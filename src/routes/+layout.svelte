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
  const absoluteNameLight = $derived(siteOrigin ? `${siteOrigin}${nameLight}` : nameLight);

  const pageHead = $derived((($page.data as any)?.head) ?? {});
  const pathname = $derived(currentUrl?.pathname || "/");
  const routeDefaultTitle = $derived(
    pathname === "/"
      ? "About | Alexey Albert"
      : (pathname === "/work" || pathname.startsWith("/work/"))
        ? "Work | Alexey Albert"
        : defaultTitle,
  );

  const head = $derived({
    title: pageHead.title ?? routeDefaultTitle,
    description: pageHead.description ?? defaultDescription,
    type: pageHead.type ?? "website",
    image: pageHead.image ?? absoluteNameLight,
  });
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
