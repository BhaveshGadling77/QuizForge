# QuizForge

A Secure Online Quiz & Assessment Platform

---

## 🚀 Overview

QuizForge is a full-stack web application that allows admins to create and manage quizzes, while students can browse and attempt **public quizzes**.

The platform focuses on secure authentication, role-based access control, and scalable backend design.

---

## 🔐 Core Features

* User Registration (email + password)
* Password hashing using `bcrypt`
* JWT-based authentication
* Role-based access control (Admin / Student)
* Protected routes using middleware
* Logout (client-side token removal)

---

## 👥 User Roles

### **Admin**

* Full control over quizzes and results

### **Student**

* Can access and attempt **public quizzes only**

---

## 🎓 Student Features

* View list of **public active quizzes**
* View quiz details
* Attempt MCQ-based quizzes
* Submit answers
* Score calculated on backend
* View quiz result immediately after submission
* View leaderboard (per quiz)

> ⚠️ Note: Currently, students can only access **public quizzes**.

---

## Bugs in the project.
- [x] calculating result functionality is not working.
- [x] unable to fetch the results on admin login.
- [x] frontend bug of clicking true and false.
- [x] allowing duplicates to add in the options.
- [x] admin can create quiz and publish it publically to attempt.



## functionalities to implement.
- [x] private quiz attempting.
- [ ] chekcing and marking of admin whether the question is correct or not.(WIP)
- [ ] leaderboard functionality.

## 🛠️ Admin Features

* Admin login
* Create quiz
* Add questions to quiz
* Edit quiz
* Delete quiz
* Publish / unpublish quiz
* View all student results for a quiz (to be implemented...)
* View result of a particular student (to be implemented...)
* Manual evaluation for short subjective questions (to be implemented...)

---

## 📚 Quiz Management

* Quiz title & description
* Multiple questions per quiz
* Multiple options per question
* Single correct answer
* Quiz status (active / inactive)
* One attempt per user

---

## 📊 Results & Leaderboard

* Store quiz results in Firebase (Firestore)
* Backend-based score calculation
* Leaderboard sorted by score (to be implemented...)
* Timestamp-based tie-breaker (to be implemented...)

---

## ⚙️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** Firebase Firestore
* **Authentication:** JWT + bcrypt

---

## 🚧 Future Improvements

* Image support for questions
* Private quiz access system (token-based access refinement)
* Improved UI/UX for student quiz attempts
* Database indexing optimization

---

## 💡 Backend Skills Demonstrated

* Authentication & Authorization (JWT)
* Middleware design
* REST API development
* CRUD operations
* Data validation & filtering
* Score evaluation logic
* Leaderboard sorting & aggregation

---

## ⚠️ Project Status

This project is **actively under development**.
Core admin functionalities and public quiz flow are implemented, with additional features being improved continuously.

---
