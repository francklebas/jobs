import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Application, ApplicationInput } from "#shared/types/application";
import { APPLICATION_STATUSES } from "#shared/types/application";

export default defineEventHandler(async (event): Promise<Application> => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const body = await readBody<ApplicationInput>(event);
  if (!body?.company?.trim() || !body?.position?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Entreprise et poste sont obligatoires",
    });
  }
  if (body.status && !APPLICATION_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: "Statut invalide" });
  }

  const payload = {
    // serverSupabaseUser renvoie les claims du JWT : l'id utilisateur est `sub`
    user_id: user.sub,
    company: body.company.trim(),
    position: body.position.trim(),
    status: body.status ?? "envoyee",
    applied_at: body.applied_at || undefined,
    follow_up_at: body.follow_up_at || null,
    contact_name: body.contact_name || null,
    contact_email: body.contact_email || null,
    job_url: body.job_url || null,
    notes: body.notes || null,
  };

  const client = await serverSupabaseClient(event);
  const { data, error } = await client
    .from("applications")
    // cast : pas de types Supabase générés pour ce projet
    .insert(payload as never)
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  return data as Application;
});
