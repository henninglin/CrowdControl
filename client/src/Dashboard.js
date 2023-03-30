import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import TrackSearchResult from "./TrackSearchResult";
import { Container, Form, Navbar, Nav } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import LikeDislike from "./LikeDislike";

const spotifyApi = new SpotifyWebApi({
  clientId: " df5386eb382b4286a239d80f6b301967",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");

  function chooseTrack(track) {
    console.log("Selected track: ", track);
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

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
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken]);

  const queueTrack = (trackUri) => {
    if (!accessToken) return;
    spotifyApi.queue(trackUri).then(
      () => {
        console.log("track added to queue");
      },
      (err) => {
        console.log("something went wrong");
      }
    );
  };

  function handleLogout() {
    localStorage.removeItem("spotify-auth")
    window.location = "/"
  }

  return (
    <div className="dashboard">
    <Container
      className="d-flex flex-column py-2 content"
      style={{ height: "100vh", maxWidth: "600px", margin: "auto"}}
    >
      <Navbar className="justify-content-between content">
        <Navbar.Brand>Musicify</Navbar.Brand>
        <Nav>
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="#lyrics">Lyrics</Nav.Link>
          <Nav.Link href="#data">Data</Nav.Link>
          <Nav.Link href="#account">Account</Nav.Link>
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
            queueTrack={queueTrack}
          />
        ))}
        {searchResults.length === 0 && (
          <>
            <div className="d-flex justify-content-center align-items-center mb-2">
              {playingTrack && (
                <div>
                  <h4>{playingTrack.title}</h4>
                  <p className="text-muted">{playingTrack.artist}</p>
                </div>
              )}
            </div>
            <div className="text-center" style={{ whiteSpace: "pre" }}>
              {lyrics}
            </div>
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
