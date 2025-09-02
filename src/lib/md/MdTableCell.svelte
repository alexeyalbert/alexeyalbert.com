<script lang="ts">
  export let header: boolean = false;
</script>

<svelte:element this={header ? "th" : "td"} class="px-3 py-2 align-top">
  <slot />
</svelte:element>
