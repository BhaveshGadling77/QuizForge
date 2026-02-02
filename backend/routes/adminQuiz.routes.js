import { createQuiz, updateQuiz, deleteQuiz } from '../controllers/quiz.controller.js'
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeAdminRole } from "../middlewares/authRole.middleware.js";
import express from "express";

const router = express.Router();

router.post("/quiz", authenticateToken, authorizeAdminRole, createQuiz);
router.put("/quiz/:quizId", authenticateToken, authorizeAdminRole, updateQuiz);
router.delete("/quiz/:quizId", authenticateToken, authorizeAdminRole, deleteQuiz);

export default router;
