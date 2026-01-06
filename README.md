# QuizForge

A Secure Online Quiz & Assessment Platform

- User Registration (email + password)
- Password hashing using `bcrypt`
- User Login
- JWT token generation
- JWT verification middleware
- Role-based access control (admin, student)
- Protected routes using middleware
- Logout (client-side token removal)

Backend skills shown: Auth flow, middleware, security

---

##  User Roles

- **Admin**
- **Student**

---

## Student Features

- View list of active quizzes
- View quiz details
- Attempt quiz (MCQ-based)
- Submit quiz answers
- Score calculated on backend
- View quiz result immediately
- View past quiz attempts
- View leaderboard (per quiz)

 Backend logic shown: evaluation, validation, data filtering

---

## Admin Features

- Admin login
- Create quiz
- Add questions to quiz
- Edit quiz
- Delete quiz
- Publish / unpublish quiz
- View all student results for a quiz

 Backend skills shown: CRUD APIs, access control

---

## Quiz Management

- Quiz title & description
- Multiple questions per quiz
- Multiple options per question
- Single correct answer
- Quiz status (active / inactive)
- One attempt per user (optional but good)

---

##  Results & Leaderboard

- Store quiz results in `Firestore`
- Score calculation on backend
- Leaderboard sorted by score
- Timestamp-based tie-breaker

 Backend skills shown: sorting, aggregation logic (manual)
