import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken) {
      axios
        .get("http://localhost:5001/auth/user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          setUser(res.data);
          setRole(res.data.role);
        })
        .catch(() => handleRefreshToken(refreshToken));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      // Requête de connexion
      const res = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      // Vérification de la réponse
      if (res.data && res.data.accessToken && res.data.refreshToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // Si les informations de l'utilisateur ne sont pas présentes dans la réponse,
        // utilisez l'ID utilisateur pour récupérer les données de l'utilisateur
        if (res.data.user_id) {
          const userRes = await axios.get(`http://localhost:5001/auth/user`, {
            headers: { Authorization: `Bearer ${res.data.accessToken}` },
          });
          setUser(userRes.data);
          setRole(userRes.data.role);
        }
      } else {
        console.error("Données manquantes dans la réponse.");
        throw new Error("Données manquantes dans la réponse.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const userId = user?.id; // Prevent crash if user is null

      // Call backend logout API if userId exists
      if (userId) {
        await axios.put("http://localhost:5001/auth/logout", { userId });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Reset state immediately
      setUser(null);
      setRole(null);

      // Use navigate from react-router instead of timeout
      window.location.href = "/login";
    }
  };

  const handleRefreshToken = async (refreshToken) => {
    if (!refreshToken) return setLoading(false);
    try {
      const res = await axios.post("http://localhost:5001/auth/refresh", {
        refreshToken,
      });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      setUser(res.data.user);
      setRole(res.data.user.role);
    } catch (error) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, handleLogin, handleLogout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
