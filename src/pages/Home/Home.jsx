import { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import musicData from "../../data/music.json";
import { HeartOutlined } from "@ant-design/icons";
import usePlayerControls from "../../hooks/usePlayerControls";
import HeroSection from "../../components/HomeContendImage/HomeContendImage";

export default function Home({ setCurrentTrackIndex, setCurrentPlaylist }) {
  const [activeTab, setActiveTab] = useState("signup");
  const [searchValue, setSearchValue] = useState("");
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );
  
  const [showWeeklyAll, setShowWeeklyAll] = useState(false);
  const [showNewReleaseAll, setShowNewReleaseAll] = useState(false);

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

  const numbers = [];
  for (let i = 1; i <= 7; i++) {
    numbers.push(<div key={i}>#{i}</div>);
  }

  return (
    <div>
      <HeroSection
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      handleSearch={handleSearch}
      filteredSongs={filteredSongs}
      handlePlaySong={handlePlaySong}
    />
      <div>
        <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
          Weekly Top<span style={{ color: "#cb0094" }}> Songs</span>
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              width: "85%",
              gap: "20px",
            }}
          >
            {(showWeeklyAll
              ? musicData.WeeklyTopSongs
              : musicData.WeeklyTopSongs.slice(0, 5)
            ).map((song, index) => (
              <div
                key={index}
                onClick={() => handlePlaySong(musicData.WeeklyTopSongs, index)}
                style={{
                  textAlign: "center",
                  backgroundColor: "#1F1F1F",
                  padding: 10,
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={song.cover}
                  alt={song.title}
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "10px",
                  }}
                />
                <p style={{ margin: "5px 0", fontWeight: 600 }}>{song.title}</p>
                <p style={{ margin: 0, color: "#929292", fontSize: "12px" }}>
                  {song.artist}
                </p>
              </div>
            ))}
          </div>
          {!showWeeklyAll && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                paddingLeft: "30px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setShowWeeklyAll(true)}
                  style={{
                    backgroundColor: "#1E1E1E",
                    width: "70px",
                    height: "70px",
                    fontSize: "30px",
                    borderRadius: "50%",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
                <p
                  style={{
                    marginTop: "8px",
                    fontWeight: 500,
                    fontSize: "15px",
                    color: "white",
                  }}
                >
                  View All
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
          New Release <span style={{ color: "#cb0094" }}> Songs</span>
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              width: "85%",
              gap: "20px",
            }}
          >
            {(showNewReleaseAll
              ? musicData.NewReleaseSongs
              : musicData.NewReleaseSongs.slice(0, 5)
            ).map((song, index) => (
              <div
                key={index}
                onClick={() => handlePlaySong(musicData.NewReleaseSongs, index)}
                style={{
                  textAlign: "center",
                  backgroundColor: "#1F1F1F",
                  padding: 10,
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={song.cover}
                  alt={song.title}
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "10px",
                  }}
                />
                <p style={{ margin: "5px 0", fontWeight: 600 }}>{song.title}</p>
                <p style={{ margin: 0, color: "#929292", fontSize: "12px" }}>
                  {song.artist}
                </p>
              </div>
            ))}
          </div>
          {!showNewReleaseAll && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                paddingLeft: "30px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setShowNewReleaseAll(true)}
                  style={{
                    backgroundColor: "#1E1E1E",
                    width: "70px",
                    height: "70px",
                    fontSize: "30px",
                    borderRadius: "50%",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
                <p
                  style={{
                    marginTop: "8px",
                    fontWeight: 500,
                    fontSize: "15px",
                    color: "white",
                  }}
                >
                  View All
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div>
          <p
            style={{
              fontWeight: 600,
              fontSize: 35,
              margin: "35px 10px 0px 4%",
            }}
          >
            Trending <span style={{ color: "#cb0094" }}>Songs</span>
          </p>
          <div style={{ marginLeft: "370px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                gap: "26%",
                width: "90%",
              }}
            >
              <p style={{ fontWeight: 500, fontSize: 17 }}>Relase Date</p>
              <p style={{ fontWeight: 500, fontSize: 17 }}>Album</p>
              <p style={{ fontWeight: 500, fontSize: 17 }}>Time</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                fontSize: "30px",
                fontWeight: 500,
                gap: "48px",
                marginLeft: "20px",
                marginBottom: "10px",
              }}
            >
              {numbers}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingRight: "2%",
                width: "90%",
              }}
            >
              {musicData.TrendingSongs.map((song, index) => (
                <div
                  key={index}
                  style={{
                    width: "100%",
                    backgroundColor: "#1F1F1F",
                    borderRadius: "10px",
                    margin: "10px",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-evenly" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        width: "23%",
                      }}
                    >
                      <img
                        src={song.cover}
                        alt={song.title}
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "10px",
                        }}
                      />
                      <div style={{ width: "100%", marginLeft: "5%" }}>
                        <p
                          style={{
                            margin: "5px 0",
                            fontWeight: 600,
                            fontSize: "120%",
                          }}
                        >
                          {song.title}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "#929292",
                            fontSize: "12px",
                          }}
                        >
                          {song.artist}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        justifyContent: "space-around",
                        paddingLeft: "50px",
                        gap: "40px",
                      }}
                    >
                      <p
                        style={{
                          width: "120px",
                          margin: "5px 0",
                          fontWeight: 400,
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {song.releaseDate}
                      </p>

                      <p
                        style={{
                          width: "200px",
                          margin: "5px 0",
                          fontWeight: 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {song.album}
                      </p>

                      <p
                        style={{
                          width: "100px",
                          margin: "5px 0",
                          fontWeight: 400,
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <HeartOutlined
                          style={{
                            marginRight: "10px",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "#EE10B0",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              style={{
                backgroundColor: "#1E1E1E",
                width: "120px",
                borderRadius: "5px",
                height: "40px",
                fontSize: "30px",
                border: "none",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              +
              <p
                style={{
                  marginLeft: "8px",
                  fontWeight: 500,
                  fontSize: "15px",
                  color: "white",
                }}
              >
                View All
              </p>
            </button>
          </div>
        </div>
        <div>
          <p
            style={{
              fontWeight: 600,
              fontSize: 35,
              margin: "35px 10px 0px 4%",
              paddingBottom: "25px",
            }}
          >
            Popular <span style={{ color: "#cb0094" }}>Artists</span>
          </p>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                paddingRight: "40px",
                paddingLeft: "40px",
              }}
            >
              {musicData.PopularArtists.map((song, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: 10,
                    borderRadius: "10px",
                  }}
                >
                  <img
                    src={song.cover}
                    alt={song.artist}
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "70px",
                    }}
                  />
                  <p
                    style={{
                      margin: "5px 0",
                      fontWeight: 300,
                      fontSize: "18px",
                    }}
                  >
                    {song.artist}
                  </p>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#1E1E1E",
                      width: "70px",
                      height: "70px",
                      fontSize: "30px",
                      borderRadius: "50%",
                      border: "none",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                  <p
                    style={{
                      marginTop: "8px",
                      fontWeight: 500,
                      fontSize: "15px",
                      color: "white",
                    }}
                  >
                    View All
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
              Music <span style={{ color: "#cb0094" }}>Video</span>
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "60px",
                padding: "0 40px",
              }}
            >
              {musicData.MusicVideo.slice(0, 3).map((song, index) => (
                <div
                  key={index}
                  style={{
                    width: "300px",
                    backgroundColor: "#1F1F1F",
                    borderRadius: "10px",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <iframe
                    style={{ borderRadius: "7px" }}
                    width="100%"
                    height="175"
                    src={song.src}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                  <p
                    style={{
                      margin: "5px 0",
                      fontWeight: 600,
                      fontSize: "18px",
                      textAlign: "left",
                    }}
                  >
                    {song.title}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      fontWeight: 300,
                    }}
                  >
                    <p>{song.artist}</p>
                    <p>{song.views}</p>
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button
                  style={{
                    backgroundColor: "#1E1E1E",
                    width: "70px",
                    height: "70px",
                    fontSize: "30px",
                    borderRadius: "50%",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
                <p
                  style={{
                    marginTop: "8px",
                    fontWeight: 500,
                    fontSize: "15px",
                    color: "white",
                  }}
                >
                  View All
                </p>
              </div>
            </div>
          </div>

          <div>
            <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
              Top<span style={{ color: "#cb0094" }}> Albums</span>
            </p>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  paddingRight: "40px",
                  paddingLeft: "40px",
                }}
              >
                {musicData.TopAlbums.slice(0, 5).map((song, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: "center",
                      backgroundColor: "#1F1F1F",
                      padding: 10,
                      borderRadius: "10px",
                    }}
                  >
                    <img
                      src={song.cover}
                      alt={song.title}
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "10px",
                      }}
                    />
                    <p style={{ margin: "5px 0", fontWeight: 600 }}>
                      {song.title}
                    </p>
                    <p
                      style={{ margin: 0, color: "#929292", fontSize: "12px" }}
                    >
                      {song.artist}
                    </p>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: "#1E1E1E",
                        width: "70px",
                        height: "70px",
                        fontSize: "30px",
                        borderRadius: "50%",
                        border: "none",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                    <p
                      style={{
                        marginTop: "8px",
                        fontWeight: 500,
                        fontSize: "15px",
                        color: "white",
                      }}
                    >
                      View All
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
              Mood <span style={{ color: "#cb0094" }}> Playlist</span>
            </p>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  paddingRight: "40px",
                  paddingLeft: "40px",
                }}
              >
                {musicData.MoodPlaylist.map((song, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: "center",
                      backgroundColor: "#1F1F1F",
                      borderRadius: "10px",
                    }}
                  >
                    <img
                      src={song.cover}
                      alt={song.titlePlaylist}
                      style={{
                        width: "170px",
                        height: "160px",
                        borderRadius: "10px",
                      }}
                    />
                    <p
                      style={{
                        margin: "5px 0",
                        fontWeight: 600,
                        display: "flex",
                        justifyContent: "flex-start",
                        padding: " 3px",
                        paddingLeft: "8px",
                      }}
                    >
                      {song.titlePlaylist}
                    </p>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: "#1E1E1E",
                        width: "70px",
                        height: "70px",
                        fontSize: "30px",
                        borderRadius: "50%",
                        border: "none",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                    <p
                      style={{
                        marginTop: "8px",
                        fontWeight: 500,
                        fontSize: "15px",
                        color: "white",
                      }}
                    >
                      View All
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "100px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ paddingLeft: "15%" }}>
                <h1 style={{ fontSize: "40px", margin: 0 }}>
                  Join Our Platform
                </h1>
                <p
                  style={{
                    width: "380px",
                    display: "flex",
                    justifyContent: "center",
                    height: "50%",
                    fontSize: "16px",
                  }}
                >
                  You can be one of the members of our platform by just adding
                  some necessarily information. If you already have an account
                  on our website, you can just hit the Login button.
                </p>
              </div>
            </div>

            <div style={{ paddingRight: "8%" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  height: "100%",
                  backgroundColor: "#53063E",
                  marginRight: "10%",
                  borderRadius: "10px",
                  padding: "30px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex" }}>
                  {["signup", "login"].map((tab) => (
                    <div
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        cursor: "pointer",
                        padding: "10px 20px",
                        backgroundColor:
                          activeTab === tab ? "transparent" : "transparent",
                        color: activeTab === tab ? "#EE10B0" : "#FAB5E7",
                        fontWeight: 600,
                        borderRadius: "8px 8px 0 0",
                        marginRight: "10px",
                        fontSize: activeTab === tab ? "25px" : "22px",
                        borderBottom:
                          activeTab === tab
                            ? "3px solid #EE10B0"
                            : "3px solid transparent",
                      }}
                    >
                      {tab === "login" ? "Login" : "Sign Up"}
                    </div>
                  ))}
                </div>

                {activeTab === "login" ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <style>
                      {`
                                                        ::placeholder {
                                                            color: white;
                                                            font-size: 13px;
                                                            font-weight: 100;
                                                        }`}
                    </style>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginTop: "20px",
                        width: "425px",
                      }}
                    >
                      <label
                        style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}
                      >
                        Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Format: +7 (123) 456 78 99"
                        style={{
                          padding: "10px",
                          fontSize: "15px",
                          border: "3px solid #D9D9D9",
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <label
                        style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter Your Password"
                        style={{
                          padding: "10px",
                          fontSize: "15px",
                          border: "3px solid #D9D9D9",
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                      />
                    </div>
                    <button
                      style={{
                        padding: "15px",
                        fontSize: "16px",
                        backgroundColor: "#cb0094",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginTop: "20px",
                      }}
                    >
                      Login
                    </button>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          backgroundColor: "#fff",
                        }}
                      ></div>
                      <span
                        style={{
                          margin: "0 10px",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: 400,
                        }}
                      >
                        Or
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          backgroundColor: "#fff",
                        }}
                      ></div>
                    </div>
                    <button
                      style={{
                        fontSize: "16px",
                        backgroundColor: "transparent",
                        color: "white",
                        border: "3px solid #fff",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "10px 20px",
                      }}
                    >
                      <img
                        src="https://wixmp-7ef3383b5fd80a9f5a5cc686.wixmp.com/logos/google-logo.svg"
                        alt="Google"
                        style={{ width: "20px", height: "20px" }}
                      />
                      Sign Up with Google
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <style>
                      {`
                                                        ::placeholder {
                                                            color: white;
                                                            font-size: 13px;
                                                            font-weight: 100;
                                                        }`}
                    </style>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontWeight: 500,
                              fontSize: "17px",
                              margin: 0,
                            }}
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Your Name"
                            style={{
                              padding: "10px",
                              fontSize: "15px",
                              border: "3px solid #D9D9D9",
                              borderRadius: "4px",
                              backgroundColor: "transparent",
                              color: "white",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontWeight: 500,
                              fontSize: "17px",
                              margin: 0,
                            }}
                          >
                            E-Mail
                          </label>
                          <input
                            type="email"
                            placeholder="Enter Your E-Mail"
                            style={{
                              padding: "10px",
                              fontSize: "15px",
                              border: "3px solid #D9D9D9",
                              borderRadius: "4px",
                              backgroundColor: "transparent",
                              color: "white",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <label
                        style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}
                      >
                        Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Format: +7 (123) 456 78 99"
                        style={{
                          padding: "10px",
                          fontSize: "15px",
                          border: "3px solid #D9D9D9",
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <label
                        style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter Your Password"
                        style={{
                          padding: "10px",
                          fontSize: "15px",
                          border: "3px solid #D9D9D9",
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                      />
                    </div>
                    <button
                      style={{
                        padding: "15px",
                        fontSize: "16px",
                        backgroundColor: "#cb0094",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginTop: "20px",
                      }}
                    >
                      Sign Up
                    </button>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          backgroundColor: "#fff",
                        }}
                      ></div>
                      <span
                        style={{
                          margin: "0 10px",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: 400,
                        }}
                      >
                        Or
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          backgroundColor: "#fff",
                        }}
                      ></div>
                    </div>
                    <button
                      style={{
                        fontSize: "16px",
                        backgroundColor: "transparent",
                        color: "white",
                        border: "3px solid #fff",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "10px 20px",
                      }}
                    >
                      <img
                        src="https://wixmp-7ef3383b5fd80a9f5a5cc686.wixmp.com/logos/google-logo.svg"
                        alt="Google"
                        style={{ width: "20px", height: "20px" }}
                      />
                      Sign Up with Google
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* конец */}
        </div>
      </div>
    </div>
  );
}
