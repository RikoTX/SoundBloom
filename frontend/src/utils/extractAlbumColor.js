const colorCache = new Map();
const inflight = new Map();

const DEFAULT_COLOR = { r: 30, g: 30, b: 38 };

function quantize(value) {
  return value >> 4 << 4;
}

function pickDominantColor(data) {
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 200) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 35) continue;
    if (min > 235) continue;

    const qr = quantize(r);
    const qg = quantize(g);
    const qb = quantize(b);
    const key = `${qr},${qg},${qb}`;
    const saturation = (max - min) / Math.max(max, 1);
    const weight = 1 + saturation * 2;
    buckets.set(key, (buckets.get(key) || 0) + weight);
  }
  if (buckets.size === 0) return null;
  let bestKey = null;
  let bestCount = -1;
  for (const [k, v] of buckets) {
    if (v > bestCount) {
      bestCount = v;
      bestKey = k;
    }
  }
  const [r, g, b] = bestKey.split(",").map(Number);
  return { r, g, b };
}

function darken(color, factor = 0.4) {
  return {
    r: Math.round(color.r * factor),
    g: Math.round(color.g * factor),
    b: Math.round(color.b * factor),
  };
}

function rgb({ r, g, b }, a = 1) {
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}

function buildGradient(color) {
  const mid = darken(color, 0.55);
  const deep = darken(color, 0.18);
  return {
    base: rgb(color),
    gradient: `linear-gradient(135deg, ${rgb(color)} 0%, ${rgb(
      mid
    )} 55%, ${rgb(deep)} 100%)`,
    soft: `linear-gradient(180deg, ${rgb(color, 0.85)} 0%, ${rgb(
      darken(color, 0.25),
      0.95
    )} 100%)`,
  };
}

export function extractAlbumGradient(imageUrl) {
  if (!imageUrl) return Promise.resolve(buildGradient(DEFAULT_COLOR));
  if (colorCache.has(imageUrl)) {
    return Promise.resolve(colorCache.get(imageUrl));
  }
  if (inflight.has(imageUrl)) return inflight.get(imageUrl);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const finish = (result) => {
      colorCache.set(imageUrl, result);
      inflight.delete(imageUrl);
      resolve(result);
    };

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const color = pickDominantColor(data) || DEFAULT_COLOR;
        finish(buildGradient(color));
      } catch (_) {
        finish(buildGradient(DEFAULT_COLOR));
      }
    };
    img.onerror = () => finish(buildGradient(DEFAULT_COLOR));
    img.src = imageUrl;
  });

  inflight.set(imageUrl, promise);
  return promise;
}
