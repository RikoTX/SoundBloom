const MAX_AUDIO_BYTES = 20 * 1024 * 1024;
const MAX_COVER_BYTES = 15 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

export function detectAudioFormat(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp3") || file.type === "audio/mpeg") return "mp3";
  if (name.endsWith(".wav") || file.type === "audio/wav") return "wav";
  if (name.endsWith(".flac") || file.type === "audio/flac") return "flac";
  return null;
}

export async function readAudioFile(file) {
  const format = detectAudioFormat(file);
  if (!format) {
    throw new Error("unsupported_audio");
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error("audio_too_large");
  }
  const dataUrl = await readFileAsDataUrl(file);
  return { dataUrl, format, size: file.size, name: file.name };
}

export async function readCoverFile(file) {
  const ok =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/gif";
  if (!ok) {
    throw new Error("unsupported_cover");
  }
  if (file.size > MAX_COVER_BYTES) {
    throw new Error("cover_too_large");
  }
  return readFileAsDataUrl(file);
}
