import { QuizService } from "../services/quiz.service.js";
import { db } from "../config/firebase.config.js";

const quizService = new QuizService(db);

export async function createQuiz(req, res) {
  try {
    await quizService.createQuiz(req.body);
    res.status(201).json({ msg: "Quiz created successfully" });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

export async function updateQuiz(req, res) {
  try {
    const quiz = await quizService.updateQuiz(
      req.params.quizId,
      req.body
    );
    res.status(200).json({ quiz });
  } catch (e) {
    res.status(404).json({ msg: e.message });
  }
}

export async function deleteQuiz(req, res) {
  try {
    await quizService.deleteQuiz(req.params.quizId);
    res.status(200).json({ msg: "Quiz deleted" });
  } catch (e) {
    res.status(404).json({ msg: e.message });
  }
}

export async function getActiveQuizzes(req, res) {
  try {
    const quizzes = await quizService.getActivePublicQuizzes();
    res.status(200).json({ quizzes });
  } catch (e) {
    res.status(500).json({ msg: "Failed to fetch quizzes" });
  }
}
