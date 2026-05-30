import { useTranslation } from "react-i18next";
import useNavigateWithScroll from "../../hooks/useNavigateWithScroll";
import GridCircleShowAll from "../../components/GridCircleShowAll/GridCircleShowAll";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import useArtistsState from "../../state/artistsState";
import useArtistsList from "../../hooks/useArtistsList";

const LEGEND_ARTIST_NAMES = [
  "Michael Jackson",
  "Madonna",
  "Prince",
  "Whitney Houston",
  "Queen",
  "ABBA",
  "The Beatles",
  "Elvis Presley",
  "Bob Marley",
  "David Bowie",
  "Pink Floyd",
  "AC/DC",
];

const HIT_ARTIST_NAMES = [
  "Eminem",
  "Adele",
  "Taylor Swift",
  "Drake",
  "Billie Eilish",
  "The Weeknd",
  "Ed Sheeran",
  "Beyoncé",
  "Imagine Dragons",
  "Coldplay",
  "Bruno Mars",
  "Rihanna",
];

export default function Artists({ setSelectedArtists }) {
  const { t } = useTranslation();
  const navigateWithScroll = useNavigateWithScroll();
  const { showPopularAll, setShowPopularAll } = useArtistsState();

  const { artists: legends, loading: legendsLoading } =
    useArtistsList(LEGEND_ARTIST_NAMES);
  const { artists: hits, loading: hitsLoading } =
    useArtistsList(HIT_ARTIST_NAMES);

  const openArtists = (artist) => {
    const name = artist.name || artist.artist;
    setSelectedArtists?.(artist);
    navigateWithScroll(`/PageArtists/${encodeURIComponent(name)}`, {
      state: { from: "artist" },
    });
  };

  return (
    <div>
      <section id="legends-artists">
        <GridCircleShowAll
          title={t("artists.legends.main")}
          pinkTitle={t("artists.legends.accent")}
          artists={legends}
          onClickArtists={openArtists}
          loading={legendsLoading}
          skeletonCount={12}
        />
      </section>

      <section id="hit-artists">
        <SongGridCircle
          title={t("artists.hitArtists.main")}
          pinkTitle={t("artists.hitArtists.accent")}
          items={hits}
          showAll={showPopularAll}
          setShowAll={setShowPopularAll}
          onClickItem={openArtists}
          loading={hitsLoading}
          skeletonCount={12}
        />
      </section>
    </div>
  );
}
