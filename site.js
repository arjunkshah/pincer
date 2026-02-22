const revealTargets = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealTargets.forEach((el) => revealObserver.observe(el));

const root = document.documentElement;
const statusDot = document.getElementById("status-dot");

const controls = {
  master: document.getElementById("master-toggle"),
  profile: document.getElementById("profile-select"),
  contrast: document.getElementById("contrast"),
  contrastValue: document.getElementById("contrast-value"),
  lineSpacing: document.getElementById("line-spacing"),
  lineSpacingValue: document.getElementById("line-spacing-value"),
  colorPreset: document.getElementById("color-preset"),
  dyslexia: document.getElementById("dyslexia-font"),
  reduceMotion: document.getElementById("reduce-motion"),
  removeClutter: document.getElementById("remove-clutter"),
  calmMode: document.getElementById("calm-mode"),
  highlightActions: document.getElementById("highlight-actions"),
  enlargeTargets: document.getElementById("enlarge-targets"),
  keyboardMode: document.getElementById("keyboard-mode"),
  reset: document.getElementById("reset-all"),
};

const defaultPrefs = {
  active: true,
  profile: "custom",
  contrast: 120,
  lineSpacing: 1.8,
  colorPreset: "default",
  dyslexiaFont: false,
  reduceMotion: true,
  removeClutter: false,
  calmMode: true,
  highlightActions: false,
  enlargeTargets: false,
  keyboardMode: false,
};

const profiles = {
  adhd: {
    contrast: 100,
    lineSpacing: 2,
    colorPreset: "default",
    dyslexiaFont: false,
    reduceMotion: true,
    removeClutter: true,
    calmMode: false,
    highlightActions: true,
    enlargeTargets: false,
    keyboardMode: false,
  },
  dyslexia: {
    contrast: 110,
    lineSpacing: 2.2,
    colorPreset: "paper",
    dyslexiaFont: true,
    reduceMotion: false,
    removeClutter: false,
    calmMode: false,
    highlightActions: false,
    enlargeTargets: false,
    keyboardMode: false,
  },
  autism: {
    contrast: 100,
    lineSpacing: 1.8,
    colorPreset: "cool",
    dyslexiaFont: false,
    reduceMotion: true,
    removeClutter: true,
    calmMode: true,
    highlightActions: false,
    enlargeTargets: false,
    keyboardMode: false,
  },
  low_vision: {
    contrast: 180,
    lineSpacing: 2,
    colorPreset: "default",
    dyslexiaFont: false,
    reduceMotion: false,
    removeClutter: true,
    calmMode: false,
    highlightActions: true,
    enlargeTargets: true,
    keyboardMode: false,
  },
  motor: {
    contrast: 100,
    lineSpacing: 1.6,
    colorPreset: "default",
    dyslexiaFont: false,
    reduceMotion: false,
    removeClutter: false,
    calmMode: false,
    highlightActions: true,
    enlargeTargets: true,
    keyboardMode: true,
  },
  custom: {
    contrast: 120,
    lineSpacing: 1.8,
    colorPreset: "default",
    dyslexiaFont: false,
    reduceMotion: true,
    removeClutter: false,
    calmMode: true,
    highlightActions: false,
    enlargeTargets: false,
    keyboardMode: false,
  },
};

let prefs = { ...defaultPrefs };

function setAttr(name, enabled) {
  if (enabled) {
    root.setAttribute(name, "");
  } else {
    root.removeAttribute(name);
  }
}

function applyPrefs() {
  if (!prefs.active) {
    root.removeAttribute("data-pincer-active");
    root.removeAttribute("data-pincer-dyslexia");
    root.removeAttribute("data-pincer-reduce-motion");
    root.removeAttribute("data-pincer-remove-clutter");
    root.removeAttribute("data-pincer-enlarge-targets");
    root.removeAttribute("data-pincer-keyboard");
    root.removeAttribute("data-pincer-highlight-actions");
    root.removeAttribute("data-pincer-color");
    root.removeAttribute("data-pincer-calm");
    statusDot.classList.remove("active");
    return;
  }

  root.setAttribute("data-pincer-active", "");
  setAttr("data-pincer-dyslexia", prefs.dyslexiaFont);
  setAttr("data-pincer-reduce-motion", prefs.reduceMotion);
  setAttr("data-pincer-remove-clutter", prefs.removeClutter);
  setAttr("data-pincer-enlarge-targets", prefs.enlargeTargets);
  setAttr("data-pincer-keyboard", prefs.keyboardMode);
  setAttr("data-pincer-highlight-actions", prefs.highlightActions);
  setAttr("data-pincer-calm", prefs.calmMode);

  if (prefs.colorPreset && prefs.colorPreset !== "default") {
    root.setAttribute("data-pincer-color", prefs.colorPreset);
  } else {
    root.removeAttribute("data-pincer-color");
  }

  root.style.setProperty("--pincer-contrast", `${prefs.contrast}%`);
  root.style.setProperty("--pincer-line-spacing", prefs.lineSpacing);
  statusDot.classList.add("active");
}

function syncUI() {
  controls.master.checked = prefs.active;
  controls.profile.value = prefs.profile;
  controls.contrast.value = prefs.contrast;
  controls.contrastValue.textContent = `${prefs.contrast}%`;
  controls.lineSpacing.value = prefs.lineSpacing;
  controls.lineSpacingValue.textContent = `${prefs.lineSpacing.toFixed(1)}×`;
  controls.colorPreset.value = prefs.colorPreset;
  controls.dyslexia.checked = prefs.dyslexiaFont;
  controls.reduceMotion.checked = prefs.reduceMotion;
  controls.removeClutter.checked = prefs.removeClutter;
  controls.calmMode.checked = prefs.calmMode;
  controls.highlightActions.checked = prefs.highlightActions;
  controls.enlargeTargets.checked = prefs.enlargeTargets;
  controls.keyboardMode.checked = prefs.keyboardMode;
}

function updatePrefs(next) {
  prefs = { ...prefs, ...next };
  if (next.profile && next.profile !== "custom") {
    const preset = profiles[next.profile];
    if (preset) {
      prefs = { ...prefs, ...preset, profile: next.profile };
    }
  }
  if (next.profile === "custom") {
    prefs.profile = "custom";
  }
  syncUI();
  applyPrefs();
}

controls.master.addEventListener("change", (event) => {
  updatePrefs({ active: event.target.checked });
});

controls.profile.addEventListener("change", (event) => {
  updatePrefs({ profile: event.target.value });
});

controls.contrast.addEventListener("input", (event) => {
  updatePrefs({ contrast: Number(event.target.value), profile: "custom" });
});

controls.lineSpacing.addEventListener("input", (event) => {
  updatePrefs({ lineSpacing: Number(event.target.value), profile: "custom" });
});

controls.colorPreset.addEventListener("change", (event) => {
  updatePrefs({ colorPreset: event.target.value, profile: "custom" });
});

controls.dyslexia.addEventListener("change", (event) => {
  updatePrefs({ dyslexiaFont: event.target.checked, profile: "custom" });
});

controls.reduceMotion.addEventListener("change", (event) => {
  updatePrefs({ reduceMotion: event.target.checked, profile: "custom" });
});

controls.removeClutter.addEventListener("change", (event) => {
  updatePrefs({ removeClutter: event.target.checked, profile: "custom" });
});

controls.calmMode.addEventListener("change", (event) => {
  updatePrefs({ calmMode: event.target.checked, profile: "custom" });
});

controls.highlightActions.addEventListener("change", (event) => {
  updatePrefs({ highlightActions: event.target.checked, profile: "custom" });
});

controls.enlargeTargets.addEventListener("change", (event) => {
  updatePrefs({ enlargeTargets: event.target.checked, profile: "custom" });
});

controls.keyboardMode.addEventListener("change", (event) => {
  updatePrefs({ keyboardMode: event.target.checked, profile: "custom" });
});

controls.reset.addEventListener("click", () => {
  prefs = { ...defaultPrefs };
  syncUI();
  applyPrefs();
});

syncUI();
applyPrefs();
