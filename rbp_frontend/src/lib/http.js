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
    apiUrl = "https://medi-match-8u18.onrender.com/api";
  }
}

export { apiUrl };

export const http = axios.create({
  baseURL: apiUrl,
  timeout: 15000, // 15s timeout
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
