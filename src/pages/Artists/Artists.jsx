import musicData from "../../data/music.json";
import { useNavigate } from "react-router-dom";
import GridCircleShowAll from "../../components/GridCircleShowAll/GridCircleShowAll";
import { useState } from "react";
import TableArtists from "../../components/TableArtists/TableArtists";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
export default function Artists({ setSelectedArtists }) {
  const navigate = useNavigate();
  const openArtists = (artist) => {
    setSelectedArtists(artist);
    navigate("/PageArtists");
  };
  const [showPopularTableAll, setShowPopularTableAll] = useState(false);
  const [showPopularAll, setShowPopularAll] = useState(false);
  return (
    <div>
      {/* КРУГЛЫЕ КАРТОЧКИ ПОПУЛЯРНЫХ АРТИСТОВ */}
      <GridCircleShowAll
        title="Legends of the"
        pinkTitle="80s - 90s"
        artists={musicData.LegendsArtists}
        onClickArtists={openArtists}
        setSelectedArtists={setSelectedArtists}
      />

      {/* ТАБЛИЦА ПОППУЛЯРНЫХ АРТИСТОВ */}
      <TableArtists
        title="Popular"
        pinkTitle="Artists"
        songs={musicData.LegendsArtists}
        showAll={showPopularTableAll}
        setShowAll={setShowPopularTableAll}
        columns={[
          {
            header: "Birthday",
            render: (song) => song.birthDate,
            width: "120px",
          },
          {
            header: "Country",
            render: (song) => song.country,
            width: "200px",
          },
          {
            header: "Listening",
            render: (song) => <>{song.plays}</>,
            width: "100px",
          },
        ]}
      />
      {/* КРУГЛЫЕ ФОРМЫ, ОТОБРАЖЕНИЕ ПОПУЛЯРНЫХ АРТИСТОВ */}
      <SongGridCircle
        title="Hit"
        pinkTitle="Artists"
        items={musicData.PopularArtists}
        showAll={showPopularAll}
        setShowAll={setShowPopularAll}
      />
    </div>
  );
}
