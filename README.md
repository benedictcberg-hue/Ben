# Die Reise nach Innen

Eine interaktive neuropsychologische Selbsterkundungs-Anwendung auf Deutsch.

## Beschreibung

"Die Reise nach Innen" ist eine immersive Web-Anwendung, die Nutzer durch fünf verschiedene "Territorien" des Geistes führt:

1. **Das Tal der Emotionen** (Limbisches System)
2. **Die Festung der Gedanken** (Frontallappen)
3. **Die Bibliothek der Echos** (Temporallappen)
4. **Der Garten der Sinne** (Parietallappen)
5. **Der Brunnen der Lebenskraft** (Vital-Zentrum)

Jedes Kapitel enthält verschiedene Module mit:
- Selbstreflexionsfragen
- Kognitive Spiele (Stroop-Test, N-Back, Trail Making, Simon/Echo)
- Persönlichkeits- und Wahrnehmungsfragen
- Stimmungs- und Lebensqualitätsbewertungen

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build

# Preview Production Build
npm run preview
```

## Entwicklung

Die Anwendung läuft standardmäßig auf `http://localhost:5173`

## Projektstruktur

```
Ben/
├── src/
│   ├── App.jsx          # Hauptkomponente mit allen Spielen und Modulen
│   ├── main.jsx         # React Entry Point
│   └── index.css        # Tailwind Styles
├── index.html           # HTML Template
├── package.json         # Dependencies
├── vite.config.js       # Vite Konfiguration
└── tailwind.config.js   # Tailwind Konfiguration
```

## Features

### Kognitive Spiele
- **Stroop-Test**: Misst kognitive Kontrolle und Aufmerksamkeit
- **Echo/Simon Game**: Testet auditives Gedächtnis
- **N-Back Test**: Prüft Arbeitsgedächtnis
- **Trail Making**: Bewertet visuelle Aufmerksamkeit und Verarbeitungsgeschwindigkeit

### Reflexionsmodule
- Szenario-basierte Fragen mit Insights
- Spektrum-Fragen (z.B. Introversion/Extraversion)
- Likert-Skalen für Struktur und Ordnung
- Rapid-Fire Fragen zu Impulskontrolle
- Wahrnehmungspräferenzen (konkret vs. abstrakt)
- Sensorische Sensitivität
- Stimmungsbarometer
- Chronotyp-Bestimmung
- Lebensrad (Life Balance)

## Lizenz

Privates Projekt
