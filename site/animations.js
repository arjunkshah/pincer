(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const typeTarget = document.querySelector("[data-typewriter]");
  if (typeTarget && !prefersReduced) {
    const fullText = typeTarget.getAttribute("data-typewriter") || "";
    typeTarget.textContent = "";
    let index = 0;
    const speed = 36;

    const tick = () => {
      index += 1;
      typeTarget.textContent = fullText.slice(0, index);
      if (index < fullText.length) {
        setTimeout(tick, speed);
      } else {
        typeTarget.classList.add("typewriter-done");
      }
    };
    setTimeout(tick, 240);
  }

  const revealTargets = document.querySelectorAll(
    [
      ".section-title",
      ".section-sub",
      ".card",
      ".bento-card",
      ".video-shell",
      ".faq-item",
      ".metric",
      ".logo-chip",
      ".blog-item",
      ".blog-feature",
      ".price-card",
      ".person",
      ".timeline-item",
      ".form",
      ".input",
      ".textarea"
    ].join(",")
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealTargets.forEach((el) => observer.observe(el));
})();
