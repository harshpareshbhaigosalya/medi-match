import axios from "axios";

// Resilient API URL detection
let apiUrl = import.meta.env.VITE_API_URL || "";

// If on Render but missing /api, append it
if (apiUrl.includes("onrender.com") && !apiUrl.includes("/api")) {
  apiUrl = `${apiUrl.replace(/\/$/, "")}/api`;
}

// Final safety fallback: If no API_URL, assume backend is at /api if not localhost, 
// or at :5000/api if on localhost
if (!apiUrl) {
  apiUrl = window.location.origin.includes("localhost")
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;
}

export const http = axios.create({
  baseURL: apiUrl,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
