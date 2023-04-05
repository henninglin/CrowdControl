import React from 'react';
import SpotifyWebApi from "spotify-web-api-node";


const spotifyApi = new SpotifyWebApi({
    clientId: " df5386eb382b4286a239d80f6b301967",
  });

function playlist (accessToken) { spotifyApi.getUserPlaylists('1115822713')
.then(function(data) {
  console.log('Retrieved playlists', data.body);
},function(err) {
  console.log('Something went wrong!', err);
});  }

const PrevPlaylist = () => {


  // An array of prev playlists
  const playlists = [
    { name: 'Alice', date: '03-04-2023' },
    { name: 'Bob', date: '04-05-2023' },
    { name: 'Charlie', date: '04-02-2023' },
    { name: 'Dave', date: '01-03-2022' },
    { name: 'Eve', date: '08-01-2023' },  
  ];

  return (
    <div>
      <h2>Previous Playlists</h2>
      <button onClick={playlist}>click me</button>
      <ul style={{listStyleType: 'none', padding:0}}>
        {playlists.map((playlist) => (
          <li key={playlist.email}>
            {playlist.name} ({playlist.date})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrevPlaylist;
