export const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
};

export const QUIZ_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
};

export const QUESTION_TYPES = {
  MCQ: "mcq",
  TRUE_FALSE: "true_false",
};

export const API_BASE = process.env.API_BASE;

export const ROUTES = {
  LOGIN: "/",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  QUIZ: "/quiz/:id",
  RESULT: "/result/:id",
  LEADERBOARD: "/leaderboard/:id",
  ADMIN: "/admin",
  ADMIN_CREATE: "/admin/create",
  ADMIN_EDIT: "/admin/edit/:id",
  ADMIN_QUESTIONS: "/admin/quiz/:id/questions",
  ADMIN_RESULTS: "/admin/quiz/:id/results",
};