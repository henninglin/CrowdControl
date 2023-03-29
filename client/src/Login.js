import React from "react"
import { useState, useEffect } from 'react'

import "./App.css"
import SignIn from "./SignIn"
import SignUp from "./SignUp"

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=df5386eb382b4286a239d80f6b301967&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state"

export default function Login() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() =>{
    function handleKeyDown(event){
      if(event.key === "Escape"){
        setShowButton(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };

  }, []);

  return (
    <section className="h-100 gradient-form" style={{ backgroundColor: "#eee" }}>
      <div className="container py-5 h-100">
    <div className="login">
      <h1 className="display-1 d-flex user-select-none">Musicify</h1>
      {showButton && (
      <a className="btn btn-success btn-lg" href={AUTH_URL}>
        Login using Spotify
      </a>
      )}
      <div className="music">
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
      </div>
      <SignIn />
      <SignUp />
    </div>
    </div>
    </section>
  )
}