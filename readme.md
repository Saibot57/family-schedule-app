# 📅 Familjens Veckoschema App

En interaktiv och användarvänlig veckoschema-applikation för familjer med barn. Håll koll på skola, förskola, fritids och alla andra aktiviteter på ett ställe!

## ✨ Funktioner

- **📊 Visuell veckoöversikt** - Se hela veckans schema i en tydlig tidslinje
- **👨‍👩‍👧‍👦 Flera barn** - Hantera schema för alla barn med färgkodning
- **➕ Lägg till aktiviteter** - Enkelt att lägga till nya aktiviteter med klick eller knapp
- **✏️ Redigera och ta bort** - Klicka på aktiviteter för att ändra eller ta bort
- **📝 Anteckningar** - Lägg till påminnelser och viktig information
- **🔄 Återkommande aktiviteter** - Markera aktiviteter som återkommer varje vecka
- **💾 Automatisk sparning** - Allt sparas automatiskt i webbläsaren
- **📱 Responsiv design** - Fungerar på dator, surfplatta och mobil
- **⏰ Tidsindikator** - Se aktuell tid markerad i schemat
- **📤 Export/Import** - Exportera och importera scheman som JSON

## 🚀 Snabbstart

### Installation

1. **Klona eller ladda ner projektet**
```bash
git clone [repository-url]
cd family-schedule-app
```

2. **Installera beroenden**
```bash
npm install
```

3. **Starta utvecklingsservern**
```bash
npm run dev
```

4. **Öppna i webbläsaren**
```
http://localhost:5173
```

### Alternativ: Direkt HTML (utan byggprocess)

Om du vill köra appen direkt utan Node.js, skapa en `index.html` fil:

```html
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Familjens Veckoschema</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="src/App.jsx"></script>
</body>
</html>
```

## 📁 Projektstruktur

```
family-schedule-app/
│
├── src/
│   ├── App.jsx                 # Huvudkomponent
│   ├── App.css                 # Huvudstilar
│   │
│   ├── components/
│   │   ├── WeekView.jsx        # Veckovisning
│   │   ├── WeekView.css
│   │   ├── DayColumn.jsx       # Dagkolumn
│   │   ├── DayColumn.css
│   │   ├── ActivityBlock.jsx   # Aktivitetsblock
│   │   ├── ActivityBlock.css
│   │   ├── ActivityModal.jsx   # Modal för redigering
│   │   └── ActivityModal.css
│   │
│   ├── hooks/
│   │   └── useSchedule.js      # State management hook
│   │
│   └── utils/
│       └── timeHelpers.js      # Hjälpfunktioner för tid
│
├── package.json                # Projektberoenden
├── vite.config.js             # Vite konfiguration
└── README.md                  # Dokumentation
```

## 🎨 Anpassning

### Ändra barn och färger

I `hooks/useSchedule.js`:

```javascript
const initialChildren = [
  { id: 'barn1', name: 'Anna', color: '#ef4444' },  // röd
  { id: 'barn2', name: 'Erik', color: '#3b82f6' },  // blå
  { id: 'barn3', name: 'Lisa', color: '#10b981' }   // grön
];
```

### Ändra arbetstider

I `components/WeekView.jsx`:

```javascript
const timeSlots = generateTimeSlots(6, 20); // 06:00 - 20:00
```

### Lägg till nya aktivitetstyper

I `components/ActivityModal.jsx`:

```javascript
const activityTypes = [
  'Skola', 'Förskola', 'Fritids', 
  'Sport', 'Musik', 'Läkarbesök', 
  'Tandläkare', 'Kalas', 'Läxhjälp',  // Lägg till här
  'Annat'
];
```

## 🔧 Utveckling

### Bygga för produktion

```bash
npm run build
```

Detta skapar en `dist` mapp med optimerade filer redo för driftsättning.

### Förhandsgranska produktionsbygge

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📱 PWA Installation (Progressive Web App)

För att göra appen installerbar på mobiler, lägg till följande i `public/manifest.json`:

```json
{
  "name": "Familjens Veckoschema",
  "short_name": "Veckoschema",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
}
```

## 🚀 Deployment

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
1. Bygg projektet: `npm run build`
2. Dra och släpp `dist` mappen till Netlify

### GitHub Pages
```bash
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

## 🔮 Framtida funktioner

- [ ] **Veckonavigering** - Bläddra mellan olika veckor
- [ ] **Delning** - Dela schema med andra föräldrar
- [ ] **Notifikationer** - Påminnelser för aktiviteter
- [ ] **Synkronisering** - Synka mellan enheter med Firebase
- [ ] **Teman** - Mörkt läge och anpassningsbara teman
- [ ] **Kalenderintegration** - Synka med Google Calendar
- [ ] **Utskrift** - Skriv ut veckoschemat
- [ ] **Statistik** - Se statistik över aktiviteter
- [ ] **Mallar** - Spara och återanvänd schemamallar
- [ ] **Familjemedlemmar** - Olika vyer för olika familjemedlemmar

## 📞 Support

Om du har frågor eller behöver hjälp:
- Skapa ett issue i GitHub
- Kontakta utvecklaren

## 📄 Licens

MIT License - Fritt att använda och modifiera!

---

**Skapad med ❤️ för familjer som vill ha ordning på vardagen**