import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "VITE_SUPABASE_URL oder VITE_SUPABASE_PUBLISHABLE_KEY fehlen. Bitte .env Datei anlegen (siehe .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
