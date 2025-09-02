<script lang="ts">
  interface Props {
    href?: string;
    children?: import("svelte").Snippet;
  }
  const { href = "#", children }: Props = $props();
</script>

<a
  {href}
  class="inline-flex items-center rounded-lg bg-accent px-4 py-2 font-medium text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent/60"
>
  {@render children?.()}
</a>
