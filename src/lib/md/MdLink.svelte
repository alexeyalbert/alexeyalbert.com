<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    href?: string;
    title?: string;
    children?: Snippet;
  }
  const { href = "", title = "", children }: Props = $props();
</script>

<a
  {href}
  {title}
  class="underline underline-offset-4 hover:text-accent"
  rel="noopener noreferrer"
  target="_blank"
>
  {@render children?.()}
</a>
