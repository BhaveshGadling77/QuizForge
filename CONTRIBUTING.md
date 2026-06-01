# Contributing To QuizForge

Thanks for taking the time to improve QuizForge. This project has separate frontend and backend apps, so most changes should be scoped to the layer they affect unless the feature clearly crosses both.

## Getting Started

1. Fork or clone the repository.
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create environment files:

```bash
cp backend/.env.sample backend/.env
cp frontend/.env.sample frontend/.env
```

5. Fill in Firebase, JWT, encryption, and API values. See [README.md](./README.md) for the full environment variable list.

## Running Locally

Start the backend:

```bash
cd backend
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: usually `http://localhost:5000`
- API base: `http://localhost:5000/api`

## Branches And Commits

Use a short branch name that describes the change:

```txt
fix/result-markdown-rendering
feature/about-page
docs/update-workflow-notes
```

Prefer conventional commit messages:

```txt
fix(auth): rehydrate session from http-only cookie
feat(results): render question markdown in breakdown
docs: add backend auth flow notes
```

## Code Style

General:

- Keep changes focused and avoid unrelated refactors.
- Follow the patterns already used in the surrounding files.
- Prefer clear names over extra comments.
- Add comments only when the logic is not obvious.
- Do not change data models unless the issue explicitly requires it.

Frontend:

- Use existing React, React Router, React Query, Axios, and Tailwind patterns.
- Keep pages responsive.
- Reuse shared components and services when possible.
- Preserve the existing dark QuizForge visual language.
- For Markdown content, use the existing `react-markdown`, `remark-gfm`, and `rehype-highlight` approach.

Backend:

- Keep controllers thin and place business logic in services.
- Use middleware for auth, role checks, and request validation concerns.
- Use appropriate status codes:
  - `401` for missing or invalid authentication.
  - `403` for authenticated users who are not allowed to perform an action.
  - `400` for invalid request data.
  - `404` for missing resources.
  - `500` for unexpected server errors.
- Do not expose private quiz access tokens to students.
- Preserve HTTP-only cookie behavior for JWT sessions.

## Authentication Guidelines

The backend is the source of truth for auth.

- Login/register/Google OAuth should issue `quizforge_token`.
- `quizforge_token` should remain HTTP-only.
- Frontend code should not read or store JWTs manually.
- Session restore should happen by calling the protected backend session endpoint.
- Admin routes must use both authentication and role authorization.

## Result And Quiz Guidelines

- Objective questions should be auto-graded during submission.
- Subjective questions should remain pending until admin evaluation.
- Result pages should use saved result records and question snapshots where needed.
- Avoid changing Firestore document shapes unless there is a planned migration.
- If changing grading behavior, verify leaderboard, history, and result breakdown behavior.

## Testing And Verification

Before opening a pull request, run the checks that apply to your change.

Frontend build:

```bash
cd frontend
npm run build
```

Backend syntax check for edited files:

```bash
node --check path/to/file.js
```

Linting:

```bash
cd frontend
npm run lint
```

Note: the current frontend lint script may need config/dependency updates depending on the installed ESLint version. If lint cannot run because of project configuration, mention that in the pull request.

Manual verification ideas:

- Register and log in with email/password.
- Log in with Google OAuth.
- Refresh the app and confirm the session restores.
- Attempt a public quiz.
- Attempt a private quiz with valid and invalid access tokens.
- Submit objective and subjective answers.
- Confirm result breakdown, leaderboard, history, and admin evaluation flows.

## Pull Request Checklist

- The change is focused and explained clearly.
- README or WORKFLOW docs are updated if behavior changed.
- Frontend builds successfully when frontend code changes.
- Backend files pass `node --check` when backend code changes.
- Auth and role behavior are not weakened.
- No secrets, `.env` files, or generated build outputs are committed.

## Reporting Issues

When reporting a bug, include:

- What you expected to happen.
- What actually happened.
- Steps to reproduce.
- Relevant route/page/API endpoint.
- Browser console or backend logs if available.
- Screenshots for UI issues.

For auth issues, mention whether the problem happens on first login, refresh/session restore, logout, or role-protected navigation.
