import Home from './Home/Home'
import Search from './Search/Search';
import Footer from '../Footer/Footer';
import { Layout } from 'antd';
import Popular from './Popular/Popular';



const scrollContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  backgroundColor: '#181818',
  color: 'white',
};

export default function ContentPage({ activeButton }) {

  const renderContent = () => {
    switch (activeButton) {
      case 'Home':
        return <Home/>
      case 'Search':
        return <Search />
      case 'Popular':
        return <Popular />
      case 'Artist':
        return <div>Артисты</div>;
      case 'LikedSongs':
        return <div>Понравившиеся песни</div>;
      case 'Playlist':
        return <div>Плейлист</div>;
      case 'Settings':
        return <div>Настройки</div>;
      case 'Logout':
        return <div>Выход</div>;
      default:
        return <div>Страница не найдена</div>;
    }
  };

  return (
    <Layout>
      <div style={scrollContainerStyle}>
        {renderContent()}
        <Footer />
      </div>
    </Layout>
  );
}
