# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite)
npm run build      # build to dist/
npm run preview    # preview the built app
npm run deploy     # build + deploy to GitHub Pages (gh-pages -d dist)
```

No test runner is configured yet.

## Architecture

This is a vanilla JS MVC habit-tracker SPA bundled with Vite.

**Entry point:** `src/main.js` — mounts the Firebase auth gate, then calls `renderApp()` on successful login.

**Auth:** `src/controller/auth.js` — wraps Firebase `onAuthStateChanged` / `signInWithEmailAndPassword`. Renders a login form; on success removes itself and calls `onReady`.

**Controller:** `src/controller/controller.js` — `renderApp()` initializes the Model, builds the DOM via View factories, and wires all event handlers. Contains view-mode logic (`data-view-mode` attribute toggling between `Focus` and `Edit` modes).

**Model:** `src/model/model.js` — singleton `Model` object that aggregates:
- `groupStore` — CRUD for habit groups (stored as Firestore documents)
- `timestampStore` — add/delete ISO timestamps within groups
- `streakStore` — delegates to `runStreaks()` for streak computation
- `viewState` — tracks current view mode (`Focus` | `Edit`)
- `statusState` — app status string

The Model directly uses `DB_SOURCES.firebase` (hardcoded in `model.js`). The `dataAccessInterface.js` factory also exposes a `browser` source (localStorage) but it is not currently used by the app.

**Data access layer:** `src/model/dataAccess/`
- `dataAccessInterface.js` — factory `createDB(source)` returning a unified `{ getAll, getById, getWhere, add, update, deleteAll, deleteById }` interface
- `databases/firebaseDb.js` — Firestore implementation
- `databases/browserDb.js` — localStorage implementation (available but unused by default)

**Streak logic:** `src/model/streaks.js` — pure functions. `runStreaks(timestamps[])` builds a daily interval map from the oldest entry to today, then counts consecutive days with at least one timestamp. Returns `{ currentStreak, largestStreak, totalCompletions, totalIntervals }`.

**View:** `src/view/view.js` — pure DOM factory functions, no framework. `createAppView()` assembles the full UI shell and returns handles to key elements. Individual group/entry elements are built by `createGroupElements` / `createGroupEntry`.

**Firebase config:** `firebase-config.js` (project root) — contains the Firebase project credentials and exports `{ db, auth }`. The Firestore emulator line is commented out.

**Deployment:** GitHub Pages via `gh-pages`. Vite base is `/streaks_js/`. A GitHub Actions workflow (`.github/workflows/jekyll-gh-pages.yml`) also exists but the primary deploy path is `npm run deploy`.
