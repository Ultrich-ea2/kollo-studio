import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import JSZip from 'jszip';
import PptxGenJS from 'pptxgenjs';
import { defaultDeck, cloneDeck, createSlide, type Deck } from '../src/model';
import { createScene } from '../src/scene';
import { assertSafeZipPath, createKitArchive, exportHtml, exportPptx, exportPdf, patchPptxTransitions } from '../src/exports';

function smallDeck(): Deck {
  const deck = cloneDeck(defaultDeck);
  const slide = createSlide('title');
  slide.title = 'Prüfung & Forschung'; slide.subtitle = 'ÄÖÜ ß – Unicode 😀'; slide.notes = 'Privat: Nur für den Vortrag.';
  deck.title = 'Beispiel <Deck>'; deck.slides = [slide];
  return deck;
}

async function archive(blob: Blob): Promise<JSZip> { return JSZip.loadAsync(await blob.arrayBuffer(), { checkCRC32: true }); }
async function zipBlob(zip: JSZip): Promise<Blob> { return new Blob([new Uint8Array(await zip.generateAsync({ type: 'uint8array' })).buffer]); }

test('Editable PPTX contains native scene text, positions and private notes', async () => {
  const deck = smallDeck();
  const zip = await archive(await exportPptx(deck, 'editable'));
  const slide = await zip.file('ppt/slides/slide1.xml')!.async('string');
  const scene = createScene(deck.slides[0], deck, 0);
  assert.ok(slide.includes('<p:sp>'));
  assert.match(slide, /Prüfung &amp; Forschung/);
  assert.match(slide, /wrap="none"/);
  assert.match(slide, /typeface="Arial"|typeface="Georgia"/);
  assert.equal((slide.match(/<a:t>/g) || []).length, scene.elements.filter(element => element.type === 'text').length);
  assert.doesNotMatch(slide, /<p:pic>/);
  assert.match(await zip.file('ppt/notesSlides/notesSlide1.xml')!.async('string'), /Privat: Nur für den Vortrag\./);
  assert.match(await zip.file('ppt/presentation.xml')!.async('string'), /cx="12192000" cy="6858000"/);
});

test('PPTX mapping is closed: none, fade, push and zoom fallback; notes are not invented', async () => {
  const deck = smallDeck();
  deck.slides = ['none', 'fade', 'slide', 'zoom'].map((effect, i) => ({ ...deck.slides[0], id: `export-${i}`, notes: '', transition: effect as Deck['slides'][number]['transition'] }));
  const zip = await archive(await exportPptx(deck, 'editable'));
  const xml = await Promise.all(deck.slides.map((_, i) => zip.file(`ppt/slides/slide${i + 1}.xml`)!.async('string')));
  assert.doesNotMatch(xml[0], /<p:transition/);
  assert.match(xml[1], /<p:transition spd="med" advClick="1"><p:fade\/><\/p:transition>/);
  assert.match(xml[2], /<p:push dir="l"\/>/);
  assert.match(xml[3], /<p:fade\/>/);
  assert.ok(xml.every(s => !s.includes('<p:timing') && !s.includes('advTm=')));
  // Upstream PptxGenJS emits an empty notes part for every slide.
  for (let i = 1; i <= deck.slides.length; i++) {
    assert.doesNotMatch(await zip.file(`ppt/notesSlides/notesSlide${i}.xml`)!.async('string'), /Privat: Nur für den Vortrag/);
  }
});

test('Transition patch refuses malformed ZIP structures and unsafe original paths', async () => {
  for (const path of ['../evil', '/root', 'C:/evil', 'ppt\\evil', 'a/./b', 'a\u0000b']) assert.throws(() => assertSafeZipPath(path));
  for (const path of ['[Content_Types].xml', 'ppt/slides/slide1.xml', 'skills/kollo-theme/SKILL.md']) assert.doesNotThrow(() => assertSafeZipPath(path));
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<Types/>'); zip.file('ppt/presentation.xml', '<p:presentation/>');
  zip.file('ppt/slides/slide1.xml', '<p:sld><p:clrMapOvr/></p:sld>');
  await assert.rejects(patchPptxTransitions(await zipBlob(zip), ['fade']), /Folienstruktur/);
  zip.file('ppt/slides/slide1.xml', '<p:sld><p:clrMapOvr></p:clrMapOvr></p:sld>');
  zip.file('../evil.txt', 'do not allow traversal');
  await assert.rejects(patchPptxTransitions(await zipBlob(zip), ['fade']), /Dateipfad/);
});

test('Standalone HTML escapes hostile text and allows only its exact fixed script', async () => {
  const deck = smallDeck();
  deck.title = '</title><script>alert(1)</script>';
  deck.slides[0].notes = '</template><script>alert(2)</script>&私';
  const html = await (await exportHtml(deck)).text();
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  const hash = createHash('sha256').update(scripts[0][1]).digest('base64');
  assert.ok(html.includes(`script-src 'sha256-${hash}'`));
  assert.ok(html.includes("connect-src 'none'"));
  assert.doesNotMatch(html, /<script>alert\(/);
  assert.ok(html.includes('&lt;/template&gt;&lt;script&gt;alert(2)&lt;/script&gt;&amp;私'));
  assert.match(html, /<aside id="notes" hidden/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.match(html, /@media print/);
  assert.match(html, /\.unrevealed\{visibility:visible!important\}/);
  assert.doesNotMatch(html, /<(?:script|link|iframe)[^>]+(?:src|href)=/i);
  assert.doesNotMatch(scripts[0][1], /\b(?:eval|fetch|XMLHttpRequest)\s*\(|new Function/);
});

test('Offline kit includes source backup and bundled documentation without external fetch', async () => {
  const deck = smallDeck();
  const resources = {
    '/public/guide.md': '# Offline-Anleitung',
    '/skills/kollo-theme/SKILL.md': '# Theme skill',
    '/skills/kollo-theme/references/schema.md': '# Schema',
  };
  const zip = await archive(await createKitArchive(deck, resources));
  assert.deepEqual(JSON.parse(await zip.file('deck.kollo.json')!.async('string')), deck);
  assert.ok(zip.file('presentation.html'));
  assert.ok(zip.file('skills/kollo-theme/SKILL.md'));
  assert.ok(zip.file('skills/kollo-theme/references/schema.md'));
  assert.match(await zip.file('EXPORTS.md')!.async('string'), /einschließlich aller.*Notizen/);
  await assert.rejects(createKitArchive(deck, {}), /Anleitung oder der Skill fehlt/);
  await assert.rejects(createKitArchive(deck, { ...resources, '/skills/kollo-theme/../../evil': 'no' }), /Dateipfad/);
  await assert.rejects(createKitArchive(deck, { ...resources, '/unknown': 'no' }), /Unerwartete Ressource/);
});

test('Overflow or invalid inputs fail before producing a partial export', async () => {
  const deck = smallDeck();
  deck.slides[0].title = 'W'.repeat(200);
  assert.ok(createScene(deck.slides[0], deck, 0).warnings.length > 0);
  await assert.rejects(exportPptx(deck, 'editable'), /Export angehalten/);
  await assert.rejects(exportHtml(deck), /Export angehalten/);
  const valid = smallDeck();
  await assert.rejects(exportPptx(valid, 'invalid' as 'editable'), /Exportmodus/);
  await assert.rejects(exportPdf(valid), /Browser.*Canvas/);
});

test('Patched upstream image-size dependency still embeds a native PNG image', async () => {
  const data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB/8AAAAASUVORK5CYII=';
  const pptx = new PptxGenJS();
  pptx.addSlide().addImage({ data, x: 1, y: 1, w: 2, h: 2, altText: 'Prüfpixel' });
  const zip = await JSZip.loadAsync(await pptx.write({ outputType: 'uint8array' }) as Uint8Array);
  const xml = await zip.file('ppt/slides/slide1.xml')!.async('string');
  assert.match(xml, /<p:pic>/);
  assert.match(xml, /descr="Prüfpixel"/);
  const media = Object.keys(zip.files).filter(path => /^ppt\/media\/.+\.png$/.test(path));
  assert.equal(media.length, 1);
  assert.equal(Buffer.from(await zip.file(media[0])!.async('uint8array')).toString('base64'), data.split(',')[1]);
});
