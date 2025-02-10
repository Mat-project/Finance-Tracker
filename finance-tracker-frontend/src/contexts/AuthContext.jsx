import React, { createContext, useState, useEffect } from "react";
import { getToken, setToken, removeToken, getStoredUser, setupAxiosInterceptors } from "@/utils/auth";
import { api } from "@/services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupAxiosInterceptors();
    const initAuth = async () => {
      const token = getToken();
      const storedUser = getStoredUser();
      
      if (token && !storedUser) {
        try {
          const response = await api.auth.me();
          setUser(response.data);
          setToken(token, response.data); // Update stored user
        } catch (error) {
          console.error("Auth initialization error:", error);
          removeToken();
          setUser(null);
        }
      } else if (token && storedUser) {
        setUser(storedUser);
        // Optionally refresh user data in background
        api.auth.me()
          .then(response => {
            setUser(response.data);
            setToken(token, response.data);
          })
          .catch(error => {
            console.error("Background user refresh error:", error);
          });
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.auth.login({
        identifier: credentials.identifier,
        password: credentials.password,
      });

      if (response.data.token) {
        setToken(response.data.token, response.data.user);
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      throw new Error(error.response?.data?.message || "Failed to login. Please check your credentials.");
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    setToken(getToken(), updatedUser); // Update stored user data
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = '/login'; // Ensure clean state by forcing page reload
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!getToken(),
    loading,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
