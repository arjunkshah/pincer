const apiKeyInput = document.getElementById("apiKey");
const termsInput = document.getElementById("terms");
const privacyInput = document.getElementById("privacy");
const saveButton = document.getElementById("save");
const status = document.getElementById("status");

function updateState() {
  const ok = apiKeyInput.value.trim().startsWith("gsk_") && termsInput.checked && privacyInput.checked;
  saveButton.disabled = !ok;
}

async function loadPrefs() {
  return new Promise((resolve) => {
    chrome.storage.local.get("pincerPrefs", (res) => resolve(res.pincerPrefs || {}));
  });
}

async function savePrefs(prefs) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ pincerPrefs: prefs }, resolve);
  });
}

async function init() {
  const prefs = await loadPrefs();
  if (prefs.openaiApiKey) {
    apiKeyInput.value = prefs.openaiApiKey;
  }
  updateState();
}

saveButton.addEventListener("click", async () => {
  const prefs = await loadPrefs();
  prefs.openaiApiKey = apiKeyInput.value.trim();
  await savePrefs(prefs);
  status.textContent = "Saved. You can close this tab.";
});

apiKeyInput.addEventListener("input", updateState);
termsInput.addEventListener("change", updateState);
privacyInput.addEventListener("change", updateState);

init();
