import axios from "axios";
import { supabase } from "./supabase";

let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (apiUrl.includes("onrender.com") && !apiUrl.includes("/api")) {
  apiUrl = `${apiUrl.replace(/\/$/, "")}/api`;
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
