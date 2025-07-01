import { Layout } from 'antd';
const { Footer } = Layout;
import Home from './Home/Home'



const scrollContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  backgroundColor: '#121212',
  color: 'white',
};

const footerStyle = {
  textAlign: 'center',
  color: 'black',
  backgroundColor: 'pink',
  padding: '12px',
};

export default function ContentPage({ activeButton }) {

  const renderContent = () => {
    switch (activeButton) {
      case 'Home':
        return <Home/>
      case 'Search':
        return <div>Поиск</div>;
      case 'Popular':
        return <div>Популярное</div>;
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
        <Footer style={footerStyle}>Footer</Footer>
      </div>
    </Layout>
  );
}
