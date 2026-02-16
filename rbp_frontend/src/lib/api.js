import axios from "axios";
import { supabase } from "./supabase";
import { apiUrl } from "./http";

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
