import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateQuizTimer } from "../middlewares/timerValidation.middleware.js";
import {
  getActiveQuizzes,
  submitQuiz,
  getMyResult,
  getLeaderboard,
  getPrivateQuiz,
  attemptQuiz,
  autoSaveAnswers,
  getDraftAnswers,
  getAttemptHistory,
  getStudentStats,
  getHistoryPaginated,
  getCategories,
  getFilteredQuizzes,
  searchQuizzes,
} from "../controllers/student.controller.js";

const router = express.Router();

router.post("/", authenticateToken, (req, res) => {
  // console.log("tbis route is hit.")
  res.json({ msg: "User authenticated successfully.", user: req.user });
});

router.get("/quizzes", authenticateToken, getActiveQuizzes);

// Quiz filtering and search
router.get("/quizzes/filter", authenticateToken, getFilteredQuizzes);
router.get("/quizzes/search", authenticateToken, searchQuizzes);
router.get("/quizzes/categories", authenticateToken, getCategories);

router.get("/quizzes/:quizId/attempt", authenticateToken, attemptQuiz);

// Auto-save endpoint - called every few seconds while answering
router.post("/quizzes/:quizId/auto-save", authenticateToken, autoSaveAnswers);

// Get draft answers - called on quiz load to resume
router.get("/quizzes/:quizId/draft", authenticateToken, getDraftAnswers);

// Submit with timer validation
router.post(
  "/quizzes/:quizId/submit",
  authenticateToken,
  validateQuizTimer,
  submitQuiz,
);

router.get("/quizzes/:quizId/my-result", authenticateToken, getMyResult);

router.get("/quizzes/:quizId/leaderboard", authenticateToken, getLeaderboard);

// Student dashboard routes
router.get("/student/attempt-history", authenticateToken, getAttemptHistory);
router.get("/student/stats", authenticateToken, getStudentStats);
router.get(
  "/student/history-paginated",
  authenticateToken,
  getHistoryPaginated,
);

// workflow for the private quizzes.
//user click on the quiz which is private
//new dialogue title will open and that will used enter the accesstoken
//then if the accesstoken is right it will open the quiz.

router.post("/quizzes/:quizId/start", authenticateToken, getPrivateQuiz);

// router.post("/api/quiz/:quizId/start")

export default router;
