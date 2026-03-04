# Datagotchi-Style Sprite Compositor

This project is a production-ready, single-page static site that demonstrates sprite-based graphics composition on an HTML canvas. It accepts a JSON array of sprite layers, loads images asynchronously, composites them by z-index, and exports a base64 PNG or downloadable file.

## Features

- JSON-driven sprite layers with per-layer offsets, sizes, and alpha blending
- Asynchronous image loading and z-index ordering
- Canvas rendering with transparency support
- Base64 export and one-click PNG download
- Responsive split-screen layout with syntax-highlighted JSON editor

## How to Use

1. Open `index.html` in your browser (or deploy via GitHub Pages).
2. Paste or edit the JSON array in the left panel.
3. Click **Compose** to render the sprite stack.
4. Use **Download PNG** or **Copy Base64** for export.

### Layer Schema

```json
[
  {
    "image": "https://example.com/layer.png",
    "zIndex": 0,
    "meta": {
      "xOffset": 0,
      "yOffset": 0,
      "width": 100,
      "height": 100,
      "alpha": 1
    }
  }
]
```

## Development

This is a static site with no build step. Edit the files directly:

- `index.html`
- `style.css`
- `script.js`

## GitHub Pages Deployment

1. Commit the files to your repository.
2. In GitHub, go to **Settings → Pages**.
3. Set the branch to `main` (or `master`) and the root folder.
4. Save and open the provided Pages URL.

## Notes

- The example sprites use `via.placeholder.com` for easy image hosting.
- Cross-origin loading is enabled in `script.js` using `crossOrigin = "anonymous"`.
