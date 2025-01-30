import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log("SUPABASE_URL:", SUPABASE_URL);
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error("Missing Supabase URL or Anon Key");
}

const publicSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export { publicSupabase };
