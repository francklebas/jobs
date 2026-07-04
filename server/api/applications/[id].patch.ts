import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Application, ApplicationInput } from "#shared/types/application";
import {
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
} from "#shared/types/application";

const UPDATABLE_FIELDS = [
  "company",
  "position",
  "status",
  "type",
  "applied_at",
  "follow_up_at",
  "contact_name",
  "contact_email",
  "job_url",
  "github_project_url",
  "notes",
] as const;

export default defineEventHandler(async (event): Promise<Application> => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const id = getRouterParam(event, "id");
  const body = await readBody<ApplicationInput>(event);

  const update: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) update[field] = body[field];
  }
  if (Object.keys(update).length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Rien à mettre à jour" });
  }
  if (
    update.status &&
    !APPLICATION_STATUSES.includes(update.status as never)
  ) {
    throw createError({ statusCode: 400, statusMessage: "Statut invalide" });
  }
  if (update.type && !APPLICATION_TYPES.includes(update.type as never)) {
    throw createError({ statusCode: 400, statusMessage: "Type invalide" });
  }

  const client = await serverSupabaseClient(event);
  const { data, error } = await client
    .from("applications")
    // cast : pas de types Supabase générés pour ce projet
    .update(update as never)
    .eq("id", id!)
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  return data as Application;
});
