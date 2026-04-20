import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authAPI, setToken, clearToken } from "../services/api";

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("grc_token");
    if (token) {
      authAPI
        .me()
        .then((u) => setUser(u))
        .catch(() => {
          clearToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for token expiry events from api.js
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setError("Session expired. Please log in again.");
    };
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login(email, password);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      const msg = err?.body?.error || err.message || "Login failed.";
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!user;
  const hasPermission = useCallback(
    (perm) => {
      if (!user) return false;
      if (user.role === "ADMIN") return true;
      return (user.permissions || []).includes(perm);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
