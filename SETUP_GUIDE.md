# QuizForge Setup & Developer Guide

Complete guide to setting up and developing QuizForge.

## Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn** package manager
- **Firebase** account with Firestore
- **Git** for version control
- **Code Editor** (VS Code recommended)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/QuizForge.git
cd QuizForge
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment

Create `.env` file:

```bash
cp .env.sample .env
```

Fill in the environment variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Firestore Collections
COLLECTION_QUIZZES=quizzes
COLLECTION_RESULTS=results
COLLECTION_DRAFTS=drafts
```

#### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate new private key (JSON)
6. Copy credentials to `.env`

#### Start Backend

```bash
npm start
```

Server will run on `http://localhost:5000`

**Log output:**

```
Server is successfully running on Port 5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Configure Environment

Create `.env` file:

```bash
cp .env.sample .env
```

Fill in environment variables:

```env
# API Configuration
VITE_API_BASE=http://localhost:5000/api
VITE_NODE_ENV=development
```

#### Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

### Backend

```
backend/
├── config/
│   └── firebase.config.js        # Firebase initialization
├── constants/
│   └── cookie.constants.js       # Cookie settings
├── controllers/
│   ├── admin.controller.js       # Admin operations
│   ├── analytics.controller.js   # Analytics (NEW)
│   ├── auth.controller.js        # Authentication
│   ├── quiz.controller.js        # Quiz operations
│   ├── student.controller.js     # Student operations
│   └── user.controller.js        # User profile (NEW)
├── middlewares/
│   ├── auth.middleware.js        # Token verification
│   ├── authRole.middleware.js    # Role authorization
│   ├── errorHandler.middleware.js # Error handling (NEW)
│   ├── logger.middleware.js      # Request logging (NEW)
│   ├── timerValidation.middleware.js
│   └── validation.middleware.js  # Input validation (NEW)
├── models/
│   ├── quiz_model.json           # Quiz schema
│   ├── results.model.json        # Results schema
│   └── user.json                 # User schema
├── routes/
│   ├── adminQuiz.routes.js       # Admin routes
│   ├── auth.routes.js            # Auth routes
│   └── user.routes.js            # User routes
├── services/
│   ├── admin.service.js          # Admin logic
│   ├── analytics.service.js      # Analytics (NEW)
│   ├── auth.service.js           # Auth logic
│   ├── encrytion.service.js      # Password hashing
│   ├── quiz.service.js           # Quiz logic
│   ├── student.service.js        # Student logic
│   ├── token.service.js          # JWT handling
│   └── user.service.js           # User logic (NEW)
├── utils/
│   ├── quizzes.utils.js          # Quiz utilities
│   └── users.utils.js            # User utilities
├── logs/                          # Request logs (NEW)
├── .env.sample
├── server.js                      # Main server file
└── package.json
```

### Frontend

```
frontend/
├── public/                        # Static assets
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx
│   │   ├── Avatar.jsx
│   │   ├── Footer.jsx
│   │   ├── LeaderboardTable.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── QuestionCard.jsx
│   │   ├── QuizCard.jsx
│   │   └── Sidebar.jsx
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state
│   ├── hooks/
│   │   └── useAuth.jsx           # Auth hook
│   ├── pages/
│   │   ├── AttemptQuiz.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Landing.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── Login.jsx
│   │   ├── QuizDetails.jsx
│   │   ├── Register.jsx
│   │   ├── Result.jsx
│   │   ├── StudentHistory.jsx
│   │   ├── UserProfile.jsx       # Profile page (NEW)
│   │   └── admin/
│   │       ├── AddQuestions.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── Analytics.jsx     # Analytics (NEW)
│   │       ├── CreateQuiz.jsx
│   │       ├── EditQuestion.jsx
│   │       ├── EditQuiz.jsx
│   │       └── ViewResults.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx         # Route configuration
│   ├── services/
│   │   ├── api.js                # Axios instance
│   │   ├── authService.js        # Auth API
│   │   ├── quizService.js        # Quiz API
│   │   └── userService.js        # User API (NEW)
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.sample
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Development Workflow

### 1. Create a New Feature

**Backend Feature Example:**

```bash
# 1. Create service
# backend/services/myfeature.service.js

# 2. Create controller
# backend/controllers/myfeature.controller.js

# 3. Add routes
# Update backend/routes/appropriate.routes.js

# 4. Add validation if needed
# Update backend/middlewares/validation.middleware.js
```

**Frontend Feature Example:**

```bash
# 1. Create page/component
# frontend/src/pages/MyFeature.jsx

# 2. Create service if needed
# frontend/src/services/myfeatureService.js

# 3. Update routes
# frontend/src/routes/AppRoutes.jsx

# 4. Update navigation if needed
# frontend/src/components/Sidebar.jsx
```

### 2. API Integration

**Frontend API Call Example:**

```javascript
import api from "@/services/api";

export const myNewEndpoint = () => api.get("/my-endpoint");
```

**Usage in Component:**

```javascript
import { useQuery } from "react-query";
import { myNewEndpoint } from "@/services/myService";

function MyComponent() {
  const { data, isLoading } = useQuery("key", myNewEndpoint);

  return <div>{/* render data */}</div>;
}
```

### 3. Testing Locally

#### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

#### Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

#### Test Protected Endpoint

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Cookie: quizforge_token=YOUR_JWT_TOKEN"
```

## Available Scripts

### Backend

```bash
npm start        # Start dev server with auto-reload
npm run dev      # Same as start
npm test         # Run tests (if configured)
```

### Frontend

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Debugging

### Backend Debugging

**Check Request Logs:**

```bash
tail -f backend/logs/$(date +%Y-%m-%d).log
```

**Enable Debug Mode:**

```env
DEBUG=*
NODE_ENV=development
```

### Frontend Debugging

1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Use React DevTools extension

## Common Issues

### Issue: "Cannot find module 'firebase'"

**Solution:**

```bash
cd backend
npm install firebase
```

### Issue: "CORS error"

**Solution:**
Check `FRONTEND_URL` in backend `.env` matches frontend URL.

### Issue: "Token invalid or missing"

**Solution:**

1. Ensure cookies are being sent (`credentials: true`)
2. Check JWT token expiration
3. Verify token is being stored in cookies

### Issue: "Firestore collection not found"

**Solution:**

1. Create collections in Firestore manually
2. Verify collection names in `.env`
3. Check Firebase permissions

## Best Practices

### Backend

1. **Always validate input** - Use validation middleware
2. **Handle errors properly** - Use try-catch and error handlers
3. **Log important events** - Use logger middleware
4. **Use services** - Keep business logic in services
5. **Secure sensitive data** - Don't return passwords
6. **Use async/await** - For Firebase operations

### Frontend

1. **Use React Query** - For server state management
2. **Handle loading states** - Show spinners/skeletons
3. **Error handling** - Display user-friendly messages
4. **Use TypeScript** - For type safety (future)
5. **Lazy load components** - For performance
6. **Responsive design** - Mobile-first approach

## Deployment

### Backend Deployment (Firebase/Heroku)

```bash
# Set up production environment
cp .env.sample .env.production
# Update .env.production with production values

# Deploy
npm run build  # If applicable
# Use your hosting platform's deployment method
```

### Frontend Deployment (Vercel/Netlify)

```bash
# Build production bundle
npm run build

# Deploy using platform's CLI or connect GitHub repo
```

## Performance Optimization

### Backend

- ✅ Implement rate limiting
- ✅ Add database indexes
- ✅ Cache frequent queries
- ✅ Optimize Firebase queries

### Frontend

- ✅ Code splitting with React.lazy()
- ✅ Image optimization
- ✅ CSS minification (Tailwind)
- ✅ Bundle size monitoring

## Security Checklist

- [ ] Remove console.logs in production
- [ ] Use HTTPS in production
- [ ] Validate all inputs
- [ ] Sanitize data
- [ ] Use secure cookies (HTTPOnly, SameSite)
- [ ] Implement rate limiting
- [ ] Use CORS properly
- [ ] Hash passwords with bcrypt
- [ ] Validate JWT tokens
- [ ] Log security events

## Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Changelog](./CHANGELOG.md)
- [README](./README.md)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [JWT Introduction](https://jwt.io/introduction)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

## Support & Contribution

- Create issues for bugs
- Submit PRs for features
- Follow commit message conventions
- Update documentation
- Add tests for new features

## Troubleshooting

### Can't connect to Firestore

1. Check Firebase credentials
2. Verify Firestore is enabled
3. Check IP whitelist if using IP-based auth
4. Review Firebase security rules

### Tests failing locally

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear cache: `npm cache clean --force`
3. Check Node version: `node -v` (should be v14+)

## Contact

For questions or issues, reach out to the development team.

---

**Happy Coding! 🚀**
