import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createAuthClient() {
  const supabase = createRouteHandlerClient({
    cookies,
  });

  // Get authenticated user using the secure method
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user };
}
