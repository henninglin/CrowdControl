import React from "react"
import "./App.css"

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=df5386eb382b4286a239d80f6b301967&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state"

export default function Login() {
  return (
    <div>
    <div className="login">
      <h1 className="display-1 d-flex user-select-none">Dynamic Music</h1>
      <a className="btn btn-success btn-lg" href={AUTH_URL}>
        Login using Spotify
      </a>
      <div class="music">
        <span class="stroke"></span>
        <span class="stroke"></span>
        <span class="stroke"></span>
        <span class="stroke"></span>
        <span class="stroke"></span>
        <span class="stroke"></span>
        <span class="stroke"></span>
      </div>
    </div>
    </div>
  )
}