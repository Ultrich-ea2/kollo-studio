"""Synthetic source-packet fixtures only; no private input or network required."""
import base64
import builtins
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import warnings
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'skills' / 'kollo-theme' / 'scripts' / 'prepare_sources.py'
spec = importlib.util.spec_from_file_location('prepare_sources', SCRIPT)
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
QA = Path(os.environ.get('KOLLO_SOURCE_QA', str(ROOT.parent / 'kollo-skill-qa')))
P, A, R, C, W = (source.NS[k] for k in ('p', 'a', 'r', 'c', 'w'))
REL = source.NS['rel']
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB/8AAAAASUVORK5CYII=')


def rels(*entries):
    return '<Relationships xmlns="' + REL + '">' + ''.join('<Relationship Id="' + rid + '" Type="' + R + '/' + kind + '" Target="' + target + '"' + (' TargetMode="External"' if external else '') + '/>' for rid, kind, target, external in entries) + '</Relationships>'


def package(parts):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, content in parts.items():
            archive.writestr(name, content)
    return output.getvalue()


def shape(text, placeholder=''):
    return '<p:sp><p:nvSpPr><p:cNvPr id="1" name="Text" descr="Alt evidence"/><p:cNvSpPr/><p:nvPr>' + placeholder + '</p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="10" y="20"/><a:ext cx="100" cy="200"/></a:xfrm></p:spPr><p:txBody><a:p><a:r><a:t>' + text + '</a:t></a:r><a:br/><a:r><a:t>Second line</a:t></a:r></a:p></p:txBody></p:sp>'


def slide(text, extra='', hidden=False):
    return f'<p:sld xmlns:p="{P}" xmlns:a="{A}" xmlns:r="{R}" xmlns:c="{C}"' + (' show="0"' if hidden else '') + '><p:cSld><p:spTree>' + shape(text) + extra + '</p:spTree></p:cSld></p:sld>'


def pptx_parts():
    picture = '<p:pic><p:nvPicPr><p:cNvPr id="2" name="Image" descr="Source diagram alt"/></p:nvPicPr><p:blipFill><a:blip r:embed="image"/></p:blipFill></p:pic>'
    chart = '<p:graphicFrame><a:graphic><a:graphicData><c:chart r:id="chart"/></a:graphicData></a:graphic></p:graphicFrame>'
    table = '<p:graphicFrame><a:graphic><a:graphicData><a:tbl><a:tr><a:tc gridSpan="2"><a:txBody><a:p><a:r><a:t>Table evidence</a:t></a:r></a:p></a:txBody></a:tc></a:tr></a:tbl></a:graphicData></a:graphic></p:graphicFrame>'
    return {
        '_rels/.rels': rels(('main', 'officeDocument', 'ppt/presentation.xml', False)),
        'ppt/presentation.xml': f'<p:presentation xmlns:p="{P}" xmlns:r="{R}"><p:sldIdLst><p:sldId id="300" r:id="third"/><p:sldId id="301" r:id="first"/></p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/></p:presentation>',
        'ppt/_rels/presentation.xml.rels': rels(('first', 'slide', 'slides/slide1.xml', False), ('third', 'slide', 'slides/slide3.xml', False)),
        'ppt/slides/slide1.xml': slide('Second in presentation', hidden=True),
        'ppt/slides/slide3.xml': slide('First &amp; Unicode ü 😀', picture + chart + table),
        'ppt/slides/_rels/slide3.xml.rels': rels(('notes', 'notesSlide', '../notesSlides/notesSlide9.xml', False), ('image', 'image', '../media/image.png', False), ('chart', 'chart', '../charts/chart1.xml', False), ('url', 'hyperlink', 'https://example.invalid/evidence', True)),
        'ppt/notesSlides/notesSlide9.xml': f'<p:notes xmlns:p="{P}" xmlns:a="{A}">' + shape('Private speaker evidence', '<p:ph type="body"/>') + shape('999', '<p:ph type="sldNum"/>') + '</p:notes>',
        'ppt/notesSlides/_rels/notesSlide9.xml.rels': rels(('note-link', 'hyperlink', 'https://example.invalid/note-source', True)),
        'ppt/media/image.png': PNG,
        'ppt/charts/chart1.xml': f'<c:chartSpace xmlns:c="{C}"><c:chart><c:plotArea><c:barChart><c:ser><c:cat><c:strRef><c:f>Sheet1!A2</c:f><c:strCache><c:pt idx="0"><c:v>Group A</c:v></c:pt></c:strCache></c:strRef></c:cat><c:val><c:numRef><c:f>Sheet1!B2</c:f><c:numCache><c:pt idx="0"><c:v>42.50</c:v></c:pt></c:numCache></c:numRef></c:val></c:ser></c:barChart></c:plotArea></c:chart></c:chartSpace>',
    }


def synthetic_pdf():
    stream = b'BT /F1 12 Tf 40 60 Td (Synthetic evidence 42) Tj ET'
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Count 2 /Kids [3 0 R 5 0 R] >>', b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 180] /Resources << /Font << /F1 4 0 R >> >> /Contents 6 0 R /Annots [8 0 R] >>', b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 180] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >>', b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'\nendstream', b'<< /Length 0 >>\nstream\n\nendstream', b'<< /Type /Annot /Subtype /Link /Rect [40 40 200 70] /Border [0 0 0] /A << /S /URI /URI (https://example.invalid/evidence) >> >>']
    data = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(data))
        data.extend(f'{index} 0 obj\n'.encode() + obj + b'\nendobj\n')
    xref = len(data)
    data.extend(f'xref\n0 {len(offsets)}\n0000000000 65535 f \n'.encode())
    for offset in offsets[1:]:
        data.extend(f'{offset:010d} 00000 n \n'.encode())
    data.extend(f'trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode())
    return bytes(data)


class SourceTests(unittest.TestCase):
    def setUp(self):
        QA.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix='synthetic-', dir=QA)
        self.addCleanup(self.temp.cleanup)
        self.folder = Path(self.temp.name)

    def write(self, name, data):
        path = self.folder / name
        path.write_bytes(data if isinstance(data, bytes) else data.encode('utf-8'))
        return path

    def test_pptx_order_notes_tables_charts_assets_and_external_evidence(self):
        data = package(pptx_parts())
        path = self.write('synthetic.pptx', data)
        document, assets = source.extract_source(path, 'd001')
        self.assertEqual([u['source_part'] for u in document['units']], ['ppt/slides/slide3.xml', 'ppt/slides/slide1.xml'])
        first = document['units'][0]
        self.assertEqual(first['objects'][0]['paragraphs'][0]['text'], 'First & Unicode ü 😀\nSecond line')
        self.assertTrue(document['units'][1]['hidden'])
        self.assertEqual(first['notes'][0]['text'], 'Private speaker evidence\nSecond line')
        self.assertNotIn('999', json.dumps(first['notes']))
        self.assertEqual(first['notes_relationships'][0]['target'], 'https://example.invalid/note-source')
        self.assertEqual(first['objects'][0]['local_transforms_emu'][0]['x'], '10')
        self.assertEqual(first['objects'][3]['table'][0][0]['merge']['gridSpan'], '2')
        chart = first['objects'][2]['relationships'][0]['chart']
        self.assertEqual(chart['series'][0]['values']['val']['cached_points'][0]['value'], '42.50')
        self.assertEqual(chart['series'][0]['values']['cat']['formulas'], ['Sheet1!A2'])
        self.assertTrue(any(r.get('external') for r in first['relationships']))
        self.assertEqual(assets['assets/d001-image-001.png'], PNG)
        self.assertEqual(document['sha256'], hashlib.sha256(data).hexdigest())
        self.assertEqual(document['metadata']['slide_size_emu']['cx'], '12192000')
        self.assertEqual(path.read_bytes(), data)

    def test_notes_and_asset_opt_out_and_no_overwrite(self):
        path = self.write('synthetic.pptx', package(pptx_parts()))
        result, assets = source.extract_source(path, 'd001', omit_notes=True, no_assets=True)
        self.assertFalse(assets)
        self.assertFalse(result['units'][0]['notes'])
        self.assertFalse(result['units'][0]['notes_relationships'])
        self.assertTrue(result['assets'])
        out = self.folder / 'packet'
        packet = source.prepare([path], out)
        before = (out / 'manifest.json').read_bytes()
        with self.assertRaisesRegex(source.SourceError, 'existiert bereits'):
            source.prepare([path], out)
        self.assertEqual((out / 'manifest.json').read_bytes(), before)
        self.assertTrue(packet['private'])
        self.assertTrue(packet['not_a_kollo_deck'])

    def test_strict_ooxml_namespaces_and_nested_group_identity(self):
        parts = pptx_parts()
        group = '<p:grpSp><p:nvGrpSpPr><p:cNvPr id="22" name="Group"/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="900" y="800"/><a:ext cx="1000" cy="2000"/><a:chOff x="0" y="0"/><a:chExt cx="100" cy="200"/></a:xfrm></p:grpSpPr>' + shape('Grouped evidence', '<p:ph type="title"/>') + '</p:grpSp>'
        parts['ppt/slides/slide3.xml'] = slide('Top level', group)
        for name, data in list(parts.items()):
            if isinstance(data, str):
                for strict, transitional in source.STRICT_NS.items():
                    data = data.replace(transitional, strict)
                parts[name] = data
        document, _ = source.extract_source(self.write('strict.pptx', package(parts)), 'd001')
        objects = document['units'][0]['objects']
        self.assertEqual(objects[1]['kind'], 'grpSp')
        self.assertEqual(objects[1]['local_transforms_emu'][0]['x'], '900')
        self.assertEqual(objects[2]['group_path'], [2])
        self.assertEqual(objects[2]['local_transforms_emu'][0]['x'], '10')
        self.assertEqual(objects[2]['placeholder']['type'], 'title')

    def test_pptx_show_uses_both_xml_boolean_spellings(self):
        for index, (value, hidden) in enumerate((('false', True), ('0', True), ('true', False), ('1', False), (None, False), (' false ', True))):
            with self.subTest(show=value):
                parts = pptx_parts()
                markup = slide('Visibility evidence')
                if value is not None:
                    markup = markup.replace('<p:sld ', f'<p:sld show="{value}" ', 1)
                parts['ppt/slides/slide1.xml'] = markup
                document, _ = source.extract_source(self.write(f'visibility-{index}.pptx', package(parts)), 'd001')
                self.assertEqual(document['units'][1]['hidden'], hidden)

    def test_docx_structure_footnotes_header_and_tracked_deletion(self):
        doc = f'<w:document xmlns:w="{W}" xmlns:r="{R}"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Evidence A</w:t></w:r><w:del><w:r><w:delText>Old claim</w:delText></w:r></w:del><w:r><w:footnoteReference w:id="7"/></w:r><w:hyperlink r:id="link"><w:r><w:t>Source</w:t></w:r></w:hyperlink></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Cell evidence</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>'
        parts = {'_rels/.rels': rels(('main', 'officeDocument', 'word/document.xml', False)), 'word/document.xml': doc, 'word/_rels/document.xml.rels': rels(('fn', 'footnotes', 'footnotes.xml', False), ('hdr', 'header', 'header1.xml', False), ('link', 'hyperlink', 'https://example.invalid/source', True)), 'word/footnotes.xml': f'<w:footnotes xmlns:w="{W}"><w:footnote w:type="separator" w:id="-1"/><w:footnote w:id="7"><w:p><w:r><w:t>Actual source footnote</w:t></w:r></w:p></w:footnote></w:footnotes>', 'word/header1.xml': f'<w:hdr xmlns:w="{W}"><w:p><w:r><w:t>Header evidence</w:t></w:r></w:p></w:hdr>'}
        document, _ = source.extract_source(self.write('synthetic.docx', package(parts)), 'd002')
        blocks = document['units'][0]['blocks']
        self.assertEqual(blocks[0]['text'], 'Evidence ASource')
        self.assertEqual(blocks[0]['style_id'], 'Heading1')
        self.assertEqual(blocks[0]['deleted_text_for_review'], ['Old claim'])
        self.assertEqual(blocks[1]['rows'][0][0]['blocks'][0]['text'], 'Cell evidence')
        self.assertEqual([u['kind'] for u in document['units']], ['document_body', 'footnotes', 'header'])
        self.assertEqual(document['units'][1]['id'], 'd002:footnotes:7')

    def test_docx_nonbreaking_and_soft_hyphens_preserve_word_boundaries(self):
        body = f'<w:document xmlns:w="{W}"><w:body><w:p><w:r><w:t>nicht</w:t><w:noBreakHyphen/><w:t>signifikant</w:t><w:softHyphen/><w:t>weiter</w:t><w:tab/><w:t>Beleg</w:t><w:br/><w:t>Ende</w:t></w:r></w:p></w:body></w:document>'
        parts = {'_rels/.rels': rels(('main', 'officeDocument', 'word/document.xml', False)), 'word/document.xml': body}
        document, _ = source.extract_source(self.write('word-boundaries.docx', package(parts)), 'd001')
        self.assertEqual(document['units'][0]['blocks'][0]['text'], 'nicht\u2011signifikant\u00adweiter\tBeleg\nEnde')

    def test_plain_utf16_csv_formula_and_tex_remain_data(self):
        text = 'Ünicode 😀\n<script>not code</script>'
        path = self.write('text.md', text.encode('utf-16'))
        document, _ = source.extract_source(path, 'd001')
        self.assertEqual(document['units'][0]['text'], text)
        csv_doc, _ = source.extract_source(self.write('table.csv', 'a;b\n"=1+1";"line\nbreak"\n'), 'd002')
        self.assertEqual(csv_doc['units'][0]['rows'][1], ['=1+1', 'line\nbreak'])
        tex = '\\write18{touch must-never-exist}\nEvidence'
        tex_doc, _ = source.extract_source(self.write('material.tex', tex), 'd003')
        self.assertEqual(tex_doc['units'][0]['text'], tex)
        out = self.folder / 'packet'
        source.prepare([path], out)
        self.assertIn('    <script>not code</script>', (out / 'sources.md').read_text('utf-8'))
        self.assertFalse((self.folder / 'must-never-exist').exists())

    def test_zip_traversal_duplicates_symlinks_limits_and_dtd_rejected(self):
        for name in ('../escape.xml', '/absolute.xml', 'C:/root.xml', 'a\\b.xml', 'a//b.xml'):
            with self.subTest(name=name), self.assertRaises(source.SourceError):
                # zipfile normalizes Windows separators when writing; mutate the
                # ZIP's local and central filename bytes to test a hostile input.
                data = package({'a/b.xml': 'x'}).replace(b'a/b.xml', b'a\\b.xml') if name == 'a\\b.xml' else package({name: 'x'})
                source.Package(data)
        buffer = io.BytesIO()
        with warnings.catch_warnings(), zipfile.ZipFile(buffer, 'w') as archive:
            warnings.simplefilter('ignore')
            archive.writestr('same.xml', 'one'); archive.writestr('same.xml', 'two')
        with self.assertRaisesRegex(source.SourceError, 'doppelter'):
            source.Package(buffer.getvalue())
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as archive:
            info = zipfile.ZipInfo('symlink'); info.create_system = 3; info.external_attr = (stat.S_IFLNK | 0o777) << 16
            archive.writestr(info, '../target')
        with self.assertRaisesRegex(source.SourceError, 'Symlinks'):
            source.Package(buffer.getvalue())
        with patch.object(source, 'MAX_PART', 3), self.assertRaises(source.SourceError):
            source.Package(package({'large': b'1234'}))
        for encoding in ('utf-8', 'utf-16'):
            with self.subTest(encoding=encoding), self.assertRaisesRegex(source.SourceError, 'DTD'):
                source.xml('<!DOCTYPE x [<!ENTITY e "danger">]><x>&e;</x>'.encode(encoding))
        with self.assertRaises(source.SourceError):
            source.resolve_part('ppt/slides/a.xml', '../../../outside')
        with self.assertRaises(source.SourceError):
            source.resolve_part('ppt/slides/a.xml', '%2e%2e/%2e%2e/%2e%2e/outside')
        with self.assertRaises(source.SourceError):
            source.resolve_part('ppt/slides/a.xml', 'https://example.invalid/file')

    def test_unsupported_images_and_per_document_failures_are_explicit(self):
        parts = pptx_parts(); parts['ppt/media/image.png'] = b'<svg onload="alert(1)"/>'
        document, assets = source.extract_source(self.write('badimage.pptx', package(parts)), 'd001')
        self.assertFalse(assets)
        self.assertTrue(any('nicht kopiert' in w for w in document['warnings']))
        invalid = self.write('unsupported.ppt', b'not executed')
        text = self.write('valid.txt', 'Valid evidence')
        packet = source.prepare([invalid, text], self.folder / 'packet')
        self.assertEqual([d['status'] for d in packet['documents']], ['error', 'extracted'])
        self.assertEqual(packet['documents'][0]['sha256'], hashlib.sha256(b'not executed').hexdigest())
        self.assertIn('Valid evidence', (self.folder / 'packet' / 'sources.md').read_text('utf-8'))

    def test_foreign_xml_attributes_and_multiline_warnings_cannot_inject_markdown(self):
        parts = pptx_parts()
        parts['ppt/slides/slide3.xml'] = slide('Evidence').replace('id="1"', 'id="bad&#10;## [evil](https://example.invalid) &lt;script&gt;" text="Foreign attribute"')
        document, _ = source.extract_source(self.write('hostile.pptx', package(parts)), 'd001')
        document['warnings'].append('first line\n<script>not active</script>\n## [evil](javascript:alert)')
        md = source.markdown({'documents': [document]})
        active = '\n'.join(line for line in md.splitlines() if line and not line.startswith('    '))
        self.assertNotIn('<script>', active)
        self.assertNotIn('[evil]', active)
        self.assertNotIn('https://example.invalid', active)
        self.assertIn('    WARNUNG: <script>not active</script>', md)
        self.assertIn('Foreign attribute', md)

    def test_pdf_optional_backend_text_scan_warning_and_timeout(self):
        if not any(importlib.util.find_spec(name) for name in ('pypdf', 'fitz')):
            self.skipTest('Neither optional PDF backend is installed; no installation performed.')
        data = synthetic_pdf()
        document, assets = source.extract_source(self.write('synthetic.pdf', data), 'd001')
        self.assertFalse(assets)
        self.assertEqual([u['id'] for u in document['units']], ['d001:p001', 'd001:p002'])
        self.assertIn('Synthetic evidence 42', document['units'][0]['text'])
        self.assertEqual(document['units'][0]['links'][0]['uri'], 'https://example.invalid/evidence')
        self.assertTrue(any('Seite 2:' in w and 'OCR' in w for w in document['warnings']))
        with patch.object(source.subprocess, 'run', side_effect=subprocess.TimeoutExpired('worker', 30)):
            with self.assertRaisesRegex(source.SourceError, '30 Sekunden'):
                source.extract_pdf(data)

    def test_missing_pdf_backends_fail_clearly_without_installation(self):
        original_import = builtins.__import__
        def no_optional(name, *args, **kwargs):
            if name in ('pypdf', 'fitz'):
                raise ImportError('Synthetic absent backend')
            return original_import(name, *args, **kwargs)
        with patch.object(builtins, '__import__', side_effect=no_optional):
            with self.assertRaisesRegex(source.SourceError, 'optional pypdf oder PyMuPDF'):
                source.pdf_worker(synthetic_pdf())


if __name__ == '__main__':
    unittest.main()
