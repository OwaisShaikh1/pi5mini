// context/AuthContext.js
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Mock login API (replace with actual API)
    setUser({ email });
    console.log("Logged in:", email);
  };

  const signup = async (email, password) => {
    // Mock signup API (replace with actual API)
    setUser({ email });
    console.log("Signed up:", email);
  };

  const resetPassword = async (email) => {
    console.log("Password reset link sent to:", email);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
