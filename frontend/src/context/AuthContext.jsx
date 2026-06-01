import { createContext, useState, useEffect, useCallback } from "react";
import { loginWithToken, logout as logoutService } from "@/services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //this will ensure that broswer javascript will not try to access the cookie before the component is mounted and the token is checked.
  useEffect(() => {
    loginWithToken()
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((_token, userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    logoutService().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
