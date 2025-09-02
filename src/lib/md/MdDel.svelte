<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    children?: Snippet;
  }
  const { children }: Props = $props();
</script>

<del class="opacity-80">
  {@render children?.()}
</del>
