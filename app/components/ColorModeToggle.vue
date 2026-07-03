<script setup lang="ts">
const colorMode = useColorMode();

function toggle() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      :title="colorMode.value === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
      @click="toggle"
    >
      {{ colorMode.value === "dark" ? "☀️" : "🌙" }}
    </button>
    <template #fallback>
      <span class="inline-block h-8 w-11" />
    </template>
  </ClientOnly>
</template>
