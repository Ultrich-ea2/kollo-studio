import { type Deck, type Slide, type Theme } from "./model";
import campusPlan from "./example-assets/campus-plan.json";

/** Original, fictional teaching material. No personal thesis or demo is bundled. */
export type ShowcaseExample = {
  id: string;
  name: string;
  description: string;
  designNotes: string[];
  deck: Deck;
};

const provenance = "Fiktives Lehrbeispiel · keine Forschungsdaten";
function slide(
  id: string,
  layout: Slide["layout"],
  title: string,
  patch: Partial<Slide> = {},
): Slide {
  return {
    id,
    layout,
    title,
    section: "",
    subtitle: "",
    body: "",
    items: [],
    image: "",
    imageAlt: "",
    notes: "",
    source: provenance,
    transition: "fade",
    reveal: false,
    seconds: 40,
    ...patch,
  };
}
function deck(title: string, theme: Theme, slides: Slide[]): Deck {
  return {
    version: 1,
    title,
    author: "Kollo · Beispielstudio",
    institution: "Fiktives Lehrprojekt",
    date: "",
    duration: 5,
    theme,
    slides,
  };
}

export const showcaseExamples: ShowcaseExample[] = [
  {
    id: "lesespuren",
    name: "Lesespuren",
    description:
      "Ein Forschungsargument auf warmem Papier. Große Serifentitel, offene Vergleiche und ein Diagramm mit klarer Grenze.",
    designNotes: [
      "Editorial: Georgia, Papierweiß, Zinnoberrot und feine Trennlinien statt Kartenraster.",
      "Erst Frage, dann Vergleich, dann Befund. Die Balken werden einzeln eingeblendet; die Einheit bleibt immer sichtbar.",
      "Die Zahlen dienen nur zum Üben. Die Schlussfolgerung trennt beobachteten Unterschied und ungeklärte Ursache.",
    ],
    deck: deck(
      "Lesespuren",
      {
        background: "#F5F0E6",
        foreground: "#26231F",
        muted: "#62584B",
        primary: "#AC371F",
        secondary: "#385D56",
        font: "Georgia",
        scale: 1,
        showProgress: false,
        composition: "editorial",
      },
      [
        slide("reading-01", "title", "Was bleibt\nnach dem Lesen?", {
          section: "LESESPUREN / 01",
          subtitle: "Eine Frage. Zwei Formate. Ein begrenzter Befund.",
          seconds: 35,
          notes:
            "Stellen Sie sich zwei Fassungen desselben Textes vor. Die erste läuft durch, die zweite enthält Zwischenüberschriften. Welche Fassung hilft beim Wiedergeben der Inhalte? Diese Präsentation führt durch ein erfundenes Lehrbeispiel. Alle Werte sind konstruiert. Wir üben daran, einen Vergleich zu erklären und seine Grenzen sichtbar zu halten.",
        }),
        slide("reading-02", "columns", "Der Inhalt bleibt gleich.", {
          section: "ANORDNUNG / 02",
          subtitle: "Geändert wird nur die Gliederung des Textes.",
          items: [
            "Fassung A\nEin fortlaufender Text. Gleiche Wörter, gleiche Reihenfolge.",
            "Fassung B\nDerselbe Text mit drei Zwischenüberschriften.",
          ],
          reveal: true,
          notes:
            "Zuerst sehen Sie Fassung A. Sie enthält den gesamten Text als fortlaufenden Absatz. Nun blenden wir Fassung B ein. Die Wörter bleiben gleich, aber Zwischenüberschriften markieren die Abschnitte. Damit ist die beabsichtigte Variation eingegrenzt. Das allein genügt noch nicht, um jeden anderen Einfluss auszuschließen.",
        }),
        slide("reading-03", "process", "Ein Vergleich in drei Schritten.", {
          section: "VORGEHEN / 03",
          items: ["Lesen", "Wiedergeben", "Vergleichen"],
          reveal: true,
          subtitle: "Gleiches Zeitfenster. Dieselben Verständnisfragen.",
          notes:
            "Wir bauen den Ablauf von links nach rechts auf. Zuerst lesen die Personen ihre jeweilige Fassung. Danach beantworten sie dieselben Verständnisfragen, ohne erneut in den Text zu schauen. Schließlich vergleichen wir die Punktwerte. Für eine echte Untersuchung müssten unter anderem Zuteilung, Vorwissen, Material und Auswertung festgelegt werden.",
        }),
        slide("reading-04", "chart", "Im Beispiel: ein Punkt mehr.", {
          section: "BEFUND / 04",
          subtitle:
            "Erfundene Mittelwerte · Punkte (0–10)\nBalkenlänge relativ zum größten dargestellten Wert",
          items: ["6 | Fassung A", "7 | Fassung B"],
          reveal: true,
          notes:
            "Die Einheit steht über dem Diagramm und bleibt beim Einblenden sichtbar. Fassung A erreicht im erfundenen Beispiel sechs von zehn Punkten. Fassung B erreicht sieben. Der Unterschied beträgt einen Punkt auf dieser Skala. Wir sehen hier keine Verteilungen, keine Stichprobengröße und keine Unsicherheit. Aus den beiden Balken folgt deshalb noch keine belastbare Aussage über eine allgemeine Wirkung.",
        }),
        slide("reading-05", "columns", "Unterschied ist nicht Ursache.", {
          section: "EINORDNUNG / 05",
          items: [
            "Sichtbar\nDie beiden erfundenen Mittelwerte unterscheiden sich um einen Punkt.",
            "Noch offen\nStreuung, Zuteilung und mögliche Unterschiede im Vorwissen.",
          ],
          reveal: true,
          notes:
            "Links steht die Aussage, die sich aus den gezeigten Werten direkt ablesen lässt. Rechts stehen die fehlenden Informationen. Die Gestaltung trennt diese Ebenen, damit ein sichtbarer Unterschied nicht versehentlich als Ursachenbeleg gelesen wird. In einer tatsächlichen Arbeit würden wir die passenden Analysen und ihre Einschränkungen ergänzen.",
        }),
        slide("reading-06", "section", "Die nächste Frage ist genauer.", {
          section: "WEITERDENKEN / 06",
          subtitle: "Unter welchen Bedingungen helfen Zwischenüberschriften?",
          items: [
            "Vorwissen erfassen",
            "Textarten vergleichen",
            "Unsicherheit berichten",
          ],
          reveal: true,
          notes:
            "Aus der begrenzten Antwort entsteht eine präzisere nächste Frage. Erstens sollten wir das Vorwissen erfassen. Zweitens wäre zu prüfen, ob das Muster für unterschiedliche Textarten gilt. Drittens müssen Unsicherheiten berichtet werden. Das sind Vorschläge für ein weiteres Vorgehen, keine Ergebnisse dieses Beispiels.",
        }),
        slide("reading-07", "closing", "Eine gute Folie zeigt auch Grenzen.", {
          section: "MITNEHMEN / 07",
          items: [
            "Vergleich erklären",
            "Einheit erhalten",
            "Reichweite benennen",
          ],
          reveal: true,
          seconds: 25,
          notes:
            "Nehmen Sie drei Gestaltungsentscheidungen mit. Erklären Sie, was verglichen wird. Halten Sie Einheit und Bezugsgröße sichtbar. Und nennen Sie, wie weit die Aussage tatsächlich reicht. Die konkrete Gliederung können Sie verändern. Diese drei Entscheidungen helfen jedoch dabei, aus einer Zahlenfolie ein nachvollziehbares Argument zu machen.",
        }),
      ],
    ),
  },
  {
    id: "signalweg",
    name: "Signalweg",
    description:
      "Eine technische Demo als lesbarer Ablauf. Ein leerer Eingang, eine sichtbare Fehlerstelle und eine überprüfbare Korrektur.",
    designNotes: [
      "Technical: tiefe Tinte, Signalfarben, kantige Messmarken und ein konsequenter Ablauf von links nach rechts.",
      "Die Codefolien teilen dieselbe Ausgangslage. Erst der Zugriff, dann die Schutzbedingung: Bewegung zeigt eine fachliche Änderung.",
      "Keine laufende Konsole nötig. Der Code wird erklärt, nicht automatisch ausgeführt; die Demo funktioniert auch offline.",
    ],
    deck: deck(
      "Signalweg",
      {
        background: "#081E2C",
        foreground: "#ECF7F5",
        muted: "#AFCCD1",
        primary: "#A8F36B",
        secondary: "#5BD8F3",
        font: "Arial",
        scale: 1,
        showProgress: true,
        composition: "technical",
      },
      [
        slide(
          "signal-01",
          "title",
          "Ein leerer Eingang.\nEin klarer Vertrag.",
          {
            section: "SIGNALWEG / DEMO",
            subtitle:
              "Wie eine kleine Prüfung einen Fehler sichtbar behandelt.",
            seconds: 30,
            notes:
              "Diese kleine Demo beginnt mit einem Grenzfall. Der Eingang ist eine leere Liste. Wir verfolgen, wo daraus ein Fehler entsteht und wie eine ausdrücklich formulierte Prüfung das Verhalten ändert. Der Code ist ein eigenständiges Lehrbeispiel. Er wird hier als Text gezeigt und führt keine Aktionen aus.",
          },
        ),
        slide("signal-02", "process", "Drei Stationen. Eine Verantwortung.", {
          section: "DATENFLUSS / 01",
          subtitle: "Jede Station übernimmt nur eine Aufgabe.",
          items: ["Eingang", "Prüfung", "Ausgabe"],
          reveal: true,
          notes:
            "Der Datenfluss wird schrittweise aufgebaut. Links kommt der Eingang an. In der Mitte entscheidet eine Prüfung, ob der nachfolgende Zugriff zulässig ist. Rechts steht die Ausgabe: entweder ein Betrag oder eine verständliche Rückmeldung. Die Verbindung zwischen den Stationen erscheint mit dem nächsten Schritt. So bleibt die Reihenfolge nachvollziehbar.",
        }),
        slide("signal-03", "code", "Die Liste ist leer. Der Zugriff folgt.", {
          section: "AUSGANGSLAGE / 02",
          subtitle:
            "JavaScript · Der zweite Block setzt einen ersten Eintrag voraus.",
          body: "const prices = [];\n\nconst first = prices[0];\nconst total = first.net + first.tax;",
          reveal: true,
          notes:
            "Die leere Liste ist bereits sichtbar. Jetzt blenden wir den Zugriff ein. prices an Position null liefert undefined. Der anschließende Zugriff auf net scheitert deshalb. Der Fehler liegt nicht in einer unbekannten Formel. Es fehlt eine ausdrücklich behandelte Voraussetzung: Die Liste muss einen ersten Eintrag enthalten.",
        }),
        slide("signal-04", "code", "Die Voraussetzung wird geprüft.", {
          section: "KORREKTUR / 03",
          subtitle:
            "Die Ausgangslage bleibt gleich. Der neue Zweig behandelt den leeren Fall.",
          body: 'const prices = [];\n\nif (prices.length === 0) {\n  console.log("Noch keine Preise vorhanden.");\n} else {\n  const first = prices[0];\n  console.log(first.net + first.tax);\n}',
          reveal: true,
          notes:
            "Der Eingang bleibt unverändert. Mit dem nächsten Schritt erscheint die Schutzbedingung. Ist die Liste leer, gibt das Programm eine Rückmeldung aus. Andernfalls kann es auf den ersten Eintrag zugreifen. Diese Prüfung behandelt nur die leere Liste. Sie garantiert noch nicht, dass die Felder net und tax existieren oder gültige Zahlen enthalten.",
        }),
        slide("signal-05", "columns", "Zwei Eingänge. Zwei erwartete Wege.", {
          section: "PRÜFEN / 04",
          items: [
            "Leere Liste\nErwartung: verständliche Rückmeldung statt Feldzugriff.",
            "Ein gültiger Eintrag\nErwartung: Summe aus net und tax.",
          ],
          reveal: true,
          notes:
            "Für die Korrektur betrachten wir zwei Wege. Im ersten Fall ist die Liste leer; wir erwarten die Rückmeldung. Im zweiten Fall enthält sie einen gültigen Eintrag; wir erwarten die Summe. Diese Folie beschreibt Erwartungen. Wer das Beispiel ausführt, sollte die tatsächlichen Ausgaben zusätzlich prüfen und dokumentieren.",
        }),
        slide(
          "signal-06",
          "bullets",
          "Die Grenze bleibt ausdrücklich sichtbar.",
          {
            section: "GRENZEN / 05",
            items: [
              "Leere Listen werden behandelt.",
              "Ungültige Feldtypen sind noch nicht geprüft.",
              "Eine fachliche Preisregel ist nicht Teil der Demo.",
            ],
            reveal: true,
            notes:
              "Eine kleine Korrektur darf nicht mehr versprechen, als sie leistet. Sie behandelt leere Listen. Eine umfassende Eingabeprüfung würde außerdem Feldtypen und Wertebereiche kontrollieren. Und ob die Summe aus netto und Steuer fachlich die richtige Regel ist, hängt vom konkreten Anwendungsfall ab. Dieser Teil gehört nicht zum Beispiel.",
          },
        ),
        slide(
          "signal-07",
          "closing",
          "Zeige den Fehler. Erkläre den Vertrag.",
          {
            section: "MITNEHMEN / 06",
            items: [
              "Grenzfall zeigen",
              "Änderung isolieren",
              "Erwartung prüfen",
            ],
            reveal: true,
            seconds: 30,
            notes:
              "Die technische Demo endet mit drei Schritten. Zeigen Sie den Grenzfall so klein, dass er verständlich bleibt. Isolieren Sie die Änderung zwischen vorher und nachher. Und formulieren Sie eine überprüfbare Erwartung. Bewegung ist dann hilfreich, wenn sie genau diese Reihenfolge sichtbar macht.",
          },
        ),
      ],
    ),
  },
  {
    id: "spielraum",
    name: "Spielraum",
    description:
      "Ein Entwurf für einen Campusplatz. Große Bühne, kurze Aussagen und eine Entscheidung, die auf nachvollziehbaren Kriterien beruht.",
    designNotes: [
      "Stage: dunkle Pflaume, warmes Weiß und elektrische Aprikose. Eine klare Seitenkante hält die freie Fläche zusammen.",
      "Wenige große Wörter statt dekorativer Dashboard-Kacheln. Kriterien und Entwurfsentscheidung erscheinen in derselben Reihenfolge.",
      "Ein konzeptioneller Entwurf ohne erfundene Nutzungsstudie. Die abschließende Frage lädt zur konkreten Kritik ein.",
    ],
    deck: deck(
      "Spielraum",
      {
        background: "#24142D",
        foreground: "#FFF5E9",
        muted: "#D4BEDB",
        primary: "#FFB57D",
        secondary: "#C9B8FF",
        font: "Arial",
        scale: 1,
        showProgress: false,
        composition: "stage",
      },
      [
        slide("space-01", "title", "Ein Platz.\nMehr Möglichkeiten.", {
          section: "SPIELRAUM / ENTWURF",
          subtitle:
            "Ein fiktiver Campusplatz wird zum gemeinsamen Aufenthaltsort.",
          seconds: 30,
          notes:
            "Ein Platz kann gleichzeitig Weg, Treffpunkt und Rückzugsort sein. Dieser fiktive Entwurf fragt, wie diese Funktionen nebeneinander bestehen können. Er zeigt keine tatsächlich erhobenen Nutzungsdaten. Wir machen stattdessen die Entwurfsabsicht, die Kriterien und die noch offenen Fragen nachvollziehbar.",
        }),
        slide("space-02", "section", "Drei Tätigkeiten teilen einen Ort.", {
          section: "BEOBACHTUNGSFRAGE / 01",
          items: ["Ankommen", "Zusammenkommen", "Kurz zurückziehen"],
          reveal: true,
          notes:
            "Wir beginnen mit drei Tätigkeiten. Menschen kommen an, treffen andere oder möchten sich kurz zurückziehen. Das sind hier angenommene Nutzungssituationen. In einem realen Projekt würden wir sie durch Beobachtungen und Gespräche prüfen. Für den Entwurf dienen sie zunächst als verständliche Ausgangspunkte.",
        }),
        slide("space-03", "image", "Die Mitte bleibt offen.", {
          section: "ORDNUNG / 02",
          subtitle: "Entwurfsskizze ohne Maßstab · feste Sitzplätze am Rand",
          image: campusPlan.image,
          imageAlt:
            "Fiktiver Campusplatz: Ein durchgängiger Weg verbindet links und rechts. Oberhalb liegt die offene Mitte, unterhalb liegen drei Sitzbereiche am Rand. Skizze ohne Maßstab.",
          notes:
            "Der Entwurf trennt zwei räumliche Angebote. Die offene Mitte lässt verschiedene Nutzungen zu. Der ruhigere Rand bietet Sitzmöglichkeiten mit Abstand zum Durchgang. Das ist eine gestalterische Entscheidung, keine nachgewiesene Wirkung. Ob sie im Alltag trägt, müsste am konkreten Ort geprüft werden.",
        }),
        slide("space-04", "process", "Der Weg bleibt durchgängig.", {
          section: "SEQUENZ / 03",
          subtitle: "Orientierung entsteht entlang einer verständlichen Folge.",
          items: ["Zugang", "Freie Mitte", "Sitzrand"],
          reveal: true,
          notes:
            "Wir lesen den Platz als Folge. Der Zugang bleibt erkennbar. Die Mitte bleibt frei von festen Hindernissen. Der Sitzrand liegt außerhalb des Hauptwegs. Blenden Sie die Stationen nacheinander ein. Die Folie behauptet damit noch keine baurechtliche oder barrierefreie Eignung; dafür braucht es Maße und eine gesonderte Prüfung.",
        }),
        slide("space-05", "columns", "Die Entscheidung folgt Kriterien.", {
          section: "ABWÄGUNG / 04",
          items: [
            "Was der Entwurf will\nFreie Wege, wechselnde Nutzung und mehrere Sitzlagen.",
            "Was noch fehlt\nMaße, Verschattung, Zugänglichkeit und Pflegeaufwand.",
          ],
          reveal: true,
          notes:
            "Links stehen die Ziele des Entwurfs. Rechts stehen Punkte, die für eine belastbare Entscheidung noch geklärt werden müssen. Diese beiden Ebenen gehören zusammen. Ein attraktives Bild ersetzt weder Maße noch die Prüfung von Zugänglichkeit und Unterhalt. Gerade im Entwurf ist eine sichtbare offene Frage eine Stärke.",
        }),
        slide("space-06", "section", "Erst erproben. Dann festlegen.", {
          section: "NÄCHSTER SCHRITT / 05",
          subtitle: "Eine vorläufige Anordnung macht die Idee diskutierbar.",
          items: [
            "Anordnung im Modell prüfen",
            "Rückmeldungen sammeln",
            "Entwurf begründet überarbeiten",
          ],
          reveal: true,
          notes:
            "Der nächste Schritt ist eine vorläufige Anordnung im Modell. Anschließend können Rückmeldungen gesammelt werden. Für jede Änderung sollten wir festhalten, welche Beobachtung oder welches Kriterium sie begründet. Die vorgeschlagene Erprobung liegt noch in der Zukunft. Sie wird nicht als bereits durchgeführte Untersuchung dargestellt.",
        }),
        slide("space-07", "closing", "Wo würdest du bleiben?", {
          section: "GESPRÄCH / 06",
          items: ["Mitte für Begegnung", "Rand für Ruhe", "Wege offen halten"],
          reveal: true,
          seconds: 30,
          notes:
            "Zum Schluss die Frage an das Publikum: Wo würden Sie sich aufhalten, und warum? Beziehen Sie Ihre Antwort auf Mitte, Rand oder Weg. So wird das Feedback konkret genug, um es am Entwurf zu prüfen. Die Präsentation endet nicht nur mit einem Bild, sondern mit einer gezielten Einladung zur Diskussion.",
        }),
      ],
    ),
  },
];
