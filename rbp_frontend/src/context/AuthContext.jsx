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
    try {
      await fetch(`${baseUrl}/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
    } catch (err) {
      console.log("PROFILE SYNC FAILED", err);
    }
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      await syncSession(data.session);
      setLoading(false);
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
