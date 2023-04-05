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


  //Used to get the data from a user when clicked on History tab
  function getMyData(){
    (async () =>{
      const me = await spotifyApi.getMe();
      console.log(me.body);
      getUserPlaylists(me.body.id);
    })().catch(e=>{
      console.error(e);
    });
  }

  //Used to get the playlist from the user when clicked on the little button at history.
  async function getUserPlaylists(userName){
    const data = await spotifyApi.getUserPlaylists(userName)
    console.log("-------------------+++++++++++++")
    for(let playlist of data.body.items){
      console.log(playlist.name + " " + playlist.id)
    }
  }

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
    if (!accessToken) return;
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
    window.location = "/"
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
          <Nav.Link href="#home" active={activeTab === "Home"} onClick={() => setActiveTab("Home")}>Home</Nav.Link>
          <Nav.Link href="#lyrics" active={activeTab === "Lyrics"} onClick={() => setActiveTab("Lyrics")}>Lyrics</Nav.Link>
          <Nav.Link href="#data" active={activeTab === "Data"} onClick={() => setActiveTab("Data")}>Data</Nav.Link>
          <Nav.Link href="#history" active={activeTab === "History"} onClick={() => setActiveTab("History")}>History</Nav.Link>
          <Nav.Link href="#participants" active={activeTab === "Participants"} onClick={() => setActiveTab("Participants")}>Participants</Nav.Link>
          <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
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
                  <div className="album-image">
                    <img src={playingTrack.albumUrl} alt={playingTrack.title} style={{width: "300px", height: "300px"}}/>
                  </div>
                </div>
              )}
            </div>
            )}
            {activeTab === "Lyrics" &&(
            <div className="text-center" style={{ whiteSpace: "pre" }}>
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
                <History/>
                <button onClick={getMyData}></button>
              </div>
            )}
          </>
        )}
      </div>
      
      <div>
        <LikeDislike />
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
      
    </Container>
    </div>
  );
}
