import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: "admin" | "teacher" | "student";
  fullName: string;
}

interface Profile {
  id?: string;
  user_id?: string;
  fullName: string;
  email?: string;
  phone?: string | null;
  avatar_url?: string | null;
  // Student specific fields from MERN backend
  rollNumber?: string;
  class?: string;
  section?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => void;
  hasRole: (role: string) => boolean;
  primaryRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/me");
      setUser(response.data.user);
      setProfile(response.data.profile);
    } catch (error) {
      console.error("Fetch user data error:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: loggedInUser } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    // Refresh to get full profile
    await fetchUserData();
  };

  const signUp = async (data: any) => {
    const response = await api.post("/auth/register", data);
    const { token, user: registeredUser } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(registeredUser));

    setUser(registeredUser);
    await fetchUserData();
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const hasRole = (role: string) => user?.role === role;
  const primaryRole = user?.role || null;

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, hasRole, primaryRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
