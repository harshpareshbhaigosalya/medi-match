import axios from "axios";

let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (apiUrl.includes("onrender.com") && !apiUrl.includes("/api")) {
  apiUrl = `${apiUrl.replace(/\/$/, "")}/api`;
}

export const http = axios.create({
  baseURL: apiUrl,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
