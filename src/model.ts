export const layouts = {
  title: 'Titelfolie', section: 'Kapitel', bullets: 'Kernaussagen', columns: 'Zwei Perspektiven',
  process: 'Ablauf', stats: 'Kennzahlen', quote: 'Zitat', code: 'Code', image: 'Bild',
  chart: 'Balkendiagramm', references: 'Quellen', closing: 'Abschluss',
} as const
export type Layout = keyof typeof layouts
export type SlideLayout = Layout
export type Theme = {
  background: string; foreground: string; muted: string; primary: string; secondary: string
  font: 'Arial' | 'Georgia'; scale: number; showProgress: boolean
}
export type Slide = {
  id: string; layout: Layout; section: string; title: string; subtitle: string; items: string[]
  body: string; image: string; imageAlt: string; notes: string; source: string
  transition: 'none' | 'fade' | 'slide' | 'zoom'; reveal: boolean; seconds: number
}
export type Deck = {
  version: 1; title: string; author: string; institution: string; date: string; duration: number
  theme: Theme; slides: Slide[]
}
export const LIMITS = Object.freeze({
  importBytes: 10 * 1024 * 1024, slides: 80, title: 200, author: 160, institution: 200, date: 80,
  durationMin: 1, durationMax: 240, scaleMin: .8, scaleMax: 1.25, id: 80, section: 100,
  subtitle: 600, items: 12, item: 1200, body: 8000, notes: 20000, source: 2000, imageAlt: 300,
  secondsMin: 0, secondsMax: 3600, imageBytes: 2 * 1024 * 1024, imageEdge: 4096,
})
const DECK_KEYS = ['version', 'title', 'author', 'institution', 'date', 'duration', 'theme', 'slides']
const THEME_KEYS = ['background', 'foreground', 'muted', 'primary', 'secondary', 'font', 'scale', 'showProgress']
const SLIDE_KEYS = ['id', 'layout', 'section', 'title', 'subtitle', 'items', 'body', 'image', 'imageAlt', 'notes', 'source', 'transition', 'reveal', 'seconds']
const encoder = new TextEncoder()
const owns = (value: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(value, key)

function record(value: unknown, keys: string[], path: string, errors: string[]): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    errors.push(`${path}: normales JSON-Objekt erwartet.`); return false
  }
  const descriptors = Object.getOwnPropertyDescriptors(value)
  let safe = true
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !keys.includes(key) || ['__proto__', 'prototype', 'constructor'].includes(key)) {
      errors.push(`${path}: unerlaubtes Feld ${String(key)}.`); safe = false; continue
    }
    const descriptor = descriptors[key]
    if (descriptor.get || descriptor.set || !descriptor.enumerable) {
      errors.push(`${path}.${key}: Getter, Setter und versteckte Felder sind nicht erlaubt.`); safe = false
    }
  }
  for (const key of keys) if (!owns(value, key)) { errors.push(`${path}.${key}: Pflichtfeld fehlt.`); safe = false }
  return safe
}
function string(value: unknown, maximum: number, path: string, errors: string[]): value is string {
  if (typeof value !== 'string') { errors.push(`${path}: Text erwartet.`); return false }
  if (value.length > maximum) { errors.push(`${path}: höchstens ${maximum} Zeichen erlaubt.`); return false }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value)) {
    errors.push(`${path}: nicht druckbare Steuerzeichen sind nicht erlaubt.`); return false
  }
  // Isolated UTF-16 surrogates cannot be faithfully rendered or exported.
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) {
    errors.push(`${path}: ungültige Unicode-Zeichenfolge.`); return false
  }
  return true
}
function finite(value: unknown, min: number, max: number, path: string, errors: string[], integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    errors.push(`${path}: ${integer ? 'ganze ' : ''}Zahl von ${min} bis ${max} erwartet.`)
  }
}
function boolean(value: unknown, path: string, errors: string[]) {
  if (typeof value !== 'boolean') errors.push(`${path}: true oder false erwartet.`)
}
function array(value: unknown, maximum: number, path: string, errors: string[]): value is unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    errors.push(`${path}: JSON-Liste erwartet.`); return false
  }
  if (value.length > maximum) { errors.push(`${path}: höchstens ${maximum} Einträge erlaubt.`); return false }
  for (const key of Reflect.ownKeys(value)) {
    if (key === 'length') continue
    if (typeof key !== 'string' || !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length) {
      errors.push(`${path}: zusätzliche Listenfelder sind nicht erlaubt.`); return false
    }
    const d = Object.getOwnPropertyDescriptor(value, key)!
    if (d.get || d.set || !d.enumerable) { errors.push(`${path}: Getter, Setter und versteckte Listenwerte sind nicht erlaubt.`); return false }
  }
  for (let i = 0; i < value.length; i++) if (!owns(value, i)) { errors.push(`${path}: lückenhafte Listen sind nicht erlaubt.`); return false }
  return value.length <= maximum
}

function imageBytes(value: string): { bytes: Uint8Array; mime: string } | null {
  if (value.length > Math.ceil(LIMITS.imageBytes / 3) * 4 + 64) return null
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match || match[2].length % 4 !== 0) return null
  const base64 = match[2]
  const length = base64.length / 4 * 3 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
  if (length > LIMITS.imageBytes) return null
  try {
    const decoded = atob(base64)
    const bytes = new Uint8Array(decoded.length)
    for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i)
    return { bytes, mime: match[1] }
  } catch { return null }
}
/** Header-only image sizing, shared by validation and contain-layout; no DOM/network. */
export function imageDimensions(value: string): { width: number; height: number } | null {
  const parsed = imageBytes(value)
  if (!parsed) return null
  const { bytes: b, mime } = parsed
  const be16 = (p: number) => (b[p] << 8) | b[p + 1]
  const le16 = (p: number) => b[p] | (b[p + 1] << 8)
  const le24 = (p: number) => b[p] | (b[p + 1] << 8) | (b[p + 2] << 16)
  const be32 = (p: number) => b[p] * 16777216 + b[p + 1] * 65536 + b[p + 2] * 256 + b[p + 3]
  const ascii = (p: number, n: number) => String.fromCharCode(...b.slice(p, p + n))
  let width = 0, height = 0
  if (mime === 'png' && b.length >= 24 && b[0] === 137 && ascii(1, 7) === 'PNG\r\n\x1a\n' && ascii(12, 4) === 'IHDR') {
    width = be32(16); height = be32(20)
  } else if (mime === 'jpeg' && b.length >= 12 && b[0] === 255 && b[1] === 216) {
    let p = 2
    while (p + 3 < b.length) {
      if (b[p] !== 255) break
      while (b[p] === 255) p++
      const marker = b[p++]
      if (marker === 217 || marker === 218) break
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue
      const length = be16(p)
      if (length < 2 || p + length > b.length) break
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker) && length >= 8) {
        height = be16(p + 3); width = be16(p + 5); break
      }
      p += length
    }
  } else if (mime === 'webp' && b.length >= 30 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    const kind = ascii(12, 4)
    if (kind === 'VP8X') { width = le24(24) + 1; height = le24(27) + 1 }
    else if (kind === 'VP8 ' && b[23] === 157 && b[24] === 1 && b[25] === 42) {
      width = le16(26) & 16383; height = le16(28) & 16383
    } else if (kind === 'VP8L' && b[20] === 47) {
      width = 1 + b[21] + ((b[22] & 63) << 8)
      height = 1 + ((b[22] & 192) >> 6) + (b[23] << 2) + ((b[24] & 15) << 10)
    }
  }
  return width > 0 && height > 0 && width <= LIMITS.imageEdge && height <= LIMITS.imageEdge ? { width, height } : null
}

function inspect(input: unknown): string[] {
  const errors: string[] = []
  if (!record(input, DECK_KEYS, 'Präsentation', errors)) return errors
  if (input.version !== 1) errors.push('Präsentation.version: nur Version 1 wird unterstützt.')
  for (const [key, max] of [['title', LIMITS.title], ['author', LIMITS.author], ['institution', LIMITS.institution], ['date', LIMITS.date]] as const) string(input[key], max, `Präsentation.${key}`, errors)
  finite(input.duration, 1, 240, 'Präsentation.duration', errors, true)
  if (record(input.theme, THEME_KEYS, 'Design', errors)) {
    const t = input.theme
    for (const key of ['background', 'foreground', 'muted', 'primary', 'secondary']) {
      if (typeof t[key] !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(t[key] as string)) errors.push(`Design.${key}: Farbe im Format #RRGGBB erwartet.`)
    }
    if (!['Arial', 'Georgia'].includes(t.font as string)) errors.push('Design.font: nur Arial oder Georgia sind erlaubt.')
    finite(t.scale, .8, 1.25, 'Design.scale', errors)
    boolean(t.showProgress, 'Design.showProgress', errors)
  }
  if (array(input.slides, LIMITS.slides, 'Folien', errors)) {
    if (!input.slides.length) errors.push('Mindestens eine Folie ist erforderlich.')
    const ids = new Set<string>()
    input.slides.forEach((s, i) => {
      const p = `Folie ${i + 1}`
      if (!record(s, SLIDE_KEYS, p, errors)) return
      if (!string(s.id, LIMITS.id, `${p}.id`, errors) || !/^[A-Za-z0-9_-]+$/.test(s.id as string)) errors.push(`${p}.id: 1 bis 80 Buchstaben, Zahlen, Unterstriche oder Bindestriche erwartet.`)
      else if (ids.has(s.id)) errors.push(`${p}.id: doppelte Folien-ID.`)
      else ids.add(s.id)
      if (typeof s.layout !== 'string' || !owns(layouts, s.layout)) errors.push(`${p}.layout: unbekannter Folientyp.`)
      for (const [key, max] of [['section', LIMITS.section], ['title', LIMITS.title], ['subtitle', LIMITS.subtitle], ['body', LIMITS.body], ['imageAlt', LIMITS.imageAlt], ['notes', LIMITS.notes], ['source', LIMITS.source]] as const) string(s[key], max, `${p}.${key}`, errors)
      if (array(s.items, LIMITS.items, `${p}.items`, errors)) {
        s.items.forEach((v, j) => {
          if (!string(v, LIMITS.item, `${p}.items[${j}]`, errors)) return
          if (s.layout === 'stats' || s.layout === 'chart') {
            const parts = v.split('|')
            if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) errors.push(`${p}: Kennzahlen benötigen „Wert | Bezeichnung“.`)
            else if (s.layout === 'chart' && (!/^\d+(?:[.,]\d+)?$/.test(parts[0].trim()) || !Number.isFinite(Number(parts[0].trim().replace(',', '.'))))) errors.push(`${p}: Diagrammwerte müssen endliche Zahlen ab 0 ohne Einheit sein.`)
          }
        })
        if (s.layout === 'columns' && s.items.length > 2) errors.push(`${p}: Zwei Perspektiven erlauben höchstens zwei Einträge.`)
      }
      if (typeof s.image !== 'string' || (s.image !== '' && !imageDimensions(s.image))) errors.push(`${p}.image: nur eingebettetes PNG, JPEG oder WebP bis 2 MiB und 4096 × 4096 Pixel erlaubt.`)
      if (!['none', 'fade', 'slide', 'zoom'].includes(s.transition as string)) errors.push(`${p}.transition: unbekannter Übergang.`)
      boolean(s.reveal, `${p}.reveal`, errors)
      finite(s.seconds, 0, 3600, `${p}.seconds`, errors, true)
    })
  }
  if (!errors.length) {
    try { if (encoder.encode(JSON.stringify(input)).length > LIMITS.importBytes) errors.push('Die Präsentation überschreitet die Dateigrenze von 10 MiB.') }
    catch { errors.push('Die Präsentation muss vollständig als JSON darstellbar sein.') }
  }
  return errors
}
export function validateDeck(deck: Deck): string[] { return inspect(deck) }
export function parseDeck(input: unknown): Deck {
  let value = input
  if (typeof input === 'string') {
    if (encoder.encode(input).length > LIMITS.importBytes) throw new Error('Die Importdatei darf höchstens 10 MiB groß sein.')
    try { value = JSON.parse(input) } catch { throw new Error('Die Datei enthält kein gültiges JSON.') }
  }
  const errors = inspect(value)
  if (errors.length) throw new Error(errors.join('\n'))
  return JSON.parse(JSON.stringify(value)) as Deck
}
export function cloneDeck(deck: Deck): Deck { return parseDeck(deck) }
let sequence = 0
export function createSlide(layout: Layout): Slide {
  if (!owns(layouts, layout)) throw new Error('Unbekannter Folientyp.')
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? `s-${crypto.randomUUID()}` : `s-${Date.now().toString(36)}-${++sequence}`
  return {
    id, layout, section: '', title: layouts[layout], subtitle: '', body: layout === 'code' ? 'function beispiel(wert) {\n  return wert * 2\n}' : '',
    items: layout === 'columns' ? ['Erste Perspektive', 'Zweite Perspektive'] : layout === 'process' ? ['Frage klären', 'Vorgehen prüfen', 'Ergebnis einordnen'] : layout === 'stats' ? ['24 | Beispielpersonen', '3 | Beispielgruppen', '2 | Vergleichswege'] : layout === 'chart' ? ['12 | A', '18 | B', '24 | C'] : [],
    image: '', imageAlt: '', notes: '', source: '', transition: 'fade', reveal: false, seconds: 60,
  }
}
const originalTheme: Theme = { background: '#080c17', foreground: '#f3f7ff', muted: '#b9c9e2', primary: '#5fcfff', secondary: '#3fffc4', font: 'Arial', scale: 1, showProgress: true }
function exampleSlide(id: string, layout: Layout, title: string, patch: Partial<Slide> = {}): Slide {
  return { ...createSlide(layout), id, section: 'Beispiel', title, source: 'Didaktisches Beispiel. Inhalte und Zahlen sind keine Forschungsergebnisse.', ...patch }
}
function exampleDeck(title: string, slides: Slide[], theme: Theme = originalTheme): Deck {
  return { version: 1, title, author: 'Beispielperson', institution: 'Beispielhochschule', date: '', duration: 20, theme: { ...theme }, slides }
}
const bachelor = exampleDeck('Beispiel: Digitale Lernwege vergleichen', [
  exampleSlide('b-01', 'title', 'Digitale Lernwege vergleichen', { subtitle: 'Beispiel einer Bachelorverteidigung - keine realen Studienergebnisse', notes: 'Das Thema und sämtliche Zahlen ausdrücklich als Beispiel vorstellen.' }),
  exampleSlide('b-02', 'section', 'Von der Frage zur Einordnung', { section: '01 · Orientierung', items: ['Ausgangslage', 'Vorgehen', 'Befunde', 'Grenzen'] }),
  exampleSlide('b-03', 'bullets', 'Eine präzise Frage statt vieler Ziele', { subtitle: 'Beispielfrage: Wie verständlich sind zwei digitale Lernwege?', items: ['Verständlichkeit als klarer Untersuchungsfokus', 'Gleiche Aufgabe für beide Varianten', 'Vorab festgelegte Auswertung'] }),
  exampleSlide('b-04', 'columns', 'Zwei Wege unter gleichen Bedingungen', { items: ['Variante A\nEin langer Hinweis nach der Aufgabe.\nGleiche Bearbeitungszeit.', 'Variante B\nKurze Hinweise an passenden Stellen.\nGleiche Bearbeitungszeit.'] }),
  exampleSlide('b-05', 'process', 'Ein nachvollziehbares Vorgehen', { items: ['Frage und Kriterien', 'Material vorbereiten', 'Beispieldaten auswerten', 'Grenzen benennen'], reveal: true }),
  exampleSlide('b-06', 'stats', 'Datenbasis ausdrücklich kennzeichnen', { subtitle: 'Nur synthetische Beispieldaten', items: ['24 | Beispielpersonen', '2 | Varianten', '3 | Beobachtungskriterien'] }),
  exampleSlide('b-07', 'chart', 'Unterschiede sichtbar machen', { subtitle: 'Fiktive Punktwerte - keine gemessene Wirkung', items: ['12 | Variante A', '18 | Variante B', '15 | Vergleich'] }),
  exampleSlide('b-08', 'code', 'Den Auswertungsschritt offenlegen', { body: 'function mittelwert(werte) {\n  const summe = werte.reduce((a, b) => a + b, 0)\n  return summe / werte.length\n}', subtitle: 'Illustratives Beispiel, kein vollständiges Forschungsprogramm' }),
  exampleSlide('b-09', 'bullets', 'Die Aussagekraft begrenzen', { items: ['Eine kleine Stichprobe erlaubt keine Verallgemeinerung.', 'Der Aufgabenkontext beeinflusst das Ergebnis.', 'Ein Folgeversuch muss die Beobachtung überprüfen.'] }),
  exampleSlide('b-10', 'references', 'Quellen vollständig nachtragen', { items: ['Autor:in (Jahr). Vollständiger Titel. Verlag oder Zeitschrift.', 'Datensatz (Jahr). Herkunft, Version und Zugriffsdatum.', 'Methode: Originalquelle und verwendete Anpassungen.'], source: 'Platzhalter für die eigenen, tatsächlich verwendeten Quellen.' }),
  exampleSlide('b-11', 'closing', 'Was bleibt - und was ist noch offen?', { subtitle: 'Beispielabschluss für die Diskussion', items: ['Eine klare Forschungsfrage', 'Ein nachvollziehbares Vorgehen', 'Eine begrenzte, überprüfbare Aussage'] }),
])
const seminar = exampleDeck('Beispiel: Literatur kritisch ordnen', [
  exampleSlide('s-01', 'title', 'Literatur kritisch ordnen', { subtitle: 'Beispielstruktur für ein Seminarreferat' }),
  exampleSlide('s-02', 'section', 'Eine Debatte nachvollziehbar machen', { section: '01 · Fragestellung', items: ['Begriffe', 'Positionen', 'Einordnung'] }),
  exampleSlide('s-03', 'bullets', 'Den Untersuchungsrahmen abstecken', { items: ['Einen Begriff nachvollziehbar definieren.', 'Den betrachteten Zeitraum eingrenzen.', 'Die Auswahl der Literatur begründen.'] }),
  exampleSlide('s-04', 'process', 'Von der Suche zur eigenen Einordnung', { items: ['Suchbegriffe', 'Kriterien wählen', 'Textvergleich', 'Einordnung'] }),
  exampleSlide('s-05', 'columns', 'Positionen fair gegenüberstellen', { items: ['Position A\nWelche Annahmen trägt sie?\nWelche Belege führt sie an?', 'Position B\nWelche Annahmen trägt sie?\nWelche Belege führt sie an?'] }),
  exampleSlide('s-06', 'quote', 'Eine Aussage im Kontext lesen', { body: 'Ein Zitat ersetzt nicht die eigene Einordnung.', subtitle: 'Formulierungsbeispiel, kein zugeschriebenes Fremdzitat', source: 'Selbst formuliertes didaktisches Beispiel.' }),
  exampleSlide('s-07', 'bullets', 'Übereinstimmung und Widerspruch trennen', { items: ['Gemeinsame Annahmen sichtbar machen.', 'Unterschiedliche Begriffe nicht gleichsetzen.', 'Offene Fragen ausdrücklich benennen.'] }),
  exampleSlide('s-08', 'references', 'Jede übernommene Aussage belegen', { items: ['Originalquelle mit Autor:in, Jahr und Fundstelle.', 'Sekundärquelle als solche kennzeichnen.', 'Eigene Einordnung von fremden Aussagen unterscheiden.'] }),
  exampleSlide('s-09', 'bullets', 'Eine Diskussion öffnen', { items: ['Welche Annahme ist besonders strittig?', 'Welcher Beleg könnte die Debatte weiterbringen?', 'Welche Frage bleibt nach dem Vergleich offen?'] }),
  exampleSlide('s-10', 'closing', 'Eine begründete Einordnung mitnehmen', { subtitle: 'Danke - welche Perspektive fehlt noch?', items: ['Begriffe klären', 'Quellen vergleichen', 'Grenzen sichtbar machen'] }),
], { ...originalTheme, background: '#f5f7fb', foreground: '#182737', muted: '#4f6379', primary: '#176b91', secondary: '#08745e', font: 'Georgia' })
const project = exampleDeck('Beispiel: Einen Prototyp nachvollziehbar prüfen', [
  exampleSlide('p-01', 'title', 'Einen Prototyp nachvollziehbar prüfen', { subtitle: 'Beispiel für eine Projektpräsentation - alle Werte sind fiktiv' }),
  exampleSlide('p-02', 'section', 'Vom Bedarf zur überprüfbaren Aussage', { section: '01 · Projektbericht', items: ['Bedarf', 'Entwurf', 'Prüfung', 'Nächster Schritt'] }),
  exampleSlide('p-03', 'bullets', 'Anforderungen prüfbar formulieren', { items: ['Eine konkrete Nutzungssituation festhalten.', 'Erfolgskriterien vorab definieren.', 'Offene Annahmen von Anforderungen trennen.'] }),
  exampleSlide('p-04', 'process', 'Entwurf und Prüfung verbinden', { items: ['Anforderung', 'Prototyp', 'Prüfszenario', 'Überarbeitung'] }),
  exampleSlide('p-05', 'columns', 'Beobachtung ist noch keine Erklärung', { items: ['Beobachtung\nWas ist im Prüfszenario passiert?\nWelche Daten liegen vor?', 'Einordnung\nWelche Erklärung ist plausibel?\nWelche Alternative bleibt offen?'] }),
  exampleSlide('p-06', 'stats', 'Den Prüfrahmen offenlegen', { subtitle: 'Synthetische Beispieldaten', items: ['3 | Prüfszenarien', '12 | Beispieldurchläufe', '2 | Offene Annahmen'] }),
  exampleSlide('p-07', 'chart', 'Beispielwerte vergleichbar darstellen', { subtitle: 'Fiktive Messpunkte, keine Leistungszusage', items: ['12 | Szenario A', '18 | Szenario B', '27 | Szenario C'] }),
  exampleSlide('p-08', 'bullets', 'Grenzen in nächste Schritte übersetzen', { items: ['Einen realen Einsatz noch nicht behaupten.', 'Fehlende Daten gezielt erheben.', 'Eine Änderung mit denselben Kriterien erneut prüfen.'] }),
  exampleSlide('p-09', 'references', 'Material und Entscheidungen belegen', { items: ['Anforderung: Herkunft und Freigabestand.', 'Prüfmaterial: Version und dokumentierte Bedingungen.', 'Übernommene Methode: vollständige Originalquelle.'] }),
  exampleSlide('p-10', 'closing', 'Was ist belegt - und was folgt daraus?', { items: ['Ein nachvollziehbarer Stand', 'Dokumentierte Grenzen', 'Ein konkreter nächster Prüfschritt'] }),
])
export const templates = [
  { id: 'bachelor', name: 'Bachelorverteidigung', description: '11 Beispielfolien: Forschungsfrage, Methode, Daten und Grenzen.', deck: bachelor },
  { id: 'seminar', name: 'Seminarreferat', description: '10 Beispielfolien für Literaturvergleich und Diskussion im Papierdesign.', deck: seminar },
  { id: 'project', name: 'Projektbericht', description: '10 Beispielfolien für Anforderungen, Prüfung und nächste Schritte.', deck: project },
]
export const defaultDeck: Deck = cloneDeck(bachelor)
