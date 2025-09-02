<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    children?: Snippet;
  }
  const { children }: Props = $props();
</script>

<blockquote
  class="border-l-4 pl-4 border-stroke dark:border-stroke-dark text-text-secondary dark:text-text-secondary-dark"
>
  {@render children?.()}
</blockquote>
