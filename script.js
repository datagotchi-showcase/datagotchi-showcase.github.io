const jsonInput = document.getElementById("jsonInput");
const jsonHighlight = document.getElementById("jsonHighlight");
const jsonStatus = document.getElementById("jsonStatus");
const composeButton = document.getElementById("compose");
const formatButton = document.getElementById("formatJson");
const canvas = document.getElementById("spriteCanvas");
const ctx = canvas.getContext("2d");
const base64Output = document.getElementById("base64Output");
const downloadLink = document.getElementById("downloadPng");
const copyBase64Button = document.getElementById("copyBase64");
const layerCount = document.getElementById("layerCount");
const canvasSize = document.getElementById("canvasSize");
const exportState = document.getElementById("exportState");

const exampleSets = {
  simple: [
    {
      image: "https://via.placeholder.com/420x300/1f4aa8/ffffff.png?text=Background",
      zIndex: 0,
      meta: { xOffset: 0, yOffset: 0, width: 420, height: 300, alpha: 1 },
    },
    {
      image: "https://via.placeholder.com/220x220/35c9c3/00172d.png?text=Character",
      zIndex: 1,
      meta: { xOffset: 100, yOffset: 60, width: 220, height: 220, alpha: 1 },
    },
    {
      image: "https://via.placeholder.com/160x90/f8c146/00172d.png?text=Hat",
      zIndex: 2,
      meta: { xOffset: 145, yOffset: 30, width: 160, height: 90, alpha: 0.9 },
    },
  ],
  complex: [
    {
      image: "https://via.placeholder.com/520x360/243b7a/ffffff.png?text=Sky+Layer",
      zIndex: 0,
      meta: { xOffset: 0, yOffset: 0, width: 520, height: 360, alpha: 1 },
    },
    {
      image: "https://via.placeholder.com/520x200/2f7bff/ffffff.png?text=Mountains",
      zIndex: 1,
      meta: { xOffset: 0, yOffset: 160, width: 520, height: 200, alpha: 0.95 },
    },
    {
      image: "https://via.placeholder.com/240x240/35c9c3/00172d.png?text=Body",
      zIndex: 2,
      meta: { xOffset: 140, yOffset: 80, width: 240, height: 240, alpha: 1 },
    },
    {
      image: "https://via.placeholder.com/140x90/f6b93b/00172d.png?text=Face",
      zIndex: 3,
      meta: { xOffset: 190, yOffset: 130, width: 140, height: 90, alpha: 1 },
    },
    {
      image: "https://via.placeholder.com/200x120/9b5de5/ffffff.png?text=Accessory",
      zIndex: 4,
      meta: { xOffset: 170, yOffset: 40, width: 200, height: 120, alpha: 0.85 },
    },
    {
      image: "https://via.placeholder.com/520x360/0b1320/ffffff.png?text=FX+Overlay",
      zIndex: 5,
      meta: { xOffset: 0, yOffset: 0, width: 520, height: 360, alpha: 0.35 },
    },
  ],
};

const tokenRegex =
  /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"\s*:)|("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;

const setStatus = (message, isError = false) => {
  jsonStatus.textContent = message;
  jsonStatus.classList.toggle("is-error", isError);
};

const setExportState = (message) => {
  exportState.textContent = message;
};

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const highlightJson = () => {
  const source = escapeHtml(jsonInput.value);
  const highlighted = source.replace(tokenRegex, (match, keyMatch, _u1, _u2, stringMatch, _u3, _u4, boolMatch) => {
    if (keyMatch) {
      return `<span class="token-key">${keyMatch}</span>`;
    }
    if (stringMatch) {
      return `<span class="token-string">${stringMatch}</span>`;
    }
    if (boolMatch) {
      return `<span class="token-boolean">${boolMatch}</span>`;
    }
    return `<span class="token-number">${match}</span>`;
  });

  jsonHighlight.innerHTML = highlighted;
  jsonHighlight.scrollTop = jsonInput.scrollTop;
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${url}`));
    image.src = url;
  });

const normalizeLayer = (layer, image) => {
  const meta = layer.meta || {};
  const width = meta.width ?? image.width;
  const height = meta.height ?? image.height;
  return {
    image,
    zIndex: layer.zIndex ?? 0,
    xOffset: meta.xOffset ?? 0,
    yOffset: meta.yOffset ?? 0,
    width,
    height,
    alpha: meta.alpha ?? 1,
  };
};

const resizeCanvasToFit = (layers) => {
  const maxWidth = Math.max(...layers.map((layer) => layer.xOffset + layer.width));
  const maxHeight = Math.max(...layers.map((layer) => layer.yOffset + layer.height));
  canvas.width = Math.max(1, Math.ceil(maxWidth));
  canvas.height = Math.max(1, Math.ceil(maxHeight));
  canvasSize.textContent = `${canvas.width} x ${canvas.height}`;
};

const composeLayers = async () => {
  setStatus("Loading images...", false);
  setExportState("Loading");
  let layers;
  try {
    layers = JSON.parse(jsonInput.value);
    if (!Array.isArray(layers)) {
      throw new Error("JSON must be an array of layers.");
    }
  } catch (error) {
    setStatus(`Invalid JSON: ${error.message}`, true);
    setExportState("Error");
    return;
  }

  try {
    const images = await Promise.all(layers.map((layer) => loadImage(layer.image)));
    const normalizedLayers = layers.map((layer, index) => normalizeLayer(layer, images[index]));
    const orderedLayers = normalizedLayers.sort((a, b) => a.zIndex - b.zIndex);

    resizeCanvasToFit(orderedLayers);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orderedLayers.forEach((layer) => {
      ctx.globalAlpha = layer.alpha;
      ctx.drawImage(layer.image, layer.xOffset, layer.yOffset, layer.width, layer.height);
    });
    ctx.globalAlpha = 1;

    const dataUrl = canvas.toDataURL("image/png");
    base64Output.value = dataUrl;
    downloadLink.href = dataUrl;
    layerCount.textContent = String(orderedLayers.length);

    setStatus(`Composited ${orderedLayers.length} layers.`, false);
    setExportState("Ready");
  } catch (error) {
    setStatus(error.message, true);
    setExportState("Error");
  }
};

const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(parsed, null, 2);
    highlightJson();
    setStatus("Formatted JSON.", false);
  } catch (error) {
    setStatus(`Cannot format: ${error.message}`, true);
  }
};

const setExample = (key) => {
  jsonInput.value = JSON.stringify(exampleSets[key], null, 2);
  highlightJson();
  composeLayers();
};

const copyBase64 = async () => {
  if (!base64Output.value) {
    setStatus("Compose an image first to copy base64.", true);
    return;
  }
  try {
    await navigator.clipboard.writeText(base64Output.value);
    setStatus("Base64 copied to clipboard.", false);
  } catch (error) {
    setStatus("Copy failed. Your browser may block clipboard access.", true);
  }
};

jsonInput.addEventListener("input", highlightJson);
jsonInput.addEventListener("scroll", () => {
  jsonHighlight.scrollTop = jsonInput.scrollTop;
});

composeButton.addEventListener("click", composeLayers);
formatButton.addEventListener("click", formatJson);
copyBase64Button.addEventListener("click", copyBase64);

document.querySelectorAll("[data-example]").forEach((button) => {
  button.addEventListener("click", () => setExample(button.dataset.example));
});

setExample("simple");
