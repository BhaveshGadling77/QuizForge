import { QuizService } from "../services/quiz.service.js";
import { db } from "../config/firebase.config.js";

const quizService = new QuizService(db);
//admin specific controllers
export async function createQuiz(req, res) {
  try {
    const quizRef = await quizService.createQuiz(req.body);
    return res.status(201).json({ 
      msg: "Quiz created successfully",
      quiz: { _id: quizRef.id }  //new
    });
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
    console.log(req.user)
    const quizzes = await quizService.getAllQuizzesForAdmin(req.user.id)
    return res.status(200).json({
      success: true,
      quizzes
    })
  } catch(e) {
    return res.status(500).json({
      success: false,
      msg: e.message
    })
  }
}

// By ADP
export async function getQuizById(req, res) {
  try {
    const quiz = await quizService.getQuizById(req.params.quizId);
    return res.status(200).json({ success: true, quiz });
  } catch (e) {
    return res.status(404).json({ success: false, msg: e.message });
  }
}

export async function getQuestions(req, res) {
  try {
    const questions = await quizService.getQuestions(req.params.quizId);
    return res.status(200).json({ success: true, questions });
  } catch (e) {
    return res.status(404).json({ success: false, msg: e.message });
  }
}

export async function addQuestion(req, res) {
  try {
    const questionId = await quizService.addQuestion(req.params.quizId, req.body);
    return res.status(201).json({ success: true, questionId });
  } catch (e) {
    return res.status(400).json({ success: false, msg: e.message });
  }
}

export async function deleteQuestion(req, res) {
  try {
    await quizService.deleteQuestion(req.params.quizId, req.params.questionId);
    return res.status(200).json({ success: true, msg: "Question deleted" });
  } catch (e) {
    return res.status(404).json({ success: false, msg: e.message });
  }
}

export async function updateQuestion(req, res) {
  try {
    await quizService.updateQuestion()
    return res.status(200).json({ success: true, msg: "Question Updated."})
  } catch(e) {
    return res.status(500).json({success: false, msg: e.message})
  }
}
