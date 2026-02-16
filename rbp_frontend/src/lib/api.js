import axios from "axios";
import { supabase } from "./supabase";

let apiUrl = import.meta.env.VITE_API_URL || "";
if (apiUrl.includes("onrender.com") && !apiUrl.includes("/api")) {
  apiUrl = `${apiUrl.replace(/\/$/, "")}/api`;
}
if (!apiUrl) {
  apiUrl = window.location.origin.includes("localhost")
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;
}

export async function api() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return axios.create({
    baseURL: apiUrl,
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
}
