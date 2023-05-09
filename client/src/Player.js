import React, { useState, useEffect } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';

export default function Player({ accessToken }) {
  const [trackUri, setTrackUri] = useState(null);

  async function getCurrentlyPlayingTrack(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    return data.item;
  }

  useEffect(() => {
    const fetchCurrentlyPlayingTrack = async () => {
      const currentlyPlayingTrack = await getCurrentlyPlayingTrack(accessToken);
      if (currentlyPlayingTrack) {
        setTrackUri(currentlyPlayingTrack.uri);
      }
    };

    const intervalId = setInterval(fetchCurrentlyPlayingTrack, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [accessToken]);

  return (
    <div className="my-2">
      {trackUri && (
        <SpotifyPlayer
          key={trackUri}
          token={accessToken}
          showSaveIcon
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
