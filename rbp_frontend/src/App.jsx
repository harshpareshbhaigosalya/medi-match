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

import { useAuth } from "./context/AuthContext";

export default function App() {
  const { loading: authLoading } = useAuth();

  if (authLoading) return <Loader />;

  return (
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
  );
}

/**
 * Watcher for the Home page to handle role-based redirects and onboarding
 */
/**
 * Watcher for the Home page to handle role-based redirects and onboarding
 */
function HomeWatcher() {
  const { profile, loading, user } = useAuth();

  // If we have a user but no profile yet, and we are still loading, wait.
  // But if loading is finished and we still have no profile, just show Home.
  if (loading && user) return <Loader />;

  // Admin should go to dashboard
  if (profile?.role === "admin") return <Navigate to="/admin" replace />;

  // User with no profile data should onboard
  if (profile && !profile.full_name) {
    return (
      <Onboarding
        profile={profile}
        onComplete={() => {
          window.location.reload();
        }}
      />
    );
  }

  return <Home />;
}
