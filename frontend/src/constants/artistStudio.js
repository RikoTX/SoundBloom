export const PRO_SOCIETIES = [
  "ASCAP",
  "BMI",
  "SESAC",
  "SOCAN",
  "PRS",
  "GEMA",
  "SACEM",
  "APRA AMCOS",
  "JASRAC",
  "None / Not a member",
];

export const MUSIC_GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Electronic",
  "Jazz",
  "Classical",
  "Folk",
  "Country",
  "Metal",
  "Reggae",
  "Blues",
  "Latin",
  "Ambient",
  "World",
];

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Kazakhstan",
  "Russia",
  "Ukraine",
  "Turkey",
  "Japan",
  "Other",
];

export const LYRICS_LANGUAGES = [
  "English",
  "Russian",
  "Kazakh",
  "Spanish",
  "French",
  "German",
  "Instrumental",
  "Other",
];

export const TRACK_GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Folk",
  "R&B",
  "Metal",
  "Ambient",
];

export const TRACK_MOODS = [
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Dark",
  "Romantic",
  "Epic",
  "Chill",
];

export const TRACK_INSTRUMENTS = [
  "Guitar",
  "Piano",
  "Drums",
  "Synth",
  "Bass",
  "Violin",
  "Saxophone",
];

export const TEMPO_OPTIONS = ["Slow", "Medium", "Fast", "Variable"];
export const ENERGY_OPTIONS = ["Low", "Medium", "High"];
export const MOOD_OPTIONS = ["Happy", "Melancholic", "Aggressive", "Dreamy", "Uplifting"];

export const CAREER_YEARS = Array.from(
  { length: new Date().getFullYear() - 1949 },
  (_, i) => new Date().getFullYear() - i,
);

export const TRACK_STATUS_LABELS = {
  pending: "artist.tracks.statusPending",
  approved: "artist.tracks.statusApproved",
  rejected: "artist.tracks.statusRejected",
};

export const AUDIO_ACCEPT = "audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac";
export const COVER_ACCEPT = "image/jpeg,image/png,image/gif";
