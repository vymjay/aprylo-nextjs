// Example of migrated API route using universal error handling
import { createPublicClient } from "@/lib/supabase/api-client";
import { withErrorHandler, withValidation, APIErrorHandler } from "@/lib/api-error-handler";

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    throw APIErrorHandler.createError("User ID is required", 400);
  }

  const { supabase } = await createPublicClient();
  const { data: addresses, error } = await supabase
    .from("Address")
    .select("*")
    .eq("userId", userId);

  if (error) {
    throw error; // Will be handled by universal error handler
  }

  return Response.json(addresses);
});

export const POST = withValidation({
  required: ['street', 'city', 'userId'],
  types: { 
    street: 'string',
    city: 'string', 
    userId: 'number',
    isDefault: 'boolean'
  }
})(async (request: Request, data: any) => {
  const { supabase } = await createPublicClient();
  const { data: address, error } = await supabase
    .from("Address")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error; // Will be handled by universal error handler
  }

  return Response.json(address);
});

export const PUT = withValidation({
  required: ['id'],
  types: { id: 'number' }
})(async (request: Request, data: any) => {
  const { supabase } = await createPublicClient();
  const { data: address, error } = await supabase
    .from("Address")
    .update(data)
    .eq("id", data.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return Response.json(address);
});

export const DELETE = withValidation({
  required: [],
})(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const addressId = searchParams.get("addressId");

  if (!addressId) {
    throw APIErrorHandler.createError("Address ID is required", 400);
  }

  const { supabase } = await createPublicClient();
  const { error } = await supabase
    .from("Address")
    .delete()
    .eq("id", addressId);

  if (error) {
    throw error;
  }

  return Response.json({ success: true });
});
