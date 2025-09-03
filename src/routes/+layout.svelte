<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import "../app.css";
  import { page } from "$app/stores";
  import nameLight from "$lib/assets/images/name_light.png";

  let {
    data,
    children,
    modal,
  }: { data: LayoutData; children: Snippet; modal?: Snippet } = $props();

  const defaultTitle = "Alexey Albert";
  const defaultDescription = "Math, CS, stats student @ UofT.";

  const currentUrl = $derived($page.url);
  const siteOrigin = $derived(currentUrl?.origin ?? "");
  const screenshotImage = $derived(currentUrl?.href
    ? `https://webshot.deam.io/${encodeURIComponent(currentUrl.href)}?width=1200&height=630`
    : `${siteOrigin}/web-app-manifest-512x512.png`);
  const baseHead = $derived({
    title: defaultTitle,
    description: defaultDescription,
    image: screenshotImage,
    type: "website",
  });
  const head = $derived({ ...baseHead, ...((($page.data as any)?.head) ?? {}) });
</script>

<svelte:head>
  <title>{head.title}</title>
  <meta name="description" content={head.description} />

  <meta property="og:title" content={head.title} />
  <meta property="og:description" content={head.description} />
  <meta property="og:type" content={head.type ?? "website"} />
  <meta property="og:url" content={currentUrl?.href} />
  <meta property="og:image" content={head.image} />
  <meta property="og:site_name" content={defaultTitle} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={head.title} />
  <meta name="twitter:description" content={head.description} />
  <meta name="twitter:image" content={head.image} />
</svelte:head>

{@render children()}
{#if modal}
  {@render modal()}
{/if}
