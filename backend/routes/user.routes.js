import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getActiveQuizzes,
  submitQuiz,
  getMyResult,
  getLeaderboard,
  getPrivateQuiz
} from "../controllers/student.controller.js";

const router = express.Router();

router.post("/login", authenticateToken, (req, res) => {
  res.json({ msg: "User authenticated successfully.", user: req.user });
});

router.get("/api/quizzes", authenticateToken, getActiveQuizzes);

router.post("/api/quizzes/:quizId/submit", authenticateToken, submitQuiz);

router.get("/api/quizzes/:quizId/my-result", authenticateToken, getMyResult);

router.get("/api/quizzes/:quizId/leaderboard", authenticateToken, getLeaderboard);

// workflow for the private quizzes.
//user click on the quiz which is private
//new dialogue title will open and that will used enter the input
//then if the accesstoken is right it will open the quiz.

router.post("/api/quizzes/:quizId/start", authenticateToken, getPrivateQuiz);

// router.post("/api/quiz/:quizId/start")

export default router;