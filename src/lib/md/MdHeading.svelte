<script lang="ts">
  interface Props {
    depth?: number;
    text?: string;
  }
  const { depth = 1, text = "" }: Props = $props();
  const level = Math.min(6, Math.max(1, depth));
  const Tag = ("h" + level) as keyof HTMLElementTagNameMap;
  const sizeClass =
    level === 1
      ? "text-4xl"
      : level === 2
        ? "text-3xl"
        : level === 3
          ? "text-2xl"
          : level === 4
            ? "text-xl"
            : level === 5
              ? "text-lg"
              : "text-base";
  const spacingClass = level <= 2 ? "mt-6 mb-3" : "mt-4 mb-2";
</script>

<svelte:element
  this={Tag}
  class={`tracking-tight font-bold ${sizeClass} ${spacingClass}`}
>
  {text}
</svelte:element>
