# QuizForge

A Secure Online Quiz & Assessment Platform

---

## 🚀 Overview

QuizForge is a full-stack web application that allows admins to create and manage quizzes, while students can browse and attempt **public quizzes**.

The platform focuses on secure authentication, role-based access control, and scalable backend design with comprehensive analytics and user management.

---

## ✨ New Features (Latest Update)

### Backend Enhancements

- ✅ **Input Validation Middleware** - Validates email, password, names, and quiz data
- ✅ **Error Handling** - Centralized error handling with custom error classes
- ✅ **Request Logging** - Track all API requests and responses in log files
- ✅ **User Profile Management** - Update name, email, change password
- ✅ **Admin Analytics** - Comprehensive dashboard with quiz performance metrics
- ✅ **Health Check Endpoint** - Monitor server status
- ✅ **Better API Responses** - Standardized response format across all endpoints

### Frontend Enhancements

- ✅ **User Profile Page** - View and edit profile information
- ✅ **Password Change UI** - Secure password change form
- ✅ **Admin Analytics Dashboard** - Visual analytics for quiz performance
- ✅ **Navigation Updates** - New sidebar links for profile and analytics
- ✅ **User Statistics** - Display quiz attempt statistics

---

## 🔐 Core Features

- User Registration (email + password)
- Password hashing using `bcrypt`
- JWT-based authentication
- Role-based access control (Admin / Student)
- Protected routes using middleware
- Logout (client-side token removal)
- **Profile Management** (NEW)
- **Analytics Dashboard** (NEW)
- **Input Validation** (NEW)
- **Error Logging** (NEW)

---

## 👥 User Roles

### **Admin**

- Full control over quizzes and results
- View analytics and student performance
- Manage all quiz content
- **NEW:** Analytics dashboard with performance metrics
- **NEW:** View detailed student performance

### **Student**

- Can access and attempt **public quizzes only**
- View personal statistics
- **NEW:** Manage profile and password

---

## 🎓 Student Features

- View list of **public active quizzes**
- View quiz details
- Attempt MCQ-based quizzes
- Submit answers
- Score calculated on backend
- View quiz result immediately after submission
- View leaderboard (per quiz)
- **NEW:** View and edit profile
- **NEW:** Change password
- **NEW:** View personal statistics

> ⚠️ Note: Currently, students can only access **public quizzes**.

---

## 🛠️ Admin Features

- Admin login
- Create quiz
- Add questions to quiz
- Edit quiz
- Delete quiz
- Publish / unpublish quiz
- View all student results for a quiz
- View result of a particular student
- Manual evaluation for short subjective questions
- **NEW:** Analytics dashboard
- **NEW:** Quiz performance metrics
- **NEW:** Student performance tracking
- **NEW:** Question difficulty analysis

---

## 📚 Quiz Management

- Quiz title & description
- Multiple questions per quiz
- Multiple options per question
- Single correct answer
- Quiz status (active / inactive)
- One attempt per user

---

## 📊 Results & Leaderboard

- Store quiz results in Firebase (Firestore)
- Backend-based score calculation
- Leaderboard sorted by score
- Timestamp-based tie-breaker
- **NEW:** Analytics for pass rates
- **NEW:** Score distribution analysis

---

## ⚙️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Query
- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore
- **Authentication:** JWT + bcrypt
- **Validation:** Custom middleware with comprehensive rules

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Firebase account

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.sample .env

# Add your Firebase credentials to .env
# PORT=5000
# NODE_ENV=development
# FIREBASE_API_KEY=your_key
# etc.

npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.sample .env

# Add backend URL
# VITE_API_BASE=http://localhost:5000/api

npm run dev
```

---

## 📡 API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints

**Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

**User Profile** (NEW)

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/change-password` - Change password
- `GET /api/profile/stats` - Get user statistics

**Quiz Management**

- `GET /api/admin/quizzes` - Get all quizzes
- `POST /api/admin/quizzes` - Create quiz
- `PUT /api/admin/quizzes/:id` - Update quiz
- `DELETE /api/admin/quizzes/:id` - Delete quiz

**Analytics** (NEW)

- `GET /api/admin/analytics/dashboard` - Dashboard stats
- `GET /api/admin/analytics/quizzes/:id` - Quiz analytics
- `GET /api/admin/analytics/quizzes/:id/performance` - Student performance

**Student**

- `GET /api/quizzes` - Get available quizzes
- `POST /api/quizzes/:id/submit` - Submit quiz
- `GET /api/quizzes/:id/my-result` - Get result
- `GET /api/quizzes/:id/leaderboard` - Get leaderboard

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- **NEW:** Input validation and sanitization
- **NEW:** Secure password change flow
- CORS protection
- Secure cookie handling

---

## 📋 Project Structure

```
QuizForge/
├── backend/
│   ├── config/          # Firebase configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Auth context
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Utilities
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 🚧 Future Improvements

- Image support for questions
- Private quiz access system (token-based access refinement)
- Improved UI/UX for student quiz attempts
- Database indexing optimization
- Export results to CSV/PDF
- Email notifications
- Password reset via email
- Quiz templates
- Bulk quiz import
- Advanced analytics charts
- Mobile app

---

## 💡 Backend Skills Demonstrated

- Authentication & Authorization (JWT)
- Middleware design
- REST API development
- CRUD operations
- Data validation & filtering
- Score evaluation logic
- Leaderboard sorting & aggregation
- **NEW:** Comprehensive error handling
- **NEW:** Request logging and monitoring
- **NEW:** Analytics and reporting
- **NEW:** Input sanitization

---

## 🧪 Testing

To test the complete flow:

1. Register a new account
2. Login with credentials
3. Create a quiz (as admin) or view quizzes (as student)
4. Attempt a quiz (as student)
5. Submit and view results
6. Check analytics dashboard
7. Update profile and change password

---

## 📝 Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Check logs in `backend/logs/` for detailed error information.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Project Status

This project is **actively under development**.
Core admin functionalities, public quiz flow, and user management are implemented, with additional features being improved continuously.

**Latest Changes:**

- ✅ User profile management system
- ✅ Admin analytics dashboard
- ✅ Comprehensive input validation
- ✅ Error handling middleware
- ✅ Request logging

---

## 📞 Support

For issues or questions:

1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review error logs in `backend/logs/`
3. Create an issue on GitHub

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Bhavesh** - Full Stack Developer

Built with ❤️ for the QuizForge community.
