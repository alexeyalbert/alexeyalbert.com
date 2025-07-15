<script lang="ts">
  import Navbar from "./navbar.svelte";

  import name_image_light from "$lib/assets/images/name_light.png";
  import name_image_dark from "$lib/assets/images/name_dark.png";
  import { onMount } from "svelte";

  let container: HTMLPreElement;
  let parentContainer: HTMLDivElement;
  let roundedContainer: HTMLDivElement;
  let topContentContainer: HTMLDivElement;
  let marginTop = 125;
  // gradient from brightest to darkest
  let chars =
    "@MBHENR#KWXDFPQASUZbdehx*8Gm&04LOVYkpq5Tagns69owz$CIu23Jcfry%1v7l+it[]{}?j|()=~!-/<>\"^_';,:`. ";
  //let chars = "1ilrtfJCyunzxvYULXATVOkoqwjFsmGEKPNMHDBZQR234567890";
  let width = 300; // Reduced width for ASCII art
  let height = 200; // Reduced height for ASCII art
  let time = 0;
  let seed = Math.random(); // Random seed value between 0 and 1
  let animationFrameId: number;

  // Seeded random number generator
  function seededRandom(x: number, y: number) {
    let dot = x * 12.9898 + y * 78.233 + seed * 43758.5453;
    return (Math.sin(dot) * 43758.5453123) % 1;
  }

  // Replace the hash function with our seeded version
  function hash(x: number, y: number) {
    return seededRandom(x, y);
  }

  // Improved gradient noise function
  function noise(x: number, y: number) {
    let xi = Math.floor(x);
    let yi = Math.floor(y);
    let xf = x - xi;
    let yf = y - yi;

    // Smoothstep
    let u = xf * xf * (3 - 2 * xf);
    let v = yf * yf * (3 - 2 * yf);

    let a = hash(xi, yi);
    let b = hash(xi + 1, yi);
    let c = hash(xi, yi + 1);
    let d = hash(xi + 1, yi + 1);

    let value = a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    return value;
  }

  // Fractal Brownian Motion
  function fbm(x: number, y: number) {
    let value = 0;
    let amplitude = 0.8;
    let frequency = 0.4;

    for (let i = 0; i < 6; i++) {
      value += amplitude * noise(x * frequency, y * frequency);
      frequency *= 0;
      amplitude *= 0.2;
    }

    return Math.abs(value); // Ensure positive values
  }

  function getAsciiChar(value: number) {
    // Map the value (0-1) to an index in our chars string
    // Reverse the value since our gradient is now brightest to darkest
    value = 1 - value;
    const index = Math.floor(value * (chars.length - 1));
    return chars[index];
  }

  function render() {
    let result = "";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let nx = x / width;
        let ny = y / height;

        // Adjust these multipliers to change the scale/zoom
        // Lower numbers = more zoomed out (bigger features)
        // Higher numbers = more zoomed in (smaller features)
        const isMobile = window.innerWidth < 640; // sm breakpoint
        let scale = isMobile ? 15 : 20; // Slightly smaller scale on mobile for better proportion
        let n = fbm(nx * scale + time * 0.2, ny * scale);

        n = Math.pow(n, 1.3); // Increase contrast
        n = Math.max(0, Math.min(1, n)); // Clamp between 0 and 1

        result += getAsciiChar(n);
      }
      result += "\n";
    }

    container.textContent = result;
  }

  function animate() {
    time += 0.01;
    render();
    animationFrameId = requestAnimationFrame(animate);
  }

  function updateLayout() {
    if (roundedContainer && topContentContainer && parentContainer) {
      const mainPadding = 15; // from p-[15px] on main
      const roundedContainerPaddingTop = 200; // from pt-[200px]
      const roundedContainerPaddingBottom = 65; // from pb-[65px]

      const roundedContainerTop = roundedContainer.getBoundingClientRect().top;
      const desiredHeight =
        window.innerHeight - roundedContainerTop - mainPadding;

      const contentHeight = topContentContainer.offsetHeight;
      const preHeight = parentContainer.offsetHeight;

      const requiredMargin =
        desiredHeight -
        roundedContainerPaddingTop -
        contentHeight -
        preHeight -
        roundedContainerPaddingBottom;

      marginTop = Math.max(125, requiredMargin);
    }
  }

  function updateDimensions() {
    if (parentContainer) {
      // Get parent width and calculate how many characters can fit
      // Use different character widths for different screen sizes
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const charWidth = isMobile ? 2.5 : 4; // Smaller character width on mobile
      width = Math.floor(parentContainer.offsetWidth / charWidth);
      // Re-render with new dimensions
      render();
    }
    updateLayout();
  }

  onMount(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateDimensions);
    };
  });
</script>

<main
  class="font-helvetica_neue flex min-h-screen flex-col justify-center p-[10px] lg:p-[15px] antialiased bg-fill-secondary-dark dark:bg-fill-secondary text-text-primary dark:text-text-primary-dark"
>
  <div
    bind:this={roundedContainer}
    class="flex flex-grow flex-col px-[20px] xl:px-[65px] pt-[250px] lg:pt-[200px] pb-[65px] w-full rounded-[52px] lg:rounded-2xl bg-fill-secondary dark:bg-fill-secondary-dark"
  >
    <div bind:this={topContentContainer} class="flex flex-wrap relative">
      <div class="absolute top-0 right-0 -mt-[230px] lg:mt-[30px] pl-[12px]">
        <Navbar />
      </div>
      <section class="flex flex-col w-[680px]">
        <h1 class="text-[40px] -tracking-[1.6px]">hey, i'm</h1>
        <img
          src={name_image_light}
          alt="Alexey Albert"
          class="block dark:invert object-cover relative mb-[15px] mt-[6px] ml-[5px] w-[580px]"
        />
        <img
          src={name_image_dark}
          alt="Alexey Albert"
          class="hidden object-cover relative mb-[15px] mt-[6px] ml-[5px] w-[580px] dark:invert-0"
        />
        <p class="text-[22px] -tracking-[0.66px]">
          I'm an enthusiastic student studying Mathematics at the University of
          Toronto. I'm interested in software, hardware, and design.
        </p>
        <p class="text-[22px] -tracking-[0.66px] mt-[40px]">
          I'm currently a member of UofT's Robotics for Space Exploration design
          team, where I've been part of the CanSat competition sub-team, working
          on the camera system, descent control, antenna design, mission patch
          design, and I'm currently in the process of redesigning the RSX
          website.
        </p>
      </section>

      
    </div>
    <div
      bind:this={parentContainer}
      class=""
      style="margin-top: {marginTop}px;"
    >
      <pre
        bind:this={container}
        class="font-mono text-[4px] sm:text-[6.5px] leading-[5px] sm:leading-[8px] whitespace-pre select-none overflow-hidden h-[300px] text-text-primary dark:text-text-primary-dark"></pre>
    </div>
  </div>
</main>
