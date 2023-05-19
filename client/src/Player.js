import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

const Player = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [latestSong, setLatestSong] = useState(null);

  useEffect(() => {
    const fetchCurrentSong = async () => {
      const partyKeyword = localStorage.getItem('partyKeyword');
      const songsRef = collection(db, 'Parties', partyKeyword, 'searchedSongs');
      const currentSongQuery = query(
        songsRef,
        where('addedToPlaylist', '==', false),
        orderBy('priority', 'desc'),
        orderBy('timestamp', 'asc'),
        limit(1)
      );

      onSnapshot(currentSongQuery, (currentSnapshot) => {
        if (!currentSnapshot.empty) {
          const currentSongData = currentSnapshot.docs[0].data();
          setCurrentSong(currentSongData);
        } else {
          setCurrentSong(null);
        }
      });
    };

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

    fetchCurrentSong();
    fetchLatestSong();
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
        <p>No latest song available</p>
      )}
      {currentSong ? (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
          <div>
            <img
              src={currentSong.albumUrl}
              alt="Album"
              style={{ width: '50px', height: '50px', borderRadius: '10%' }}
            />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h4 style={{ fontSize: '1em', margin: 0 }}>Next In Queue:</h4>
            <h4 style={{ fontSize: '0.8em', margin: 0 }}>{currentSong.name} by {currentSong.artist}</h4>
          </div>
        </div>
      ) : (
        <p>No song currently playing</p>
      )}
    </div>
  );
};

export default Player;
