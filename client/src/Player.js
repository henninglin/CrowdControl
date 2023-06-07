import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

const Player = () => {
  const [nextSong, setNextSong] = useState(null);
  const [latestSong, setLatestSong] = useState(null);


  //Show next song played, where addedToPlaylist is false, which means that it havent been played.
    const fetchNextSong = async () => {
      const partyKeyword = localStorage.getItem('partyKeyword');
      const songsRef = collection(db, 'Parties', partyKeyword, 'searchedSongs');
      const nextSongQuery = query(
        songsRef,
        where('addedToPlaylist', '==', false),
        orderBy('priority', 'desc'),
        orderBy('timestamp', 'asc'),
        limit(1)
      );

      onSnapshot(nextSongQuery, (nextSnapshot) => {
        if (!nextSnapshot.empty) {
          const nextSongData = nextSnapshot.docs[0].data();
          setNextSong(nextSongData);
        } else {
          setNextSong(null);
        }
      });
    };

    //Show latest song played, where addedToPlaylist is true, which means that it has been played.
    const fetchLatestSong = async () => {
      const partyKeyword = localStorage.getItem('partyKeyword');
      const songsRef = collection(db, 'Parties', partyKeyword, 'searchedSongs');
      const latestSongQuery = query(
        songsRef,
        where('addedToPlaylist', '==', true),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      onSnapshot(latestSongQuery, (latestSnapshot) => {
        if (!latestSnapshot.empty) {
          const latestSongData = latestSnapshot.docs[0].data();
          setLatestSong(latestSongData);
        } else {
          setLatestSong(null);
        }
      });
    };

    fetchNextSong();
    fetchLatestSong();

  useEffect(() => {
    fetchNextSong();
  }, []);
  

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {latestSong ? (
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <div>
            <img
              src={latestSong.albumUrl}
              alt="Album"
              style={{ width: '50px', height: '50px', borderRadius: '10%' }}
            />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h4 style={{ fontSize: '1em', margin: 0 }}>Now Playing:</h4>
            <h4 style={{ fontSize: '0.8em', margin: 0 }}>{latestSong.name} by {latestSong.artist}</h4>
          </div>
        </div>
      ) : (
        <div>
          <p>An Error has occured</p>
          <button onClick={fetchNextSong}>Retry Fetch</button>
        </div>
      )}
      {nextSong ? (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
          <div>
            <img
              src={nextSong.albumUrl}
              alt="Album"
              style={{ width: '50px', height: '50px', borderRadius: '10%' }}
            />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h4 style={{ fontSize: '1em', margin: 0 }}>Next In Queue:</h4>
            <h4 style={{ fontSize: '0.8em', margin: 0 }}>{nextSong.name} by {nextSong.artist}</h4>
          </div>
        </div>
      ) : (
        <p>No Next In Queue</p>
      )}
    </div>
  );
};

export default Player;
