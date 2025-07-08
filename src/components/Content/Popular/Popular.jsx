import { useState } from 'react';
import {
    SearchOutlined,
} from '@ant-design/icons';
import musicData from '../../../../public/music.json';
import { Tabs } from 'antd';
import {
    HeartOutlined
} from '@ant-design/icons';



export default function Popular() {

    const numbers = [];
    for (let i = 1; i <= 7; i++) {
        numbers.push(<div key={i}>#{i}</div>);
    }

    return (
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
            <div >
                <p style={{ fontWeight: 600, fontSize: 35, margin: '35px 10px 0px 4%' }}>
                    Popular <span style={{ color: '#cb0094' }}>Songs</span>
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
                        {[...musicData.TrendingSongs]
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
                                                alt={song.title}
                                                style={{ width: '70px', height: '70px', borderRadius: '10px' }}
                                            />
                                            <div style={{ width: '100%', marginLeft: '5%' }}>
                                                <p style={{ margin: '5px 0', fontWeight: 600, fontSize: '120%' }}>{song.title}</p>
                                                <p style={{ margin: 0, color: '#929292', fontSize: '12px' }}>{song.artist}</p>
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
                                                {song.releaseDate}
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
                                                {song.album}
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
                                                <HeartOutlined
                                                    style={{
                                                        marginRight: '10px',
                                                        cursor: 'pointer',
                                                        fontSize: '18px',
                                                        color: '#EE10B0',
                                                    }}
                                                />
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
            <div>
                <p style={{ fontWeight: 600, fontSize: 35, marginLeft: '4%' }}>
                    Popular<span style={{ color: '#cb0094' }}> Albums</span>
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', width: '85%', gap: '30px' }}>
                        {[...musicData.PopularAlbums]
                            .sort((a, b) => b.plays - a.plays)
                            .slice(0,10)
                            .map((song, index) => (
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

                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '20px'
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

    )
}