import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const id = getRouterParam(event, "id");
  const client = await serverSupabaseClient(event);
  const { error } = await client.from("applications").delete().eq("id", id!);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  return { ok: true };
});
