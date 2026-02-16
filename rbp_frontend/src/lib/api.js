import axios from "axios";
import { supabase } from "./supabase";

// Centralized API configuration using relative paths by default
const apiUrl = import.meta.env.VITE_API_URL || "/api";

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
