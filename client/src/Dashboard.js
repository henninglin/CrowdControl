import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import TrackSearchResult from "./TrackSearchResult";
import { Container, Form, Navbar, Nav } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import LikeDislike from "./LikeDislike";
import Data from "./Data";
import Participants from "./Participants";
import History from "./History";

const spotifyApi = new SpotifyWebApi({
  clientId: " df5386eb382b4286a239d80f6b301967",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [activeTab, setActiveTab] = useState("Home");


  function chooseTrack(track) {
    console.log("Selected track: ", track);
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  useEffect(() => {
    console.log("Access token:", accessToken);
  }, [accessToken]);
  
  //Used to show lyrics from the song playing
  useEffect(() => {
    if (!playingTrack) return setLyrics("Search a song to display lyrics");
    axios
      .get("http://localhost:3001/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return console.log("No access token");
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return "No access";

    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const largestAlbumImage = track.album.images.reduce(
            (largest, image) => {
              if (image.height > largest.height) return image;
              return largest;
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: largestAlbumImage.url,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken]);

  function handleLogout() {
    localStorage.removeItem("spotify-auth")
    window.location = "/";
  }

  return (
    <div className="dashboard">
    <Container
      className="d-flex flex-column py-2 content"
      style={{ height: "100vh", maxWidth: "600px", margin: "auto", }}
    >
      <Navbar className="justify-content-between">
        <Navbar.Brand>Musicify</Navbar.Brand>
        <Nav>
          <Nav.Link active={activeTab === "Home"} onClick={() => setActiveTab("Home")}>Home</Nav.Link>
          <Nav.Link active={activeTab === "Lyrics"} onClick={() => setActiveTab("Lyrics")}>Lyrics</Nav.Link>
          <Nav.Link active={activeTab === "Data"} onClick={() => setActiveTab("Data")}>Genre</Nav.Link>
          <Nav.Link active={activeTab === "History"} onClick={() => setActiveTab("History")}>Playlist</Nav.Link>
          <Nav.Link active={activeTab === "Participants"} onClick={() => setActiveTab("Participants")}>Users</Nav.Link>
          <Nav.Link onClick={handleLogout}>Exit</Nav.Link>
        </Nav>
      </Navbar>
      <Form.Control
        type="search"
        placeholder="Search for a song..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div
        className="flex-grow-1 my-2"
        style={{ overflowY: "auto", overflowX: "hidden" }}
      >
        {searchResults.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
        {searchResults.length === 0 && (
          <>{activeTab === "Home" && (
            <div className="d-flex justify-content-center align-items-center mb-2">
              {playingTrack && (
                <div className="justify-content-center">
                  <h4 style= {{ textAlign: 'center' }}>{playingTrack.title}</h4>
                  <p className="text-muted" style= {{ textAlign: 'center' }}>{playingTrack.artist}</p>
                <div style={{ width: '180px', height: '180px', margin: '0 auto' }}>
                  <img src={playingTrack.albumUrl} alt={playingTrack.title} style={{width: "100%", height: "100%", objectFit: 'cover'}}/>
                </div>
                <LikeDislike />
                </div>
              )}
            </div>
            )}
            {activeTab === "Lyrics" && playingTrack && (
            <div className="text-center" style={{ whiteSpace: "pre" }}>
              <h4 style= {{ textAlign: 'center' }}>{playingTrack.title}</h4>
              <p className="text-muted" style= {{ textAlign: 'center' }}>{playingTrack.artist}</p>
              {lyrics}
            </div>
            )}
            {activeTab === "Data" && (
              <div className="d-flex justify-content-center align-items-center">
                <Data/>
              </div>
            )}
            {activeTab === "Participants" && (
              <div className="d-flex justify-content-center align-items-center">
                <Participants/>
              </div>
            )}
            {activeTab === "History" && (
              <div className="d-flex justify-content-center align-items-center">
                <History accessToken={accessToken}/>
              </div>
            )}
          </>
        )}
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
      
    </Container>
    </div>
  );
}
