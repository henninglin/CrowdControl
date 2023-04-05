import React, { useState, useEffect } from 'react'
import SpotifyPlayer from "react-spotify-web-playback"

export default function Player({ accessToken, trackUri }) {
    const [play, setPlay] = useState(false);
  
    useEffect(() => {
      setPlay(true);
    }, [trackUri]);

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
              activeColor: "#fff",
              bgColor: "#333",
              color: "#fff",
              loaderColor: "#fff",
              sliderColor: "#1cb954",
              trackArtistColor: "#ccc",
              trackNameColor: "#fff",
            }}
          />
        )}
        {!trackUri && <div>No song selected</div>}
      </div>
    );
  }