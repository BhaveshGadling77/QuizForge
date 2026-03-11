import api from "./api";

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
 * Fetch the currently authenticated user's profile
 */
export const getMe = () => api.get("/auth/me");

/**
 * Logout (clears local token)
 */
export const logout = () => {
  localStorage.removeItem("token");
};