(() => {
  "use strict";

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) {
      return;
    }

    if (message.type === "AI_REWRITE" || message.type === "CALM_REWRITE" || message.type === "AI_TOOLTIP") {
      sendResponse({ error: "AI features are disabled in this build." });
      return true;
    }
  });
})();
