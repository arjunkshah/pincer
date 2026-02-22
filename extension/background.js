const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const MODEL = "llama-3.1-8b-instant";
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function buildSystemPrompt(mode) {
  const modes = {
    plain: "Write in plain language. Use common words. Keep sentences short.",
    grade5: "Write at a 5th grade reading level. Use simple vocabulary. Avoid complex sentence structures.",
    bullets: "Focus on the bullet_version field. Break all information into clear, short bullet points.",
    steps: "Focus on the step_version field. Convert all instructions into numbered steps.",
    literal: "Write in literal_version. Avoid all metaphors, idioms, and figurative language. Be completely literal and direct.",
    actions: "Focus on actions_detected. List only the specific actions the user needs to take. Ignore background information."
  };

  return `You are Pincer, an AI accessibility assistant. Your job is to rewrite web page text to be more accessible.

Rules:
- Use short sentences (max 15 words each).
- Avoid jargon, technical terms, and idioms.
- Preserve all factual meaning — never invent new facts.
- Tone must be neutral, calm, and supportive.
- Return ONLY a JSON object with the following keys:
  {
    "simplified_text": "...",
    "bullet_version": ["...", "..."],
    "step_version": ["Step 1: ...", "Step 2: ..."],
    "literal_version": "...",
    "actions_detected": ["...", "..."],
    "deadlines_detected": ["..."]
  }

Mode: ${modes[mode] || modes.plain}`;
}

function splitText(text, limit) {
  if (text.length <= limit) return [text];
  const chunks = [];
  let idx = 0;
  while (idx < text.length) {
    let end = idx + limit;
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      if (lastPeriod > idx + 1500) end = lastPeriod + 1;
    }
    chunks.push(text.slice(idx, end).trim());
    idx = end;
  }
  return chunks;
}

function mergeChunks(results) {
  if (results.length === 1) return results[0];
  return {
    simplified_text: results.map((r) => r.simplified_text || "").join("\n\n"),
    bullet_version: results.flatMap((r) => r.bullet_version || []),
    step_version: results.flatMap((r) => r.step_version || []),
    literal_version: results.map((r) => r.literal_version || "").join("\n\n"),
    actions_detected: results.flatMap((r) => r.actions_detected || []),
    deadlines_detected: results.flatMap((r) => r.deadlines_detected || [])
  };
}

async function getApiKey(prefs) {
  if (prefs && prefs.openaiApiKey) return prefs.openaiApiKey;
  return new Promise((resolve) => {
    chrome.storage.local.get("pincerPrefs", (res) => {
      resolve(res.pincerPrefs?.openaiApiKey || "");
    });
  });
}

async function callGroq(text, mode, apiKey) {
  const systemPrompt = buildSystemPrompt(mode);
  const userPrompt = `Rewrite the following web page text according to your instructions. Return ONLY valid JSON.\n\nTEXT:\n${text}`;

  const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error ${response.status}: ${text}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    return { simplified_text: content };
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "AI_REWRITE") {
    (async () => {
      try {
        const apiKey = await getApiKey(message.prefs);
        if (!apiKey) {
          sendResponse({ error: "No API key configured." });
          return;
        }

        const cacheKey = `${message.text.slice(0, 80)}::${message.mode}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
          sendResponse({ data: cached.data });
          return;
        }

        const chunks = splitText(message.text, 3000);
        const results = [];
        for (const chunk of chunks) {
          const data = await callGroq(chunk, message.mode, apiKey);
          results.push(data);
        }

        const merged = mergeChunks(results);
        cache.set(cacheKey, { data: merged, ts: Date.now() });
        sendResponse({ data: merged });
      } catch (error) {
        console.error("[Pincer] AI rewrite error:", error);
        sendResponse({ error: error.message });
      }
    })();
    return true;
  }

  if (message.type === "CALM_REWRITE") {
    (async () => {
      try {
        if (!message.texts || message.texts.length === 0) {
          sendResponse({ replacements: [] });
          return;
        }

        const apiKey = await getApiKey(message.prefs);
        if (!apiKey) {
          sendResponse({ replacements: [] });
          return;
        }

        const systemPrompt = "You are Pincer Calm Mode. Your job is to rewrite anxiety-inducing, aggressive, or urgent-sounding text into calm, neutral language.\n\nRules:\n- Keep the same factual meaning.\n- Remove urgency, threats, and aggressive tone.\n- Use simple, reassuring language.\n- Return ONLY a JSON object: { \"replacements\": [{ \"original\": \"...\", \"calm\": \"...\" }, ...] }";
        const userPrompt = `Rewrite these alert/notice texts to be calm and neutral:\n${JSON.stringify(message.texts)}`;

        const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          sendResponse({ replacements: [] });
          return;
        }

        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || "{}";
        const data = JSON.parse(content);
        sendResponse({ replacements: data.replacements || [] });
      } catch (error) {
        console.error("[Pincer] Calm rewrite error:", error);
        sendResponse({ replacements: [] });
      }
    })();
    return true;
  }

  if (message.type === "AI_TOOLTIP") {
    (async () => {
      try {
        const apiKey = await getApiKey(message.prefs);
        if (!apiKey) {
          sendResponse({ text: null });
          return;
        }

        const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              {
                role: "system",
                content: "Describe what this HTML element does in one short, plain sentence. Be literal. Max 15 words."
              },
              { role: "user", content: message.elementHtml }
            ],
            temperature: 0.2,
            max_tokens: 60
          })
        });

        const json = await response.json();
        sendResponse({ text: json.choices?.[0]?.message?.content?.trim() || null });
      } catch {
        sendResponse({ text: null });
      }
    })();
    return true;
  }

  return false;
});
