<script setup lang="ts">
// Champ date affiché au format français (jj/mm/aaaa), valeur en ISO (aaaa-mm-jj).
// Le bouton calendrier ouvre le picker natif du navigateur.
const model = defineModel<string | null>();

const props = defineProps<{ dense?: boolean }>();

const nativeInput = useTemplateRef("nativeInput");
const text = ref(isoToFr(model.value));

watch(model, (value) => {
  text.value = isoToFr(value);
});

function isoToFr(iso: string | null | undefined): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function frToIso(fr: string): string | null {
  const match = fr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")}`;
}

function onTextChange() {
  const trimmed = text.value.trim();
  if (!trimmed) {
    model.value = null;
    return;
  }
  const iso = frToIso(trimmed);
  if (iso) {
    model.value = iso;
    text.value = isoToFr(iso);
  } else {
    // saisie invalide : on revient à la dernière valeur valide
    text.value = isoToFr(model.value);
  }
}

function openPicker() {
  const input = nativeInput.value;
  if (!input) return;
  if (typeof input.showPicker === "function") {
    input.showPicker();
  } else {
    input.focus();
    input.click();
  }
}
</script>

<template>
  <div class="relative">
    <input
      v-model="text"
      type="text"
      inputmode="numeric"
      placeholder="jj/mm/aaaa"
      :class="[
        'w-full rounded-lg border border-zinc-300 bg-white font-normal outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800',
        props.dense ? 'py-1 pl-2 pr-8 text-sm' : 'py-2 pl-3 pr-9 text-sm',
      ]"
      @change="onTextChange"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      title="Ouvrir le calendrier"
      @click="openPicker"
    >
      <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </button>
    <!-- input natif invisible mais rendu, pour ancrer showPicker() sur le champ -->
    <input
      ref="nativeInput"
      type="date"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0"
      :value="model ?? ''"
      @change="model = ($event.target as HTMLInputElement).value || null"
    />
  </div>
</template>
