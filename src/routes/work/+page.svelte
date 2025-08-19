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
  onMount(() => {
    console.log("Component mounted");
  });
</script>

<main
  class="font-helvetica_neue flex min-h-screen flex-col justify-center p-[10px] lg:p-[15px] antialiased bg-fill-secondary-dark dark:bg-fill-secondary text-text-primary dark:text-text-primary-dark"
>
  <div
    class="flex flex-grow flex-col px-[20px] xl:px-[65px] pt-[250px] lg:pt-[200px] pb-[65px] w-full rounded-[52px] lg:rounded-2xl bg-fill-secondary dark:bg-fill-secondary-dark"
  >
  
    <div class="flex flex-wrap relative">
      <div class="absolute top-0 right-0 -mt-[230px] lg:mt-[30px] pl-[12px]">
        <Navbar />
      </div>
      <section class="flex flex-col items-center w-full gap-[18px]">
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
        <!-- work Card -->
        <!--
        <div
          class="bg-fill-primary dark:bg-fill-primary-dark border-[1px] border-stroke dark:border-stroke-dark rounded-[16px] p-[25px] text-text-primary dark:text-text-primary-dark max-w-[680px] w-full"
      > -->
          <!-- Title and Date -->
          <!--
          <h2 class="text-[40px] font-medium -tracking-[1.6px] -mb-[5px]">
            work Title
          </h2>
          <p
            class="text-text-secondary dark:text-text-secondary-dark -tracking-[0.8px] text-[20px] mt-0 mb-[10px]"
          >
            September 2024 - September 2025
          </p>
      -->
          <!-- Two Column Layout -->
          <!--
          <div class=""> --> <!-- grid grid-rows-2 grid-cols-2 gap-[18px]-->
            <!-- Left Column -->
            <!-- <div>
              <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                Description
              </h3>
              <p
                class="text-text-primary dark:text-text-primary-dark -tracking-[0.6px] text-[20px] leading-tight"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
                massa mi. Aliquam in hendrerit urna.
              </p> -->

              <!-- Attachments -->

              <!-- 
              <div class="">
                <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                  Attachments
                </h3>
                <div class="flex flex-row gap-[15px]"> 
                -->
                  <!-- gap-3 default-->
                   <!--
                  <button
                    class="bg-fill-secondary dark:bg-fill-secondary-dark border-[1px] rounded-[5px] flex items-center border-stroke dark:border-stroke-dark justify-center basis-full gap-[4px]"
                  >
                    <img
                      src={richtext_light}
                      alt="richtext"
                      class="block dark:hidden"
                    />
                    <img
                      src={richtext_dark}
                      alt="richtext"
                      class="hidden dark:block"
                    />
                    <span
                      class="text-[18px] font-normal -tracking-[0.72px] text-text-secondary dark:text-text-secondary-dark"
                      >Blogpost</span
                    >
                  </button>

                  <button
                    class="bg-fill-secondary dark:bg-fill-secondary-dark border-[1px] rounded-[5px] flex items-center border-stroke dark:border-stroke-dark justify-center basis-full gap-[4px]"
                  >
                    <img
                      src={photo_on_rectangle_angled_light}
                      alt="photo_on_rectangle_angled"
                      class="block dark:hidden"
                    />
                    <img
                      src={photo_on_rectangle_angled_dark}
                      alt="photo_on_rectangle_angled"
                      class="hidden dark:block"
                    />
                    <span
                      class="text-[18px] font-normal -tracking-[0.72px] text-text-secondary dark:text-text-secondary-dark"
                      >Images</span
                    >
                  </button>

                  <button
                    class="bg-fill-secondary dark:bg-fill-secondary-dark border-[1px] rounded-[5px] flex items-center border-stroke dark:border-stroke-dark justify-center basis-full gap-[4px]"
                  >
                    <img
                      src={link_light}
                      alt="link"
                      class="block dark:hidden"
                    />
                    <img src={link_dark} alt="link" class="hidden dark:block" />
                    <span
                      class="text-[18px] font-normal -tracking-[0.72px] text-text-secondary dark:text-text-secondary-dark"
                      >Link</span
                    >
                  </button>
                </div>
              </div>

            -->
            <!-- </div> -->

            <!-- Right Column -->


            <!-- <div class=""> -->
              <!-- space-y-6 -->
              <!-- What I Brought -->
              <!-- <div> 
                <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                  What I Brought
                </h3>
                <ul
                  class="list-disc list-inside pl-[10px] text-text-primary dark:text-text-primary-dark -tracking-[0.6px] text-[20px] leading-tight"
                >
                  <li>Lorem ipsum dolor sit amet</li>
                  <li>Consectetur adipiscing elit Ut et massa mi.</li>
                  <li>
                    Aliquam in hendrerit urna. Pellentesque sit amet sapien.
                  </li>
                </ul>
              </div> -->

              <!-- What I Got -->
              <!-- 
              <div>
                <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                  What I Got
                </h3>
                <ul
                  class="list-disc list-inside pl-[10px] text-text-primary dark:text-text-primary-dark -tracking-[0.6px] text-[20px] leading-tight"
                >
                  <li>Lorem ipsum dolor sit amet</li>
                  <li>Consectetur adipiscing elit Ut et massa mi.</li>
                  <li>
                    Aliquam in hendrerit urna. Pellentesque sit amet sapien.
                  </li>
                </ul>
              </div>
            </div> -->

            <!-- 
          </div>
        </div> -->

        <div
          class="bg-fill-primary dark:bg-fill-primary-dark border-[1px] border-stroke dark:border-stroke-dark rounded-[16px] p-[25px] text-text-primary dark:text-text-primary-dark max-w-[680px] w-full"
        >
          <!-- Title and Date -->
          <h2 class="text-[40px] font-medium -tracking-[1.6px] leading-[45px]">
            UofT Robotics for Space Exploration, Aerial (CANSAT) Subteam
          </h2>
          <p
            class="text-text-secondary dark:text-text-secondary-dark -tracking-[0.8px] text-[20px] mt-0 mb-[10px]"
          >
            September 2024 - Now
          </p>

          <div class=""> <!-- grid grid-rows-2 grid-cols-2 gap-[18px]-->
            <div>
              <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                Description
              </h3>
              <ul
                class="text-text-primary dark:text-text-primary-dark -tracking-[0.6px] text-[20px] leading-tight list-disc list-outside pl-[16px] space-y-[10px]"
              >
                <li>Developed on-board camera system to record high quality redundant video during launch and
                  parachute deployment in a heavily power- and performance-constrained environment.</li>
                <li>Was solely responsible for parachute selection, involving CAD modeling and CFD simulations
                  of various parachute sizes and shapes to select one that would slow the CANSAT down to the
                  precise speed required by the mission parameters</li>
                <li>
                  Solely designed and built QHA ground station antenna and worked with team members to
optimize the design using Ansys HFSS simulations.
                </li>
                <li>
                  Secured a software license sponsorship equivalent to $50,000 in value
                </li>
                <li>
                  Designed subteam mission patch and am in the process of redesigning the website and logo
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          class="bg-fill-primary dark:bg-fill-primary-dark border-[1px] border-stroke dark:border-stroke-dark rounded-[16px] p-[25px] text-text-primary dark:text-text-primary-dark max-w-[680px] w-full"
        >
          <!-- Title and Date -->
          <h2 class="text-[40px] font-medium -tracking-[1.6px] leading-[45px]">
            UofT Students in Data Science and Statistics Datathon
          </h2>
          <p
            class="text-text-secondary dark:text-text-secondary-dark -tracking-[0.8px] text-[20px] mt-0 mb-[10px]"
          >
            March 2025
          </p>

          <div class=""> <!-- grid grid-rows-2 grid-cols-2 gap-[18px]-->
            <div>
              <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                Description
              </h3>
              <p
                class="text-text-primary dark:text-text-primary-dark -tracking-[0.6px] text-[20px] leading-tight"
              >
              Led a team and developed a MVP web app to forecast the probability and predicted length
              of TTC subway delays.
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-fill-primary dark:bg-fill-primary-dark border-[1px] border-stroke dark:border-stroke-dark rounded-[16px] p-[25px] text-text-primary dark:text-text-primary-dark max-w-[680px] w-full"
        >
          <!-- Title and Date -->
          <h2 class="text-[40px] font-medium -tracking-[1.6px] leading-[45px]">
            STA130 Statistics Research Project
          </h2>
          <p
            class="text-text-secondary dark:text-text-secondary-dark -tracking-[0.8px] text-[20px] mt-0 mb-[10px]"
          >
            December 2024
          </p>

          <div class=""> <!-- grid grid-rows-2 grid-cols-2 gap-[18px]-->
            <div>
              <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                Description
              </h3>
              <p
                class="text-text-primary dark:text-text-primary-dark -tracking-[0.6px] text-[20px] leading-tight"
              >
              Developed a OLS regression model and used p-value analysis to determine if playing online
video games during periods of social isolation have a positive correlation with mental health
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-fill-primary dark:bg-fill-primary-dark border-[1px] border-stroke dark:border-stroke-dark rounded-[16px] p-[25px] text-text-primary dark:text-text-primary-dark max-w-[680px] w-full"
        >
          <!-- Title and Date -->
          <h2 class="text-[40px] font-medium -tracking-[1.6px] leading-[45px]">
            Harmonic Music Match
          </h2>
          <p
            class="text-text-secondary dark:text-text-secondary-dark -tracking-[0.8px] text-[20px] mt-0 mb-[10px]"
          >
            September 2023 - 2024
          </p>

          <div class=""> <!-- grid grid-rows-2 grid-cols-2 gap-[18px]-->
            <div>
              <h3 class="font-medium text-[22px] -tracking-[0.88px] mb-[2px]">
                Description
              </h3>
              <ul
                class="text-text-primary dark:text-text-primary-dark -tracking-[0.6px] text-[20px] leading-tight list-disc list-outside pl-[16px] space-y-[10px]"
              >
                <li>Solely developed and designed a web app that would match registered Spotify users based
                  on the similarity of their listening activity</li>
                <li>Developed using HTML/CSS/JS with Node.js, Express, and jQuery. Used MySQL for user info
                  and a vector database (Milvus) to store songs as embeddings in latent space. Hosted on an
                  AWS EC2 machine with nginx.</li>
              </ul>
            </div>
          </div>
        </div>

      </section>

      <!-- <div class="absolute top-0 xl:right-0">
        <Navbar />
      </div> -->
    </div>
  </div>
</main>
