import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Returns a Supabase client configured with the user's auth token
 * if provided, or the default client otherwise.
 */
export const getSupabaseClient = (authToken) => {
  if (authToken) {
    return createClient(
      supabaseUrl,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      }
    );
  }
  return supabase;
};

export default supabase;
