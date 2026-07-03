<script setup lang="ts">
// Page de callback après confirmation d'e-mail / lien magique :
// le module Supabase y récupère la session, puis on renvoie vers l'accueil.
const user = useSupabaseUser();

watchEffect(() => {
  if (user.value) navigateTo("/");
});
</script>

<template>
  <main class="mt-[20vh] text-center text-zinc-500 dark:text-zinc-400">
    <p>Connexion en cours…</p>
  </main>
</template>
