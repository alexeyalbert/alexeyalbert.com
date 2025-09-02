<script>
  import Navbar from "../navbar.svelte";
  import { onMount } from "svelte";
  import richtext_light from "$lib/assets/icons/richtext_light.svg";
  import richtext_dark from "$lib/assets/icons/richtext_dark.svg";
  import photo_on_rectangle_angled_light from "$lib/assets/icons/photo_on_rectangle_angled_light.svg";
  import photo_on_rectangle_angled_dark from "$lib/assets/icons/photo_on_rectangle_angled_dark.svg";
  import link_light from "$lib/assets/icons/link_light.svg";
  import link_dark from "$lib/assets/icons/link_dark.svg";
  import download_light from "$lib/assets/icons/download_light.svg";
  import download_dark from "$lib/assets/icons/download_dark.svg";
  import resume from "$lib/assets/pdfs/Alexey Albert Resume.pdf";

  import GridCard from "./GridCard.svelte";

  let { data, children } = $props();

  onMount(() => {
    console.log("Work layout mounted");
  });
</script>

<main
  class="font-helvetica_neue flex min-h-screen flex-col justify-center p-[10px] lg:p-[15px] antialiased bg-fill-secondary-dark dark:bg-fill-secondary text-text-primary dark:text-text-primary-dark"
>
  <div
    class="flex grow flex-col px-[20px] xl:px-[65px] pt-[250px] lg:pt-[200px] pb-[65px] w-full rounded-[52px] lg:rounded-2xl bg-fill-secondary dark:bg-fill-secondary-dark"
  >
    <div class="flex flex-wrap relative">
      <div class="absolute top-0 right-0 -mt-[230px] lg:mt-[30px] pl-[12px]">
        <Navbar />
      </div>
      <section class="flex flex-col items-center w-full">
        <div
          class="flex flex-row flex-wrap justify-between max-w-[680px] w-full items-end"
        >
          <h2
            class="ml-[9px] text-[62px] font-otbulb_mono -tracking-[2.48px] -mb-[11px]"
          >
            work
          </h2>
          <a
            download="Alexey Albert Resume.pdf"
            href={resume}
            class="flex flex-row text-[28px] font-otbulb_mono -tracking-[1.12px] justify-end w-full sm:w-auto"
          >
            download resume
            <img
              src={download_light}
              alt="download icon"
              class="ml-[11.5px] mr-[11px] block dark:hidden"
            />
            <img
              src={download_dark}
              alt="download icon"
              class="ml-[11.5px] mr-[11px] hidden dark:block"
            />
          </a>
        </div>

        <div class="grid sm:grid-cols-2 gap-[18px] max-w-[680px] w-full">
          {#each data?.works ?? [] as w}
            <GridCard
              title={w.title}
              date={w.date}
              body={w.body}
              href={`/work/${w.slug}`}
            />
          {/each}
        </div>

        {@render children?.()}
      </section>
    </div>
  </div>
</main>
