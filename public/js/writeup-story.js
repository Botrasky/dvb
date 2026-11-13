(() => {
  const article = document.querySelector("[data-writeup-story]");
  const hero = document.querySelector("[data-story-hero]");
  if (!(article instanceof HTMLElement)) return;

  hero?.querySelectorAll("[data-story-enter]").forEach((item, index) => {
    item.style.setProperty("--story-order", String(index));
  });
  requestAnimationFrame(() => hero?.setAttribute("data-story-ready", ""));

  const source = [...article.children];
  const groups = [];
  const preamble = [];
  let group;

  for (const node of source) {
    if (node.tagName === "H1") continue;
    if (node.tagName === "H2") {
      if (group?.nodes.length) groups.push(group);
      group = {
        title: node.textContent?.trim() || "Section",
        nodes: [node, ...preamble.splice(0)],
      };
    } else if (group) {
      group.nodes.push(node);
    } else {
      preamble.push(node);
    }
  }
  if (group?.nodes.length) groups.push(group);
  if (!groups.length && preamble.length) {
    groups.push({ title: "Report", nodes: preamble });
  }
  if (groups.length < 2) return;

  const deck = document.createElement("div");
  deck.className = "writeup-dashboard-grid";
  deck.setAttribute("role", "region");
  deck.setAttribute("aria-label", "Amaterasu report dashboard");

  const slides = groups.map((item, index) => {
    const slide = document.createElement("section");
    slide.className = "writeup-dashboard-card";
    slide.dataset.slide = String(index);
    slide.style.setProperty("--story-order", String(index));
    slide.dataset.section = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    slide.setAttribute("aria-labelledby", `writeup-section-${index}`);
    item.nodes.forEach((node, order) => {
      node.style.setProperty("--story-order", String(order));
      if (node.tagName === "OL") {
        [...node.children].forEach((step, stepIndex) => {
          step.style.setProperty("--story-order", String(stepIndex + 1));
        });
      }
      slide.append(node);
    });
    const heading = slide.querySelector("h2");
    heading?.setAttribute("id", `writeup-section-${index}`);
    deck.append(slide);
    return slide;
  });
  article.replaceChildren(deck);
  article.dataset.storyEnhanced = "";
})();
