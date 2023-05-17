import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import TrackSearchResult from "./TrackSearchResult";
import { Container, Form, Navbar, Nav, Carousel } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import LikeDislike from "./LikeDislike";
import Data from "./Data";
import Participants from "./Participants";
import History from "./History";
import {auth, db} from "./firebase";
import Level from "./Level";
import Leaderboard from "./Leaderboard"
import { addDoc, collection, serverTimestamp, updateDoc, limit, orderBy, query, onSnapshot, getDocs, where, doc, getDoc, deleteDoc } from "firebase/firestore"; 

const spotifyApi = new SpotifyWebApi({
  clientId: "df5386eb382b4286a239d80f6b301967",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [queuedSongs, setQueuedSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);

  function chooseTrack(track) {

    console.log("Selected track: ", track);
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");

    const partyKeyword = localStorage.getItem("partyKeyword");
    const userId = auth.currentUser;
    
    //Add track to firebase
    async function addTrackToFirestore() {
      try {
        const trackDetails = await spotifyApi.getTrack(track.uri.split(":")[2]);
        const artistId = trackDetails.body.artists[0].id;

        const genres = await getArtistGenres(artistId);

        const partySongsRef = collection(db, "Parties", partyKeyword, "searchedSongs");

        const q = query(collection(db, "Parties", partyKeyword, "searchedSongs"), where("uri", "==", track.uri));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          console.log("Track already in queue");
          alert("Song already in queue");
          return;
        }

        const songDuration = trackDetails.body.duration_ms / 1000;
  
        const docRef = await addDoc(partySongsRef, {
          name: track.title,
          artist: track.artist,
          uri: track.uri,
          albumUrl: track.albumUrl,
          user: userId.displayName,
          timestamp: serverTimestamp(),
          genre: genres,
          score: 0,
          priority: 0,
          duration: songDuration
        });
        
        console.log("Document written with ID: ", docRef.id);
        console.log("Added song to database: ", track.title);

        return docRef.id;
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    
    addTrackToFirestore().then(async(songId)=>{
      setSelectedSongId(songId);
      console.log(songId);

      // Fetch the playlistId from Firebase and call addTrackToPlaylist()
      const partyKeyword = localStorage.getItem("partyKeyword");
      const playlistId = await fetchPlaylistId(partyKeyword);

      if(playlistId){
        const partySongsRef = collection(db, "Parties", partyKeyword, "searchedSongs");
        const songQuery = query(partySongsRef, where("addedToPlaylist", "==", false), orderBy("timestamp", "asc"), limit(1));
        const songSnap = await getDocs(songQuery);

        if (!songSnap.empty) {
          const oldestSong = songSnap.docs[0];
          // Add the song with the oldest timestamp to the Spotify playlist
          addTrackToPlaylist(playlistId, oldestSong.data().uri);
    
          // Update the song in Firestore to mark it as added to the playlist
          await updateDoc(doc(partySongsRef, oldestSong.id), {
            addedToPlaylist: true
          });
        } else {
          console.error("Could not fetch song with the oldest timestamp");
        }

      } else {
        console.error("Could not fetch playlistId");
      }
    });
  }

  //Get genres from track
  async function getArtistGenres(artistId) {
    try {
      const artistDetails = await spotifyApi.getArtist(artistId);
      return artistDetails.body.genres;
    } catch (error) {
      console.error("Error fetching artist genres:", error);
      return [];
    }
  }

  //Create playlist in Spotify
  async function createPlaylist(accessToken) {
    spotifyApi.setAccessToken(accessToken);
    const partyKeyword = localStorage.getItem("partyKeyword");
    console.log("Party keyword:", partyKeyword);
    const partyDocRef = doc(db, "Parties", partyKeyword);
    const docSnapshot = await getDoc(partyDocRef);
    console.log("Document snapshot:", docSnapshot);

    if (!docSnapshot.exists || !docSnapshot.data().playlist) {

      //Get party details from firebase
      const partyData = docSnapshot.data()
      const partyName = partyData.name;
      const partyDate = partyData.date;

      // Create the playlist
      const playlistName = `${partyName} - ${partyDate}`;
      const playlistData = await spotifyApi.createPlaylist(playlistName, { 'public': true, 'collaborative': true })
      const playlistId = playlistData.body.id;

      // Update the Firebase document with the new playlist field
      await updateDoc(partyDocRef, { playlist: playlistId })
      .then(() => {
        console.log("Document updated successfully");
      })
      .catch((error) =>{
        console.error("Error updating document: ", error);
      });

      console.log("Playlist created in firebase and spotify", playlistId);
      return playlistId;

    } else {
      console.log("Playlist for the party already exists");
      console.log("Playlist data:", docSnapshot.data());
      return docSnapshot.data().playlist;
    }
  }

  //Add song to Spotify
  async function addTrackToPlaylist(playlistId, trackUri) {
    try {
      const response = await spotifyApi.addTracksToPlaylist(playlistId, [trackUri]);
      console.log("Song added to spotify: ", response);
    } catch (err) {
      console.error(err);
    }
  }

  //Fetch playlist variable from firebase
  async function fetchPlaylistId(partyKeyword) {
    try {
      const partyDocRef = doc(db, "Parties", partyKeyword);
      const docSnapshot = await getDoc(partyDocRef);
  
      if (docSnapshot.exists()) {
        const playlistId = docSnapshot.data().playlist;
        return playlistId;
      } else {
        console.error("Party document does not exist");
      }
    } catch (err) {
      console.error("Error fetching playlistId: ", err);
    }
  }

  async function deleteSong(songId) {
    const partyKeyword = localStorage.getItem("partyKeyword");
    const songRef = doc(db, "Parties", partyKeyword, "searchedSongs", songId);
  
    try {
      await deleteDoc(songRef);
      console.log(`Deleted song with id: ${songId}`);
    } catch (error) {
      console.error(`Error deleting song: ${error}`);
    }
  }

  useEffect(() => {
    if(accessToken){
      console.log("Creating playlist");
      createPlaylist();
    }
  }, [accessToken]);

  useEffect(() => {
    console.log("Access token:", accessToken);
  }, [accessToken]);

  //Show queued songs as a carousel.
  useEffect(() => {
    const partyKeyword = localStorage.getItem("partyKeyword");
  
    if (partyKeyword) {
      const partySongsRef = collection(db, "Parties", partyKeyword, "searchedSongs");
  
      const unsub = onSnapshot(
        query(partySongsRef, orderBy("timestamp", "asc")),
        (snapshot) => {
          const queuedSongsData = [];
          snapshot.forEach((doc) => {
            queuedSongsData.push({ id: doc.id, ...doc.data() });
          });
          setQueuedSongs(queuedSongsData);
          console.log("All fetched songs: ", queuedSongsData);
        },
        (error) => console.error("Error fetching queued songs: ", error)
      );
       
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    // Execute the function immediately upon mounting
    autoAdd();
  
    // Then set it to execute every minute
    const intervalId = setInterval(() => {
      autoAdd();
    }, 60 * 1000); // every minute in milliseconds
  
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  async function autoAdd() {
    // Fetch the playlistId from Firebase and call addTrackToPlaylist()
    const partyKeyword = localStorage.getItem("partyKeyword");
    const playlistId = await fetchPlaylistId(partyKeyword);
  
    if(playlistId){
      const partySongsRef = collection(db, "Parties", partyKeyword, "searchedSongs");
      const songQuery = query(partySongsRef, where("addedToPlaylist", "==", false), orderBy("timestamp", "asc"), limit(1));
      const songSnap = await getDocs(songQuery);
  
      if (!songSnap.empty) {
        const oldestSong = songSnap.docs[0];
        // Add the song with the oldest timestamp to the Spotify playlist
        addTrackToPlaylist(playlistId, oldestSong.data().uri);
    
        // Update the song in Firestore to mark it as added to the playlist
        await updateDoc(doc(partySongsRef, oldestSong.id), {
          addedToPlaylist: true
        });
      } else {
        console.error("Could not fetch song with the oldest timestamp");
      }
  
    } else {
      console.error("Could not fetch playlistId");
    }
  }
  
  //Used to show lyrics from the song playing
  useEffect(() => {
    if (!playingTrack) return setLyrics("Search a song to display lyrics");
    axios
      .get("https://musicify-lin.herokuapp.com/lyrics", {
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
  
  //Search result, show title, image, artist.
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

  //Logout of the app
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
          <Nav.Link active={activeTab === "Data"} onClick={() => setActiveTab("Data")}>Data</Nav.Link>
          <Nav.Link active={activeTab === "Leaderboard"} onClick={() => setActiveTab("Leaderboard")}>Rank</Nav.Link>
          <Nav.Link active={activeTab === "Playlist"} onClick={() => setActiveTab("Playlist")}>Playlist</Nav.Link>
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
              {queuedSongs.length ? (
                <Carousel indicators={false} variant="dark">
                 {queuedSongs.map((song, idx) => (
                  <Carousel.Item key={idx}>
                    <div className="d-flex justify-content-center align-items-center mb-2">
                      <div className="justify-content-center">
                        <h4 style={{ textAlign: 'center' }}>{song.name}</h4>
                        <p className="text-muted" style={{ textAlign: 'center' }}>{song.artist}</p>
                        <div style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                          <img
                            src={song.albumUrl}
                            alt={song.name}
                            style={{ width: "100%", height: "100%", objectFit: 'cover' }}
                          />
                        </div>
                        <LikeDislike songId={song.id}/>
                      </div>
                    </div>
                  </Carousel.Item>
                ))}
                </Carousel>
              ) : (
                <p>No songs queued yet</p>
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
            {activeTab === "Leaderboard" && (
              <div className="d-flex justify-content-center align-items-center">
                <Leaderboard/>
              </div>
            )}
            {activeTab === "Participants" && (
              <div className="d-flex justify-content-center align-items-center">
                <Participants/>
              </div>
            )}
            {activeTab === "Playlist" && (
              <div className="d-flex justify-content-center align-items-center">
                <History accessToken={accessToken}/>
              </div>
            )}
          </>
        )}
      </div>
      <div className="justify-content-center align-items-center mb-2">
        <Level/>
      </div>
      <div>
        {/*<Player accessToken={accessToken}/>*/}
      </div>
      
    </Container>
    </div>
  );
}
