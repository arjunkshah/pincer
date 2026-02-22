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
