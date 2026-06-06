const links = document.querySelectorAll('.top-nav a[href^="#"], .button[href^="#"]');

links.forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".top-nav a").forEach((item) => item.removeAttribute("aria-current"));
    if (link.classList.contains("disabled")) return;
    const navMatch = document.querySelector(`.top-nav a[href="${link.getAttribute("href")}"]`);
    if (navMatch) navMatch.setAttribute("aria-current", "page");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = document.querySelector(`.top-nav a[href="#${entry.target.id}"]`);
      document.querySelectorAll(".top-nav a").forEach((item) => item.removeAttribute("aria-current"));
      if (active) active.setAttribute("aria-current", "page");
    });
  },
  { rootMargin: "-36% 0px -58% 0px" }
);

document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));

const caseData = [
  {
    kicker: "Successful imagination",
    title: "Imagination provides missing viewpoint evidence",
    copy:
      "The original views leave the spatial relation uncertain. Astra invokes the world simulator with a targeted camera motion, then uses the returned view to confirm the answer.",
    figure: "assets/paper-fig-p17-1.png",
    observations: ["assets/cases/case1_obs1.png", "assets/cases/case1_obs2.png"],
    imagined: "assets/cases/case1_imagined.png",
    alts: ["Case 1 observation 1", "Case 1 observation 2", "Case 1 imagined simulator view"],
    tool: "world_simulator_tool(reference_image=1, motion_type=dy, value=1.5)",
    beforeTool: [
      "Response: <think> I need to determine the spatial relationship between Image-1 and Image-2 - specifically, from the viewpoint of Image-1, where Image-2 is captured. Image-1 shows the back/side of a beige sofa, with the camera positioned low and behind it, looking toward the room's far wall (which includes a tiled fireplace or hearth area). Image-2 shows the same sofa from a higher, more frontal angle - revealing its seat cushion and armrest, along with surrounding furniture such as a bookshelf and tripod stand.",
      "This implies that Image-2 is taken from the front of the sofa, relative to the perspective in Image-1. But is this unambiguous?",
      "The key ambiguity: Is Image-2 actually \"in front\" of Image-1 (i.e., directly facing the sofa) - or could it be rotated around the sofa in some other way (e.g., the photo was repositioned to show the sofa \"head-on\" despite being originally captured from a side/back angle)?",
      "To resolve whether \"front\" is truly the correct answer - or if it is misleading due to camera rotation - I should simulate a novel view from the camera position of Image-1 and compute what Image-2 would look like under the exact same viewpoint. This will confirm if Image-2 corresponds to a front-facing shot from Image-1.",
      "Therefore, I call `world_simulator_tool` with Image-1 as reference, applying a forward motion to generate a simulated view from behind the sofa. If the output matches Image-2 (i.e., reveals the same angle and objects), then Image-2 is indeed taken from the front - but if not, we'll know for sure. </think> <action> Based on the viewpoint of the image 1, Move forward by 1.5 meters parallel to the ground. </action>",
    ],
    afterTool:
      "<think> The simulated view from Image-1 (moving forward by 1.5 meters) perfectly matches Image-2 - it reveals the same camera angle, the sofa's front cushion and armrest, the bookshelf, and tripod stand. This confirms that Image-2 is captured from the front of the sofa relative to Image-1's perspective. </think> <answer>A. front</answer>",
  },
  {
    kicker: "Trajectory analysis",
    title: "Tool actions shape the final answer",
    copy:
      "This case exposes the full reasoning chain: the initial hypothesis, the simulator action, the generated observation, and how the model grounds the final response.",
    figure: "assets/paper-fig-p18-1.png",
    observations: ["assets/cases/case2_obs1.png", "assets/cases/case2_obs2.png"],
    imagined: "assets/cases/case2_imagined.png",
    alts: ["Case 2 observation 1", "Case 2 observation 2", "Case 2 imagined simulator view"],
    tool: "world_simulator_tool(reference_image=2, motion_type=dy, value=1.5)",
    beforeTool: [
      "Response: <think> The question asks how to move from the camera position in Image 2 to that of Image 1 - essentially, what camera motion would transform Image 2 into Image 1.",
      "Observing both images: - Image 1 shows a door on the left, an exit sign, and a shiny trash can near the entrance. - Image 2 shows a row of washing machines on the right, with a countertop on the left and a green bucket in the background. The floor drain is centered in both views.",
      "Spatially, Image 1 is taken from a viewpoint closer to the door, looking inward toward the space. Image 2 appears to be taken from a position further down the room, looking more toward the back wall (where the machines line up).",
      "To go from Image 2 -> Image 1, the camera must move forward (toward the door) - i.e., closer to the front of the room. This corresponds to moving \"front\" in the options - meaning, toward the viewer's face if they were standing at the camera's position in Image 2.",
      "However, since this is a spatial reasoning problem and involves viewing directions between two static images, it's safer to simulate the scene to verify.",
      "Let me use `world_simulator_tool` to generate a view from Image 2 as if moving forward to confirm whether it matches Image 1. </think> <action> Based on the viewpoint of the image 2, Move forward by 1.5 meters parallel to the ground. </action>",
    ],
    afterTool:
      "<think> The simulated view confirms: moving forward from the Image 2 perspective brings the camera into alignment with Image 1 - the shiny trash can, door, and exit sign come into frame, and the washing machines recede into the background. This means to reach the camera position of Image 1 from Image 2, you must move forward. </think> <answer>A. front</answer>",
  },
];

const caseViewer = document.querySelector("[data-case-viewer]");

if (caseViewer) {
  const tabs = caseViewer.querySelectorAll("[data-case-index]");
  const kicker = caseViewer.querySelector("[data-case-kicker]");
  const title = caseViewer.querySelector("[data-case-title]");
  const copy = caseViewer.querySelector("[data-case-copy]");
  const observationOne = caseViewer.querySelector("[data-case-observation-one]");
  const observationTwo = caseViewer.querySelector("[data-case-observation-two]");
  const transcript = caseViewer.querySelector("[data-case-transcript]");
  const link = caseViewer.querySelector("[data-case-link]");

  const appendTextBlock = (parent, text) => {
    const block = document.createElement("p");
    block.className = "cot-block";
    block.textContent = text;
    parent.appendChild(block);
  };

  const setCase = (index) => {
    const next = caseData[index];
    if (!next) return;

    tabs.forEach((tab) => {
      const isActive = Number(tab.dataset.caseIndex) === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    kicker.textContent = next.kicker;
    title.textContent = next.title;
    copy.textContent = next.copy;
    observationOne.src = next.observations[0];
    observationOne.alt = next.alts[0];
    observationTwo.src = next.observations[1];
    observationTwo.alt = next.alts[1];
    transcript.replaceChildren();
    next.beforeTool.forEach((step) => appendTextBlock(transcript, step));

    const toolCall = document.createElement("div");
    toolCall.className = "tool-call";
    toolCall.textContent = next.tool;
    transcript.appendChild(toolCall);

    const generatedFigure = document.createElement("figure");
    generatedFigure.className = "inline-generated-view";
    const generatedLabel = document.createElement("span");
    generatedLabel.textContent = "Generated observation from world simulator";
    const generatedImage = document.createElement("img");
    generatedImage.src = next.imagined;
    generatedImage.alt = next.alts[2];
    generatedFigure.append(generatedLabel, generatedImage);
    transcript.appendChild(generatedFigure);

    appendTextBlock(transcript, next.afterTool);
    if (link) link.href = next.figure;
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setCase(Number(tab.dataset.caseIndex)));
  });

  setCase(0);
}
