import { HeartOutlined, ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';


export default function PageAlbums({ selectedAlbum }) {
    const navigate = useNavigate();
    if (!selectedAlbum) {
        return <div style={{ color: 'white', padding: '40px' }}>Album not selected</div>;
    }

    const { infoAlbums, title, artist, cover, releaseDate, album, tracks } = selectedAlbum;

    const getTotalDuration = (trackList) => {
        let totalSeconds = 0;

        trackList.forEach((track) => {
            const [min, sec] = track.duration.split(':').map(Number);
            totalSeconds += min * 60 + sec;
        });

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    };


    const numbers = tracks.map((_, index) => (
        <div key={index}>{index + 1}</div>
    ));


    return (
        <div style={{ margin: '40px', paddingBottom: '100px', borderRadius: '15px', background: 'linear-gradient(to right,rgb(3, 98, 152),rgb(1, 37, 57))' }}>
            <div style={{ color: 'white' }}>
                <div style={{ borderRadius: '15px', background: 'linear-gradient(to right,#0E9EEF,rgb(4, 58, 87))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={() => navigate('/Popular')} style={{ cursor: 'pointer', width: '100px', height: '100px', fontSize: 40, backgroundColor: 'transparent', border: 'none' }}><ArrowLeftOutlined /></button>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', maxWidth: '400px', width: '100%', alignItems: 'center' }}>
                            <a style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Share</a>
                            <a style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>About</a>
                            <a style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Premium</a>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', marginLeft: '50px', paddingBottom: '30px' }}>
                        <img
                            src={cover}
                            alt={title}
                            style={{ width: '250px', borderRadius: '10px', marginTop: '20px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10%' }}>
                            <h1 style={{ fontSize: 35 }}>{title}</h1>
                            <p style={{ fontSize: 17, fontWeight: 600 }}>
                                {infoAlbums}
                            </p>
                            <p style={{ color: '#fff', marginBottom: '10px', fontWeight: 700, fontSize: 15 }}>
                                {tracks.length} songs&nbsp;&nbsp; <span style={{ color: 'red' }}>●</span>  &nbsp;&nbsp;{getTotalDuration(tracks)}
                            </p>
                        </div>
                        <div style={{
                            width: '300px',
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', color: '#EE10B0', gap: '10px', cursor: 'pointer' }}>
                                <h1>Play All</h1>
                                <button style={{ padding: 1, fontSize: 60, backgroundColor: 'transparent', border: 'none', color: '#EE10B0', cursor: 'pointer' }}><PlayCircleOutlined /></button>
                            </div>
                        </div>

                    </div>
                </div>

                {tracks && tracks.length > 0 && (
                    <div >
                        <div style={{ marginLeft: '370px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: '26%', width: '90%' }}>
                                <p style={{ fontWeight: 500, fontSize: 17 }} >Relase Date</p>
                                <p style={{ fontWeight: 500, fontSize: 17 }} >Album</p>
                                <p style={{ fontWeight: 500, fontSize: 17 }} >Time</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column',
                                fontSize: '30px',
                                fontWeight: 500,
                                gap: '45px',
                                marginLeft: '20px',
                                marginBottom: '10px',
                                color: 'white',
                            }}>
                                {numbers}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '2%', width: '90%' }}>
                                {tracks.map((track, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#1F1F1F',
                                            borderRadius: '10px',
                                            margin: '10px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                                                <img
                                                    src={track.cover}
                                                    alt={track.title}
                                                    style={{ width: '70px', height: '70px', borderRadius: '10px' }}
                                                />
                                                <div style={{ width: '100%', marginLeft: '5%' }}>
                                                    <p style={{ margin: '5px 0', fontWeight: 600, fontSize: '120%' }}>{track.title}</p>
                                                    <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{track.artist}</p>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    justifyContent: 'space-around',
                                                    paddingLeft: '50px',
                                                    gap: '145px',
                                                }}
                                            >
                                                <p style={{
                                                    width: '120px',
                                                    margin: '5px 0',
                                                    fontWeight: 400,
                                                    fontSize: '14px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {track.releaseDate}
                                                </p>

                                                <p style={{
                                                    width: '200px',
                                                    margin: '5px 0',
                                                    fontWeight: 400,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}>
                                                    {album}
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
                                                    <HeartOutlined
                                                        style={{
                                                            marginRight: '10px',
                                                            cursor: 'pointer',
                                                            fontSize: '18px',
                                                            color: '#EE10B0',
                                                        }}
                                                    />
                                                    {track.duration}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
