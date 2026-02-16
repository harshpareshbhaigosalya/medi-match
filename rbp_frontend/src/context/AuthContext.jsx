import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  async function syncSession(session) {
    if (!session) {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem("token");
      return;
    }

    const access = session.access_token;
    setUser(session.user);
    setToken(access);
    localStorage.setItem("token", access);

    // Fetch and store profile data
    const baseUrl = import.meta.env.VITE_API_URL || "/api";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(`${baseUrl}/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.warn("Auth profile sync skipped or failed", err);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          await syncSession(data.session);
        }
      } catch (err) {
        console.error("AUTH BOOT ERROR", err);
      } finally {
        setLoading(false);
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, token, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
