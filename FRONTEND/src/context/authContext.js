import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for adding auth token to requests
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    // Add token to all requests that need authorization
    axios.interceptors.request.use(
      (config) => {
        if (accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 responses (expired token)
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const res = await axios.post(
                "http://localhost:5001/auth/refresh",
                {
                  refreshToken,
                }
              );
              localStorage.setItem("accessToken", res.data.accessToken);
              localStorage.setItem("refreshToken", res.data.refreshToken);
              axios.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${res.data.accessToken}`;

              // Retry the original request
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, log the user out
            handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );
  }, []);

  // Check user authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/auth/user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(response.data);
      } catch (error) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            await handleRefreshToken(refreshToken);
          } catch (refreshError) {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      // Step 1: Login request to get tokens
      const loginRes = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      // Check if we received the expected tokens
      if (loginRes.data.accessToken && loginRes.data.refreshToken) {
        // Store tokens
        localStorage.setItem("accessToken", loginRes.data.accessToken);
        localStorage.setItem("refreshToken", loginRes.data.refreshToken);

        // Set default Authorization header for future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${loginRes.data.accessToken}`;

        // Step 2: Get user data with the new token
        try {
          const userRes = await axios.get("http://localhost:5001/auth/user", {
            headers: { Authorization: `Bearer ${loginRes.data.accessToken}` },
          });

          // Set user data in context
          setUser(userRes.data);
          return userRes.data;
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error(
            "Successfully logged in but failed to fetch user data"
          );
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        // Call logout endpoint
        await axios.put(
          "http://localhost:5001/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clean up regardless of server response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Clear authorization header
      delete axios.defaults.headers.common["Authorization"];

      // Clear the user state LAST to trigger UI updates
      setUser(null);

      // Force navigation to login page
      window.location.href = "/login";
    }
  };

  const handleRefreshToken = async (refreshToken) => {
    try {
      const refreshRes = await axios.post(
        "http://localhost:5001/auth/refresh",
        {
          refreshToken,
        }
      );

      if (refreshRes.data.accessToken) {
        localStorage.setItem("accessToken", refreshRes.data.accessToken);
        localStorage.setItem(
          "refreshToken",
          refreshRes.data.refreshToken || refreshToken
        );

        // Update auth header with new token
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${refreshRes.data.accessToken}`;

        // Fetch user data with the new token
        const userRes = await axios.get("http://localhost:5001/auth/user", {
          headers: { Authorization: `Bearer ${refreshRes.data.accessToken}` },
        });

        setUser(userRes.data);
        return userRes.data;
      } else {
        throw new Error("Invalid response from refresh token endpoint");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        handleLogin,
        handleLogout,
        handleRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
