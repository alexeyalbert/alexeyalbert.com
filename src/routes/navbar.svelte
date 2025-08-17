<script lang="ts">
  import { page } from "$app/stores";
  import right_chevron_light from "$lib/assets/icons/right_chevron_light.svg";
  import right_chevron_dark from "$lib/assets/icons/right_chevron_dark.svg";
  import { Fa } from "svelte-fa";
  import type { IconSize } from "svelte-fa";
  import {
    faGithubAlt,
    faLinkedinIn,
    faXTwitter,
  } from "@fortawesome/free-brands-svg-icons";
</script>

<nav class="flex flex-col whitespace-norap text-[30px] -tracking-[1.2px]">
  <h2 class="self-end font-medium mt-[10px] text-right">directory</h2>
  <ul class="list-none">
    <li class="mt-[5px]">
      <a href="/" class="flex">
        <img
          src={right_chevron_light}
          alt="right chevron"
          class="mt-[8px] mr-[9px] block dark:hidden"
          class:invisible={$page.url.pathname !== "/"}
        />
        <img
          src={right_chevron_dark}
          alt="right chevron"
          class="mt-[8px] mr-[9px] hidden dark:block"
          class:invisible={$page.url.pathname !== "/"}
        />
        about
      </a>
    </li>
    <li>
      <a href="/work" class="flex mt-[-8px]">
        <img
          src={right_chevron_light}
          alt="right chevron"
          class="mt-[8px] mr-[9px] block dark:hidden"
          class:invisible={$page.url.pathname !== "/work"}
        />
        <img
          src={right_chevron_dark}
          alt="right chevron"
          class="mt-[8px] mr-[9px] hidden dark:block"
          class:invisible={$page.url.pathname !== "/work"}
        />
        work
      </a>
    </li>
    <li>
      <a href="mailto:hi@alxy.ca" class="flex mt-[-8px]">
        <img
          src={right_chevron_light}
          alt="right chevron"
          class="mt-[8px] mr-[9px] block dark:hidden invisible"
        />
        <img
          src={right_chevron_dark}
          alt="right chevron"
          class="mt-[8px] mr-[9px] hidden dark:block invisible"
        />
        contact
      </a>
    </li>
    <div class="flex flex-row items-start justify-between mt-[16px] mx-[10px]">
      <a href="https://github.com/alexeyalbert">
        <Fa icon={faGithubAlt} size="24" />
      </a>
      <a href="https://www.x.com/alexeyalbert">
        <Fa icon={faXTwitter} size="24" />
      </a>
      <a href="https://www.linkedin.com/in/alexeyalbert">
        <Fa icon={faLinkedinIn} size="24" />
      </a>
    </div>
  </ul>
</nav>
