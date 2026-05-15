import api from "./api";

/* USER PROFILE ENDPOINTS */

/**
 * Get current user's profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = () => api.get("/profile");

/**
 * Update user profile (name, email)
 * @param {Object} data - { name, email }
 * @returns {Promise} Updated profile
 */
export const updateUserProfile = (data) => api.put("/profile", data);

/**
 * Change user password
 * @param {Object} data - { oldPassword, newPassword, confirmPassword }
 * @returns {Promise} Success response
 */
export const changePassword = (data) =>
  api.post("/profile/change-password", data);

/**
 * Get user statistics (quizzes attempted, average score, etc.)
 * @returns {Promise} User statistics
 */
export const getUserStats = () => api.get("/profile/stats");

/* ADMIN ANALYTICS ENDPOINTS */

/**
 * Get dashboard statistics for admin
 * @returns {Promise} Dashboard stats (total quizzes, students, attempts, avg score)
 */
export const getDashboardStats = () => api.get("/admin/analytics/dashboard");

/**
 * Get analytics for a specific quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise} Quiz analytics (avg score, attempts, pass rate, etc.)
 */
export const getQuizAnalytics = (quizId) =>
  api.get(`/admin/analytics/quizzes/${quizId}`);

/**
 * Get analytics for all admin's quizzes
 * @returns {Promise} Array of quiz analytics
 */
export const getAllQuizzesAnalytics = () => api.get("/admin/analytics/quizzes");

/**
 * Get student performance for a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise} Array of student performance data sorted by score
 */
export const getStudentPerformance = (quizId) =>
  api.get(`/admin/analytics/quizzes/${quizId}/performance`);

/**
 * Get question statistics for a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise} Array of question statistics (correct %, etc.)
 */
export const getQuestionStatistics = (quizId) =>
  api.get(`/admin/analytics/quizzes/${quizId}/questions`);
