<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    ordered?: boolean;
    children?: Snippet;
  }
  const { ordered = false, children }: Props = $props();
  const Tag = (ordered ? "ol" : "ul") as "ol" | "ul";
</script>

<svelte:element
  this={Tag}
  class="ml-6 list-outside {ordered ? 'list-decimal' : 'list-disc'}"
>
  {@render children?.()}
</svelte:element>
