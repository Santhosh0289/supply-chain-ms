import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role  = localStorage.getItem("role");
    const name  = localStorage.getItem("name");
    if (token) setUser({ token, role, name });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { access_token, role, name } = res.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name);
    setUser({ token: access_token, role, name });
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);