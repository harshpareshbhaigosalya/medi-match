import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading: authLoading } = useAuth();

  // If AuthContext is still fetching session or profile, show loader
  if (authLoading) {
    return <Loader />;
  }

  // Not logged in -> Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check: If we have a profile, check the role.
  // If profile sync failed/offline, we might not have a profile yet but we have 'user'.
  // In that case, we permit 'user' role routes, but block 'admin' routes.
  if (requiredRole === "admin") {
    if (profile && profile.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    // If profile is missing but we need admin, we must wait or deny.
    // For safety, if we need admin and profile is missing, we redirect unless we are still loading.
    if (!profile) return <Navigate to="/" replace />;
  }

  // If they are on a 'user' route and they are an 'admin', redirect them to admin dashboard
  if (requiredRole === "user" && profile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children ? children : <Outlet />;
}
