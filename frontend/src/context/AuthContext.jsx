import { createContext, useState, useEffect, useCallback } from "react";
import { loginWithToken, logout as logoutService } from "@/services/authService";
import Cookies  from "js-cookie";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to rehydrate user from stored token
  useEffect(() => {
    const token = Cookies.get("token");
    console.log("AuthProvider mounted. Found token:", !!token);
    if (!token) {
      setLoading(false);
      return;
    }
    loginWithToken()
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        Cookie.remove('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, userData) => {
    Cookies.set("token", token, { expires: 14 }); // Store token in cookie for 14 days
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}