<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import "../app.css";

  let {
    data,
    children,
    modal,
  }: { data: LayoutData; children: Snippet; modal?: Snippet } = $props();
</script>

{@render children()}
{#if modal}
  {@render modal()}
{/if}
