<script setup lang="ts">
import type { Application, ApplicationStatus } from "#shared/types/application";
import { ACTIVE_STATUSES } from "#shared/types/application";

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const {
  data: applications,
  refresh,
  status,
} = await useFetch<Application[]>("/api/applications");

const today = new Date().toISOString().slice(0, 10);

/** Candidatures actives dont la date de relance est atteinte ou dépassée. */
const dueFollowUps = computed(
  () =>
    applications.value?.filter(
      (app) =>
        app.follow_up_at &&
        app.follow_up_at <= today &&
        ACTIVE_STATUSES.includes(app.status),
    ) ?? [],
);

async function updateApplication(id: string, patch: Record<string, unknown>) {
  await $fetch(`/api/applications/${id}`, { method: "PATCH", body: patch });
  await refresh();
}

function updateStatus(id: string, newStatus: ApplicationStatus) {
  return updateApplication(id, { status: newStatus });
}

function updateFollowUp(id: string, date: string | null) {
  return updateApplication(id, { follow_up_at: date });
}

/** Marque la relance comme faite : statut « relancée », prochaine relance dans 7 jours. */
function markFollowedUp(app: Application) {
  const next = new Date();
  next.setDate(next.getDate() + 7);
  return updateApplication(app.id, {
    status: "relancee",
    follow_up_at: next.toISOString().slice(0, 10),
  });
}

async function removeApplication(id: string) {
  if (!confirm("Supprimer cette candidature ?")) return;
  await $fetch(`/api/applications/${id}`, { method: "DELETE" });
  await refresh();
}

async function logout() {
  await supabase.auth.signOut();
  navigateTo("/login");
}
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-8">
    <header class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Mes candidatures</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ user?.email }}</p>
      </div>
      <div class="flex items-center gap-2">
        <ColorModeToggle />
        <button
          class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          @click="logout"
        >
          Se déconnecter
        </button>
      </div>
    </header>

    <section
      v-if="dueFollowUps.length"
      class="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950/40"
    >
      <h2 class="mb-3 font-semibold text-amber-800 dark:text-amber-300">
        🔔 Relances à faire ({{ dueFollowUps.length }})
      </h2>
      <ul class="flex flex-col gap-2">
        <li
          v-for="app in dueFollowUps"
          :key="app.id"
          class="flex flex-wrap items-center justify-between gap-2 text-sm"
        >
          <span>
            <strong>{{ app.company }}</strong> — {{ app.position }}
            <a
              v-if="app.contact_email"
              :href="`mailto:${app.contact_email}`"
              class="ml-1 text-blue-600 hover:underline dark:text-blue-400"
            >
              écrire à {{ app.contact_name || app.contact_email }}
            </a>
          </span>
          <button
            class="rounded-lg bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
            @click="markFollowedUp(app)"
          >
            Relance faite ✓
          </button>
        </li>
      </ul>
    </section>

    <div class="mb-6">
      <ApplicationForm @created="refresh" />
    </div>

    <p v-if="status === 'pending'" class="text-zinc-500 dark:text-zinc-400">
      Chargement…
    </p>
    <ApplicationsTable
      v-else-if="applications?.length"
      :applications="applications"
      @update-status="updateStatus"
      @update-follow-up="updateFollowUp"
      @remove="removeApplication"
    />
    <p v-else class="rounded-2xl bg-white p-8 text-center text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
      Aucune candidature pour l'instant. Ajoute ta première ci-dessus 👆
    </p>
  </main>
</template>
