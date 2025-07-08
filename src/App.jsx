import React, { useState } from 'react';
import { Layout } from 'antd';
import Sider from './components/Sider/Sider';
import ContentPage from './components/Content/ContentPage'


const outerLayoutStyle = {
  height: '100vh',
  display: 'flex',
};



export default function App() {
  const [activeButton, setActivePage] = useState('Home');
  const [selectedAlbum, setSelectedAlbum] = useState(null); 
  return (
    <div style={outerLayoutStyle}>
      <Sider activeButton={activeButton} setActiveButton={setActivePage} />
      <ContentPage activeButton={activeButton}
        setActiveButton={setActivePage}
        selectedAlbum={selectedAlbum}
        setSelectedAlbum={setSelectedAlbum} />
    </div>
  );
}

