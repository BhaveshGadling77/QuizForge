import { QuizService } from "../services/quiz.service.js";
import { db } from "../config/firebase.config.js";

const quizService = new QuizService(db);

//admin specific controllers
export async function createQuiz(req, res) {
  try {
    await quizService.createQuiz(req.body);
    return res.status(201).json({ msg: "Quiz created successfully" });
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
}

export async function updateQuiz(req, res) {
  try {
    const quiz = await quizService.updateQuiz(req.params.quizId, req.body);
    return res.status(200).json({ quiz });
  } catch (e) {
    return res.status(404).json({ msg: e.message });
  }
}

export async function deleteQuiz(req, res) {
  try {
    await quizService.deleteQuiz(req.params.quizId);
    return res.status(200).json({ msg: "Quiz deleted" });
  } catch (e) {
    return res.status(404).json({ msg: e.message });
  }
}

//user specific controllers
export async function getActiveQuizzes(req, res) {
  try {
    const quizzes = await quizService.getActivePublicQuizzes();
    return res.status(200).json({ quizzes });
  } catch (e) {
    return res.status(500).json({ msg: "Failed to fetch quizzes" });
  }
}

export async function attemptQuiz(req, res) {
  try {
    let quizId = req.params.quizId;
    let userId = req.user.id;
    const quizData = await quizService.getQuizData(quizId, userId);
    return res.status(200).json({
      success: true,
      quiz: quizData,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: e.message,
    });
  }
}
