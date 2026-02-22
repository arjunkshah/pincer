# Pincer

Pincer is an accessibility-first Chrome extension that makes the web easier to read for dyslexic, neurodivergent, and disabled people. This repo contains the extension and a minimal landing page.

Highlights include AI rewrite, focus mode, calm mode, reading ruler, dyslexia-friendly fonts, contrast controls, and keyboard-friendly navigation.

## Structure

- `extension/` — Chrome extension source
- `site/` — Landing page (static HTML/CSS) + demo video + downloadable zip
- `assets/` — Source recordings, brand files, and references

## Landing page

Open `site/index.html` or serve the folder locally.

Deploy with Surge:

```
surge site pincer.surge.sh
```

## Netlify proxy (recommended)

Chrome extensions cannot keep API keys secret. Use a Netlify function as a proxy:

1. Create a Netlify site from this repo.
2. Set an environment variable `GROQ_API_KEY` in Netlify.
3. Update `extension/background.js` to point to your Netlify URL:
   `https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/groq-proxy`
4. Rebuild the zip:

```
cd extension
zip -r ../site/pincer-extension.zip .
```

## Extension

Load unpacked:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

Update the downloadable zip:

```
cd extension
zip -r ../site/pincer-extension.zip .
```
