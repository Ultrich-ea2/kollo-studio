import { imageDimensions, type Deck, type Slide } from "./model";

export type Rect = {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke?: string;
  radius?: number;
  group?: number;
};
export type Text = {
  type: "text";
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize: number;
  color: string;
  bold?: boolean;
  font?: string;
  align?: "left" | "center" | "right";
  group?: number;
};
export type Image = {
  type: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
  alt: string;
  group?: number;
};
export type Element = Rect | Text | Image;
export type SceneElement = Element;
export type Scene = {
  background: string;
  elements: Element[];
  warnings: string[];
};

const WIDTH = 1280,
  HEIGHT = 720,
  LEFT = 56,
  RIGHT = 1224,
  CONTENT_BOTTOM = 616;
const round = (n: number) => Math.round(n * 1000) / 1000;
const lineHeight = (size: number) => size * 1.18;
type TextStyle = {
  size: number;
  color?: string;
  bold?: boolean;
  font?: string;
  align?: Text["align"];
  group?: number;
};
type Box = { x: number; y: number; w: number; h: number };

/** Deliberately conservative, synchronous metrics. No canvas, DOM, OS or font loading. */
export function measureText(
  text: string,
  size: number,
  font = "Arial",
  bold = false,
): number {
  let em = 0;
  for (const c of text) {
    if (/\p{Mark}/u.test(c) || c === "\u200d" || /[\ufe00-\ufe0f]/u.test(c))
      continue;
    if (font === "Courier New") {
      em += 0.62;
      continue;
    }
    if (/\s/u.test(c)) em += 0.32;
    else if (c === "I" || c === "t" || c === "`") em += 0.43;
    else if (/[ilj1.,:;!|']/u.test(c)) em += 0.31;
    else if (c === "@") em += 1.06;
    else if (/[MW%&œŒæÆ]/u.test(c)) em += 1.02;
    else if (c === "m") em += 0.91;
    else if (c === "w") em += 0.8;
    else if (c === "ß") em += 0.68;
    else if (/[A-ZÄÖÜ]/u.test(c)) em += 0.72;
    else if (/[0-9]/u.test(c)) em += 0.6;
    else if (/[a-zäöüß]/u.test(c)) em += 0.57;
    else if (c === "—") em += 1.02;
    else if (/[+*=<>~–]/u.test(c)) em += 0.68;
    else if (/[-/\\()[\]{}]/u.test(c)) em += 0.48;
    else if ((c.codePointAt(0) || 0) > 0x2e7f) em += 1.05;
    else em += 1.02;
  }
  return em * size * (font === "Georgia" ? 1.06 : 1.04) * (bold ? 1.035 : 1);
}

function blend(a: string, b: string, fraction: number): string {
  const channel = (color: string, start: number) =>
    parseInt(color.slice(start, start + 2), 16);
  return (
    "#" +
    [1, 3, 5]
      .map((p) =>
        Math.round(channel(a, p) * (1 - fraction) + channel(b, p) * fraction)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/** Every string remains in the deck. A capacity problem is visible and blocks export. */
export function createScene(slide: Slide, deck: Deck, index: number): Scene {
  const scene: Scene = {
    background: deck.theme.background,
    elements: [],
    warnings: [],
  };
  const t = deck.theme,
    scale = t.scale;
  const panel = blend(t.background, t.primary, 0.075),
    border = blend(t.background, t.muted, 0.24);
  const warn = (message: string) => {
    if (!scene.warnings.includes(message)) scene.warnings.push(message);
  };
  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    radius = 0,
    stroke?: string,
    group?: number,
  ) => {
    if (w <= 0 || h <= 0) return;
    scene.elements.push({
      type: "rect",
      x: round(x),
      y: round(y),
      w: round(w),
      h: round(h),
      fill,
      radius,
      ...(stroke ? { stroke } : {}),
      ...(group ? { group } : {}),
    });
  };
  const line = (
    text: string,
    x: number,
    y: number,
    w: number,
    style: TextStyle,
  ) => {
    const h = lineHeight(style.size);
    scene.elements.push({
      type: "text",
      text,
      x: round(x),
      y: round(y),
      w: round(w),
      h: round(h),
      fontSize: round(style.size),
      color: style.color || t.foreground,
      font: style.font || t.font,
      ...(style.bold ? { bold: true } : {}),
      ...(style.align ? { align: style.align } : {}),
      ...(style.group ? { group: style.group } : {}),
    });
  };
  const wrap = (
    text: string,
    width: number,
    style: TextStyle,
    label: string,
  ): string[] => {
    if (!text) return [];
    const lines: string[] = [];
    const measure = (s: string) =>
      measureText(s, style.size, style.font || t.font, style.bold);
    for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
      if (!paragraph.trim()) {
        lines.push("");
        continue;
      }
      let current = "";
      for (const word of paragraph.trim().split(/\s+/u)) {
        if (measure(word) > width) {
          warn(
            `${label}: Ein Wort ist breiter als sein Textfeld. Wort kürzen oder mit Leerzeichen aufteilen.`,
          );
          if (current) {
            lines.push(current);
            current = "";
          }
          let part = "";
          for (const c of word) {
            if (part && measure(part + c) > width) {
              lines.push(part);
              part = "";
            }
            part += c;
          }
          current = part;
        } else if (!current || measure(current + " " + word) <= width)
          current += (current ? " " : "") + word;
        else {
          lines.push(current);
          current = word;
        }
      }
      lines.push(current);
    }
    return lines;
  };
  const block = (
    text: string,
    box: Box,
    style: TextStyle,
    label: string,
  ): number => {
    const lines = wrap(text, box.w, style, label),
      lh = lineHeight(style.size);
    const capacity = Math.max(0, Math.floor((box.h + 0.001) / lh));
    if (lines.length > capacity)
      warn(
        `${label}: Überlauf (${lines.length} Zeilen, Platz für ${capacity}). Text kürzen, Schriftgröße anpassen oder auf mehrere Folien verteilen.`,
      );
    lines
      .slice(0, capacity)
      .forEach((value, i) => line(value, box.x, box.y + i * lh, box.w, style));
    return Math.min(lines.length, capacity) * lh;
  };
  const bodyStyle: TextStyle = { size: 28 * scale };
  const bodyBlock = (
    text: string,
    y: number,
    width = RIGHT - LEFT,
    x = LEFT,
    maximum = CONTENT_BOTTOM,
  ): number =>
    block(
      text,
      { x, y, w: width, h: Math.max(0, maximum - y) },
      bodyStyle,
      "Text",
    );
  const list = (
    items: string[],
    box: Box,
    fontSize = 28 * scale,
    numbered = true,
  ) => {
    if (!items.length) return;
    const gap = 17,
      inset = numbered ? 62 : 0;
    const style = { size: fontSize };
    const heights = items.map((item, i) =>
      Math.max(
        lineHeight(fontSize),
        wrap(item, box.w - inset, style, `Inhalt ${i + 1}`).length *
          lineHeight(fontSize),
      ),
    );
    const required =
      heights.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
    if (required > box.h + 0.01)
      warn(
        `Inhalte: Überlauf (${items.length} Punkte benötigen ${Math.ceil(required)} px, verfügbar ${Math.floor(box.h)} px). Punkte kürzen oder aufteilen.`,
      );
    let y = box.y;
    items.forEach((item, i) => {
      const h = heights[i];
      if (y + h > box.y + box.h + 0.01) return;
      const group = i + 1;
      if (numbered) {
        rect(
          box.x,
          y + 2,
          36,
          32,
          blend(t.background, i % 2 ? t.secondary : t.primary, 0.14),
          8,
          undefined,
          group,
        );
        line(String(i + 1).padStart(2, "0"), box.x, y + 5, 36, {
          size: 17,
          bold: true,
          color: i % 2 ? t.secondary : t.primary,
          align: "center",
          group,
        });
      }
      block(
        item,
        { x: box.x + inset, y, w: box.w - inset, h },
        { size: fontSize, group },
        `Inhalt ${i + 1}`,
      );
      y += h + gap;
    });
  };

  // Persistent frame: no browser effects are needed to read the exported scene.
  rect(LEFT, 28, 32, 4, t.primary, 2);
  rect(94, 28, 12, 4, t.secondary, 2);
  block(
    slide.section,
    { x: 122, y: 21, w: 1000, h: 40 },
    { size: 16 * scale, color: t.muted },
    "Kapitel",
  );
  rect(LEFT, 639, RIGHT - LEFT, 1, border);
  block(
    slide.source ? "Quelle: " + slide.source : "",
    { x: LEFT, y: 650, w: 1168, h: 33.1 },
    { size: 14, color: t.muted },
    "Quellenangabe",
  );
  line(
    String(index + 1).padStart(2, "0") +
      " / " +
      String(deck.slides.length).padStart(2, "0"),
    1110,
    687,
    114,
    { size: 13, color: t.muted, align: "right" },
  );
  if (t.showProgress) {
    rect(LEFT, 706, 1168, 3, border, 1);
    rect(
      LEFT,
      706,
      1168 *
        Math.max(0, Math.min(1, (index + 1) / Math.max(1, deck.slides.length))),
      3,
      t.primary,
      1,
    );
  }
  if (slide.image && slide.layout !== "image")
    warn(
      "Bild: Das gespeicherte Bild ist in diesem Layout nicht sichtbar. Zum Bildlayout wechseln oder das Bild entfernen.",
    );

  if (slide.layout === "title") {
    const titleStyle = { size: 64 * scale, bold: true };
    const titleH = block(
      slide.title,
      { x: 68, y: 136, w: 854, h: 3 * lineHeight(titleStyle.size) },
      titleStyle,
      "Titel",
    );
    let y = 136 + titleH + 22;
    y += block(
      slide.subtitle,
      { x: 70, y, w: 820, h: Math.min(100, Math.max(0, 492 - y)) },
      { size: 27 * scale, color: t.muted },
      "Untertitel",
    );
    if (slide.body) {
      y += 19;
      y += block(
        slide.body,
        { x: 70, y, w: 820, h: Math.max(0, 490 - y) },
        bodyStyle,
        "Text",
      );
    }
    if (slide.items.length) {
      y += 20;
      list(
        slide.items,
        { x: 70, y, w: 820, h: Math.max(0, 490 - y) },
        26 * scale,
      );
    }
    const identity = [deck.author, deck.institution, deck.date]
      .filter(Boolean)
      .join(" · ");
    block(
      identity,
      { x: 70, y: 540, w: 854, h: 64 },
      { size: 21 * scale, color: t.muted },
      "Vortragsangaben",
    );
    // Abstract academic motif: argument -> evidence -> conclusion; no external assets.
    rect(991, 138, 230, 337, panel, 20, border);
    rect(1015, 169, 182, 4, t.primary, 2);
    for (let i = 0; i < 3; i++) {
      const cy = 211 + i * 76;
      rect(1015, cy, 34, 34, i === 1 ? t.secondary : t.primary, 9);
      rect(
        1065,
        cy + 7,
        102 - i * 14,
        7,
        blend(t.background, t.foreground, 0.65),
        3,
      );
      rect(1065, cy + 22, 118 - i * 10, 4, border, 2);
      if (i < 2) rect(1031, cy + 40, 2, 23, border);
    }
  } else {
    const headingStyle = { size: 60 * scale, bold: true };
    const headingH = block(
      slide.title,
      { x: LEFT, y: 82, w: 1168, h: 3 * lineHeight(headingStyle.size) },
      headingStyle,
      "Titel",
    );
    let contentY = 82 + headingH + 25;
    if (slide.subtitle)
      contentY +=
        block(
          slide.subtitle,
          {
            x: LEFT,
            y: contentY,
            w: 1168,
            h: Math.min(95, Math.max(0, CONTENT_BOTTOM - contentY)),
          },
          { size: 25 * scale, color: t.muted },
          "Untertitel",
        ) + 22;
    if (contentY > CONTENT_BOTTOM)
      warn(
        "Titel und Untertitel lassen keinen Platz für Inhalte. Text kürzen oder auf mehrere Folien verteilen.",
      );
    if (slide.body && !["quote", "code", "image"].includes(slide.layout))
      contentY += bodyBlock(slide.body, contentY) + 22;
    const box: Box = {
      x: LEFT,
      y: Math.min(CONTENT_BOTTOM, contentY),
      w: 1168,
      h: Math.max(0, CONTENT_BOTTOM - contentY),
    };

    if (slide.layout === "bullets" || slide.layout === "references") {
      list(slide.items, box, (slide.layout === "references" ? 24 : 28) * scale);
    } else if (slide.layout === "section") {
      const rows = slide.items.length;
      if (rows) {
        const rowH = 68 * scale,
          gap = 12;
        if (rows * rowH + (rows - 1) * gap > box.h)
          warn(
            "Kapitelübersicht: Überlauf. Weniger Punkte oder kürzere Einträge verwenden.",
          );
        slide.items.forEach((item, i) => {
          const y = box.y + i * (rowH + gap);
          if (y + rowH > box.y + box.h + 0.01) return;
          rect(LEFT, y, 1168, rowH, panel, 12, border, i + 1);
          line(
            String(i + 1).padStart(2, "0"),
            79,
            y + (rowH - lineHeight(27 * scale)) / 2,
            62,
            {
              size: 27 * scale,
              bold: true,
              color: i % 2 ? t.secondary : t.primary,
              group: i + 1,
            },
          );
          block(
            item,
            {
              x: 159,
              y: y + (rowH - lineHeight(28 * scale)) / 2,
              w: 1038,
              h: lineHeight(28 * scale),
            },
            { size: 28 * scale, group: i + 1 },
            `Kapitel ${i + 1}`,
          );
        });
      }
    } else if (slide.layout === "columns") {
      const width = (box.w - 24) / 2;
      slide.items.forEach((item, i) => {
        if (i > 1) {
          warn(
            "Spalten: Mehr als zwei Einträge können nicht angezeigt werden.",
          );
          return;
        }
        const x = LEFT + i * (width + 24),
          accent = i ? t.secondary : t.primary;
        rect(x, box.y, width, box.h, panel, 16, border, i + 1);
        rect(x + 26, box.y + 25, 42, 4, accent, 2, undefined, i + 1);
        const parts = item.replace(/\r\n?/g, "\n").split("\n");
        const title = parts.shift() || "";
        const headH = block(
          title,
          {
            x: x + 26,
            y: box.y + 49,
            w: width - 52,
            h: Math.min(110, Math.max(0, box.h - 65)),
          },
          { size: 30 * scale, bold: true, color: accent, group: i + 1 },
          `Spalte ${i + 1}: Überschrift`,
        );
        block(
          parts.join("\n"),
          {
            x: x + 26,
            y: box.y + 65 + headH,
            w: width - 52,
            h: Math.max(0, box.h - 87 - headH),
          },
          { size: 27 * scale, group: i + 1 },
          `Spalte ${i + 1}`,
        );
      });
    } else if (slide.layout === "process") {
      const count = slide.items.length,
        columns = Math.min(4, count),
        rows = Math.ceil(count / 4),
        gap = 20;
      const width = columns ? (box.w - (columns - 1) * gap) / columns : 0;
      const height = rows
        ? Math.min(234, (box.h - (rows - 1) * gap) / rows)
        : 0;
      if (count && height < 118 * scale)
        warn("Ablauf: Überlauf. Weniger Schritte pro Folie verwenden.");
      slide.items.forEach((item, i) => {
        if (height < 118 * scale) return;
        const x = LEFT + (i % 4) * (width + gap),
          y = box.y + Math.floor(i / 4) * (height + gap);
        rect(x, y, width, height, panel, 16, border, i + 1);
        rect(
          x + 21,
          y + 22,
          44,
          38,
          i % 2 ? t.secondary : t.primary,
          9,
          undefined,
          i + 1,
        );
        line(String(i + 1).padStart(2, "0"), x + 21, y + 27, 44, {
          size: 21,
          color: t.background,
          bold: true,
          align: "center",
          group: i + 1,
        });
        block(
          item,
          { x: x + 21, y: y + 84, w: width - 42, h: height - 102 },
          { size: 26 * scale, bold: true, group: i + 1 },
          `Schritt ${i + 1}`,
        );
        if (i % 4 < columns - 1 && i < count - 1) {
          rect(x + width + 3, y + 43, 14, 2, t.primary, 1, undefined, i + 2);
          rect(x + width + 13, y + 40, 3, 8, t.primary, 1, undefined, i + 2);
        }
      });
    } else if (slide.layout === "stats") {
      const count = slide.items.length,
        columns = Math.min(count, 3),
        rows = Math.ceil(count / 3),
        gap = 24;
      const width = columns ? (box.w - (columns - 1) * gap) / columns : 0;
      const height = rows
        ? Math.min(248, (box.h - (rows - 1) * gap) / rows)
        : 0;
      if (count && height < 130 * scale)
        warn("Kennzahlen: Überlauf. Weniger Kennzahlen pro Folie verwenden.");
      slide.items.forEach((item, i) => {
        if (height < 130 * scale) return;
        const x = LEFT + (i % 3) * (width + gap),
          y = box.y + Math.floor(i / 3) * (height + gap);
        const [value = "", label = ""] = item.split("|").map((v) => v.trim()),
          accent = i % 2 ? t.secondary : t.primary;
        rect(x, y, width, height, panel, 16, border, i + 1);
        rect(x + 24, y + 24, 38, 4, accent, 2, undefined, i + 1);
        const valueH = block(
          value,
          {
            x: x + 24,
            y: y + 47,
            w: width - 48,
            h: Math.min(height - 88, lineHeight(52 * scale)),
          },
          { size: 52 * scale, bold: true, color: accent, group: i + 1 },
          `Kennzahl ${i + 1}`,
        );
        block(
          label,
          {
            x: x + 24,
            y: y + 62 + valueH,
            w: width - 48,
            h: Math.max(0, height - 82 - valueH),
          },
          { size: 25 * scale, group: i + 1 },
          `Kennzahl ${i + 1}: Bezeichnung`,
        );
      });
    } else if (slide.layout === "chart") {
      const entries = slide.items.map((item) => {
        const [v = "", label = ""] = item.split("|").map((s) => s.trim());
        return { value: Number(v.replace(",", ".")), printed: v, label };
      });
      const maximum = Math.max(
        0,
        ...entries.map((entry) =>
          Number.isFinite(entry.value) ? entry.value : 0,
        ),
      );
      const gap = 20,
        rowH = entries.length
          ? Math.min(88, (box.h - (entries.length - 1) * gap) / entries.length)
          : 0;
      if (entries.length && rowH < 58 * scale)
        warn("Diagramm: Überlauf. Weniger Balken pro Folie verwenden.");
      entries.forEach((entry, i) => {
        if (rowH < 58 * scale) return;
        const y = box.y + i * (rowH + gap),
          accent = i % 2 ? t.secondary : t.primary;
        block(
          entry.label,
          { x: LEFT, y, w: 400, h: rowH },
          { size: 25 * scale, group: i + 1 },
          `Balken ${i + 1}: Bezeichnung`,
        );
        const barX = 480,
          barW = 630;
        rect(barX, y + 3, barW, 31, panel, 7, border, i + 1);
        if (entry.value > 0 && maximum > 0)
          rect(
            barX,
            y + 3,
            barW * Math.min(1, entry.value / maximum),
            31,
            accent,
            7,
            undefined,
            i + 1,
          );
        block(
          entry.printed,
          { x: 1126, y: y + 1, w: 98, h: rowH },
          {
            size: 25 * scale,
            bold: true,
            color: accent,
            align: "right",
            group: i + 1,
          },
          `Balken ${i + 1}: Wert`,
        );
      });
    } else if (slide.layout === "quote") {
      rect(LEFT, box.y, 5, box.h, t.primary, 2);
      const quoteH = block(
        slide.body,
        {
          x: LEFT + 36,
          y: box.y + 12,
          w: box.w - 60,
          h: Math.max(0, box.h - 24),
        },
        { size: 36 * scale, bold: true, group: 1 },
        "Zitat",
      );
      if (slide.items.length)
        list(
          slide.items,
          {
            x: LEFT + 36,
            y: box.y + 34 + quoteH,
            w: box.w - 60,
            h: Math.max(0, box.h - 34 - quoteH),
          },
          25 * scale,
        );
    } else if (slide.layout === "code") {
      rect(LEFT, box.y, box.w, box.h, panel, 16, border);
      const size = 23 * scale,
        lh = lineHeight(size),
        lines = slide.body
          .replace(/\r\n?/g, "\n")
          .replace(/\t/g, "    ")
          .split("\n");
      const capacity = Math.max(0, Math.floor((box.h - 40) / lh));
      if (lines.length > capacity)
        warn(
          `Code: Überlauf (${lines.length} Zeilen, Platz für ${capacity}). Code aufteilen oder kürzen.`,
        );
      lines.slice(0, capacity).forEach((value, i) => {
        line(
          String(i + 1).padStart(2, "0"),
          LEFT + 22,
          box.y + 20 + i * lh,
          38,
          { size: 17 * scale, color: t.muted, font: "Courier New", group: 1 },
        );
        if (measureText(value, size, "Courier New") > box.w - 102)
          warn(
            `Codezeile ${i + 1}: Überlauf. Zeile manuell umbrechen; Code wird nicht automatisch verändert.`,
          );
        else
          line(value, LEFT + 80, box.y + 20 + i * lh, box.w - 102, {
            size,
            font: "Courier New",
            group: 1,
          });
      });
      if (slide.items.length)
        warn(
          "Code: Zusätzliche Inhaltspunkte sind in diesem Layout nicht sichtbar. In den Code oder in die Notizen übernehmen oder ein anderes Layout wählen.",
        );
    } else if (slide.layout === "image") {
      const hasText = !!slide.body || slide.items.length > 0,
        imageW = hasText ? 738 : box.w;
      rect(LEFT, box.y, imageW, box.h, panel, 14, border);
      const dimensions = imageDimensions(slide.image);
      if (slide.image && dimensions) {
        const factor = Math.min(
          (imageW - 28) / dimensions.width,
          Math.max(0, box.h - 28) / dimensions.height,
        );
        if (factor > 0) {
          const w = dimensions.width * factor,
            h = dimensions.height * factor;
          scene.elements.push({
            type: "image",
            x: round(LEFT + (imageW - w) / 2),
            y: round(box.y + (box.h - h) / 2),
            w: round(w),
            h: round(h),
            src: slide.image,
            alt: slide.imageAlt,
            group: 1,
          });
        } else
          warn(
            "Bild: Kein Platz unter der Überschrift. Titel und Untertitel kürzen.",
          );
      } else if (slide.image)
        warn(
          "Bild: Ungültiges oder nicht unterstütztes Bild. PNG, JPEG oder WebP erneut einfügen.",
        );
      else
        block(
          "Bild lokal einfügen",
          {
            x: LEFT + 28,
            y: box.y + 28,
            w: imageW - 56,
            h: Math.max(0, box.h - 56),
          },
          { size: 27 * scale, color: t.muted },
          "Bildplatzhalter",
        );
      if (hasText) {
        const x = LEFT + imageW + 28,
          w = box.w - imageW - 28;
        const h = block(
          slide.body,
          { x, y: box.y, w, h: box.h },
          { size: 25 * scale, group: 2 },
          "Bildtext",
        );
        if (slide.items.length)
          list(
            slide.items,
            {
              x,
              y: box.y + h + (h ? 20 : 0),
              w,
              h: Math.max(0, box.h - h - (h ? 20 : 0)),
            },
            24 * scale,
            false,
          );
      }
    } else if (slide.layout === "closing") {
      if (slide.items.length) {
        const gap = 17,
          width = (box.w - 2 * gap) / 3,
          height = Math.min(214, box.h);
        if (slide.items.length > 3)
          warn(
            "Abschluss: Überlauf. Höchstens drei Kerngedanken verwenden oder auf weitere Folien verteilen.",
          );
        slide.items.slice(0, 3).forEach((item, i) => {
          const x = LEFT + i * (width + gap),
            accent = i % 2 ? t.secondary : t.primary;
          rect(x, box.y, width, height, panel, 16, border, i + 1);
          rect(x + 23, box.y + 25, 35, 4, accent, 2, undefined, i + 1);
          block(
            item,
            {
              x: x + 23,
              y: box.y + 57,
              w: width - 46,
              h: Math.max(0, height - 80),
            },
            { size: 27 * scale, bold: true, group: i + 1 },
            `Kerngedanke ${i + 1}`,
          );
        });
      }
    }
  }

  // A visible warning survives screenshots as well as the editor's detailed check.
  if (scene.warnings.length) {
    rect(LEFT, 613, 1168, 24, blend(t.background, "#ffb86b", 0.17), 4);
    line(
      `Layout prüfen: ${scene.warnings.length} Hinweis${scene.warnings.length > 1 ? "e" : ""} - Inhalt kürzen oder aufteilen.`,
      LEFT + 10,
      616,
      1148,
      { size: 14, color: t.foreground, bold: true },
    );
  }
  // Guard future layouts too: no element may silently draw beyond the artboard.
  for (const e of scene.elements) {
    if (
      ![e.x, e.y, e.w, e.h].every(Number.isFinite) ||
      e.x < 0 ||
      e.y < 0 ||
      e.w <= 0 ||
      e.h <= 0 ||
      e.x + e.w > WIDTH + 0.01 ||
      e.y + e.h > HEIGHT + 0.01
    )
      warn(
        "Layout: Ein Element liegt außerhalb der Folie. Inhalt kürzen oder Layout wechseln.",
      );
  }
  return scene;
}

const escapeXml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
/** No foreignObject, script, links or external resources. Export and preview use these exact positions. */
export function svgMarkup(scene: Scene): string {
  const elements = scene.elements
    .map((e) => {
      const group =
        e.group === undefined
          ? ""
          : ` data-group="${escapeXml(String(e.group))}"`;
      if (e.type === "rect")
        return `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.radius || 0}" fill="${escapeXml(e.fill)}"${e.stroke ? ` stroke="${escapeXml(e.stroke)}"` : ""}${group}/>`;
      if (e.type === "image")
        return `<image x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" href="${escapeXml(e.src)}" preserveAspectRatio="xMidYMid meet"${group}><title>${escapeXml(e.alt)}</title></image>`;
      const x =
        e.align === "center"
          ? e.x + e.w / 2
          : e.align === "right"
            ? e.x + e.w
            : e.x;
      const anchor =
        e.align === "center" ? "middle" : e.align === "right" ? "end" : "start";
      return `<text x="${round(x)}" y="${round(e.y + e.fontSize * 0.92)}" font-family="${escapeXml(e.font || "Arial")}" font-size="${e.fontSize}" fill="${escapeXml(e.color)}" font-weight="${e.bold ? 700 : 400}" text-anchor="${anchor}" xml:space="preserve"${group}>${escapeXml(e.text)}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="${escapeXml(scene.background)}"/>${elements}</svg>`;
}
