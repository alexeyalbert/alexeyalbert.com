<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fade, fly, scale } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";
  import SvelteMarkdown, {
    defaultRenderers,
    Html,
    allowHtmlOnly,
  } from "@humanspeak/svelte-markdown";
  import MdHeading from "$lib/md/MdHeading.svelte";
  import MdLink from "$lib/md/MdLink.svelte";
  import MdImg from "$lib/md/MdImg.svelte";
  import MdButton from "$lib/md/MdButton.svelte";
  import MdParagraph from "$lib/md/MdParagraph.svelte";
  import MdList from "$lib/md/MdList.svelte";
  import MdListItem from "$lib/md/MdListItem.svelte";
  import MdHr from "$lib/md/MdHr.svelte";
  import MdBlockquote from "$lib/md/MdBlockquote.svelte";
  import MdEm from "$lib/md/MdEm.svelte";
  import MdStrong from "$lib/md/MdStrong.svelte";
  import MdDel from "$lib/md/MdDel.svelte";
  import MdTable from "$lib/md/MdTable.svelte";
  import MdTableHead from "$lib/md/MdTableHead.svelte";
  import MdTableBody from "$lib/md/MdTableBody.svelte";
  import MdTableRow from "$lib/md/MdTableRow.svelte";
  import MdTableCell from "$lib/md/MdTableCell.svelte";
  import MdCodeSpan from "$lib/md/MdCodeSpan.svelte";
  import MdCode from "$lib/md/MdCode.svelte";
  import up_right_dark from "$lib/assets/icons/up_right_dark.svg";
  import up_right_light from "$lib/assets/icons/up_right_light.svg";

  let { data } = $props();

  const close = () => goto("/work", { noScroll: true });

  type LinkTag = { title: string; href: string };
  function normalizeLinks(
    meta: Record<string, unknown> | undefined | null,
  ): LinkTag[] {
    const results: LinkTag[] = [];
    if (!meta) return results;
    const raw = (meta as any).links as unknown;

    const pushIfValid = (title: unknown, href: unknown) => {
      const t = typeof title === "string" ? title.trim() : "";
      const h = typeof href === "string" ? href.trim() : "";
      if (t && h) results.push({ title: t, href: h });
    };

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          if ("title" in obj && ("href" in obj || "url" in obj)) {
            pushIfValid(obj.title, (obj as any).href ?? (obj as any).url);
          } else {
            const keys = Object.keys(obj);
            if (keys.length === 1) {
              const k = keys[0];
              pushIfValid(k, obj[k]);
            }
          }
        }
      }
    } else if (raw && typeof raw === "object") {
      for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        pushIfValid(k, v);
      }
    }

    // Back-compat: support legacy single githubLink if provided and no links
    if (results.length === 0 && (meta as any)?.githubLink) {
      pushIfValid("GitHub", (meta as any).githubLink);
    }

    return results;
  }

  const linkTags: LinkTag[] = normalizeLinks(data?.meta as any);

  const renderers = {
    ...defaultRenderers,
    heading: MdHeading,
    link: MdLink,
    paragraph: MdParagraph,
    list: MdList,
    image: MdImg,
    listitem: MdListItem,
    hr: MdHr,
    blockquote: MdBlockquote,
    em: MdEm,
    strong: MdStrong,
    del: MdDel,
    table: MdTable,
    tablehead: MdTableHead,
    tablebody: MdTableBody,
    tablerow: MdTableRow,
    tablecell: MdTableCell,
    codespan: MdCodeSpan,
    code: MdCode,
    html: {
      ...Html,
      ...allowHtmlOnly([
        ["img", MdImg],
        ["md-button", MdButton],
        "strong",
        "em",
        "a",
      ]),
    },
  };

  let articleRef: HTMLElement;
  let containerRef: HTMLElement;
  let reduceMotion = $state(false);

  const handleDocumentClick = (e: MouseEvent) => {
    if (!articleRef || !containerRef) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    // Only handle clicks that occur within the modal container
    if (!containerRef.contains(target)) return;
    // Close if the click is outside of the article
    if (!articleRef.contains(target)) close();
  };

  onMount(() => {
    // Respect user preference for reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion = mq.matches;
    const onChange = () => (reduceMotion = mq.matches);
    mq.addEventListener?.("change", onChange);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", handleDocumentClick, true);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", handleDocumentClick, true);
      document.body.style.overflow = original;
      mq.removeEventListener?.("change", onChange);
    };
  });
</script>

<div
  bind:this={containerRef}
  class="fixed inset-0 z-[100] w-dvw h-dvh bg-fill-primary dark:bg-fill-primary-dark sm:bg-fill-primary-dark/40 sm:dark:bg-fill-primary-dark/40 sm:backdrop-blur-sm overflow-visible"
  role="dialog"
  aria-modal="true"
  in:fade={{ duration: reduceMotion ? 0 : 150 }}
  out:fade={{ duration: reduceMotion ? 0 : 150 }}
>
  <div class="absolute inset-0 overflow-y-auto h-full" role="document" tabindex="-1">
    <div
      in:fly={{ y: reduceMotion ? 0 : 18, duration: reduceMotion ? 0 : 200, easing: cubicOut }}
      out:fly={{ y: reduceMotion ? 0 : 12, duration: reduceMotion ? 0 : 160, easing: cubicIn }}
    >
      <article
        bind:this={articleRef}
        class="mx-auto w-full sm:w-auto max-w-none sm:max-w-[720px] rounded-none sm:rounded-3xl bg-fill-primary dark:bg-fill-primary-dark text-text-primary dark:text-text-primary-dark p-6 border-0 sm:border border-stroke dark:border-stroke-dark mt-0 mb-0 sm:mt-20 sm:mb-20 min-h-full"
        in:scale={{ start: 0.98, duration: reduceMotion ? 0 : 200, easing: cubicOut }}
        out:scale={{ start: 0.98, duration: reduceMotion ? 0 : 160, easing: cubicIn }}
      >
      {#if data.meta?.title || data.meta?.date}
        <header class="">
          {#if data.meta?.title}
            <h1 class="text-4xl font-bold tracking-tight">
              {String(data.meta.title)}
            </h1>
          {/if}
          {#if data.meta?.date}
            <p
              class="mt-1 font-bold text-lg tracking-tight text-text-secondary dark:text-text-secondary-dark"
            >
              {String(data.meta.date)}
            </p>
          {/if}

          {#if linkTags.length}
            <div class="mx-2 mt-3 mb-4 flex flex-wrap gap-2">
              {#each linkTags as link}
                <a
                  href={link.href}
                  target="_blank"
                  class="inline-flex items-center text-lg rounded-[6px] bg-fill-secondary dark:bg-fill-secondary-dark text-text-secondary dark:text-text-secondary-dark px-1.5 border border-stroke dark:border-stroke-dark gap-1.5"
                >
                  {link.title}
                  <img
                    src={up_right_light}
                    alt="link icon"
                    class="w-[13px] h-[13px] block dark:hidden"
                  />
                  <img
                    src={up_right_dark}
                    alt="link icon"
                    class="w-[13px] h-[13px] hidden dark:block"
                  />
                </a>
              {/each}
            </div>
          {/if}
        </header>
      {/if}
      <div class="px-2 overflow-x-scroll">
        <SvelteMarkdown
          source={data.source}
          {renderers}
          options={{ breaks: true, gfm: true }}
        />
      </div>
      </article>
    </div>
  </div>
</div>
