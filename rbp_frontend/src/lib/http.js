import axios from "axios";

// Determination of API URL:
// 1. Check VITE_API_URL environment variable
// 2. If missing and on localhost, use local backend (port 5000)
// 3. If missing and on Render (production), use the verified backend URL
// 1. Check VITE_API_URL environment variable
// 2. If missing and on localhost, use local backend (port 5000)
// 3. If missing and on production, assume relative path /api (requires proxy or same-origin)
let apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    apiUrl = "http://localhost:5000/api";
  } else {
    // Production Fallback: Relative path.
    // This expects the backend to be served at the same origin under /api
    apiUrl = "/api";
  }
}

// Ensure the URL ends with /api if it doesn't already (and isn't just /api)
if (apiUrl !== "/api" && !apiUrl.endsWith("/api") && !apiUrl.includes("/api/")) {
  apiUrl = apiUrl.replace(/\/$/, "") + "/api";
}

export { apiUrl };

export const http = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
