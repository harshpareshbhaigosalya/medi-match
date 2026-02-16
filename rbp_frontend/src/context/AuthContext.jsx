import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  async function syncSession(session) {
    if (!session) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      return;
    }

    const access = session.access_token;

    setUser(session.user);
    setToken(access);

    // store token so navbar + APIs work
    localStorage.setItem("token", access);

    // make sure backend profile exists
    const baseUrl = import.meta.env.VITE_API_URL || "/api";

    // Don't block if we can't sync profile immediately
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      await fetch(`${baseUrl}/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (err) {
      console.warn("Profile sync skipped or failed (backend may be offline or URL misconfigured)", err);
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

    // listen for google/email login changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
