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

export async function getAllQuizzesForAdmin(req, res) {
  try {
    const quizzes = await quizService.getAllQuizzesForAdmin()
    return res.status(200).json({
      success: true,
      quizzes
    })
  } catch(e) {
    return res.status(500).json({
      success: true,
      msg: e.message
    })
  }
}



