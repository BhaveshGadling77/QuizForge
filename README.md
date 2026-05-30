# QuizForge 🚀

A Secure, Scalable, and Feature-Rich Online Quiz & Assessment Platform

---

## 📖 Overview

**QuizForge** is a full-stack web application designed to empower educators and administrators to create, manage, and evaluate quizzes seamlessly. For students, it provides a highly engaging, premium interface to attempt quizzes, track performance over time, and view detailed analytical breakdowns. 

The platform places a heavy emphasis on security (AES encryption for private tokens, JWT auth), robust database architecture (Firebase Firestore), and a beautiful modern user experience using React.

---

## ✨ Key Features

### 🔐 Security & Core
- **Authentication**: Secure user registration and login using encrypted passwords (`bcrypt`) and JWT.
- **Role-Based Access Control**: Strict segregation between `admin` and `student` routes.
- **Private Quizzes**: Supports locked "private" quizzes using AES-256-CBC symmetrically encrypted access tokens. 

### 🛠️ Admin Capabilities
- **Comprehensive Quiz Management**: Create, edit, delete, and publish/unpublish quizzes.
- **Diverse Question Types**: 
  - Multiple Choice (MCQ)
  - True / False
  - Short Subjective (requires manual grading)
  - Short Integer (exact number matching)
- **Manual Evaluation Dashboard**: A streamlined interface allowing admins to quickly review short subjective answers. Includes 1-click "Correct/Incorrect" buttons for rapid grading alongside custom point allocation.
- **Analytics View**: View all student submissions for a specific quiz at a glance.

### 🎓 Student Experience
- **Dynamic Dashboard**: Browse available active public quizzes or unlock private quizzes with an access token.
- **Premium Attempt Interface**: A smooth, timer-based UI for taking quizzes.
- **Comprehensive History & Stats**: An animated, analytical dashboard showing total attempts, highest score, average percentage, total accuracy, and recent win streaks.
- **Detailed Result Breakdown**: A question-by-question review showing exactly what the student answered, whether it was correct/incorrect/pending, the points earned, and the correct answer (once evaluated).
- **Global Leaderboard**: Competitive ranking system per quiz, sorted by highest score (descending) and time taken (ascending).

---

## ⚙️ Tech Stack

* **Frontend:** React.js, React Query, React Router v6, TailwindCSS (with custom design tokens and keyframe animations).
* **Backend:** Node.js, Express.js
* **Database:** Firebase Firestore (NoSQL)
* **Security:** JWT (JSON Web Tokens), `bcrypt` (one-way hashing), Node `crypto` (AES-256-CBC symmetric encryption).

---

## 💡 Backend Skills & Architecture Demonstrated

* **Advanced Firestore Queries & Transactions**: Ensuring data consistency during quiz submissions and manual grading via `runTransaction`.
* **Scalable Data Modeling**: Subcollections for questions to avoid document size limits and allow massive quiz banks.
* **Symmetric vs Asymmetric Encryption**: Practical application of AES-256-CBC for reversible tokens so admins can view them, while keeping them encrypted at rest.
* **Complex Aggregations**: Backend logic for computing averages, streaks, and performance stats dynamically across collections.
* **REST API Best Practices**: Standardized response formats, middleware-based token validation, and robust error handling.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Firebase Project with Firestore enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BhaveshGadling77/QuizForge.git
   cd QuizForge
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file based on `.env.sample` and add your Firebase credentials, `JWT_SECRET`, and a 32-byte hex `ENCRYPTION_KEY`.
   ```bash
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
