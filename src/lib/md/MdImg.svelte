<script lang="ts">
  interface Props {
    href?: string;
    title?: string;
    text?: string;
  }
  const { href = "", title = undefined, text = "" }: Props = $props();
</script>

<div class="flex flex-col justify-center items-center w-[90%] mx-auto">
  <img
    src={href}
    {title}
    alt={text}
    class="rounded-xl h-auto max-h-130 border border-stroke dark:border-stroke-dark"
  />
  <p class="text-text-secondary dark:text-text-secondary-dark text-sm mt-1">
    {title}
  </p>
</div>
