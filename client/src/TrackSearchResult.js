import React from "react"


//Show results from Spotify when searched
export default function TrackSearchResult({ track, chooseTrack }) {
  function handlePlay() {
    console.log(`Playing ${track.title} by ${track.artist} (${track.genre})`);
    chooseTrack(track)
    
  }
  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer" }}
      onClick={handlePlay}
    >
      <img src={track.albumUrl} style={{ height: "64px", width: "64px" }} alt="albumImage" />
      <div className="ml-3 p-2">
        <div>{track.title}</div>
        <div className="text-muted">{track.artist}</div>
      </div>
    </div>
  )
}