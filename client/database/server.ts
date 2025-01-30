import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error("Missing Supabase URL or Service Role Key");
}

const serviceSupabase = createClient<Database>(
	SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY,
);

export { serviceSupabase };
