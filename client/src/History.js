import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "./firebase"; 

const spotifyApi = new SpotifyWebApi({
  clientId: "df5386eb382b4286a239d80f6b301967",
});

const History = ({ accessToken }) => {
  const [playlists, setPlaylists] = useState([]);
  const [queuedSongs, setQueuedSongs] = useState([]);


  useEffect(() => {
    spotifyApi.setAccessToken(accessToken);

    spotifyApi
      .getUserPlaylists()
      .then((data) => {
        setPlaylists(data.body.items);
      })
      .catch((err) => {
        console.error(err);
      });

    
    const partyKeyword = localStorage.getItem('partyKeyword');
    const songsQueuedRef = collection(db, "Parties", partyKeyword, "searchedSongs");
    const q = query(songsQueuedRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSongs = [];
      snapshot.forEach((doc) => {
        fetchedSongs.push({ id: doc.id, ...doc.data() });
      });
      setQueuedSongs(fetchedSongs);
    });

    return unsubscribe;
  }, [accessToken]);

  return (
    <div>
      <h5 className="mt-3 mb-3">Current Queue:</h5>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {queuedSongs.map((song) => (
          <li key={song.id} className="mb-3">
            {song.name} by {song.artist}
          </li>
        ))}
      </ul>
      <h5 className="mt-3 mb-3">Previous Playlists</h5>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {playlists.map((playlist) => (
          <li key={playlist.id} className="mb-3">
           <a href={`https://open.spotify.com/playlist/${playlist.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-success">{playlist.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
