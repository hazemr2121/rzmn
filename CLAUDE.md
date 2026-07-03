# BrainLeague (دوري المعرفة)

Arabic, Jeopardy-style 2-team trivia game. Two teams pick 6 shared categories, answer
graded questions (easy/medium/hard → 300/600/900 pts), track scores, resume sessions, and
review history. UI text is Arabic (RTL). Questions come from local hardcoded banks **and**
two external trivia APIs.

## Stack

- **Frontend**: React 19 + TypeScript + Vite 8, Tailwind v4 (PostCSS). Entry `src/main.tsx`.
- **Backend**: Express 5 + Mongoose 9 (MongoDB) + JWT auth + bcryptjs. Entry `server/index.js`.
- **External APIs**: `the-trivia-api.com/v2` and `opentdb.com` (see `server/src/services/triviaService.js`).

Frontend and backend are **separate npm packages** with separate `package.json` /
`node_modules`. Root = frontend; `server/` = backend.

## Layout

```
src/
  App.tsx              # root screen router (state machine, no react-router)
  types.ts             # shared TS types (Screen, Category, GameConfig, Scores, ...)
  context/AuthContext  # auth state, fetch wrappers for /auth, localStorage token
  services/gameApi.ts  # fetch wrappers for /game endpoints
  components/          # one file per screen (Login/Signup/Splash/Setup/CategoryPicker/Board/End/History)
  data/                # category definitions
    categories.ts        # local question banks (hardcoded Arabic Q&A) + POINTS/DIFF maps
    aiCategories.ts      # "Made by AI" question banks (Arabic, media via imageUrl/audioUrl/videoUrl)
    apiCategories.ts     # the-trivia-api category metadata
    opentdbCategories.ts # OpenTDB category metadata
  styles/globalStyles.ts # injected global CSS (fonts, vars)
server/
  index.js             # express bootstrap, mounts /api/auth + /api/game
  src/
    config/db.js       # mongoose connect
    middleware/auth.js # protect (JWT) + authorize (role) middleware
    models/            # User, GameSession (mongoose schemas)
    routes/            # auth.js, game.js
    controllers/       # authController.js, gameController.js
    services/triviaService.js  # external trivia API fetching
```

## Architecture notes

- **No router.** `App.tsx` is a `useState`-driven screen machine: `splash → setup → pick →
  board → end`, plus `history`. Auth gates everything; unauthenticated users see
  login/signup only.
- **Category sources** (`Category.source`): `"local"` (banks in `data/categories.ts`),
  `"ai"` (AI-written banks in `data/aiCategories.ts`, behaves like local), `"api"`
  (the-trivia-api), `"opentdb"`, `"islamic"` (server-local bank). API questions are fetched
  per-cell at play time via `POST /game/fetch-questions`, server-side, then cached on the
  session doc.
- **Game state lives server-side** on the `GameSession` doc: `scores`, `currentTeam`,
  `questionsUsed` (per-category list of seen question texts, prevents repeats),
  `apiQuestions` cache, `status` (`active`/`completed`). A session is created with exactly
  **6 categories** (validated in `routes/game.js` and `gameController.createSession`).
- **Auth**: JWT bearer token. `AuthContext` stores token + user in `localStorage`; frontend
  attaches `Authorization: Bearer <token>` on game calls. `server/src/middleware/auth.js`
  `protect` verifies and loads `req.user`. All `/api/game/*` routes are behind `protect`.
- **API response shape**: backend returns `{ success, data, message }`. Frontend reads
  `data.data` and throws `data.message` on `!res.ok`.

## Commands

Frontend (root):
```
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm run preview  # preview built app
```

Backend (`server/`):
```
npm run dev      # nodemon index.js
npm start        # node index.js
```
No test suite exists (server `npm test` is a placeholder that exits 1).

## Config / env

- Frontend: `VITE_API_URL` (defaults to `http://localhost:5000/api`).
- Backend (`server/.env`): `PORT` (default 5000), `MONGO_URI`/Mongo connection, `JWT_SECRET`.
  `.env` files are gitignored — do not commit secrets.

## Conventions

- Styling is mostly **inline styles + injected `<style>` strings** (e.g. `globalStyles.ts`,
  big CSS template literals inside components like `BoardScreen.tsx`), not Tailwind classes,
  despite Tailwind being installed. Match the surrounding style of the file you edit.
- All user-facing copy is **Arabic**. Keep new UI strings Arabic and RTL-aware.
- Backend is CommonJS (`require`); frontend is ESM + TS.
