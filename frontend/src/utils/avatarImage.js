const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_INPUT_BYTES = 5 * 1024 * 1024;

export function fileToAvatarDataUrl(file, maxSize = 256) {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return Promise.reject(new Error("unsupported_type"));
  }

  if (file.size > MAX_INPUT_BYTES) {
    return Promise.reject(new Error("too_large"));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas_unavailable"));
          return;
        }

        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("invalid_image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}
