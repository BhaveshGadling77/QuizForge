import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getActiveQuizzes, submitQuiz } from "../controllers/quiz.controller.js";
const router = express.Router();

router.post("/", authenticateToken, (req, res) => {
  res.json({ msg: "User authenticated successfully.", user: req.user });
});

router.get("/api/quizzes", authenticateToken, getActiveQuizzes)

router.post("/api/quizzes/:quizId/submit", authenticateToken, submitQuiz)


export default router;
