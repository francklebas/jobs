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

defineProps<{ applications: Application[] }>();

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
</script>

<template>
  <div class="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
          <th class="px-4 py-3 font-medium">Entreprise</th>
          <th class="px-4 py-3 font-medium">Poste</th>
          <th class="px-4 py-3 font-medium">Type</th>
          <th class="px-4 py-3 font-medium">Envoyée le</th>
          <th class="px-4 py-3 font-medium">Statut</th>
          <th class="px-4 py-3 font-medium">Relance</th>
          <th class="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="app in applications"
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
</template>
