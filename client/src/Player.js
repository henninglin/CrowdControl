import React, { useState, useEffect } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';
import { db } from './firebase';
import { query, orderBy, limit, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Player({ accessToken }) {
  const [play, setPlay] = useState(true);
  const [trackUri, setTrackUri] = useState(null);
  const [currentSongId, setCurrentSongId] = useState(null);

  const partyKeyword = localStorage.getItem("partyKeyword");

  useEffect(() => {
    const fetchSongs = async () => {
      const songsRef = collection(db, 'Parties', partyKeyword, 'searchedSongs');
      const songsQuery = query(songsRef, orderBy('timestamp'), limit(1));
      const songsSnapshot = await getDocs(songsQuery);
  
      if (!songsSnapshot.empty) {
        const oldestSong = songsSnapshot.docs[0];
        const songData = oldestSong.data();
        setTrackUri(songData.uri);
        setPlay(true);
        setCurrentSongId(oldestSong.id);  // Set the song id in state
      } else {
        setTrackUri(null);
      }
    };
  
    if (partyKeyword) {
      fetchSongs();
    }
  }, [partyKeyword, trackUri]);  // Add trackUri to dependency array

  const deleteSong = async () => {
    // Delete the song after it has been played
    const songDoc = doc(db, 'Parties', partyKeyword, 'searchedSongs', currentSongId);
    await deleteDoc(songDoc);
    console.log("Deleted song from Firebase");
  }

  const handlePlaybackStateChange = (state) => {
    // When the player state changes, check if it's no longer playing
    if (!state.isPlaying) {
      setPlay(false);

      // If the song has ended (i.e., position is approximately equal to duration), 
      // delete the song and set trackUri to null to fetch a new song
      if (state.position >= state.duration - 1) {
        console.log("Finish song");
        deleteSong();
        setTrackUri(null);
      }
    }
    // If the current track URI is different from the track URI in the state, update the state
    else if (state.track.uri !== trackUri) {
      setTrackUri(state.track.uri);
    }
  };

  return (
    <div className="my-2">
      {trackUri && (
        <SpotifyPlayer
          key={trackUri}
          token={accessToken}
          showSaveIcon
          callback={handlePlaybackStateChange}
          play={play}
          uris={trackUri ? [trackUri] : []}
          styles={{
            activeColor: '#fff',
            bgColor: '#333',
            color: '#fff',
            loaderColor: '#fff',
            sliderColor: '#1cb954',
            trackArtistColor: '#ccc',
            trackNameColor: '#fff',
          }}
        />
      )}
      {!trackUri && <div>No song selected</div>}
    </div>
  );
}
