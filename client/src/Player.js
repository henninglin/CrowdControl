import React, { useState, useEffect } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function Player({ accessToken, trackUri }) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const postTrackUri = async () => {
      try {
        await axios.post('http://localhost:3001/queue', { trackUri });
      } catch (error) {
        console.log(error);
      }
    };

    if (trackUri) {
      postTrackUri();
    }
  }, [trackUri]);

  useEffect(() => {
    socket.on('playSong', (uri) => {
      setPlay(true);
    });

    return () => {
      socket.off('playSong');
    };
  }, []);

  return (
    <div className="my-2">
      {trackUri && (
        <SpotifyPlayer
          key={trackUri}
          token={accessToken}
          showSaveIcon
          callback={(state) => {
            if (!state.isPlaying) setPlay(false);
          }}
          play={play}
          uris={[trackUri]}
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
