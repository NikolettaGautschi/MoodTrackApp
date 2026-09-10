import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "SUPABASE_URL oder SUPABASE_PUBLISHABLE_KEY fehlen. Bitte .env Datei anlegen (siehe .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
