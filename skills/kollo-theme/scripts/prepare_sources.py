#!/usr/bin/env python3
"""Make a local, untrusted evidence packet; never convert sources to Kollo slides.

OOXML and text handling use the standard library. PDF extraction optionally uses
an already installed pypdf or PyMuPDF, in a time-limited child process. No shell,
network, Office automation, macros, field evaluation or document code execution.
"""
import argparse
import contextlib
import csv
import hashlib
import html
import io
import json
import os
from pathlib import Path
import posixpath
import re
import stat
import struct
import subprocess
import sys
from urllib.parse import unquote, urlsplit
import zipfile
import xml.etree.ElementTree as ET

MAX_INPUT = 64 * 1024 * 1024
MAX_TOTAL_INPUT = 128 * 1024 * 1024
MAX_PART = 8 * 1024 * 1024
MAX_UNPACKED = 128 * 1024 * 1024
MAX_ENTRIES = 6000
MAX_UNITS = 300
MAX_TEXT = 2_000_000
MAX_ASSETS = 32 * 1024 * 1024
MAX_IMAGE = 5 * 1024 * 1024
NS = {
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'c': 'http://schemas.openxmlformats.org/drawingml/2006/chart',
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'rel': 'http://schemas.openxmlformats.org/package/2006/relationships',
}
STRICT_NS = {
    'http://purl.oclc.org/ooxml/presentationml/main': NS['p'],
    'http://purl.oclc.org/ooxml/drawingml/main': NS['a'],
    'http://purl.oclc.org/ooxml/officeDocument/relationships': NS['r'],
    'http://purl.oclc.org/ooxml/drawingml/chart': NS['c'],
    'http://purl.oclc.org/ooxml/wordprocessingml/main': NS['w'],
}


class SourceError(ValueError):
    pass


def q(prefix, local):
    return '{' + NS[prefix] + '}' + local


def local(tag):
    return tag.rsplit('}', 1)[-1]


def normalized_name(name):
    if name.startswith('{'):
        namespace, suffix = name[1:].split('}', 1)
        return '{' + STRICT_NS.get(namespace, namespace) + '}' + suffix
    return name


def bounded_read(path):
    with Path(path).open('rb') as handle:
        data = handle.read(MAX_INPUT + 1)
    if len(data) > MAX_INPUT:
        raise SourceError('Eingabe größer als 64 MiB.')
    return data


def decode_text(data):
    try:
        if data.startswith((b'\xff\xfe', b'\xfe\xff')):
            text = data.decode('utf-16')
        else:
            text = data.decode('utf-8-sig')
    except UnicodeError as error:
        raise SourceError('UTF-8 oder UTF-16 mit BOM erforderlich; keine verlustbehaftete Zeichensatzraten.') from error
    if '\0' in text or len(text) > MAX_TEXT:
        raise SourceError('Binärzeichen oder mehr als 2 Millionen Textzeichen.')
    return text


def safe_zip_name(name, directory=False):
    parts = name.rstrip('/').split('/')
    if not name or name.startswith('/') or re.match(r'^[A-Za-z]:', name) or '\\' in name or any(ord(c) < 32 for c in name):
        raise SourceError('Unsicherer ZIP-Pfad.')
    if any(part in ('', '.', '..') for part in parts) or (name.endswith('/') and not directory):
        raise SourceError('Unsicherer ZIP-Pfad.')


def resolve_part(base, target):
    url = urlsplit(target)
    if url.scheme or url.netloc or url.query:
        raise SourceError('Externe oder nicht unterstützte Beziehung wird nicht geladen.')
    path = unquote(url.path, errors='strict')
    if '\\' in path or any(ord(c) < 32 for c in path):
        raise SourceError('Unsicheres Beziehungsziel.')
    result = posixpath.normpath(path.lstrip('/') if path.startswith('/') else posixpath.join(posixpath.dirname(base), path))
    safe_zip_name(result)
    return result


def xml(data):
    if len(data) > MAX_PART:
        raise SourceError('XML-Teil größer als 8 MiB.')
    text = decode_text(data)
    if re.search(r'<!\s*(?:DOCTYPE|ENTITY)\b', text, re.I):
        raise SourceError('XML mit DTD oder Entitäten ist nicht erlaubt.')
    try:
        root = ET.fromstring(text)
    except ET.ParseError as error:
        raise SourceError('Ungültiges XML.') from error
    pending = [(root, 0)]
    nodes = 0
    while pending:
        node, depth = pending.pop()
        nodes += 1
        if nodes > 100_000 or depth > 64:
            raise SourceError('XML-Struktur zu groß oder zu tief.')
        node.tag = normalized_name(node.tag)
        node.attrib = {normalized_name(key): value for key, value in node.attrib.items()}
        pending.extend((child, depth + 1) for child in node)
    return root


class Package:
    def __init__(self, data):
        try:
            self.zip = zipfile.ZipFile(io.BytesIO(data))
            entries = self.zip.infolist()
        except zipfile.BadZipFile as error:
            raise SourceError('Ungültiges ZIP-/Office-Paket.') from error
        if len(entries) > MAX_ENTRIES or sum(info.file_size for info in entries) > MAX_UNPACKED:
            raise SourceError('ZIP-Grenze überschritten: 6000 Teile / 128 MiB entpackt.')
        seen = set()
        for info in entries:
            safe_zip_name(info.filename, info.is_dir())
            if info.orig_filename != info.filename or info.filename in seen:
                raise SourceError('Mehrdeutiger oder doppelter ZIP-Pfad.')
            seen.add(info.filename)
            if info.flag_bits & 1 or stat.S_ISLNK(info.external_attr >> 16):
                raise SourceError('Verschlüsselte Teile oder ZIP-Symlinks sind nicht erlaubt.')
            if info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED):
                raise SourceError('Office-ZIP unterstützt nur Stored/Deflate-Kompression.')
            if info.file_size > MAX_PART or (info.file_size > 1024 * 1024 and info.file_size > 200 * max(1, info.compress_size)):
                raise SourceError('ZIP-Teil zu groß oder auffälliges Kompressionsverhältnis.')
        self.names = seen

    def read(self, name):
        if name not in self.names:
            raise SourceError('Verknüpfter Paket-Teil fehlt: ' + name)
        try:
            with self.zip.open(name) as handle:
                result = handle.read(MAX_PART + 1)
            if len(result) > MAX_PART:
                raise SourceError('Paket-Teil überschreitet die Grenze.')
            return result
        except (zipfile.BadZipFile, RuntimeError) as error:
            raise SourceError('Paket-Teil nicht lesbar.') from error

    def tree(self, name):
        return xml(self.read(name))

    def relationships(self, part):
        name = posixpath.join(posixpath.dirname(part), '_rels', posixpath.basename(part) + '.rels') if part else '_rels/.rels'
        if name not in self.names:
            return {}
        result = {}
        for element in self.tree(name):
            if local(element.tag) != 'Relationship':
                continue
            rid = element.get('Id', '')
            if not rid or rid in result:
                raise SourceError('Fehlende oder doppelte Beziehungs-ID.')
            item = {'id': rid, 'type': element.get('Type', ''), 'target': element.get('Target', ''), 'external': element.get('TargetMode', '').lower() == 'external'}
            if not item['external']:
                try:
                    item['part'] = resolve_part(part, item['target'])
                except (SourceError, UnicodeError, ValueError):
                    item['blocked'] = True
            result[rid] = item
        return result

    def main(self):
        roots = [r for r in self.relationships('').values() if r['type'].endswith('/officeDocument') and r.get('part')]
        if len(roots) != 1:
            raise SourceError('Eindeutiger Office-Hauptteil fehlt (verschlüsselte Dateien werden nicht unterstützt).')
        return roots[0]['part']


def raster_info(data):
    if len(data) > MAX_IMAGE:
        raise SourceError('Rasterbild größer als 5 MiB.')
    if len(data) >= 24 and data[:8] == b'\x89PNG\r\n\x1a\n' and data[12:16] == b'IHDR':
        kind, (width, height) = 'png', struct.unpack('>II', data[16:24])
    elif data[:2] == b'\xff\xd8':
        kind, width, height, offset = 'jpeg', 0, 0, 2
        while offset + 4 <= len(data):
            if data[offset] != 255:
                break
            while offset < len(data) and data[offset] == 255:
                offset += 1
            if offset >= len(data):
                break
            marker = data[offset]
            offset += 1
            if marker == 1 or 0xD0 <= marker <= 0xD7:
                continue
            length = int.from_bytes(data[offset:offset + 2], 'big')
            if length < 2 or offset + length > len(data) or marker in (0xD9, 0xDA):
                break
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF) and length >= 8:
                height = int.from_bytes(data[offset + 3:offset + 5], 'big')
                width = int.from_bytes(data[offset + 5:offset + 7], 'big')
                break
            offset += length
    elif len(data) >= 30 and data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        kind, width, height = 'webp', 0, 0
        if data[12:16] == b'VP8X':
            width, height = 1 + int.from_bytes(data[24:27], 'little'), 1 + int.from_bytes(data[27:30], 'little')
        elif data[12:16] == b'VP8L' and data[20] == 0x2F:
            bits = int.from_bytes(data[21:25], 'little')
            width, height = (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
        elif data[12:16] == b'VP8 ' and data[23:26] == b'\x9d\x01\x2a':
            width, height = int.from_bytes(data[26:28], 'little') & 0x3FFF, int.from_bytes(data[28:30], 'little') & 0x3FFF
    else:
        raise SourceError('Nur PNG, JPEG und WebP werden als untrusted Rasterdateien kopiert.')
    if not width or not height or width > 8192 or height > 8192 or width * height > 40_000_000:
        raise SourceError('Rasterabmessungen ungültig oder zu groß.')
    return kind, width, height


class Extractor:
    def __init__(self, doc_id, package, omit_notes=False, no_assets=False):
        self.id, self.pkg = doc_id, package
        self.omit_notes, self.no_assets = omit_notes, no_assets
        self.warnings, self.assets, self.asset_records, self.metadata = [], {}, {}, {}
        self.text_count = 0

    def text(self, value):
        self.text_count += len(value)
        if self.text_count > MAX_TEXT:
            raise SourceError('Mehr als 2 Millionen extrahierte Textzeichen; Quelle aufteilen.')
        return value

    def asset(self, part):
        if part in self.asset_records:
            return self.asset_records[part]
        try:
            data = self.pkg.read(part)
            kind, width, height = raster_info(data)
            record = {'source_part': part, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'format': kind, 'width': width, 'height': height, 'trust': 'untrusted_original_bytes_not_decoded'}
            if width > 4096 or height > 4096 or len(data) > 2 * 1024 * 1024:
                self.warnings.append(f'{part}: vor Kollo-Import auf 2 MiB / 4096 Pixel verkleinern.')
            if not self.no_assets:
                path = f'assets/{self.id}-image-{len(self.asset_records) + 1:03d}.{kind}'
                record['file'] = path
                self.assets[path] = data
            self.asset_records[part] = record
            return record
        except SourceError as error:
            self.warnings.append(f'{part}: Bild nicht kopiert: {error}')
            return {'source_part': part, 'unsupported': True}

    def drawing_paragraphs(self, element):
        result = []
        for index, paragraph in enumerate(element.findall('.//a:p', NS), 1):
            text = ''.join(n.text or '' if n.tag == q('a', 't') else '\n' if n.tag == q('a', 'br') else '\t' if n.tag == q('a', 'tab') else '' for n in paragraph.iter())
            record = {'paragraph': index, 'text': self.text(text)}
            properties = paragraph.find('a:pPr', NS)
            if properties is not None:
                record['properties'] = dict(properties.attrib)
                record['bullet_properties'] = [{'kind': local(n.tag), **n.attrib} for n in properties if local(n.tag).startswith('bu')]
            result.append(record)
        return result

    def object(self, element, number, relationships, groups=()):
        props = next((n for n in element.iter() if local(n.tag) == 'cNvPr'), None)
        item = {'object': number, 'kind': local(element.tag), 'group_path': list(groups)}
        if props is not None:
            item['properties'] = dict(props.attrib)
        placeholder = element.find('.//p:ph', NS) if element.tag != q('p', 'grpSp') else None
        if placeholder is not None:
            item['placeholder'] = dict(placeholder.attrib)
        transform = None
        for path in ('p:grpSpPr/a:xfrm', 'p:spPr/a:xfrm', 'p:xfrm'):
            transform = element.find(path, NS)
            if transform is not None:
                break
        transforms = [dict(n.attrib, element=local(n.tag)) for n in transform] if transform is not None else []
        if transforms:
            item['local_transforms_emu'] = transforms
        if element.tag != q('p', 'grpSp'):
            table = element.find('.//a:tbl', NS)
            if table is not None:
                item['table'] = [[{'row': r + 1, 'column': c + 1, 'merge': dict(cell.attrib), 'paragraphs': self.drawing_paragraphs(cell)} for c, cell in enumerate(row.findall('a:tc', NS))] for r, row in enumerate(table.findall('a:tr', NS))]
            else:
                item['paragraphs'] = self.drawing_paragraphs(element)
        links = []
        for node in element.iter():
            if element.tag == q('p', 'grpSp'):
                break
            for attr in (q('r', 'id'), q('r', 'embed'), q('r', 'link')):
                rid = node.get(attr)
                if not rid:
                    continue
                relationship = relationships.get(rid, {'id': rid, 'missing': True})
                link = dict(relationship, usage=local(node.tag))
                if node.tag == q('a', 'blip') and relationship.get('part') and not relationship.get('external'):
                    link['asset'] = self.asset(relationship['part'])
                if node.tag == q('c', 'chart') and relationship.get('part'):
                    try:
                        link['chart'] = self.chart(relationship['part'])
                    except SourceError as error:
                        self.warnings.append(f'{relationship["part"]}: Diagramm nicht lesbar: {error}')
                links.append(link)
        if links:
            item['relationships'] = links
        return item

    def chart(self, part):
        tree = self.pkg.tree(part)
        series = []
        for number, element in enumerate(tree.findall('.//c:ser', NS), 1):
            values = {}
            for key in ('tx', 'cat', 'val', 'xVal', 'yVal', 'bubbleSize'):
                branch = element.find('c:' + key, NS)
                if branch is not None:
                    values[key] = {'formulas': [n.text or '' for n in branch.findall('.//c:f', NS)], 'cached_points': [{'index': n.get('idx'), 'value': self.text(''.join(n.itertext()))} for n in branch.findall('.//c:pt', NS)], 'literal_values': [self.text(n.text or '') for n in branch.findall('c:v', NS)]}
            series.append({'series': number, 'values': values})
        self.warnings.append(f'{part}: Diagrammwerte sind gespeicherte Caches, nicht aktualisierte Arbeitsmappendaten; Darstellung nicht rekonstruiert.')
        return {'source_part': part, 'types': sorted({local(n.tag) for n in tree.iter() if local(n.tag).endswith('Chart')}), 'series': series, 'relationships': list(self.pkg.relationships(part).values())}

    def pptx(self):
        main = self.pkg.main()
        tree, relations = self.pkg.tree(main), self.pkg.relationships(main)
        size = tree.find('p:sldSz', NS)
        if size is not None:
            self.metadata['slide_size_emu'] = dict(size.attrib)
        slides = tree.findall('p:sldIdLst/p:sldId', NS)
        if not slides or len(slides) > MAX_UNITS:
            raise SourceError('PPTX benötigt 1–300 Folien.')
        units = []
        for number, entry in enumerate(slides, 1):
            relation = relations.get(entry.get(q('r', 'id')), {})
            part = relation.get('part')
            if not part or relation.get('external') or not relation.get('type', '').endswith('/slide'):
                raise SourceError('Folienbeziehung fehlt oder ist nicht intern.')
            slide, rels = self.pkg.tree(part), self.pkg.relationships(part)
            unit = {'id': f'{self.id}:s{number:03d}', 'kind': 'slide', 'index': number, 'source_part': part, 'slide_id': entry.get('id'), 'hidden': slide.get('show', 'true').strip() in ('0', 'false'), 'objects': [], 'relationships': list(rels.values()), 'notes': [], 'notes_relationships': []}
            def walk(parent, groups=()):
                for element in parent:
                    kind = local(element.tag)
                    if kind in ('sp', 'pic', 'graphicFrame', 'cxnSp', 'grpSp', 'contentPart'):
                        obj = self.object(element, len(unit['objects']) + 1, rels, groups)
                        unit['objects'].append(obj)
                        if kind == 'grpSp':
                            walk(element, groups + (obj['object'],))
            shape_tree = slide.find('p:cSld/p:spTree', NS)
            if shape_tree is not None:
                walk(shape_tree)
            for relation in rels.values():
                if relation['type'].endswith('/notesSlide') and relation.get('part') and not self.omit_notes:
                    notes = self.pkg.tree(relation['part'])
                    unit['notes_relationships'].extend(self.pkg.relationships(relation['part']).values())
                    for shape in notes.findall('.//p:sp', NS):
                        placeholder = shape.find('.//p:ph', NS)
                        if placeholder is not None and placeholder.get('type') in ('sldNum', 'hdr', 'ftr', 'dt', 'sldImg'):
                            continue
                        unit['notes'].extend(self.drawing_paragraphs(shape))
            if slide.find('p:timing', NS) is not None or slide.find('p:transition', NS) is not None:
                self.warnings.append(f'Folie {number}: Timing/Animationen vorhanden; nicht als ausführbarer Ablauf übernommen.')
            units.append(unit)
        self.warnings.append('PPTX: Objektfolge ist XML-/Zeichenreihenfolge, keine garantierte Lesereihenfolge. Master/Layout, Designschriften, SmartArt, Formeln, Videos, OLE und Bildzuschnitt werden nicht visuell rekonstruiert. Für Layouttreue zusätzlich Folienbilder/PDF bereitstellen.')
        return units

    def word_paragraph(self, paragraph, rels):
        special = {q('w', 'tab'): '\t', q('w', 'br'): '\n', q('w', 'cr'): '\n', q('w', 'noBreakHyphen'): '\u2011', q('w', 'softHyphen'): '\u00ad'}
        text = ''.join((n.text or '') if n.tag == q('w', 't') else special.get(n.tag, '') for n in paragraph.iter())
        item = {'kind': 'paragraph', 'text': self.text(text)}
        style = paragraph.find('w:pPr/w:pStyle', NS)
        if style is not None:
            item['style_id'] = style.get(q('w', 'val'))
        numbering = paragraph.find('w:pPr/w:numPr', NS)
        if numbering is not None:
            item['numbering_reference'] = {local(n.tag): dict(n.attrib) for n in numbering}
        deleted = [self.text(n.text or '') for n in paragraph.findall('.//w:delText', NS)]
        if deleted:
            item['deleted_text_for_review'] = deleted
        item['references'] = [dict(n.attrib, kind=local(n.tag)) for n in paragraph.iter() if local(n.tag) in ('footnoteReference', 'endnoteReference')]
        if paragraph.find('.//w:instrText', NS) is not None:
            item['field_code_not_evaluated'] = True
        item['relationships'] = []
        for node in paragraph.iter():
            for attr in (q('r', 'id'), q('r', 'embed'), q('r', 'link')):
                if node.get(attr):
                    relationship = rels.get(node.get(attr), {'id': node.get(attr), 'missing': True})
                    record = dict(relationship, usage=local(node.tag))
                    if node.tag == q('a', 'blip') and relationship.get('part') and not relationship.get('external'):
                        record['asset'] = self.asset(relationship['part'])
                    item['relationships'].append(record)
        item['image_properties'] = [dict(n.attrib) for n in paragraph.iter() if local(n.tag) == 'docPr']
        return item

    def word_blocks(self, parent, rels):
        result = []
        for element in parent:
            if element.tag == q('w', 'p'):
                result.append(self.word_paragraph(element, rels))
            elif element.tag == q('w', 'tbl'):
                result.append({'kind': 'table', 'rows': [[{'row': r + 1, 'column': c + 1, 'blocks': self.word_blocks(cell, rels), 'properties': ET.tostring(cell.find('w:tcPr', NS), encoding='unicode') if cell.find('w:tcPr', NS) is not None else ''} for c, cell in enumerate(row.findall('w:tc', NS))] for r, row in enumerate(element.findall('w:tr', NS))]})
            elif element.tag in (q('w', 'sdt'), q('w', 'sdtContent'), q('w', 'ins'), q('w', 'del')):
                result.extend(self.word_blocks(element, rels))
        return result

    def docx(self):
        main = self.pkg.main()
        tree, rels = self.pkg.tree(main), self.pkg.relationships(main)
        body = tree.find('w:body', NS)
        if body is None:
            raise SourceError('DOCX-Dokumentkörper fehlt.')
        units = [{'id': self.id + ':body', 'kind': 'document_body', 'source_part': main, 'blocks': self.word_blocks(body, rels), 'relationships': list(rels.values())}]
        seen = set()
        for relation in rels.values():
            kind, part = relation['type'].rsplit('/', 1)[-1], relation.get('part')
            if kind not in ('footnotes', 'endnotes', 'header', 'footer') or not part or part in seen:
                continue
            seen.add(part)
            extra, extra_rels = self.pkg.tree(part), self.pkg.relationships(part)
            nodes = list(extra) if kind in ('footnotes', 'endnotes') else [extra]
            for node in nodes:
                if node.get(q('w', 'type')) in ('separator', 'continuationSeparator'):
                    continue
                units.append({'id': f'{self.id}:{kind}:{node.get(q("w", "id"), len(units))}', 'kind': kind, 'source_part': part, 'blocks': self.word_blocks(node, extra_rels)})
        self.warnings.append('DOCX: Strukturfolge statt Seitenlayout; keine verlässlichen Seitenzahlen. Eingefügte Änderungen sind enthalten, gelöschter Text separat markiert. Felder werden nicht ausgeführt. Listennummern, Kommentare, Textfelder, Formeln, AltChunk und Layout benötigen Originalprüfung.')
        return units


def pdf_worker(data):
    if len(data) > MAX_INPUT:
        raise SourceError('PDF größer als 64 MiB.')
    warnings, units, count = [], [], 0
    try:
        import pypdf
    except ImportError:
        pypdf = None
    if pypdf is not None:
        reader = pypdf.PdfReader(io.BytesIO(data), strict=True)
        if reader.is_encrypted:
            raise SourceError('Verschlüsseltes PDF: unverschlüsselte Kopie bereitstellen.')
        pages, backend = reader.pages, 'pypdf'
        if not 1 <= len(pages) <= MAX_UNITS:
            raise SourceError('PDF benötigt 1–300 Seiten.')
        for index, page in enumerate(pages, 1):
            text = page.extract_text() or ''
            count += len(text)
            if count > MAX_TEXT:
                raise SourceError('PDF-Textgrenze überschritten.')
            links = []
            annotations = page.get('/Annots', [])
            if hasattr(annotations, 'get_object'):
                annotations = annotations.get_object()
            if len(annotations) > 1000:
                raise SourceError('Zu viele PDF-Anmerkungen auf einer Seite.')
            for annotation in annotations:
                obj = annotation.get_object()
                if str(obj.get('/Subtype')) == '/Link':
                    action = obj.get('/A')
                    if action:
                        action = action.get_object()
                        if action.get('/URI'):
                            uri = str(action.get('/URI'))
                            if len(uri) > 8000:
                                raise SourceError('PDF-Linkziel zu lang.')
                            links.append({'uri': uri, 'external_not_fetched': True})
            units.append({'kind': 'page', 'index': index, 'text': text, 'links': links, 'width': float(page.mediabox.width), 'height': float(page.mediabox.height)})
    else:
        try:
            import fitz
        except ImportError as error:
            raise SourceError('PDF benötigt optional pypdf oder PyMuPDF (fitz). Nichts installiert; bitte PDF selbst beilegen oder lokal Text exportieren.') from error
        with fitz.open(stream=data, filetype='pdf') as reader:
            if reader.needs_pass:
                raise SourceError('Verschlüsseltes PDF: unverschlüsselte Kopie bereitstellen.')
            if not 1 <= len(reader) <= MAX_UNITS:
                raise SourceError('PDF benötigt 1–300 Seiten.')
            backend = 'PyMuPDF'
            for index, page in enumerate(reader, 1):
                text = page.get_text('text', sort=False)
                count += len(text)
                if count > MAX_TEXT:
                    raise SourceError('PDF-Textgrenze überschritten.')
                raw_links = page.get_links()
                if len(raw_links) > 1000:
                    raise SourceError('Zu viele PDF-Anmerkungen auf einer Seite.')
                links = []
                for link in raw_links:
                    uri = link.get('uri')
                    if uri:
                        if len(uri) > 8000:
                            raise SourceError('PDF-Linkziel zu lang.')
                        links.append({'uri': uri, 'external_not_fetched': True})
                units.append({'kind': 'page', 'index': index, 'text': text, 'links': links, 'width': page.rect.width, 'height': page.rect.height, 'rotation': page.rotation})
    for unit in units:
        if not unit['text'].strip():
            warnings.append(f'Seite {unit["index"]}: kein extrahierbarer Text; Scan/Bildseite möglich. Keine OCR ausgeführt.')
    warnings.append('PDF: Textreihenfolge kann abweichen; Schriftcodierung, Formeln, Tabellen und Diagramme visuell prüfen. Keine Vortragsnotizen oder Bild-/Diagrammrekonstruktion zugesichert; Original/Pagendarstellungen beilegen.')
    return {'backend': backend, 'units': units, 'warnings': warnings}


def extract_pdf(data):
    try:
        result = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--_pdf-worker'], input=data, capture_output=True, timeout=30, check=False, env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
    except subprocess.TimeoutExpired as error:
        raise SourceError('PDF-Extraktion nach 30 Sekunden abgebrochen.') from error
    if result.returncode or len(result.stdout) > 32 * 1024 * 1024:
        try:
            message = json.loads(result.stdout).get('error', 'PDF-Extraktion fehlgeschlagen.')
        except (ValueError, UnicodeError):
            message = 'PDF-Extraktion fehlgeschlagen; Datei/Backend prüfen.'
        raise SourceError(message)
    return json.loads(result.stdout)


def extract_source(path, doc_id, omit_notes=False, no_assets=False, _data=None):
    path = Path(path)
    data = bounded_read(path) if _data is None else _data
    result = {'id': doc_id, 'filename': path.name, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'format': path.suffix.lower().lstrip('.'), 'status': 'extracted', 'warnings': [], 'units': [], 'assets': []}
    assets = {}
    extension = path.suffix.lower()
    if extension in ('.pptx', '.docx'):
        package = Package(data)
        extractor = Extractor(doc_id, package, omit_notes, no_assets)
        result['units'] = extractor.pptx() if extension == '.pptx' else extractor.docx()
        result['warnings'] = extractor.warnings
        result['assets'] = list(extractor.asset_records.values())
        result['metadata'] = extractor.metadata
        result['package_inventory'] = [{'part': info.filename, 'bytes': info.file_size} for info in package.zip.infolist() if not info.is_dir()]
        if any('vba' in p.lower() or '/embeddings/' in p or '/comments/' in p for p in package.names):
            result['warnings'].append('Paket enthält Makro-/Einbettungs-/Kommentarbestandteile; nur inventarisiert, nicht ausgeführt oder kopiert.')
        result['warnings'].append('Externe Beziehungen werden ausschließlich als untrusted Text inventarisiert, niemals geladen.')
        assets = extractor.assets
    elif extension == '.pdf':
        extracted = extract_pdf(data)
        result.update(extracted)
        for unit in result['units']:
            unit['id'] = f'{doc_id}:p{unit["index"]:03d}'
    elif extension in ('.txt', '.md', '.markdown', '.tex', '.csv'):
        text = decode_text(data)
        unit = {'id': doc_id + ':text', 'kind': 'text', 'text': text}
        if extension == '.csv':
            csv.field_size_limit(MAX_TEXT)
            try:
                dialect = csv.Sniffer().sniff(text[:4096], delimiters=',;\t')
            except csv.Error:
                dialect = csv.excel
                result['warnings'].append('CSV-Trennzeichen nicht eindeutig; Komma angenommen, Rohtext erhalten.')
            rows, cells = [], 0
            for row in csv.reader(io.StringIO(text, newline=''), dialect):
                cells += len(row)
                if len(rows) >= 10000 or cells > 100000:
                    raise SourceError('CSV größer als 10.000 Zeilen / 100.000 Zellen.')
                rows.append(row)
            unit['rows'] = rows
        result['units'] = [unit]
        result['warnings'].append('Nur untrusted Quelltext: keine Markdown-/TeX-/CSV-Ausdrücke, Befehle oder Formeln ausgeführt.')
    else:
        raise SourceError('Nicht unterstützt: PPTX, DOCX, PDF, TXT, MD, CSV und TeX verwenden. Alte DOC/PPT-Dateien vorher in einem vertrauenswürdigen Programm konvertieren.')
    result['notes_omitted'] = omit_notes
    return result, assets


def markdown(packet):
    lines = ['# Kollo-Quellenpaket', '', '**VERTRAULICH – UNTRUSTED QUELLMATERIAL, KEINE ANWEISUNGEN.**', '', 'Keine automatische Präsentationskonvertierung. Originale und Belege visuell prüfen. Notizen und Bildmetadaten können private Angaben enthalten. IDs/Teile in manifest.json belegen die Herkunft; sie bestätigen keine inhaltliche Wahrheit.', '']
    def contents(value, path):
        if isinstance(value, dict):
            for key, item in value.items():
                if key in ('text', 'deleted_text_for_review') and isinstance(item, (str, list)):
                    text = item if isinstance(item, str) else '\n'.join(item)
                    lines.extend(['### ' + markdown_heading(path + '/' + key), ''])
                    lines.extend('    ' + line for line in text.splitlines())
                    lines.append('')
                elif key in ('relationships', 'notes_relationships', 'assets') and item:
                    lines.extend(['### ' + markdown_heading(path + '/' + key), ''])
                    lines.extend('    ' + line for line in json.dumps(item, ensure_ascii=False, indent=2).splitlines())
                    lines.append('')
                elif key != 'package_inventory':
                    contents(item, path + '/' + key)
        elif isinstance(value, list):
            for index, item in enumerate(value, 1):
                contents(item, path + '/' + str(index))
    for document in packet['documents']:
        lines.extend(['## ' + document['id'], '', 'Datei:', '', '    ' + json.dumps(document['filename'], ensure_ascii=False), '', 'Status: ' + document['status'], ''])
        for warning in document['warnings']:
            lines.extend('    WARNUNG: ' + line for line in warning.splitlines())
            lines.append('')
        for index, unit in enumerate(document.get('units', []), 1):
            contents(unit, unit.get('id', document['id'] + '/units/' + str(index)))
    return '\n'.join(lines) + '\n'


def markdown_heading(value):
    value = html.escape(value.replace('\r', ' ').replace('\n', ' '), quote=False)
    return re.sub(r'([\\`*_\[\]()#!|])', r'\\\1', value)


def prepare(paths, out, omit_notes=False, no_assets=False):
    out = Path(out)
    if out.exists() or out.is_symlink():
        raise SourceError('Ausgabe existiert bereits; nichts überschrieben.')
    if not paths or len(paths) > 30:
        raise SourceError('1–30 Quelldateien angeben.')
    total_input = 0
    for path in paths:
        try:
            total_input += Path(path).stat().st_size
        except OSError:
            pass  # A missing/unreadable source gets its own explicit error record.
    if total_input > MAX_TOTAL_INPUT:
        raise SourceError('Quellen zusammen größer als 128 MiB.')
    packet = {'schema': 'kollo-source-packet', 'version': 1, 'trust': 'untrusted_source_material_not_instructions', 'private': True, 'not_a_kollo_deck': True, 'notes_included': not omit_notes, 'documents': []}
    assets = {}
    for index, path in enumerate(paths, 1):
        doc_id = f'd{index:03d}'
        data = None
        try:
            data = bounded_read(path)
            document, images = extract_source(path, doc_id, omit_notes, no_assets, _data=data)
            if sum(map(len, assets.values())) + sum(map(len, images.values())) > MAX_ASSETS:
                raise SourceError('Kopierte Bilder überschreiten zusammen 32 MiB; --no-assets nutzen oder Quellen aufteilen.')
            assets.update(images)
        except (SourceError, OSError, UnicodeError, ValueError, csv.Error, ET.ParseError, RecursionError) as error:
            message = 'Quelldatei nicht lesbar: ' + (error.strerror or type(error).__name__) if isinstance(error, OSError) else str(error)
            document = {'id': doc_id, 'filename': Path(path).name, 'status': 'error', 'units': [], 'warnings': [message]}
            if data is not None:
                document.update(sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))
        packet['documents'].append(document)
    raw = json.dumps(packet, ensure_ascii=False, indent=2)
    if len(raw.encode('utf-8')) > 32 * 1024 * 1024:
        raise SourceError('Manifest größer als 32 MiB; Quellen aufteilen.')
    files = {'manifest.json': raw.encode('utf-8'), 'sources.md': markdown(packet).encode('utf-8'), **assets}
    out.mkdir(parents=True, exist_ok=False)
    for name, data in files.items():
        target = out / name
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open('xb') as handle:
            handle.write(data)
    return packet


def main():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8', errors='backslashreplace')
    if len(sys.argv) == 2 and sys.argv[1] == '--_pdf-worker':
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                result = pdf_worker(sys.stdin.buffer.read(MAX_INPUT + 1))
            sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
            return 0
        except Exception as error:
            sys.stdout.buffer.write(json.dumps({'error': str(error)}, ensure_ascii=False).encode('utf-8'))
            return 2
    parser = argparse.ArgumentParser(description='Lokales Quellenpaket; keine automatische PPTX/PDF-zu-Kollo-Konvertierung.')
    parser.add_argument('--out', required=True, help='Neuer Ausgabeordner; bestehende Ordner werden nicht verändert.')
    parser.add_argument('--omit-notes', action='store_true', help='PPTX-Vortragsnotizen weglassen; keine Anonymisierung anderer Texte.')
    parser.add_argument('--no-assets', action='store_true', help='Rasterbilder nur inventarisieren, nicht kopieren.')
    parser.add_argument('inputs', nargs='+')
    args = parser.parse_args()
    try:
        packet = prepare(args.inputs, args.out, args.omit_notes, args.no_assets)
        errors = sum(document['status'] == 'error' for document in packet['documents'])
        print(f'Quellenpaket erstellt: {len(packet["documents"])} Dateien, {errors} Fehler. Warnungen in manifest.json prüfen. VERTRAULICH: Notizen/Metadaten können enthalten sein.')
        return 1 if errors else 0
    except (SourceError, OSError) as error:
        print('Nicht erstellt: ' + str(error), file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
