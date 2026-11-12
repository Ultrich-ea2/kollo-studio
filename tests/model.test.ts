import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { cloneDeck, createSlide, defaultDeck, imageDimensions, layouts, LIMITS, parseDeck, templates, validateDeck, type Deck, type Layout } from '../src/model'

const fresh = () => cloneDeck(defaultDeck)
const checkError = (change: (deck: any) => void, pattern: RegExp) => {
  const deck = fresh(); change(deck); assert.throws(() => parseDeck(deck), pattern)
}
const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZ1kAAAAASUVORK5CYII='

test('three useful, independent templates and every layout have valid complete schema', () => {
  assert.equal(templates.length, 3)
  assert.equal(new Set(templates.map(t => t.id)).size, 3)
  assert.ok(defaultDeck.slides.length >= 10 && defaultDeck.slides.length <= 12)
  for (const template of templates) {
    assert.deepEqual(validateDeck(template.deck), [])
    assert.ok(template.deck.title.startsWith('Beispiel:'))
    assert.notEqual(template.deck, defaultDeck)
  }
  for (const layout of Object.keys(layouts) as Layout[]) {
    const deck = fresh(), slide = createSlide(layout)
    deck.slides = [slide]
    assert.deepEqual(validateDeck(deck), [], layout)
    assert.notEqual(slide.id, createSlide(layout).id)
  }
  assert.throws(() => createSlide('constructor' as Layout), /Unbekannter/)
})

test('round-trip preserves accents, meaningful whitespace, notes, sources, timing and identity', () => {
  const deck = fresh()
  deck.title = 'Prüfung: œuvre, € und „École“'
  deck.author = ''; deck.institution = ''; deck.date = ''
  const slide = deck.slides[0]
  slide.notes = '  Private Notiz\n\nKeine Veröffentlichung ohne Prüfung. 👩🏽‍🎓\tEnde '
  slide.source = 'Müller (2025), S. 12–14. https://example.org/?a=1&b=2'
  slide.seconds = 0
  const parsed = parseDeck(JSON.stringify(deck))
  assert.deepEqual(parsed, deck)
  parsed.slides[0].notes = 'geändert'
  parsed.theme.primary = '#123456'
  assert.notEqual(parsed.slides[0].notes, deck.slides[0].notes)
  assert.notEqual(parsed.theme.primary, deck.theme.primary)
})

test('required fields, versions, duplicates and unexpected keys are rejected', () => {
  checkError(d => { delete d.slides[0].notes }, /notes: Pflichtfeld/)
  checkError(d => { delete d.theme.scale }, /scale: Pflichtfeld/)
  checkError(d => { d.version = 2 }, /Version 1/)
  checkError(d => { d.extra = true }, /unerlaubtes Feld extra/)
  checkError(d => { d.slides[0].script = 'alert(1)' }, /unerlaubtes Feld script/)
  checkError(d => { d.theme.primary = 'red' }, /#RRGGBB/)
  checkError(d => { d.theme.font = 'https://evil.test/font.woff' }, /Arial oder Georgia/)
  checkError(d => { d.slides[0].layout = 'constructor' }, /unbekannter Folientyp/)
  checkError(d => { d.slides[0].transition = 'eval' }, /unbekannter Übergang/)
  checkError(d => { d.slides[1].id = d.slides[0].id }, /doppelte Folien-ID/)
  checkError(d => { d.slides[0].id = '' }, /1 bis 80/)
  checkError(d => { d.slides[0].id = '../slide' }, /1 bis 80/)
  checkError(d => { d.slides[0].id = 'a'.repeat(81) }, /höchstens 80/)
})

test('prototype, symbol and accessor payloads cannot execute during import', () => {
  const polluted = JSON.parse(JSON.stringify(fresh()).replace('"version":1', '"version":1,"__proto__":{"polluted":true}'))
  assert.throws(() => parseDeck(polluted), /unerlaubtes Feld __proto__/)
  assert.equal(({} as any).polluted, undefined)
  checkError(d => { d.theme = Object.assign(Object.create({ primary: '#000000' }), d.theme) }, /normales JSON-Objekt/)
  checkError(d => { d.slides[0].constructor = 'x' }, /unerlaubtes Feld constructor/)
  checkError(d => { d[Symbol('hidden')] = true }, /unerlaubtes Feld Symbol/)
  let called = false
  const accessor = fresh()
  Object.defineProperty(accessor.slides[0], 'title', { get() { called = true; throw new Error('executed') }, enumerable: true })
  assert.throws(() => parseDeck(accessor), /Getter/)
  assert.equal(called, false)
  const hidden = fresh()
  Object.defineProperty(hidden.theme, 'primary', { value: '#000000', enumerable: false })
  assert.throws(() => parseDeck(hidden), /versteckte Felder/)
  const arrayGetter = fresh()
  Object.defineProperty(arrayGetter.slides, '0', { get() { called = true; throw new Error('executed') }, enumerable: true })
  assert.throws(() => parseDeck(arrayGetter), /Getter/)
  assert.equal(called, false)
})

test('lists must be bounded, dense ordinary JSON arrays with no extra properties', () => {
  checkError(d => { d.slides = [] }, /Mindestens eine/)
  checkError(d => { d.slides = new Array(2 ** 30) }, /höchstens 80/)
  checkError(d => { delete d.slides[1] }, /lückenhafte/)
  checkError(d => { d.slides.tag = 'hidden' }, /zusätzliche Listenfelder/)
  checkError(d => { Object.defineProperty(d.slides, '0', { value: d.slides[0], enumerable: false }) }, /versteckte Listenwerte/)
  checkError(d => { d.slides[0].items = Array.from({ length: 13 }, () => 'Punkt') }, /höchstens 12/)
  const eighty = fresh()
  eighty.slides = Array.from({ length: 80 }, (_, i) => ({ ...createSlide('bullets'), id: `slide-${i}` }))
  assert.equal(parseDeck(eighty).slides.length, 80)
})

test('numeric boundaries stay finite and exact; booleans are not coerced', () => {
  const deck = fresh()
  for (const duration of [1, 240]) { deck.duration = duration; assert.equal(parseDeck(deck).duration, duration) }
  for (const scale of [.8, 1.25]) { deck.theme.scale = scale; assert.equal(parseDeck(deck).theme.scale, scale) }
  for (const seconds of [0, 3600]) { deck.slides[0].seconds = seconds; assert.equal(parseDeck(deck).slides[0].seconds, seconds) }
  for (const duration of [0, 241, 1.1, NaN, Infinity, '20']) checkError(d => { d.duration = duration }, /duration/)
  for (const scale of [.799, 1.251, NaN, Infinity, '1']) checkError(d => { d.theme.scale = scale }, /scale/)
  for (const seconds of [-1, 3601, 2.5, NaN]) checkError(d => { d.slides[0].seconds = seconds }, /seconds/)
  checkError(d => { d.slides[0].reveal = 'false' }, /true oder false/)
  checkError(d => { d.theme.showProgress = 1 }, /true oder false/)
})

test('every text boundary is inclusive, with no truncation or malformed Unicode', () => {
  for (const [field, max] of [['title', LIMITS.title], ['author', LIMITS.author], ['institution', LIMITS.institution], ['date', LIMITS.date]] as const) {
    const deck = fresh(); deck[field] = 'Ä'.repeat(max)
    assert.equal(parseDeck(deck)[field].length, max)
    checkError(d => { d[field] = 'a'.repeat(max + 1) }, /höchstens/)
  }
  for (const [field, max] of [['section', LIMITS.section], ['title', LIMITS.title], ['subtitle', LIMITS.subtitle], ['body', LIMITS.body], ['notes', LIMITS.notes], ['source', LIMITS.source], ['imageAlt', LIMITS.imageAlt]] as const) {
    const deck = fresh(); deck.slides[0][field] = 'é'.repeat(max)
    assert.equal(parseDeck(deck).slides[0][field].length, max)
    checkError(d => { d.slides[0][field] = 'x'.repeat(max + 1) }, /höchstens/)
  }
  checkError(d => { d.slides[0].items = ['x'.repeat(LIMITS.item + 1)] }, /höchstens 1200/)
  for (const bad of ['x\u0000y', '\u000by', '\ud800', '\udc00']) checkError(d => { d.slides[0].notes = bad }, /Steuerzeichen|Unicode/)
})

test('stats and charts enforce value-label pairs; charts preserve decimal spelling', () => {
  const deck = fresh(), slide = createSlide('chart'); deck.slides = [slide]
  for (const item of ['0 | Null', '12,50 | Gruppe A', '2.75 | Gruppe B']) {
    slide.items = [item]; assert.equal(parseDeck(deck).slides[0].items[0], item)
  }
  for (const item of ['-1 | x', 'Infinity | x', 'NaN | x', '1e3 | x', '2% | x', '1.2.3 | x', '1 | ', '1 | x | y', '1, | x']) {
    slide.items = [item]; assert.throws(() => parseDeck(deck), /Diagrammwerte|Kennzahlen/)
  }
  slide.layout = 'stats'; slide.items = ['42 % | Anteil']; assert.deepEqual(validateDeck(deck), [])
  slide.layout = 'columns'; slide.items = ['eins', 'zwei', 'drei']; assert.throws(() => parseDeck(deck), /höchstens zwei/)
})

test('image allowlist rejects external, SVG, MIME mismatch, corrupt headers and oversized dimensions', () => {
  const deck = fresh(); deck.slides[0].image = tinyPng
  assert.deepEqual(imageDimensions(tinyPng), { width: 1, height: 1 })
  assert.equal(parseDeck(deck).slides[0].image, tinyPng)
  for (const image of ['https://example.org/a.png', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', 'data:text/html;base64,PGgxPng8L2gxPg==', tinyPng.replace('image/png', 'image/jpeg'), 'data:image/png;base64,YWJjZA==', 'data:image/png;base64,**==']) {
    deck.slides[0].image = image; assert.throws(() => parseDeck(deck), /eingebettetes PNG/)
  }
  const bytes = Buffer.from(tinyPng.split(',')[1], 'base64')
  bytes.writeUInt32BE(4097, 16)
  deck.slides[0].image = 'data:image/png;base64,' + bytes.toString('base64')
  assert.throws(() => parseDeck(deck), /4096/)
  deck.slides[0].image = 'data:image/png;base64,' + Buffer.alloc(LIMITS.imageBytes + 1).toString('base64')
  assert.throws(() => parseDeck(deck), /2 MiB/)
})

test('header-only JPEG and WebP sizing is bounded for all supported header variants', () => {
  const jpg = Uint8Array.from([255,216,255,192,0,8,8,0,20,0,30,1,255,217])
  assert.deepEqual(imageDimensions('data:image/jpeg;base64,' + Buffer.from(jpg).toString('base64')), { width: 30, height: 20 })
  const webp = Buffer.alloc(30); webp.write('RIFF', 0); webp.writeUInt32LE(22, 4); webp.write('WEBPVP8X', 8); webp.writeUInt32LE(10, 16); webp.writeUIntLE(399, 24, 3); webp.writeUIntLE(199, 27, 3)
  assert.deepEqual(imageDimensions('data:image/webp;base64,' + webp.toString('base64')), { width: 400, height: 200 })
  webp.write('VP8L', 12); webp[20] = 47; webp[21] = 99; webp[22] = 0; webp[23] = 25; webp[24] = 0
  assert.deepEqual(imageDimensions('data:image/webp;base64,' + webp.toString('base64')), { width: 100, height: 101 })
})

test('malformed and oversized JSON fail in German before parsing large input', () => {
  assert.throws(() => parseDeck('{'), /kein gültiges JSON/)
  assert.throws(() => parseDeck(' '.repeat(LIMITS.importBytes + 1)), /10 MiB/)
  assert.throws(() => parseDeck(null), /JSON-Objekt/)
  assert.throws(() => parseDeck([]), /JSON-Objekt/)
  assert.throws(() => parseDeck(1), /JSON-Objekt/)
})

test('bundled authoring skill example follows the exact application schema', () => {
  const path = new URL('../skills/kollo-theme/assets/beispiel.kollo.json', import.meta.url)
  const deck = parseDeck(fs.readFileSync(path, 'utf8'))
  assert.deepEqual(validateDeck(deck), [])
})
