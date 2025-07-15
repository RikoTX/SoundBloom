import { HeartOutlined, ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function PageArtists({ selectedArtists }) {
  const navigate = useNavigate();

  if (!selectedArtists) {
    return <div style={{ color: 'white', padding: '40px' }}>Artist not selected</div>;
  }

  const { backgroundImage, infoAlbums, plays, title, artist, cover, releaseDate, album, tracks, albums, singles, playlist, fansAlsoListen } = selectedArtists;

  const getTotalDuration = (trackList) => {
    let totalSeconds = 0;
    trackList.forEach((track) => {
      const [min, sec] = track.duration.split(':').map(Number);
      totalSeconds += min * 60 + sec;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
  };

  const numbers = tracks?.map((_, index) => <div key={index}>{index + 1}</div>);

  return (
    <div style={{ margin: '40px', paddingBottom: '100px', borderRadius: '15px', background: '#0C0B0B' }}>
      <div style={{ color: 'white' }}>
        <div
          style={{
            borderRadius: '10px',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            height: '480px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '10px',
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => navigate('/Artist')}
                style={{
                  cursor: 'pointer',
                  width: '100px',
                  height: '100px',
                  fontSize: 40,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                }}
              >
                <ArrowLeftOutlined />
              </button>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  maxWidth: '400px',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <a style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Share</a>
                <a style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>About</a>
                <a style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Premium</a>
              </div>
            </div>

            <h1 style={{ fontSize: 100, margin: 0, marginLeft: '3%', marginBottom: '8%' }}>{artist}</h1>
          </div>
        </div>



        {tracks && tracks.length > 0 && (
          <div>
            <p style={{ fontWeight: 700, fontSize: 35, margin: '35px 10px 0px 4%' }}>
              Popular
            </p>
            <div style={{ marginLeft: '390px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: '35%', width: '90%' }}>
                <p style={{ fontWeight: 500, fontSize: 17 }}>Release Date</p>
                <p style={{ fontWeight: 500, fontSize: 17 }}>Played</p>
                <p style={{ fontWeight: 500, fontSize: 17 }}>Time</p>
              </div>
            </div>

            <div style={{}}>
              <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontSize: '30px', fontWeight: 500, gap: '45px', marginLeft: '20px', marginBottom: '10px', color: 'white' }}>
                  {numbers}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '2%', width: '90%' }}>
                  {[...tracks]
                    .sort((a, b) => b.plays - a.plays)
                    .map((track, index) => (
                      <div key={index} style={{ width: '100%', backgroundColor: '#1F1F1F', borderRadius: '10px', margin: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                            <img src={track.cover} alt={track.title} style={{ width: '70px', height: '70px', borderRadius: '10px' }} />
                            <div style={{ width: '100%', marginLeft: '5%' }}>
                              <p style={{ margin: '5px 0', fontWeight: 600, fontSize: '120%' }}>{track.title}</p>
                              <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{track.artist}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-around', gap: '145px' }}>
                            <p style={{ width: '120px', margin: '5px 0', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {track.releaseDate}
                            </p>
                            <p style={{ width: '200px', margin: '5px 0', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', justifyContent: 'center' }}>
                              {track.plays}
                            </p>
                            <p style={{ width: '100px', margin: '5px 0', fontWeight: 400, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <HeartOutlined style={{ marginRight: '10px', cursor: 'pointer', fontSize: '18px', color: '#EE10B0' }} />
                              {track.duration}<MoreOutlined style={{ fontSize: 17, marginLeft: '10px' }} />
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
                paddingBottom: '50px'

              }}>
                <button style={{
                  backgroundColor: '#EE10B0',
                  width: '120px',
                  borderRadius: '5px',
                  height: '40px',
                  fontSize: '30px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <p style={{
                    fontWeight: 500,
                    fontSize: '15px',
                    color: 'white'
                  }}>
                    Show More
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
        <p style={{ fontWeight: 700, fontSize: 35, margin: '35px 10px 0px 4%', marginTop: '20px', marginBottom: '20px' }}>
          Artist’s  <span style={{ color: '#cb0094' }}>Albums</span>
        </p>
        {albums && (



          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
            {albums.map((album, index) => (
              <div key={index} style={{ backgroundColor: '#1F1F1F', padding: 10, borderRadius: '10px' }}>
                <img
                  src={album.cover}
                  alt={album.title}
                  style={{ width: '150px', height: '150px', borderRadius: '10px' }}
                />
                <p style={{ margin: '5px 0', fontWeight: 600 }}>{album.title}</p>
                <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{album.year}</p>
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
        )}

        <p style={{ fontWeight: 700, fontSize: 35, margin: '35px 10px 0px 4%', marginTop: '80px', marginBottom: '20px' }}>
          Single   <span style={{ color: '#cb0094' }}>Songs</span>
        </p>
        {singles && (



          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
            {singles.map((single, index) => (
              <div key={index} style={{ backgroundColor: '#1F1F1F', padding: 10, borderRadius: '10px' }}>
                <img
                  src={single.cover}
                  alt={single.title}
                  style={{ width: '150px', height: '150px', borderRadius: '10px' }}
                />
                <p style={{ margin: '5px 0', fontWeight: 600 }}>{single.title}</p>
                <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{single.year}</p>
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
        )}




        <p style={{ fontWeight: 700, fontSize: 35, margin: '35px 10px 0px 4%', marginTop: '80px', marginBottom: '20px' }}>
          Artist’s   <span style={{ color: '#cb0094' }}>Playlist</span>
        </p>
        {playlist && (



          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
            {playlist.map((item, index) => (
              <div key={index} style={{ textAlign: 'center', backgroundColor: '#1F1F1F', borderRadius: '10px' }}>
                <img
                  src={item.cover}
                  alt={item.title}
                  style={{ width: '170px', height: '160px', borderRadius: '10px' }}
                />
                <p style={{ margin: '5px 0', fontWeight: 600, display: 'flex', justifyContent: 'flex-start', padding: ' 3px', paddingLeft: '8px' }}>{item.title}</p>
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
        )}


        <p style={{ fontWeight: 700, fontSize: 35, margin: '35px 10px 0px 4%', marginTop: '80px', marginBottom: '20px' }}>
          Eminem Fans    <span style={{ color: '#cb0094' }}>Also Listen To</span>
        </p>
        {fansAlsoListen && (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
            {fansAlsoListen.map((fan, index) => (
              <div key={index} style={{ textAlign: 'center', padding: 10, borderRadius: '10px' }}>
                <img
                  src={fan.cover}
                  alt={fan.artist}
                  style={{ width: '220px', height: '220px', borderRadius: '300px' }}
                />
                <p style={{ margin: '5px 0', fontWeight: 300, fontSize: '18px' }}>{fan.artist}</p>
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
        )}
      </div>
    </div>
  );
}
