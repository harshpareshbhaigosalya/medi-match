import axios from "axios";

// The API URL should ideally be in VITE_API_URL. 
// If missing, we use "/api" as a relative path.
const apiUrl = import.meta.env.VITE_API_URL || "/api";

export const http = axios.create({
  baseURL: apiUrl,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
