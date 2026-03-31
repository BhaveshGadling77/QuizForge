import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getActiveQuizzes,
  submitQuiz,
  getMyResult,
  getLeaderboard,
  getPrivateQuiz,
  attemptQuiz
} from "../controllers/student.controller.js";

const router = express.Router();

router.post("/", authenticateToken, (req, res) => {
  res.json({ msg: "User authenticated successfully.", user: req.user });
});

router.get("/quizzes", authenticateToken, getActiveQuizzes);

router.get("/quizzes/:quizId/attempt", authenticateToken, attemptQuiz)
router.post("/quizzes/:quizId/submit", authenticateToken, submitQuiz);

router.get("/quizzes/:quizId/my-result", authenticateToken, getMyResult);

router.get("/quizzes/:quizId/leaderboard", authenticateToken, getLeaderboard);

// workflow for the private quizzes.
//user click on the quiz which is private
//new dialogue title will open and that will used enter the accesstoken
//then if the accesstoken is right it will open the quiz.

router.post("/quizzes/:quizId/start", authenticateToken, getPrivateQuiz);

// router.post("/api/quiz/:quizId/start")

export default router;