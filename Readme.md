# Streaks_JS

A super light weight, MVC personal accountability app. Tracks habits as streaks — similar to Snapchat streaks — stripped of cluttered UI and extra features.

## Quick Start

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build       # build to dist/
npm run preview     # preview the production build locally
npm run deploy      # build + push to GitHub Pages
```

## Testing & Quality

```bash
npm test            # run all tests (Vitest)
npm run test:watch  # watch mode
npm run lint        # Biome lint
npm run format      # Biome auto-format
```

## Architecture

The project follows a Model-View-Controller pattern.

### Model (`src/model/`)
Manages all application state and data. Exposes a clean `Model` API to the controller — never accessed directly from the view. Connects to Firebase Firestore via a swappable data access layer (`dataAccessInterface.js`) that also supports a local `browserDb` backend for offline dev.

Streak calculation lives in `streaks.js` as pure functions, independently testable.

### View (`src/view/view.js`)
Pure DOM factory functions. No framework, no state. Receives data and callbacks from the controller, returns DOM elements.

### Controller (`src/controller/`)
Owns view mode state (`Focus` / `Edit`), wires Model to View, and handles all user interactions. `auth.js` manages the Firebase login gate — on successful login it passes the authenticated user to `renderApp`.

### Data Access Layer (`src/model/dataAccess/`)
Factory pattern via `createDB(source)`. Two implementations: `firebaseDb` (Firestore, production) and `browserDb` (localStorage, local dev). Switch with `VITE_DB_SOURCE=browser` in a `.env` file.

## Environment

Copy `.env.example` to `.env` and adjust:

```
VITE_DB_SOURCE=firebase   # or "browser" for local dev without Firebase
```

## Known Issues

- No TypeScript. The data model is implicit — a clear next step is a TS migration.
