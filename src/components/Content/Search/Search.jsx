import { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import musicData from '../../../../public/music.json';
import usePlayerControls from '../hooks/usePlayerControls';


const containerStyle = {
    display: 'flex',
    alignItems: 'start',
    justifyContent: 'center',
    gap: '50px',
    paddingTop: '40px',
    width: '100%',
    position: 'relative',
};


const inputContainerStyle = {
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
};

const buttonStyle = {
    padding: '8px 16px',
    border: '1px solid #121212',
    backgroundColor: '#121212',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const linkText = {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
};

const linkStyle = {
    fontSize: '17px',
    color: 'white',
    textDecoration: 'none',
};

const buttonWrapper = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
};

const styleButtonLogin = {
    backgroundColor: 'transparent',
    color: '#cb0094',
    padding: '11px',
    width: '150px',
    border: '1px solid #cb0094',
    borderRadius: '3px',
    cursor: 'pointer',
};

const styleButtonSignUp = {
    backgroundColor: '#cb0094',
    color: 'white',
    padding: '11px',
    width: '150px',
    borderRadius: '3px',
    border: '1px solid #cb0094',
    cursor: 'pointer',
};

export default function Search({ setCurrentTrackIndex, setCurrentPlaylist }) {
    const [searchValue, setSearchValue] = useState('');
    const { handlePlaySong } = usePlayerControls(setCurrentPlaylist, setCurrentTrackIndex);


    const handleSearch = () => {
        console.log(searchValue);
    };
    const allSongs = [
        ...(musicData.NewReleaseSongs || []),
        ...(musicData.TopAlbums || []),
        ...(musicData.WeeklyTopSongs || []),
        ...(musicData.TrendingSongs || []),
    ];

    const filteredSongs = allSongs.filter((song) => {
        const query = searchValue.toLowerCase();
        return (
            song.title?.toLowerCase().includes(query) ||
            song.artist?.toLowerCase().includes(query)
        );
    });

    return (
        <div>
            <div style={containerStyle}>
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
                {searchValue && (
                    <div
                        
                        style={{
                            position: 'absolute',
                            top: '80px',
                            left: '22.5%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '10px',
                            width: '400px',
                            zIndex: 10,
                            color: 'white',
                            cursor: 'pointer'
                        }}>
                        {filteredSongs.length > 0 ? (
                            filteredSongs.map((song, index) => (
                                <div key={index} onClick={() => handlePlaySong(filteredSongs, index)} style={{ padding: '5px 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'start', alignItems: 'center', gap: '10px' }}>
                                    <img
                                        src={song.cover}
                                        style={{ width: '30px', height: '30px', borderRadius: '5px' }}
                                    />
                                    <strong>{song.title}</strong>
                                    {song.artist && <span style={{ marginLeft: '10px', color: '#888' }}>by {song.artist}</span>}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#888' }}>No results found.</p>
                        )}
                    </div>
                )}


                <div style={linkText}>
                    <a href="#" style={linkStyle}>About Us</a>
                    <a href="#" style={linkStyle}>Contact</a>
                    <a href="#" style={linkStyle}>Premium</a>
                </div>

                <div style={buttonWrapper}>
                    <button style={styleButtonLogin}>Login</button>
                    <button style={styleButtonSignUp}>Sign Up</button>
                </div>
            </div>

            <div>
                <div style={{}}>
                    <p style={{
                        fontWeight: 600,
                        fontSize: 35,
                        marginLeft: '4%',
                        marginBottom: '20px'
                    }}>
                        Music <span style={{ color: '#cb0094' }}> Genres</span>
                    </p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        padding: '0 40px'
                    }}>
                        {musicData.MusicGenres.map((song, index) => (
                            <div key={index} style={{
                                textAlign: 'center',
                                borderRadius: '10px',
                                marginBottom: '20px'
                            }}>
                                <img
                                    src={song.cover}
                                    style={{ width: '240px', height: '160px', borderRadius: '5px' }}
                                />
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
                    Mood <span style={{ color: '#cb0094' }}> Playlist</span>
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
                        {musicData.MoodPlaylist.map((song, index) => (
                            <div key={index} style={{ textAlign: 'center', backgroundColor: '#1F1F1F', borderRadius: '10px' }}>
                                <img
                                    src={song.cover}
                                    alt={song.titlePlaylist}
                                    style={{ width: '170px', height: '160px', borderRadius: '10px' }}
                                />
                                <p style={{ margin: '5px 0', fontWeight: 600, display: 'flex', justifyContent: 'flex-start', padding: ' 3px', paddingLeft: '8px' }}>{song.titlePlaylist}</p>
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
                <p style={{ fontWeight: 600, fontSize: 35, margin: '35px 10px 0px 4%', paddingBottom: '25px' }}>
                    Popular <span style={{ color: '#cb0094' }}>Artists</span>
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
                        {musicData.PopularArtists.map((song, index) => (
                            <div key={index} style={{ textAlign: 'center', padding: 10, borderRadius: '10px' }}>
                                <img
                                    src={song.cover}
                                    alt={song.artist}
                                    style={{ width: '140px', height: '140px', borderRadius: '70px' }}
                                />
                                <p style={{ margin: '5px 0', fontWeight: 300, fontSize: '18px' }}>{song.artist}</p>
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
                    Music <span style={{ color: '#cb0094' }}>Video</span>
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '50px',
                            padding: '0 40px'
                        }}>
                            {musicData.MusicVideo.slice(0, 6).map((song, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: '300px',
                                        backgroundColor: '#202020',
                                        borderRadius: '10px',
                                        padding: '10px',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <iframe
                                        style={{ borderRadius: '7px' }}
                                        width="100%"
                                        height="175"
                                        src={song.src}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    ></iframe>
                                    <p style={{
                                        margin: '5px 0',
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        textAlign: 'left'
                                    }}>
                                        {song.title}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '13px',
                                        fontWeight: 300
                                    }}>
                                        <p>{song.artist}</p>
                                        <p>{song.views}</p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                    <div style={{ paddingRight: '40px' }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
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
            <div>
                <p style={{ fontWeight: 600, fontSize: 35, marginLeft: '4%' }}>
                    New Release <span style={{ color: '#cb0094' }}>Songs</span>
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
                        {musicData.NewReleaseSongs.map((song, index) => (
                            <div
                                key={index}
                                onClick={() => handlePlaySong(musicData.NewReleaseSongs, index)}
                                style={{
                                    textAlign: 'center',
                                    backgroundColor: '#1F1F1F',
                                    padding: 10,
                                    borderRadius: '10px',
                                    cursor: 'pointer'
                                }}
                            >
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
                    Top<span style={{ color: '#cb0094' }}> Albums</span>
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
                        {musicData.TopAlbums.slice(5, 10).map((song, index) => (
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
        </div>
    );
}
