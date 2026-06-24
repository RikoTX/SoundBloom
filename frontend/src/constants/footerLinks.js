export const FOOTER_MELODIES = [
  {
    id: "popular-songs",
    labelKey: "footer.popularSongs",
    path: "/Popular",
    hash: "popular-songs",
  },
  {
    id: "trending-songs",
    labelKey: "footer.trendingSongs",
    path: "/Home",
    hash: "trending-songs",
  },
  {
    id: "new-releases",
    labelKey: "footer.newReleases",
    path: "/Home",
    hash: "new-release-songs",
  },
  {
    id: "music-videos",
    labelKey: "footer.musicVideos",
    path: "/Home",
    hash: "music-videos",
  },
  {
    id: "mood-playlists",
    labelKey: "footer.moodPlaylists",
    path: "/Home",
    hash: "mood-playlists",
  },
];

export const FOOTER_ACCESS = [
  {
    id: "explore",
    labelKey: "footer.explore",
    path: "/Home",
    hash: "music-genres",
  },
  {
    id: "artists",
    labelKey: "footer.artists",
    path: "/Artist",
    hash: "hit-artists",
  },
  {
    id: "albums",
    labelKey: "footer.albums",
    path: "/Popular",
    hash: "popular-albums",
  },
  {
    id: "genres",
    labelKey: "footer.genres",
    path: "/Home",
    hash: "music-genres",
  },
  {
    id: "playlists",
    labelKey: "footer.playlists",
    path: "/Home",
    hash: "mood-playlists",
  },
];

export const FOOTER_CONTACT_GUEST = [
  { id: "login", labelKey: "common.login", path: "/login" },
  { id: "sign-up", labelKey: "common.signUp", path: "/register" },
  { id: "support", labelKey: "footer.support", path: "/Home", hash: "sign-in" },
  {
    id: "social-media",
    labelKey: "footer.socialMedia",
    path: null,
    hash: "footer-social",
  },
];

export const FOOTER_CONTACT_AUTH = [
  { id: "liked-songs", labelKey: "nav.likedSongs", path: "/LikedSongs" },
  { id: "saved-albums", labelKey: "nav.savedAlbums", path: "/SavedAlbums" },
  { id: "saved-genres", labelKey: "nav.savedGenres", path: "/SavedGenres" },
  {
    id: "saved-playlists",
    labelKey: "nav.savedPlaylists",
    path: "/SavedPlaylists",
  },
  {
    id: "social-media",
    labelKey: "footer.socialMedia",
    path: null,
    hash: "footer-social",
  },
];

export function getFooterSections(isAuth) {
  return [
    {
      id: "melodies",
      titleKey: "footer.melodies",
      items: FOOTER_MELODIES,
    },
    {
      id: "access",
      titleKey: "footer.discover",
      items: FOOTER_ACCESS,
    },
    {
      id: "library",
      titleKey: isAuth ? "footer.myLibrary" : "footer.account",
      items: isAuth ? FOOTER_CONTACT_AUTH : FOOTER_CONTACT_GUEST,
    },
  ];
}
