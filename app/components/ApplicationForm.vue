<script setup lang="ts">
import type { ApplicationInput } from "#shared/types/application";

const emit = defineEmits<{ created: [] }>();

const open = ref(false);
const saving = ref(false);
const errorMessage = ref("");

function emptyForm(): ApplicationInput {
  return {
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    follow_up_at: null,
    contact_name: "",
    contact_email: "",
    job_url: "",
    notes: "",
  };
}

const form = ref<ApplicationInput>(emptyForm());

async function submit() {
  saving.value = true;
  errorMessage.value = "";
  try {
    await $fetch("/api/applications", { method: "POST", body: form.value });
    form.value = emptyForm();
    open.value = false;
    emit("created");
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ?? "Erreur lors de l'enregistrement";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section>
    <button
      v-if="!open"
      class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      @click="open = true"
    >
      + Nouvelle candidature
    </button>

    <form
      v-else
      class="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900"
      @submit.prevent="submit"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="form-label">
          Entreprise *
          <input v-model="form.company" required class="form-input" />
        </label>
        <label class="form-label">
          Poste *
          <input v-model="form.position" required class="form-input" />
        </label>
        <div class="form-label">
          Date de candidature
          <DateField v-model="form.applied_at" />
        </div>
        <div class="form-label">
          Relancer le
          <DateField v-model="form.follow_up_at" />
        </div>
        <label class="form-label">
          Contact
          <input v-model="form.contact_name" placeholder="Nom du recruteur" class="form-input" />
        </label>
        <label class="form-label">
          E-mail du contact
          <input v-model="form.contact_email" type="email" class="form-input" />
        </label>
        <label class="form-label sm:col-span-2">
          Lien de l'offre
          <input v-model="form.job_url" type="url" placeholder="https://…" class="form-input" />
        </label>
        <label class="form-label sm:col-span-2">
          Notes
          <textarea v-model="form.notes" rows="2" class="form-input" />
        </label>
      </div>

      <p v-if="errorMessage" class="mt-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>

      <div class="mt-4 flex gap-2">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Ajouter
        </button>
        <button
          type="button"
          class="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          @click="open = false"
        >
          Annuler
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.form-label {
  @apply flex flex-col gap-1 text-sm font-medium;
}

.form-input {
  @apply rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800;
}
</style>
