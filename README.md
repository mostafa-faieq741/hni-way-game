# HNI Way – Learning Object

Pre-game onboarding experience for the HNI Way business simulation.

## Screen Flow

```
Start Screen (no back)
  └─▶ Overview & Objective (no back to Start)
        └─▶ Key Terms (drag-and-drop activity)
              └─▶ Before You Play (setup + turn flow)
                    └─▶ Ready to Start (placeholder)
```

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
```

The `dist/` folder is self-contained. Upload it to TalentLMS or any
web server as a standard HTML web object / iframe embed.

## Adding a Real Video

In `src/screens/StartScreen.jsx`, locate:

```jsx
<StartScreen onStart={goNext} />
```

In `src/App.jsx`, pass the video source:

```jsx
<StartScreen
  onStart={goNext}
  videoSrc="./video.mp4"
  videoPoster="./poster.jpg"
/>
```

Place the MP4 and poster files in the `public/` folder before building.

## Project Structure

```
src/
├── App.jsx                    ← Screen router + navigation logic
├── main.jsx                   ← React entry point
├── styles/
│   └── globals.css            ← Full HNI design system
├── data/
│   ├── keyTerms.js            ← All 22 terms and definitions
│   └── gameData.js            ← Objectives, setup, turn flow content
├── components/
│   ├── HNILogo.jsx            ← Brand logo (PNG + SVG fallback)
│   ├── Button.jsx             ← Primary / secondary / ghost variants
│   ├── VideoPlayer.jsx        ← MP4-ready with placeholder
│   └── Navigation.jsx         ← Back / Next footer bar
└── screens/
    ├── StartScreen.jsx
    ├── ObjectivesScreen.jsx
    ├── KeyTermsScreen.jsx      ← Drag-and-drop matching activity
    ├── BeforeYouPlayScreen.jsx ← Setup + Turn Flow
    └── ReadyToStartScreen.jsx  ← Placeholder for future game screens
```

## Adding Future Game Screens

1. Create `src/screens/GameScreen.jsx`
2. Add it to the `SCREEN_TITLES` array and `renderScreen()` switch in `App.jsx`
3. The navigation system will handle it automatically

## Brand Notes

- Primary: `#91195a` (Magenta Purple)
- Fonts: Montserrat (headings) + Source Sans 3 (body) via Google Fonts
- Design follows HNI Brand Guidelines v2.0 – January 2025
