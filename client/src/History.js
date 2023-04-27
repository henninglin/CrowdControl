import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: "df5386eb382b4286a239d80f6b301967",
});

const History = ({ accessToken }) => {
  const [playlists, setPlaylists] = useState([]);

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
  }, [accessToken]);

  return (
    <div>
      <h5 className="mt-2">Playlist History</h5>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {playlists.map((playlist) => (
          <li key={playlist.id} className="mb-2">
           <a href={`https://open.spotify.com/playlist/${playlist.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-success">{playlist.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
