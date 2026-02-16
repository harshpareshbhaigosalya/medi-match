// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";
import { http } from "./lib/http";
import Products from "./pages/Products";
import ContactUs from "./pages/Contact_US";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import OrderDetails from "./pages/OrderDetails";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminVariants from "./pages/admin/AdminVariants";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import Reports from "./pages/admin/AdminReports";
import AdminAISuggestions from "./pages/admin/AdminAISuggestions";
import AdminUserInsights from "./pages/admin/AdminUserInsights";
import Onboarding from "./components/Onboarding";
import Loader from "./components/Loader";

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const checkApi = async () => {
      try {
        // Quick check to see if API is reachable
        const res = await http.get("/products?limit=1");
        if (typeof res.data === 'string' && res.data.includes("<!DOCTYPE")) {
          throw new Error("API not found (returned HTML)");
        }
      } catch (e) {
        console.error("API Connectivity Error", e);
        setApiError(true);
      } finally {
        setAppLoading(false);
      }
    };
    checkApi();
  }, []);

  if (appLoading) return <Loader />;

  return (
    <>
      {apiError && (
        <div className="bg-red-600 text-white text-center p-2 font-bold text-sm fixed top-0 left-0 right-0 z-50 shadow-md">
          ⚠️ Backend API not connected. VITE_API_URL is missing or incorrect.
          <span className="opacity-80 font-normal ml-2 hidden sm:inline">Set it in Render Dashboard.</span>
        </div>
      )}
      <div className={apiError ? "mt-10" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PUBLIC & USER AREA */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomeWatcher />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/contactus" element={<ContactUs />} />

            {/* AUTH PROTECTED USER ROUTES */}
            <Route element={<ProtectedRoute requiredRole="user" />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* ADMIN AREA */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="variants" element={<AdminVariants />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="ai-suggestions" element={<AdminAISuggestions />} />
            <Route path="user-insights" element={<AdminUserInsights />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

/**
 * Watcher for the Home page to handle role-based redirects and onboarding
 */
function HomeWatcher() {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await http.get("/profile/");
        setProfile(res.data);
      } catch (err) {
        console.log("HOME WATCHER PROFILE ERROR", err);
        // If error is 401, clear token
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading && localStorage.getItem("token")) return <Loader />;

  // Admin should go to dashboard
  if (profile?.role === "admin") return <Navigate to="/admin" replace />;

  // User with no profile data should onboard
  if (profile && !profile.full_name) {
    return (
      <Onboarding
        profile={profile}
        onComplete={() => {
          window.location.reload(); // Refresh to clear onboarding state
        }}
      />
    );
  }

  return <Home />;
}
