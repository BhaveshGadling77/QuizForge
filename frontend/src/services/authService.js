import api from "./api.js";

/**
 * Register a new user
 * @param {{ name: string, email: string, password: string, role: string }} data
 */
export const register = (data) => api.post("/auth/register", data);

/**
 * Login with email + password → returns { token, user }
 */
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

/**
 * Login/register with a Firebase Google ID token.
 */
export const googleLogin = (idToken, role) =>
  api.post("/auth/google", { idToken, role });

/**
 * Rehydrate the current session from the HTTP-only quizforge_token cookie.
 */
export const loginWithToken = () => api.post("/");

/**
 * Fetch the currently authenticated user's profile
 */
export const getMe = loginWithToken;

/**
 * Logout clears the HTTP-only auth cookie on the backend.
 */
export const logout = () => api.post("/auth/logout");
