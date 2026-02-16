import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { apiUrl } from "../lib/http";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    async function syncSession(session) {
        if (!session) {
            setUser(null);
            setToken(null);
            setProfile(null);
            localStorage.removeItem("token");
            return;
        }

        const access = session.access_token;
        setUser(session.user);
        setToken(access);
        localStorage.setItem("token", access);

        try {
            const res = await fetch(`${apiUrl}/profile/`, {
                headers: { Authorization: `Bearer ${access}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (err) {
            console.log("PROFILE SYNC FAILED", err);
        }
    }

    useEffect(() => {
        async function load() {
            setLoading(true);
            const { data } = await supabase.auth.getSession();
            await syncSession(data.session);
            setLoading(false);
        }

        load();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            syncSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
