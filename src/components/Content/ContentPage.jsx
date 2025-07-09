import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Footer from '../Footer/Footer';
import Home from './Home/Home';
import Search from './Search/Search';
import Popular from './Popular/Popular';
import PageAlbums from '../PageAlbums/PageAlbums';
import PageArtists from '../PageArtists/PageArtists';
import Artists from './Artists/Artists';


const scrollContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  backgroundColor: '#181818',
  color: 'white',
};

export default function ContentPage({ selectedAlbum, setSelectedAlbum, selectedArtists, setSelectedArtists }) {
  return (
    <Layout>
      <div style={scrollContainerStyle}>
        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/Search" element={<Search />} />
          <Route path="/Popular" element={<Popular setSelectedAlbum={setSelectedAlbum} />} />
          <Route path="/Artist" element={<Artists setSelectedArtists={setSelectedArtists} />} />
          <Route path="/LikedSongs" element={<div>Понравившиеся песни</div>} />
          <Route path="/Playlist" element={<div>Плейлист</div>} />
          <Route path="/Settings" element={<div>Настройки</div>} />
          <Route path="/Logout" element={<div>Выход</div>} />
          <Route path="/PageAlbums" element={<PageAlbums selectedAlbum={selectedAlbum} setSelectedAlbum={setSelectedAlbum} />} />
          <Route path="/PageArtists" element={<PageArtists selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </div>
    </Layout>
  );
}
