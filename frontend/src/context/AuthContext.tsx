"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/types";
import api from "@/services/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("vehicle_crm_token");
    const savedUser = localStorage.getItem("vehicle_crm_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with /me
        api.get("/auth/me")
          .then((res) => {
            if (res.data.success) {
              setUser(res.data.user);
              localStorage.setItem("vehicle_crm_user", JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("vehicle_crm_token", newToken);
    localStorage.setItem("vehicle_crm_user", JSON.stringify(newUser));

    if (newUser.role === "admin") {
      router.push("/admin/dashboard");
    } else if (newUser.role === "technician") {
      router.push("/technician/dashboard");
    } else {
      router.push("/portal/dashboard");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("vehicle_crm_token");
    localStorage.removeItem("vehicle_crm_user");
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("vehicle_crm_user", JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
