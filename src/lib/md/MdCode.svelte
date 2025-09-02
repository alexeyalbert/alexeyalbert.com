<script lang="ts">
  import { Highlight, HighlightAuto } from "svelte-highlight";
  import type { LanguageType } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";
  import { browser } from "$app/environment";

  interface Props {
    lang: string;
    text: string;
  }
  const { lang, text }: Props = $props();
  const code = text;
  let resolvedLanguage = $state<LanguageType<string> | undefined>(undefined);

  async function loadLanguage(name?: string) {
    if (!browser || !name) {
      resolvedLanguage = undefined;
      return;
    }
    try {
      const all = await import("svelte-highlight/languages");
      const lower = name.toLowerCase?.() ?? name;
      const mapped =
        lower === "ts" ? "typescript" : lower === "js" ? "javascript" : lower;
      const key = mapped as keyof typeof all;
      const candidate = (all as any)[key];
      resolvedLanguage = (candidate ?? undefined) as
        | LanguageType<string>
        | undefined;
    } catch (e) {
      resolvedLanguage = undefined;
    }
  }

  $effect(() => {
    void loadLanguage(lang);
  });

  // Adjust only the base background fill for each theme
  const themedGithub = github.replace(
    "background:#ffffff",
    "background: var(--color-fill-secondary)",
  );
  const themedGithubDark = githubDark
    .replace(
      "background:#0d1117",
      "background: var(--color-fill-tertiary-dark)",
    )
    .replace("<style>", '<style media="(prefers-color-scheme: dark)">');
</script>

<!-- <pre class="rounded-xl bg-fill-secondary dark:bg-fill-tertiary-dark overflow-x-auto {lang}"><code class="text-[0.95em]">{text}</code></pre> -->

<svelte:head>
  {@html themedGithub}
  {@html themedGithubDark}
</svelte:head>

{#if resolvedLanguage}
  <Highlight
    {code}
    language={resolvedLanguage}
    class="rounded-xl overflow-x-auto text-[0.95em]"
    langtag
    --langtag-padding="0.5em"
  />
{:else}
  <HighlightAuto
    {code}
    class="rounded-xl overflow-x-auto text-[0.95em]"
    langtag
    --langtag-padding="0.5em"
  />
{/if}
