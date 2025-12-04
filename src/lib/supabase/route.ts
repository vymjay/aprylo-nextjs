import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createServerRouteHandler() {
  const supabase = createRouteHandlerClient({ 
    cookies 
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(error?.message || "Unauthorized");
  }

  return { supabase, user };
}

export function createSupabaseClient() {
  return createRouteHandlerClient({ 
    cookies 
  });
}
  