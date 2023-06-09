require('dotenv').config() // Library to load environment variables from a .env file
const express = require("express") // Web app framework for Node.js
const cors = require("cors") // Library to handle Cross-Origin Resource Sharing
const bodyParser = require("body-parser") // Library to parse request body as JSON
const lyricsFinder = require("lyrics-finder") // Library to find lyrics based on artist and track name
const SpotifyWebApi = require("spotify-web-api-node") // Wrapper Library for Spotify API
const path = require('path');

const app = express() // Create an instance of the Express application
app.use(cors()) // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()) // Parse request bodies as JSON
app.use(bodyParser.urlencoded({ extended: true })) // Parse URL-encoded request bodies
app.use(express.static(path.join(__dirname + "/public"))) // Serve static files from the "public" directory

const PORT = process.env.PORT || 3001; // Set the port for the server to listen on

// Endpoint for refreshing the access token
app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI || "http://localhost:3000",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  })

  spotifyApi
    .refreshAccessToken()
    console.log('Data from refreshAccessToken:', data)
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      })
    })
    .catch(err => {
      console.log('Error from refreshAccessToken:', err);
      res.sendStatus(400)
    })
})

// Endpoint for the initial login/authentication
app.post("/login", (req, res) => {
  const code = req.body.code
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI || "http://localhost:3000",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  })

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      console.log('Data from authorizationCodeGrant:', data);
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      })
    })
    .catch(err => {
      console.log('Error from authorizationCodeGrant:', err);
      res.sendStatus(400)
    })
})

// Endpoint for retrieving song lyrics
app.get("/lyrics", async (req, res) => {
  const lyrics =
    (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
  res.json({ lyrics })
})

app.listen(PORT) // Start the server and listen on the specified port
