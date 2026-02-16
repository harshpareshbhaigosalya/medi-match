import axios from "axios";

// Determination of API URL:
// 1. Check VITE_API_URL environment variable
// 2. If missing and on localhost, use local backend (port 5000)
// 3. If missing and on Render (production), use the verified backend URL
let apiUrl = import.meta.env.VITE_API_URL || "";

if (!apiUrl) {
  if (window.location.host.includes("localhost") || window.location.host.includes("127.0.0.1")) {
    apiUrl = "http://localhost:5000/api";
  } else {
    // Production Fallback: Use the verified backend URL for this project
    // Note: User can override this by setting VITE_API_URL in Render dashboard
    apiUrl = "https://medi-match-backend.onrender.com/api";
  }
}

// Ensure the URL ends with /api if it doesn't already
if (apiUrl.includes("onrender.com") && !apiUrl.endsWith("/api") && !apiUrl.includes("/api/")) {
  apiUrl = apiUrl.replace(/\/$/, "") + "/api";
}

export { apiUrl };

export const http = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
