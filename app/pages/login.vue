<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const mode = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const infoMessage = ref("");

watchEffect(() => {
  if (user.value) navigateTo("/");
});

async function submit() {
  loading.value = true;
  errorMessage.value = "";
  infoMessage.value = "";

  const credentials = { email: email.value, password: password.value };
  const { error } =
    mode.value === "login"
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp(credentials);

  loading.value = false;
  if (error) {
    errorMessage.value = error.message;
  } else if (mode.value === "register") {
    infoMessage.value =
      "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.";
  }
}
</script>

<template>
  <main class="mx-auto mt-[10vh] w-full max-w-sm px-4">
    <div class="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-xl font-semibold">Suivi de candidatures</h1>
        <ColorModeToggle />
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <label class="flex flex-col gap-1 text-sm font-medium">
          E-mail
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm font-medium">
          Mot de passe
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        <button
          type="submit"
          :disabled="loading"
          class="mt-2 rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {{ mode === "login" ? "Se connecter" : "Créer un compte" }}
        </button>

        <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
          {{ errorMessage }}
        </p>
        <p v-if="infoMessage" class="text-sm text-green-700 dark:text-green-400">
          {{ infoMessage }}
        </p>
      </form>

      <button
        type="button"
        class="mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400"
        @click="mode = mode === 'login' ? 'register' : 'login'"
      >
        {{ mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter" }}
      </button>
    </div>
  </main>
</template>
