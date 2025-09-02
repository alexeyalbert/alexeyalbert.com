<script lang="ts">
  export let title: string;
  export let date: string;
  type BasicImageBody = { src: string; alt?: string };
  // Allow passing an enhanced image object directly
  export let body: string | string[] | BasicImageBody | Record<string, unknown>;
  export let href: string | undefined;
</script>

<a {href} class="h-full rounded-[12px]" data-sveltekit-preload-data>
  <div
    class="bg-fill-primary dark:bg-fill-primary-dark border border-stroke dark:border-stroke-dark rounded-[14px] px-3 pt-2 pb-3 text-text-primary dark:text-text-primary-dark h-full tracking-tight flex flex-col"
  >
    <h3 class="font-bold text-lg/tight">{title}</h3>
    <p
      class="-my-1 text-text-secondary dark:text-text-secondary-dark font-bold"
    >
      {date}
    </p>
    {#if typeof body === "string"}
      <p class="mt-2">{body}</p>
    {:else if Array.isArray(body)}
      <div class="relative">
        <ul
          class="mt-2 list-disc list-outside pl-6 bg-gradient-to-b from-text-primary to-text-primary/10 dark:from-text-primary-dark dark:to-text-primary-dark/10 inline-block text-transparent bg-clip-text text-base/loose list-clamp-8"
        >
          {#each body as item}
            <li
              class="marker:text-text-primary dark:marker:text-text-primary-dark"
            >
              {item}
            </li>
          {/each}
        </ul>
        <div class="gradient-blur h-full">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    {:else}
      <div class="">
        {#if body && typeof body === "object" && Array.isArray((body as any).sources)}
          <enhanced:img
            src={body as any}
            alt={(body as any).alt ?? ""}
            class="w-full h-auto rounded-[6px] mt-4 aspect-16/9 object-cover"
          />
        {:else}
          <img
            src={(body as BasicImageBody).src}
            alt={(body as BasicImageBody).alt ?? ""}
            class="w-full h-auto rounded-[6px] mt-4 border border-stroke dark:border-stroke-dark aspect-16/9 object-cover align-bottom"
          />
        {/if}
      </div>
    {/if}
  </div>
</a>
