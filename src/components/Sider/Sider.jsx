import { Layout } from 'antd';
import CustomButton from '../Button/Button';
import {
    HomeOutlined,
    SearchOutlined,
    StarOutlined,
    UserOutlined,
    HeartOutlined,
    ProfileOutlined,
    SettingOutlined,
    LogoutOutlined
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


export default function SiderMenu({ activeButton, setActiveButton }) {
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
                    <CustomButton
                        active={activeButton === 'Home'}
                        onClick={() => setActiveButton('Home')}
                    >
                        <HomeOutlined /> Home
                    </CustomButton>
                    <CustomButton
                        active={activeButton === 'Search'}
                        onClick={() => setActiveButton('Search')}
                    >
                        <SearchOutlined /> Search
                    </CustomButton>
                    <CustomButton
                        active={activeButton === 'Popular'}
                        onClick={() => setActiveButton('Popular')}
                    >
                        <StarOutlined /> Popular
                    </CustomButton>
                    <CustomButton
                        active={activeButton === 'Artist'}
                        onClick={() => setActiveButton('Artist')}
                    >
                        <UserOutlined /> Artist
                    </CustomButton>
                </div>

                <label style={labelStyle}>Playlist and favorite</label>
                <div style={menuStyle}>
                    <CustomButton
                        active={activeButton === 'LikedSongs'}
                        onClick={() => setActiveButton('LikedSongs')}
                    >
                        <HeartOutlined /> Liked songs
                    </CustomButton>
                    <CustomButton
                        active={activeButton === 'Playlist'}
                        onClick={() => setActiveButton('Playlist')}
                    >
                        <ProfileOutlined /> Playlist
                    </CustomButton>
                </div>

                <label style={labelStyle}>General</label>
                <div style={menuStyle}>
                    <CustomButton
                        active={activeButton === 'Settings'}
                        onClick={() => setActiveButton('Settings')}
                    >
                        <SettingOutlined /> Settings
                    </CustomButton>
                    <CustomButton
                        active={activeButton === 'Logout'}
                        onClick={() => setActiveButton('Logout')}
                    >
                        <LogoutOutlined /> Logout  
                    </CustomButton>
                </div>
            </div>
        </AntSider>
    );
}
