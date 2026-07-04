<script setup lang="ts">
import type {
  Application,
  ApplicationStatus,
  ApplicationType,
} from "#shared/types/application";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TYPES,
  APPLICATION_TYPE_LABELS,
} from "#shared/types/application";

const props = defineProps<{ applications: Application[] }>();

const emit = defineEmits<{
  "update-status": [id: string, status: ApplicationStatus];
  "update-type": [id: string, type: ApplicationType];
  "update-follow-up": [id: string, date: string | null];
  remove: [id: string];
}>();

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

/** Minuscules sans accents, pour une recherche insensible à la casse et aux diacritiques. */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const search = ref("");

function haystack(app: Application) {
  return normalize(
    [
      app.company,
      app.position,
      APPLICATION_STATUS_LABELS[app.status],
      APPLICATION_TYPE_LABELS[app.type ?? "emploi"],
      app.contact_name,
      app.contact_email,
      app.notes,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Chaque terme (séparé par des espaces) doit apparaître quelque part dans la ligne. */
const filtered = computed(() => {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  if (!terms.length) return props.applications;
  return props.applications.filter((app) => {
    const h = haystack(app);
    return terms.every((term) => h.includes(term));
  });
});

type SortKey =
  | "company"
  | "position"
  | "type"
  | "applied_at"
  | "status"
  | "follow_up_at";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company", label: "Entreprise" },
  { key: "position", label: "Poste" },
  { key: "type", label: "Type" },
  { key: "applied_at", label: "Envoyée le" },
  { key: "status", label: "Statut" },
  { key: "follow_up_at", label: "Relance" },
];

const sortKey = ref<SortKey | null>(null);
const sortDir = ref<"asc" | "desc">("asc");

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

function sortValue(app: Application, key: SortKey): string | number | null {
  switch (key) {
    case "status":
      // ordre du pipeline (envoyée → … → sans réponse) plutôt qu'alphabétique
      return APPLICATION_STATUSES.indexOf(app.status);
    case "type":
      return APPLICATION_TYPE_LABELS[app.type ?? "emploi"];
    case "company":
    case "position":
      return normalize(app[key]);
    default:
      // dates ISO : l'ordre lexicographique est l'ordre chronologique
      return app[key];
  }
}

const displayed = computed(() => {
  const key = sortKey.value;
  if (!key) return filtered.value;
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...filtered.value].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    // valeurs absentes toujours en bas, quel que soit le sens
    if (va === null) return vb === null ? 0 : 1;
    if (vb === null) return -1;
    return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
  });
});
</script>

<template>
  <div>
    <input
      v-model="search"
      type="search"
      placeholder="Rechercher (entreprise, poste, contact, notes…)"
      class="mb-3 w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
    />

    <div class="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
          <th
            v-for="col in COLUMNS"
            :key="col.key"
            class="px-4 py-3 font-medium"
            :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined"
          >
            <button
              type="button"
              class="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-100"
              @click="toggleSort(col.key)"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key" aria-hidden="true">
                {{ sortDir === "asc" ? "▲" : "▼" }}
              </span>
            </button>
          </th>
          <th class="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        <tr v-if="!displayed.length">
          <td
            colspan="7"
            class="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
          >
            Aucune candidature ne correspond à « {{ search }} »
          </td>
        </tr>
        <tr
          v-for="app in displayed"
          :key="app.id"
          class="border-t border-zinc-100 dark:border-zinc-800"
        >
          <td class="px-4 py-3">
            <a
              v-if="app.job_url"
              :href="app.job_url"
              target="_blank"
              rel="noopener"
              class="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {{ app.company }}
            </a>
            <span v-else class="font-medium">{{ app.company }}</span>
            <small v-if="app.contact_name" class="block text-zinc-500 dark:text-zinc-400">
              {{ app.contact_name }}
            </small>
          </td>
          <td class="px-4 py-3">
            {{ app.position }}
            <a
              v-if="app.github_project_url"
              :href="app.github_project_url"
              target="_blank"
              rel="noopener"
              class="block text-xs text-zinc-500 hover:underline dark:text-zinc-400"
            >
              Projet GitHub ↗
            </a>
          </td>
          <td class="px-4 py-3">
            <select
              :value="app.type ?? 'emploi'"
              class="rounded-lg border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
              @change="emit('update-type', app.id, ($event.target as HTMLSelectElement).value as ApplicationType)"
            >
              <option v-for="type in APPLICATION_TYPES" :key="type" :value="type">
                {{ APPLICATION_TYPE_LABELS[type] }}
              </option>
            </select>
          </td>
          <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(app.applied_at) }}</td>
          <td class="px-4 py-3">
            <select
              :value="app.status"
              class="rounded-lg border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
              @change="emit('update-status', app.id, ($event.target as HTMLSelectElement).value as ApplicationStatus)"
            >
              <option v-for="status in APPLICATION_STATUSES" :key="status" :value="status">
                {{ APPLICATION_STATUS_LABELS[status] }}
              </option>
            </select>
          </td>
          <td class="px-4 py-3">
            <DateField
              dense
              class="w-32"
              :model-value="app.follow_up_at"
              @update:model-value="emit('update-follow-up', app.id, $event ?? null)"
            />
          </td>
          <td class="px-4 py-3 text-right">
            <button
              class="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
              title="Supprimer"
              @click="emit('remove', app.id)"
            >
              ✕
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>
