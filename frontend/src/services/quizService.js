import api from "./api";

// ─── Quiz CRUD ────────────────────────────────────────────────────────────────

export const getQuizzes = () => api.get("/quizzes");

export const getQuizById = (id) => api.get(`/quizzes/${id}`);

export const createQuiz = (data) => api.post("/quizzes", data);

export const updateQuiz = (id, data) => api.put(`/quizzes/${id}`, data);

export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);

export const publishQuiz = (id) => api.patch(`/quizzes/${id}/publish`);

// ─── Questions ────────────────────────────────────────────────────────────────

export const getQuestions = (quizId) =>
  api.get(`/quizzes/${quizId}/questions`);

export const addQuestion = (quizId, data) =>
  api.post(`/quizzes/${quizId}/questions`, data);

export const updateQuestion = (quizId, questionId, data) =>
  api.put(`/quizzes/${quizId}/questions/${questionId}`, data);

export const deleteQuestion = (quizId, questionId) =>
  api.delete(`/quizzes/${quizId}/questions/${questionId}`);

// ─── Attempts ─────────────────────────────────────────────────────────────────

export const submitAttempt = (quizId, answers) =>
  api.post(`/quizzes/${quizId}/attempt`, { answers });

export const getResult = (quizId) => api.get(`/quizzes/${quizId}/result`);

export const getLeaderboard = (quizId) =>
  api.get(`/quizzes/${quizId}/leaderboard`);

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllResults = (quizId) =>
  api.get(`/admin/quizzes/${quizId}/results`);