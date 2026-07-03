import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Application } from "#shared/types/application";

export default defineEventHandler(async (event): Promise<Application[]> => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const client = await serverSupabaseClient(event);
  const { data, error } = await client
    .from("applications")
    .select("*")
    .order("applied_at", { ascending: false });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  return data as Application[];
});
