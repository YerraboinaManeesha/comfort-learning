# ComfortLearning — Full-Stack (MongoDB)

A course marketplace app with a real backend: **Node.js + Express API** backed by **MongoDB**. By default it runs entirely self-contained — no database to install or connect. The cart persists server-side per browser session (within a single run of the server), so it survives a page refresh — that's the actual difference from a front-end-only demo. It also has real user accounts: registration, login, hashed passwords, and a login-history log, all backed by the database.

## Tech stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript (`fetch` API, no framework)
- **Backend:** Node.js, Express
- **Database:** MongoDB — via `mongodb-memory-server` by default (a real MongoDB that runs in-process, zero setup), or a real persistent MongoDB if you set `MONGODB_URI`
- **Auth:** `bcryptjs` for password hashing, `express-session` for cookie-based sessions

## Project structure

```
comfortlearning-fullstack-mongo/
├── server.js          # Express app + all API routes
├── db.js              # MongoDB connection (Mongoose)
├── models/
│   ├── Course.js       # course schema
│   ├── CartItem.js     # cart line-item schema (sessionId + course + quantity)
│   ├── User.js         # name, email, hashed password
│   └── LoginHistory.js # one row per login attempt (success or failure)
├── middleware/
│   └── auth.js         # requireAuth — blocks a route unless logged in
├── routes/
│   └── auth.js         # register, login, logout, me, history
├── data/
│   └── courses.js      # the starter course catalogue (shared by auto-seed and scripts/seed.js)
├── scripts/
│   └── seed.js         # manually re-seed courses (rarely needed — server.js auto-seeds on startup)
├── package.json
├── .env.example        # copy to .env and fill in your Mongo connection string
└── public/              # served as static files by Express
    ├── index.html
    ├── style.css
    ├── logos.js         # inline SVG logos, keyed by logoKey
    ├── auth.js           # login/register modal, account menu, login-history panel
    └── script.js         # fetches courses/cart from the API and renders the UI
```

## API endpoints

**Courses & cart**

| Method | Route              | What it does                                  |
|--------|---------------------|------------------------------------------------|
| GET    | `/api/courses`      | List all courses                                |
| GET    | `/api/cart`         | Get this session's cart (with course data populated) |
| POST   | `/api/cart`         | Add a course to the cart — `{ courseId }`       |
| PUT    | `/api/cart/:id`     | Change quantity — `{ delta: 1 }` or `{ delta: -1 }` |
| DELETE | `/api/cart/:id`     | Remove one course from the cart                |
| DELETE | `/api/cart`         | Clear the whole cart                            |

**Auth**

| Method | Route                  | What it does                                       |
|--------|-------------------------|------------------------------------------------------|
| POST   | `/api/auth/register`   | Create an account — `{ name, email, password }`. Logs the user in immediately. |
| POST   | `/api/auth/login`      | Log in — `{ email, password }`. Records a row in login history either way. |
| POST   | `/api/auth/logout`     | Destroy the session                                  |
| GET    | `/api/auth/me`         | Who's currently logged in (`{ user: null }` if nobody) |
| GET    | `/api/auth/history`    | This user's last 20 login attempts, newest first — **requires login** |

## Setup

**No MongoDB install required.** By default, the app starts its own real, self-contained MongoDB automatically, in memory, the moment it runs.

**1. Install dependencies:**
```bash
npm install
```

**2. Run it:**
```bash
npm start
```
Visit **http://localhost:3000**. The course catalogue seeds itself automatically on first startup.

For auto-restart while developing:
```bash
npm run dev
```

That's it — courses, cart, registration, login, and login history all work immediately, no `.env` file, no database account, no separate install.

> **Note:** the very first time you run `npm start`, `mongodb-memory-server` downloads a small MongoDB binary in the background (a few tens of MB) — this needs an internet connection once. After that it's cached locally and every future start is instant, fully offline.

### The tradeoff: data doesn't persist between restarts

Because the default database lives in memory inside the Node process, everything resets when you stop the server — including any accounts you registered and their login history. The course catalogue re-seeds itself automatically, so browsing/cart always works right away, but don't rely on this mode for data you want to keep.

### Switching to a real, persistent database

When you're ready for data that survives a restart (e.g. before deploying, or for genuine day-to-day use):

1. Get a MongoDB connection — either install MongoDB Community Server locally, or make a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud, no install).
2. `cp .env.example .env`, then uncomment `MONGODB_URI` and fill in your connection string.
3. `npm start` — the app detects `MONGODB_URI` and connects to that instead of starting an in-memory database. Run `npm run seed` once to load the starter courses.

## How the cart persistence works

Each visitor gets a session cookie (via `express-session`). Every cart action — add, change quantity, remove, clear — writes to the `cartitems` collection in MongoDB, keyed by that session id, with a `course` field referencing the `courses` collection (fetched back with `.populate('course')`, MongoDB's equivalent of a SQL join). Refresh the page, close the tab and come back later, and the cart is still there.

## How passwords and login history work

- Passwords are **never stored as plain text**. `bcryptjs` hashes the password with a random salt (`bcrypt.hash`) before it's saved, and login compares the typed password against the hash (`bcrypt.compare`) — the plain password itself never touches the database.
- Every login **attempt** — successful or not — writes a row to the `loginhistories` collection, with a timestamp, IP address, and whether it succeeded. Failed attempts against an email that doesn't exist are still logged (with `user: null`), which is useful for spotting brute-force attempts in a real system.
- Login history is only visible to the logged-in user themselves (`requireAuth` middleware checks `req.session.userId` before the route runs).

## Notes for interviews

- Course data lives in MongoDB (`courses` collection), not hardcoded in the frontend — fetched via `GET /api/courses`.
- The cart is a separate collection referencing courses by `ObjectId`, matched to a session — a genuine document-database data model, not a flat array.
- `Course.exists()`, `findOneAndUpdate` with `upsert`, and `.populate()` are the kinds of Mongoose patterns worth being able to talk through — they map to real interview questions about how MongoDB differs from a relational database (no joins at the DB engine level; population is done by Mongoose issuing a second query).
- Authentication uses hashed passwords (`bcryptjs`) and server-side sessions (`express-session`) — not JWTs. Worth knowing the tradeoff: sessions are simpler and easier to revoke (just delete the session), while JWTs are stateless and scale better across multiple servers. A natural "what would you add next" answer.
- There's still no payment processing — "Proceed" opens the real, official resource for that course, since this is a learning/portfolio project, not a real storefront. That's an intentional, explainable boundary, not an oversight.
