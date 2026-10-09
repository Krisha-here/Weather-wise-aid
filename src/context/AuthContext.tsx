import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: { name: string } | null;
  login: (name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  // Initialize from localStorage to persist login
  useEffect(() => {
    const savedUser = localStorage.getItem("weather_wise_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (name: string) => {
    const newUser = { name };
    setUser(newUser);
    localStorage.setItem("weather_wise_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("weather_wise_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
