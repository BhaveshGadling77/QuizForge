import api from "./api";

/*  QUIZ  */

export const getQuizzes = () => api.get("/admin/quizzes");

export const getQuizById = (id) => api.get(`/admin/quizzes/${id}`);

export const createQuiz = (data) => api.post("/admin/quizzes", data);

export const updateQuiz = (id, data) => api.put(`/admin/quizzes/${id}`, data);

export const deleteQuiz = (id) => api.delete(`/admin/quizzes/${id}`);

/* PUBLISH  */

export const publishQuiz = (id) => api.post(`/admin/quizzes/${id}/publish`, {});

export const unpublishQuiz = (id) =>
  api.post(`/admin/quizzes/${id}/unpublish`, {});

/*  QUESTIONS  */

export const getQuestions = (quizId) =>
  api.get(`/admin/quizzes/${quizId}/questions`);

export const addQuestion = (quizId, data) =>
  api.post(`/admin/quizzes/${quizId}/questions`, data);

export const deleteQuestion = (quizId, questionId) =>
  api.delete(`/admin/quizzes/${quizId}/questions/${questionId}`);

export const updateQuestion = (quizId, questionId, updates) =>
  api.put(`/admin/quizzes/${quizId}/questions/${questionId}`, updates);

/*  RESULTS  */

export const getAllResults = (quizId) =>
  api.get(`/admin/quizzes/${quizId}/results`);

export const getStudentResult = (quizId, userId) =>
  api.get(`/admin/quizzes/${quizId}/results/${userId}`);

export const evaluateResult = (resultId, scores) =>
  api.post(`/admin/results/${resultId}/evaluate`, { scores });

/*  USER SIDE - QUIZZES  */

export const getActiveQuizzes = () => api.get("/quizzes");

export const getQuizData = (quizId) => api.get(`/quizzes/${quizId}/attempt`);

export const submitAttempt = (quizId, data) =>
  api.post(`/quizzes/${quizId}/submit`, data);

export const getResult = (quizId) => api.get(`/quizzes/${quizId}/result`);

export const getLeaderboard = (quizId) =>
  api.get(`/quizzes/${quizId}/leaderboard`);


/*  USER SIDE - STUDENT DASHBOARD  */

/**
 * Get all quiz attempts by the student
 */
export const getAttemptHistory = () => api.get("/student/attempt-history");

/**
 * Get student's overall statistics
 * Average score, highest score, total attempts, etc.
 */
export const getStudentStatistics = () => api.get("/student/stats");

/**
 * Get paginated quiz history
 */
export const getHistoryPaginated = (pageSize = 10, pageNumber = 1) =>
  api.get("/student/history-paginated", {
    params: { pageSize, pageNumber },
  });
