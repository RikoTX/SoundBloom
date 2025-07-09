import musicData from '../../../../public/music.json';
import { useNavigate } from 'react-router-dom';


export default function Artists({setSelectedArtists}) {
    const navigate = useNavigate();
    const openArtists = (artist) => {
        setSelectedArtists(artist);
        navigate('/PageArtists');
    };

    const numbers = [];
    for (let i = 1; i <= 7; i++) {
        numbers.push(<div key={i}>#{i}</div>);
    }
    return (
        <div>
            <div>
                <p style={{ fontWeight: 600, fontSize: 35, margin: '35px 10px 0px 4%', paddingBottom: '25px' }}>
                    Legends of the   <span style={{ color: '#cb0094' }}>80s - 90s</span>
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '40px', paddingLeft: '40px' }}>
                        {[...musicData.LegendsArtists]
                            .sort((a, b) => b.plays - a.plays)
                            .map((artist, index) => (
                                <div key={index} onClick={() => openArtists(artist)} style={{ textAlign: 'center', padding: 10, borderRadius: '10px', cursor: 'pointer' }}>
                                    <img
                                        src={artist.cover}
                                        alt={artist.artist}
                                        style={{ width: '140px', height: '140px', borderRadius: '70px' }}
                                    />
                                    <p style={{ margin: '5px 0', fontWeight: 300, fontSize: '18px' }}>{artist.artist}</p>
                                </div>
                            ))}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                        </div>
                    </div>
                </div>
            </div>
            <div >
                <p style={{ fontWeight: 600, fontSize: 35, margin: '35px 10px 0px 4%' }}>
                    Popular <span style={{ color: '#cb0094' }}>Artists</span>
                </p>
                <div style={{ marginLeft: '370px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: '26%', width: '90%' }}>
                        <p style={{ fontWeight: 500, fontSize: 17 }} >Birthday</p>
                        <p style={{ fontWeight: 500, fontSize: 17 }} >Country</p>
                        <p style={{ fontWeight: 500, fontSize: 17 }} >Listening</p>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontSize: '30px', fontWeight: 500, gap: '48px', marginLeft: '20px', marginBottom: '10px' }}>
                        {numbers}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '2%', width: '90%' }}>
                        {[...musicData.LegendsArtists]
                            .slice(3, 10)
                            .sort((a, b) => b.plays - a.plays)
                            .map((song, index) => (
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
                                        <div style={{ display: 'flex', justifyContent: 'space-around', width: '23%' }}>
                                            <img
                                                src={song.cover}
                                                style={{ width: '70px', height: '70px', borderRadius: '10px' }}
                                            />
                                            <div style={{ width: '100%', marginLeft: '5%' }}>
                                                <p style={{ margin: '5px 0', fontWeight: 600, fontSize: '120%' }}>{song.artist}</p>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                justifyContent: 'space-around',
                                                paddingLeft: '50px',
                                                gap: '40px',
                                            }}
                                        >
                                            <p
                                                style={{
                                                    width: '120px',
                                                    margin: '5px 0',
                                                    fontWeight: 400,
                                                    fontSize: '14px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {song.birthDate}
                                            </p>

                                            <p
                                                style={{
                                                    width: '200px',
                                                    margin: '5px 0',
                                                    fontWeight: 400,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {song.country}
                                            </p>

                                            <p
                                                style={{
                                                    width: '100px',
                                                    margin: '5px 0',
                                                    fontWeight: 400,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {song.plays}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            <div>
                <p style={{ fontWeight: 600, fontSize: 35, margin: '35px 10px 0px 4%', paddingBottom: '25px' }}>
                    Hit <span style={{ color: '#cb0094' }}>Artists</span>
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

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}