import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shared URL logic to ensure syncSession uses the correct URL
  const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || "";
    if (!url) {
      if (window.location.host.includes("localhost") || window.location.host.includes("127.0.0.1")) {
        url = "http://localhost:5000/api";
      } else {
        url = "https://medi-match-8u18.onrender.com/api";
      }
    }
    return url;
  };

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

    const baseUrl = getBaseUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${baseUrl}/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        console.warn("Profile fetch returned non-ok status:", res.status);
      }
    } catch (err) {
      console.warn("Auth profile sync skipped or failed", err);
    }
  }

  useEffect(() => {
    async function init() {
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

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // If we already finished initial loading, we can sync updates without blocking
      await syncSession(session);
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
