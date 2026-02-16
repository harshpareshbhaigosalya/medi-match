import axios from "axios";
import { supabase } from "./supabase";

const API_BASE = "http://localhost:5000/api";

export async function api() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
}
