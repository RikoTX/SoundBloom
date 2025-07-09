import { Layout } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomButton from '../Button/Button';
import {
  HomeOutlined, SearchOutlined, StarOutlined, UserOutlined,
  HeartOutlined, ProfileOutlined, SettingOutlined, LogoutOutlined
} from '@ant-design/icons';

const { Sider: AntSider } = Layout;

const siderStyle = {
  backgroundColor: '#181818',
  borderRight: '2px solid #cb0094',
  boxShadow: '1px 0 10px #cb0094',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const contentWrapperStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '40px 20px 0 20px',
  overflowY: 'auto',
};

const labelStyle = {
  color: '#cb0094',
  fontSize: '15px',
  marginBottom: '5px',
  marginTop: '20px',
};

const menuStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '20px',
  width: '100%',
  alignItems: 'center',
};

export default function SiderMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const current = location.pathname.replace('/', '') || 'Home';

  const createButton = (name, icon, label) => (
    <CustomButton
      active={current === name}
      onClick={() => navigate(`/${name}`)}
    >
      {icon} {label}
    </CustomButton>
  );

  return (
    <AntSider width="18%" style={siderStyle}>
      <div style={contentWrapperStyle}>
        <img
          src="soundBloom.png"
          alt="SoundBloom"
          style={{
            maxWidth: '90%',
            alignSelf: 'center',
            marginBottom: '20px',
          }}
        />
        <label style={labelStyle}>Menu</label>
        <div style={menuStyle}>
          {createButton('Home', <HomeOutlined />, 'Home')}
          {createButton('Search', <SearchOutlined />, 'Search')}
          {createButton('Popular', <StarOutlined />, 'Popular')}
          {createButton('Artist', <UserOutlined />, 'Artist')}
        </div>

        <label style={labelStyle}>Playlist and favorite</label>
        <div style={menuStyle}>
          {createButton('LikedSongs', <HeartOutlined />, 'Liked songs')}
          {createButton('Playlist', <ProfileOutlined />, 'Playlist')}
        </div>

        <label style={labelStyle}>General</label>
        <div style={menuStyle}>
          {createButton('Settings', <SettingOutlined />, 'Settings')}
          {createButton('Logout', <LogoutOutlined />, 'Logout')}
        </div>
      </div>
    </AntSider>
  );
}
