import axios from "axios";
import { supabase } from "./supabase";

// Determination of API URL (Keeping in sync with http.js)
let apiUrl = import.meta.env.VITE_API_URL || "";

if (!apiUrl) {
  if (window.location.host.includes("localhost") || window.location.host.includes("127.0.0.1")) {
    apiUrl = "http://localhost:5000/api";
  } else {
    apiUrl = "https://medi-match-8u18.onrender.com/api";
  }
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
