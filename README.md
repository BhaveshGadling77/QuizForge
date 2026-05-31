# QuizForge

QuizForge is a full-stack online quiz and assessment platform built with React, Express, and Firebase Firestore. It supports separate student and admin workflows, JWT-based authentication, Google OAuth, public and private quizzes, timed attempts, automatic and manual evaluation, result history, and leaderboards.

## Current Status

This project currently includes:

- Email/password registration and login with bcrypt password hashing.
- Google OAuth sign-in through Firebase Authentication.
- JWT session handling with an HTTP-only backend cookie and frontend auth state.
- Role-based access for `student` and `admin` users.
- Admin quiz CRUD with publish/unpublish controls.
- Public and private quizzes, including encrypted private quiz access tokens.
- Question types: MCQ, true/false, short integer, and short subjective.
- Student quiz dashboard, quiz attempt flow, result page, history page, and leaderboard.
- Manual admin evaluation for subjective answers.
- Firebase Firestore as the database.

## Tech Stack

Frontend:

- React 18
- Vite
- React Router
- React Query
- Tailwind CSS
- Axios
- Firebase client SDK for Google OAuth

Backend:

- Node.js
- Express 5
- Firebase Firestore
- Firebase Admin SDK for verifying Google ID tokens
- JSON Web Tokens
- bcrypt
- Node crypto for AES-256-CBC private quiz token encryption

## Project Structure

```txt
QuizForge/
  backend/
    config/
    constants/
    controllers/
    middlewares/
    routes/
    services/
    utils/
    server.js
  frontend/
    src/
      components/
      context/
      hooks/
      pages/
      routes/
      services/
      utils/
```

## Authentication Flow

QuizForge supports two authentication methods.

Email/password:

1. User registers with name, email, password, and role.
2. Backend hashes the password with bcrypt.
3. Backend stores the user in Firestore.
4. Backend issues a JWT and sets `quizforge_token` as an HTTP-only cookie.

Google OAuth:

1. Frontend opens the Firebase Google popup.
2. Firebase returns a Google ID token.
3. Frontend sends the ID token to `POST /api/auth/google`.
4. Backend verifies the ID token with Firebase Admin.
5. Backend finds or creates the app user in Firestore.
6. Backend issues the app JWT and sets `quizforge_token`.

Important role behavior:

- On the Register page, the user selects `student` or `admin` before continuing with Google.
- On the Login page, Google sign-in only signs in an existing Firestore user.
- If a Google email does not exist yet, login shows an error and the user must register first.

For production, allowing public self-registration as `admin` is risky. A safer production setup is to register Google users as `student` only and promote admins manually in Firestore, or require an invite/admin code.

## Firebase Setup

Create a Firebase project and enable:

- Firestore Database
- Authentication
- Google sign-in provider

### Enable Google Provider

1. Open Firebase Console.
2. Go to Authentication -> Sign-in method.
3. Enable Google.
4. Add a support email.
5. Save.

### Authorized Domains

In Firebase Console:

1. Go to Authentication -> Settings -> Authorized domains.
2. Add local/deployed domains.

For local development:

```txt
localhost
```

For Vercel production, add your exact Vercel domain without `https://`:

```txt
your-project.vercel.app
```

If you later use a custom domain, add that too:

```txt
example.com
www.example.com
```

Firebase authorized domains do not generally cover every random Vercel preview URL automatically. Add preview domains manually if you want OAuth to work on those preview deployments.

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.sample`.

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
PORT=5000

COLLECTION_USERS=users
COLLECTION_QUIZZES=quizzes
COLLECTION_QUESTIONS=questions
COLLECTION_RESULTS=results

NODE_ENV=development
ENCRYPTION_KEY=

FRONTEND_LOCAL_URL=http://localhost:5173
FRONTEND_URL=
```

Notes:

- `ACCESS_TOKEN_SECRET` should be a strong random string.
- `ENCRYPTION_KEY` must be a 32-byte hex key for AES-256-CBC. That means 64 hex characters.
- In production, set `NODE_ENV=production`.
- In production, set `FRONTEND_URL` to your deployed frontend URL, for example `https://your-project.vercel.app`.

To generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend

Create `frontend/.env` from `frontend/.env.sample`.

```env
VITE_API_BASE=http://localhost:5000/api

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

For production on Vercel:

```env
VITE_API_BASE=https://your-backend-domain.com/api
```

The `VITE_FIREBASE_*` values come from Firebase Console -> Project settings -> Your apps -> Web app config.

## Local Development

Install dependencies separately for backend and frontend.

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

Start the backend:

```bash
cd backend
npm start
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: based on `PORT`, usually `http://localhost:5000`
- API base: `http://localhost:5000/api`

## Available Scripts

Backend:

```bash
npm start
```

Starts the Express server with Node's `--env-file=.env` and watch mode.

```bash
npm run dev
```

Starts the Express server without `--env-file`. Use this only if your shell already has the environment variables loaded.

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Main API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/google`

Student:

- `POST /api/`
- `GET /api/quizzes`
- `GET /api/quizzes/:quizId/attempt`
- `POST /api/quizzes/:quizId/start`
- `POST /api/quizzes/:quizId/submit`
- `GET /api/quizzes/:quizId/result`
- `GET /api/quizzes/:quizId/leaderboard`
- `GET /api/student/attempt-history`
- `GET /api/student/history-paginated`
- `GET /api/student/stats`

Admin:

- `GET /api/admin/quizzes`
- `POST /api/admin/quizzes`
- `GET /api/admin/quizzes/:quizId`
- `PUT /api/admin/quizzes/:quizId`
- `DELETE /api/admin/quizzes/:quizId`
- `POST /api/admin/quizzes/:quizId/publish`
- `POST /api/admin/quizzes/:quizId/unpublish`
- `GET /api/admin/quizzes/:quizId/questions`
- `POST /api/admin/quizzes/:quizId/questions`
- `PUT /api/admin/quizzes/:quizId/questions/:questionId`
- `DELETE /api/admin/quizzes/:quizId/questions/:questionId`
- `GET /api/admin/quizzes/pending`
- `GET /api/admin/quizzes/:quizId/pending-results`
- `POST /api/admin/results/:resultId/evaluate`
- `GET /api/admin/quizzes/:quizId/results`
- `GET /api/admin/quizzes/:quizId/results/:userId`

## Deployment Notes

Frontend on Vercel:

1. Set the frontend root to `frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add all `VITE_*` environment variables in Vercel.
5. Add the Vercel domain to Firebase Authorized domains.

Backend:

Deploy the `backend` folder to a Node-capable host such as Render, Railway, Fly.io, or a VPS.

Backend production requirements:

- Set all backend environment variables on the host.
- Set `NODE_ENV=production`.
- Set `FRONTEND_URL=https://your-project.vercel.app`.
- Ensure the frontend `VITE_API_BASE` points to `https://your-backend-domain.com/api`.

Cookie/CORS behavior:

- In production, the backend cookie is configured with `secure: true` and `sameSite: "None"`.
- Your backend must be served over HTTPS for the auth cookie to work in production.
- The backend CORS origin uses `FRONTEND_URL` when `NODE_ENV=production`.

## License

This project is licensed under the terms in [LICENSE](./LICENSE).
