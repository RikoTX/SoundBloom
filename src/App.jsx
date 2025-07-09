import { useState } from 'react';
import Sider from './components/Sider/Sider';
import ContentPage from './components/Content/ContentPage';

const outerLayoutStyle = {
  height: '100vh',
  display: 'flex',
};

export default function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtists, setSelectedArtists] = useState(null);


  return (
    <div style={outerLayoutStyle}>
      <Sider />
      <ContentPage selectedAlbum={selectedAlbum} setSelectedAlbum={setSelectedAlbum} selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists} />
    </div>
  );
}
