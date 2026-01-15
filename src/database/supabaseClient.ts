import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL: string = process.env.SUPABASE_URL!;
const SUPABASE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing Supabase URL or Service Role Key in environment variables"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "inventory",
  },
});

console.log("ß Supabase client initialized for schema: inventory");
