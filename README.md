# QuizForge

A Secure Online Quiz & Assessment Platform

- [x] User Registration (email + password)
- [x] Password hashing using `bcrypt`
- [x] User Login
- [x] JWT token generation
- [x] JWT verification middleware
- [x] Role-based access control (admin, student)
- [x] Protected routes using middleware
- [x] Logout (client-side token removal)

Backend skills shown: Auth flow, middleware, security

---

##  User Roles

- **Admin**
- **Student**

---

## Student Features

- [x] View list of active quizzes
- [x] View quiz details
- [ ] Attempt quiz (MCQ-based)
- [ ] Submit quiz answers
- [ ] Score calculated on backend
- [ ] View quiz result immediately
- [ ] View past quiz attempts
- [ ] View leaderboard (per quiz)

 Backend logic shown: evaluation, validation, data filtering

---

## Admin Features

- [x] Admin login
- [x] Create quiz
- [x] Add questions to quiz
- [x] Edit quiz
- [x] Delete quiz
- [ ] Publish / unpublish quiz
- [ ] View all student results for a quiz

 Backend skills shown: CRUD APIs, access control

---

## Quiz Management

- [x] Quiz title & description
- [x] Multiple questions per quiz
- [x] Multiple options per question
- [x] Single correct answer
- [ ] Quiz status (active / inactive)
- [ ] One attempt per user (optional but good)

---

##  Results & Leaderboard

- [ ] Store quiz results in `Firestore`
- [ ] Score calculation on backend
- [ ] Leaderboard sorted by score
- [ ] Timestamp-based tie-breaker

Backend skills shown: sorting, aggregation logic (manual)

techstack :- Firebase, Nodejs, ExpressJs, Reactjs.