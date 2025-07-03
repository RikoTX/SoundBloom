import { useEffect, useState } from 'react';
import {
    SearchOutlined,
} from '@ant-design/icons';
import musicData from '../../../../public/music.json';

import {
    HeartOutlined
} from '@ant-design/icons';




const imageWrapperStyle = {
    position: 'relative',
    maxWidth: '100%',
};

const imageStyle = {
    paddingRight: '80px',
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
};
const inputContainerStyle = {
    position: 'absolute',
    top: '8%',
    left: '20%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '400px',
    backgroundColor: '#121212',
    border: '1px solid #333',
};


const inputStyle = {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#121212',
    color: 'grey',
    width: '100%',
};


const buttonStyle = {
    padding: '8px 16px',
    border: '1px solid #121212',
    backgroundColor: '#121212',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const ImageCenter = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    paddingTop: '50px',
};
const linkText = {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '20px',
};

const linkStyle = {
    fontSize: '17px',
    color: 'white',
    textDecoration: 'none',
};

const Position = {
    position: 'absolute',
    top: '2.5%',
    right: '38%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}

const ButtonElements = {
    position: 'absolute',
    top: '4%',
    right: '10%'
}

const styleButtonLogin = {
    backgroundColor: 'transparent',
    color: '#cb0094',
    padding: '11px',
    width: '150px',
    border: '1px solid #cb0094',
    borderRadius: '3px',
    marginRight: '10px',
    cursor: 'pointer',

}
const styleButtonSignUp = {
    backgroundColor: '#cb0094',
    padding: '11px',
    width: '150px',
    borderRadius: '3px',
    border: '1px solid #cb0094',
    cursor: 'pointer',
}

const textStyle = {
    fontWeight: 700,
    fontSize: 40,
}
const textPosition = {
    position: 'absolute',
    top: '20%',
    left: '3%',
}

const textImage = {
    width: '380px',
    position: 'absolute',
    bottom: '30%',
    left: '3%',
    color: '#bdbdbd',
}

const positionButton = {
    position: 'absolute',
    bottom: '20%',
    left: '3.5%'
}

const styleDiscoverNow = {
    color: 'white',
    backgroundColor: '#cb0094',
    border: '1px solid #cb0094',
    padding: '10px',
    width: '150px',
    borderRadius: '4px',
    fontSize: '17px',
    marginRight: '30px',
    cursor: 'pointer',

}

const styleCreatePlaylist = {
    color: '#0E9EEF',
    backgroundColor: 'transparent',
    border: '2px solid #0E9EEF',
    padding: '10px',
    width: '150px',
    borderRadius: '4px',
    fontSize: '17px',
    cursor: 'pointer',

}
export default function Home() {
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = () => {
        console.log(searchValue);
    };
    const numbers = [];
    for (let i = 1; i <= 7; i++) {
        numbers.push(<div key={i}>#{i}</div>);
    }

    return (
        <div>
            <div style={ImageCenter}>
                <div style={imageWrapperStyle}>
                    <img
                        src="../../../public/fon.png"
                        alt="SoundBloom"
                        style={imageStyle}
                    />

                    <div style={inputContainerStyle}>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search For Musics, Artist, ..."
                            style={inputStyle}
                        />
                        <button onClick={handleSearch} style={buttonStyle}>
                            <SearchOutlined />
                        </button>
                    </div>
                    <div style={Position}>
                        <div style={linkText}>
                            <a href="#" style={linkStyle}>About Us</a>
                            <a href="#" style={linkStyle}>Contact</a>
                            <a href="#" style={linkStyle}>Premium</a>
                        </div>

                    </div>
                    <div style={ButtonElements}>
                        <button style={styleButtonLogin}>
                            Login
                        </button>
                        <button style={styleButtonSignUp}>
                            Sign Up
                        </button>
                    </div>

                    <div style={textPosition}>
                        <p style={textStyle}>
                            All the <span style={{ color: '#cb0094' }}>Best Songs</span><br />
                            in One Place
                        </p>
                    </div>
                    <div style={textImage}>
                        <p>
                            On our website, you can access an amazing collection of popular and new songs. Stream your favorite tracks in high quality and enjoy without interruptions. Whatever your taste in music, we have it all for you!
                        </p>
                    </div>
                    <div style={positionButton}>
                        <button style={styleDiscoverNow}>
                            Discover Now
                        </button>
                        <button style={styleCreatePlaylist}>
                            Create Playlist
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <p style={{ fontWeight: 600, fontSize: 35, marginLeft: '4%' }}>
                    Weekly Top <span style={{ color: '#cb0094' }}>Songs</span>
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
                        {musicData.WeeklyTopSongs.map((song, index) => (
                            <div key={index} style={{ textAlign: 'center', backgroundColor: '#1F1F1F', padding: 10, borderRadius: '10px' }}>
                                <img
                                    src={song.cover}
                                    alt={song.title}
                                    style={{ width: '150px', height: '150px', borderRadius: '10px' }}
                                />
                                <p style={{ margin: '5px 0', fontWeight: 600 }}>{song.title}</p>
                                <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{song.artist}</p>
                            </div>
                        ))}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <button style={{
                                    backgroundColor: '#1E1E1E',
                                    width: '70px',
                                    height: '70px',
                                    fontSize: '30px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}>
                                    +
                                </button>
                                <p style={{
                                    marginTop: '8px',
                                    fontWeight: 500,
                                    fontSize: '15px',
                                    color: 'white'
                                }}>
                                    View All
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <p style={{ fontWeight: 600, fontSize: 35, marginLeft: '4%' }}>
                    New Release <span style={{ color: '#cb0094' }}>Songs</span>
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
                        {musicData.NewReleaseSongs.map((song, index) => (
                            <div key={index} style={{ textAlign: 'center', backgroundColor: '#1F1F1F', padding: 10, borderRadius: '10px' }}>
                                <img
                                    src={song.cover}
                                    alt={song.title}
                                    style={{ width: '150px', height: '150px', borderRadius: '10px' }}
                                />
                                <p style={{ margin: '5px 0', fontWeight: 600 }}>{song.title}</p>
                                <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{song.artist}</p>
                            </div>
                        ))}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <button style={{
                                    backgroundColor: '#1E1E1E',
                                    width: '70px',
                                    height: '70px',
                                    fontSize: '30px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}>
                                    +
                                </button>
                                <p style={{
                                    marginTop: '8px',
                                    fontWeight: 500,
                                    fontSize: '15px',
                                    color: 'white'
                                }}>
                                    View All
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div >
                    <p style={{ fontWeight: 600, fontSize: 35, margin: '35px 10px 0px 4%' }}>
                        Trending <span style={{ color: '#cb0094' }}>Songs</span>
                    </p>
                    <div style={{ marginLeft: '370px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: '26%', width: '90%' }}>
                            <p style={{ fontWeight: 500, fontSize: 17 }} >Relase Date</p>
                            <p style={{ fontWeight: 500, fontSize: 17 }} >Album</p>
                            <p style={{ fontWeight: 500, fontSize: 17 }} >Time</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontSize: '30px', fontWeight: 500, gap: '48px', marginLeft: '20px', marginBottom: '10px' }}>
                            {numbers}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '2%', width: '90%' }}>
                            {musicData.TrendingSongs.map((song, index) => (
                                <div key={index} style={{ width: '100%', backgroundColor: '#1F1F1F', borderRadius: '10px', margin: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-around', width: '23%' }}>
                                            <img
                                                src={song.cover}
                                                alt={song.title}
                                                style={{ width: '70px', height: '70px', borderRadius: '10px' }}
                                            />
                                            <div style={{ width: '100%', marginLeft: '5%' }}>
                                                <p style={{ margin: '5px 0', fontWeight: 600, fontSize: '120%' }}>{song.title}</p>
                                                <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{song.artist}</p>
                                            </div>

                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            justifyContent: 'space-around',
                                            paddingLeft: '50px',
                                            gap: '40px',
                                        }}>
                                            <p style={{
                                                width: '120px',
                                                margin: '5px 0',
                                                fontWeight: 400,
                                                fontSize: '14px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {song.releaseDate}
                                            </p>

                                            <p style={{
                                                width: '200px',
                                                margin: '5px 0',
                                                fontWeight: 400,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {song.album}
                                            </p>

                                            <p style={{
                                                width: '100px',
                                                margin: '5px 0',
                                                fontWeight: 400,
                                                display: 'flex',
                                                alignItems: 'center',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                <HeartOutlined style={{ marginRight: '10px', cursor: 'pointer', fontSize: '18px', color: '#EE10B0' }} />
                                                {song.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <button style={{
                            backgroundColor: '#1E1E1E',
                            width: '120px',
                            borderRadius: '5px',
                            height: '40px',
                            fontSize: '30px',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            +<p style={{
                                marginLeft: '8px',
                                fontWeight: 500,
                                fontSize: '15px',
                                color: 'white'
                            }}>
                                View All
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
