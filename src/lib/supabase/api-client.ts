import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Centralized Supabase client factory for API routes
 * Provides consistent cookie handling and authentication patterns
 * Note: This file should only be used in server-side contexts (API routes, server components)
 */

// Types for different client needs
export type AuthenticatedClient = {
  supabase: SupabaseClient;
  user: any;
};

export type UnauthenticatedClient = {
  supabase: SupabaseClient;
};

/**
 * Creates an unauthenticated Supabase client for public endpoints
 * Only use this in API routes or server components
 */
export async function createPublicClient(): Promise<UnauthenticatedClient> {
  // Dynamic import to avoid bundling issues
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({
    cookies: (): any => cookieStore,
  });
  return { supabase: supabase as SupabaseClient };
}

/**
 * Creates an authenticated Supabase client and validates user session
 * Only use this in API routes or server components
 */
export async function createAuthenticatedClient(): Promise<AuthenticatedClient> {
  // Dynamic import to avoid bundling issues
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({
    cookies: (): any => cookieStore,
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error(error?.message || "Unauthorized");
  }
  return { supabase: supabase as SupabaseClient, user };
}

/**
 * Creates an authenticated Supabase client but doesn't throw on auth failure
 * Only use this in API routes or server components
 */
export async function createOptionalAuthClient(): Promise<{
  supabase: SupabaseClient;
  user: any | null;
}> {
  // Dynamic import to avoid bundling issues
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({
    cookies: (): any => cookieStore,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase: supabase as SupabaseClient, user };
}

/**
 * Helper function to handle authentication errors consistently
 */
export function handleAuthError(error: any): NextResponse {
  console.error("Auth error:", error);

  if (error.message === "Unauthorized" || error.message?.includes("JWT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: error.message || "Internal server error" },
    { status: 500 }
  );
}

/**
 * Helper function to get internal user ID from Supabase user ID
 */
export async function getInternalUserId(
  supabase: SupabaseClient,
  supabaseUserId: string
): Promise<number> {
  // Use direct query instead of RPC function for better reliability
  const { data, error } = await supabase
    .from("User")
    .select("id")
    .eq("supabaseUserId", supabaseUserId)
    .maybeSingle();

  if (error) {
    console.error('Database error while getting internal user ID:', error);
    throw new Error(`Failed to get internal user ID: ${error.message}`);
  }

  if (!data?.id) {
    console.error('User not found in database:', { supabaseUserId });
    throw new Error("User not found in database. Please ensure your account is properly set up.");
  }

  return data.id;
}

/**
 * Wrapper function for authenticated API routes
 */
export async function withAuth<T>(
  handler: (client: AuthenticatedClient, ...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<NextResponse> {
  try {
    const client = await createAuthenticatedClient();
    const result = await handler(client, ...args);
    return NextResponse.json(result);
  } catch (error: any) {
    return handleAuthError(error);
  }
}

/**
 * Wrapper function for public API routes
 */
export async function withPublic<T>(
  handler: (client: UnauthenticatedClient, ...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<NextResponse> {
  try {
    const client = await createPublicClient();
    const result = await handler(client, ...args);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Legacy compatibility exports for gradual migration
export const createSupabaseClient = createPublicClient;
export const createServerRouteHandler = createAuthenticatedClient;
export const createServerSupabaseClient = createAuthenticatedClient;
export const createAuthClient = createOptionalAuthClient;