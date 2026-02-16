import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { http } from "../lib/http";
import Loader from "./Loader";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      try {
        const res = await http.get("/profile/");
        setProfile(res.data);
      } catch (e) {
        console.error("ProtectedRoute Profile Fetch Error", e);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  if (authLoading || (user && profileLoading)) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check if applicable
  if (requiredRole && profile && profile.role !== requiredRole) {
    if (profile.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
