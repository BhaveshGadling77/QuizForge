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
- [ ] Private Quizzes with Access Token.

Backend skills shown: Auth flow, middleware, security

---

##  User Roles

- **Admin**
- **Student**

---

## Student Features

- [x] View list of active quizzes
- [x] View quiz details
- [x] Attempt quiz (MCQ-based)
- [x] Submit quiz answers
- [x] Score calculated on backend
- [x] View quiz result immediately
- [x] View past quiz attempts
- [x] View leaderboard (per quiz)

 Backend logic shown: evaluation, validation, data filtering

---

## Admin Features

- [x] Admin login
- [x] Create quiz
- [x] Add questions to quiz
- [x] Edit quiz
- [x] Delete quiz
- [x] Publish / unpublish quiz
- [x] View all student results for a quiz
- [x] view result of a particular student.
- [x] Manual evaluation for the short-subjective questions.

 Backend skills shown: CRUD APIs, access control

---

## Quiz Management

- [x] Quiz title & description
- [x] Multiple questions per quiz
- [x] Multiple options per question
- [x] Single correct answer
- [x] Quiz status (active / inactive)
- [x] One attempt per user

---

##  Results & Leaderboard

- [x] Store quiz results in `Firestore`
- [x] Score calculation on backend
- [x] Leaderboard sorted by score
- [x] Timestamp-based tie-breaker

Backend skills shown: sorting, aggregation logic (manual)

## DataBase indexes we have to make.


techstack :- Firebase, Nodejs, ExpressJs, Reactjs.