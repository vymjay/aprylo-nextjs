import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client for use in browser/client components
 * This client handles authentication state automatically
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Export a singleton instance for convenience
export const supabase = createClient();
