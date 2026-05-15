# QuizForge API Documentation

Complete API reference for the QuizForge backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints require JWT token in cookie (`quizforge_token`) or Authorization header.

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new student or admin account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "msg": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "msg": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Logout

**POST** `/auth/logout`

Logout and clear authentication token.

**Response:**

```json
{
  "msg": "Logout successful"
}
```

---

## User Profile Endpoints

### Get User Profile

**GET** `/profile`

Retrieve current user's profile information.

**Response:**

```json
{
  "success": true,
  "profile": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update User Profile

**PUT** `/profile`

Update name and/or email.

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "user_id",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "student"
  }
}
```

### Change Password

**POST** `/profile/change-password`

Change user password.

**Request Body:**

```json
{
  "oldPassword": "CurrentPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Get User Statistics

**GET** `/profile/stats`

Get user's quiz attempt statistics.

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalAttempts": 15,
    "averageScore": 78.5,
    "highestScore": 95,
    "lastAttemptDate": "2024-01-20T14:20:00Z"
  }
}
```

---

## Quiz Management Endpoints (Admin)

### Create Quiz

**POST** `/admin/quizzes`

Create a new quiz.

**Request Body:**

```json
{
  "title": "JavaScript Basics",
  "description": "Test your knowledge of JavaScript fundamentals",
  "timeLimit": 30,
  "visibility": "public",
  "category": "Programming",
  "difficulty": "Beginner"
}
```

**Response:**

```json
{
  "msg": "Quiz created successfully",
  "quiz": {
    "_id": "quiz_id"
  }
}
```

### Get All Quizzes (Admin)

**GET** `/admin/quizzes`

Retrieve all quizzes created by admin.

**Response:**

```json
{
  "success": true,
  "quizzes": [
    {
      "quizId": "quiz_id",
      "title": "JavaScript Basics",
      "description": "...",
      "totalQuestions": 10,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Single Quiz

**GET** `/admin/quizzes/:quizId`

Retrieve specific quiz details.

**Response:**

```json
{
  "success": true,
  "quiz": {
    "quizId": "quiz_id",
    "title": "JavaScript Basics",
    "questions": [...]
  }
}
```

### Update Quiz

**PUT** `/admin/quizzes/:quizId`

Update quiz details.

**Request Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "timeLimit": 45
}
```

**Response:**

```json
{
  "success": true,
  "quiz": { ... }
}
```

### Delete Quiz

**DELETE** `/admin/quizzes/:quizId`

Delete a quiz and all associated data.

**Response:**

```json
{
  "msg": "Quiz deleted"
}
```

### Publish Quiz

**POST** `/admin/quizzes/:quizId/publish`

Make quiz active and available for students.

**Response:**

```json
{
  "success": true,
  "message": "Quiz Published Successfully."
}
```

### Unpublish Quiz

**POST** `/admin/quizzes/:quizId/unpublish`

Deactivate quiz.

**Response:**

```json
{
  "success": true,
  "message": "Quiz Unpublished Successfully."
}
```

---

## Question Management Endpoints (Admin)

### Add Question

**POST** `/admin/quizzes/:quizId/questions`

Add a new question to quiz.

**Request Body:**

```json
{
  "title": "What is a closure?",
  "options": [
    "A function that returns another function",
    "A variable scope",
    "A loop control",
    "A data structure"
  ],
  "correctOptionIndex": 0,
  "points": 5
}
```

**Response:**

```json
{
  "success": true,
  "questionId": "question_id"
}
```

### Get Questions

**GET** `/admin/quizzes/:quizId/questions`

Retrieve all questions in a quiz.

**Response:**

```json
{
  "success": true,
  "questions": [...]
}
```

### Update Question

**PUT** `/admin/quizzes/:quizId/questions/:questionId`

Update question details.

**Request Body:**

```json
{
  "title": "Updated question",
  "options": [...],
  "correctOptionIndex": 1
}
```

**Response:**

```json
{
  "success": true,
  "question": {...}
}
```

### Delete Question

**DELETE** `/admin/quizzes/:quizId/questions/:questionId`

Remove a question from quiz.

**Response:**

```json
{
  "success": true,
  "message": "Question deleted"
}
```

---

## Student Quiz Endpoints

### Get Active Quizzes

**GET** `/quizzes`

Retrieve all published public quizzes.

**Response:**

```json
{
  "quizzes": [
    {
      "quizId": "quiz_id",
      "title": "JavaScript Basics",
      "description": "...",
      "timeLimit": 30
    }
  ]
}
```

### Attempt Quiz

**GET** `/quizzes/:quizId/attempt`

Get quiz data for attempting.

**Response:**

```json
{
  "success": true,
  "quiz": {
    "quizId": "quiz_id",
    "title": "...",
    "questions": [
      {
        "questionId": "q_id",
        "title": "What is...",
        "options": ["A", "B", "C", "D"],
        "points": 5
      }
    ]
  }
}
```

### Auto-save Answers

**POST** `/quizzes/:quizId/auto-save`

Save quiz answers periodically (every 30 seconds).

**Request Body:**

```json
{
  "answers": {
    "question_id_1": 0,
    "question_id_2": 2
  },
  "timeLeftSeconds": 1200
}
```

**Response:**

```json
{
  "success": true,
  "message": "Answers saved"
}
```

### Get Draft Answers

**GET** `/quizzes/:quizId/draft`

Retrieve saved draft answers to resume quiz.

**Response:**

```json
{
  "data": {
    "answers": { ... },
    "timeLeftSeconds": 1200
  }
}
```

### Submit Quiz

**POST** `/quizzes/:quizId/submit`

Submit completed quiz for evaluation.

**Request Body:**

```json
{
  "answers": {
    "question_id_1": 0,
    "question_id_2": 2
  }
}
```

**Response:**

```json
{
  "success": true,
  "result": {
    "resultId": "result_id",
    "score": 85,
    "totalPoints": 100,
    "correctCount": 17,
    "totalQuestions": 20,
    "timestamp": "2024-01-20T14:20:00Z"
  }
}
```

### Get My Result

**GET** `/quizzes/:quizId/my-result`

Get personal quiz result.

**Response:**

```json
{
  "success": true,
  "result": {
    "score": 85,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "timestamp": "2024-01-20T14:20:00Z"
  }
}
```

### Get Leaderboard

**GET** `/quizzes/:quizId/leaderboard`

Get quiz leaderboard sorted by score.

**Response:**

```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "studentName": "Alice",
      "score": 95,
      "attemptTime": "2024-01-20T14:20:00Z"
    },
    {
      "rank": 2,
      "studentName": "Bob",
      "score": 85,
      "attemptTime": "2024-01-20T15:30:00Z"
    }
  ]
}
```

---

## Results & Analytics Endpoints (Admin)

### Get Dashboard Stats

**GET** `/admin/analytics/dashboard`

Get overall dashboard statistics.

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalQuizzes": 12,
    "totalStudents": 45,
    "totalAttempts": 250,
    "averageScore": 78.5
  }
}
```

### Get Quiz Analytics

**GET** `/admin/analytics/quizzes/:quizId`

Get detailed analytics for specific quiz.

**Response:**

```json
{
  "success": true,
  "analytics": {
    "quizId": "quiz_id",
    "title": "JavaScript Basics",
    "totalAttempts": 25,
    "averageScore": 82.3,
    "highestScore": 100,
    "lowestScore": 45,
    "passRate": 88.5,
    "scoreDistribution": {
      "0-20%": 1,
      "20-40%": 2,
      "40-60%": 3,
      "60-80%": 9,
      "80-100%": 10
    }
  }
}
```

### Get All Quizzes Analytics

**GET** `/admin/analytics/quizzes`

Get analytics for all admin's quizzes.

**Response:**

```json
{
  "success": true,
  "count": 12,
  "analytics": [...]
}
```

### Get Student Performance

**GET** `/admin/analytics/quizzes/:quizId/performance`

Get student-wise performance for quiz.

**Response:**

```json
{
  "success": true,
  "count": 25,
  "performance": [
    {
      "resultId": "result_id",
      "userName": "Alice",
      "userEmail": "alice@example.com",
      "score": 95,
      "totalQuestions": 20,
      "correctAnswers": 19,
      "timeSpent": 18
    }
  ]
}
```

### Get Question Statistics

**GET** `/admin/analytics/quizzes/:quizId/questions`

Get statistics for each question.

**Response:**

```json
{
  "success": true,
  "count": 20,
  "statistics": [
    {
      "questionIndex": 0,
      "correctCount": 22,
      "incorrectCount": 3,
      "correctPercentage": "88.00"
    }
  ]
}
```

### Get All Results for Quiz

**GET** `/admin/quizzes/:quizId/results`

Get all student results for a quiz.

**Response:**

```json
{
  "success": true,
  "results": [...]
}
```

### Get Single Student Result

**GET** `/admin/quizzes/:quizId/results/:userId`

Get specific student's result.

**Response:**

```json
{
  "success": true,
  "result": {
    "resultId": "result_id",
    "studentName": "Alice",
    "score": 85,
    "answers": [...]
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid input data"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Token missing or invalid"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Admin access required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | OK - Request successful        |
| 201  | Created - Resource created     |
| 400  | Bad Request - Invalid input    |
| 401  | Unauthorized - Auth required   |
| 403  | Forbidden - Access denied      |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error          |

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

---

## Environment Variables

Required backend environment variables:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
COLLECTION_QUIZZES=quizzes
COLLECTION_RESULTS=results
COLLECTION_DRAFTS=drafts
```

---

## Validation Rules

### Password

- Minimum 6 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

### Email

- Valid email format
- Unique across system

### Quiz

- Title: minimum 3 characters
- Description: minimum 10 characters
- Time limit: positive number

### Question

- Title: minimum 5 characters
- Options: minimum 2
- Correct option: valid index

---

## Examples

### Complete Quiz Attempt Flow

1. Get available quizzes

```bash
curl -X GET http://localhost:5000/api/quizzes \
  -H "Cookie: quizforge_token=YOUR_TOKEN"
```

2. Start quiz attempt

```bash
curl -X GET http://localhost:5000/api/quizzes/QUIZ_ID/attempt \
  -H "Cookie: quizforge_token=YOUR_TOKEN"
```

3. Auto-save answers (every 30s)

```bash
curl -X POST http://localhost:5000/api/quizzes/QUIZ_ID/auto-save \
  -H "Cookie: quizforge_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers": {"q1": 0, "q2": 1}, "timeLeftSeconds": 1200}'
```

4. Submit quiz

```bash
curl -X POST http://localhost:5000/api/quizzes/QUIZ_ID/submit \
  -H "Cookie: quizforge_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers": {"q1": 0, "q2": 1}}'
```

---

## Support

For issues or questions, please contact support or create an issue on GitHub.
