require('dotenv').config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const lyricsFinder = require("lyrics-finder")
const SpotifyWebApi = require("spotify-web-api-node")
const http = require('http');
const socketIO = require('socket.io');
 
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
 
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
 
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
 
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
 
let queue = [];
let isPlaying = false;
 
function playNextSong(spotifyApi) {
  if (queue.length === 0) {
    isPlaying = false;
    return;
  }
 
  const trackUri = queue[0];
  queue = queue.slice(1);
 
  spotifyApi.play({uris: [trackUri]})
    .then(() => {
      console.log("Playing song with URI:", trackUri);
      isPlaying = true;
 
      io.emit('playSong', trackUri);
      playNextSong(spotifyApi);
    })
    .catch(err => {
      console.log("Error playing song with URI:", trackUri);
      console.log(err);
      isPlaying = false;
      playNextSong(spotifyApi);
    });
}
 
app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000",
    clientId: "df5386eb382b4286a239d80f6b301967",
    clientSecret: "a82d98bfb8b045e797786b0b7ee6040e",
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
 
app.post("/login", (req, res) => {
  const code = req.body.code
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000",
    clientId: "df5386eb382b4286a239d80f6b301967",
    clientSecret: "a82d98bfb8b045e797786b0b7ee6040e",
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
 
app.get("/lyrics", async (req, res) => {
  const lyrics =
    (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
  res.json({ lyrics })
})
 
app.post("/queue", async (req, res) => {
  const trackUri = req.body.trackUri;
  const accessToken = req.body.accessToken;
  queue.push(trackUri);
 
  if (!isPlaying) {
    const spotifyApi = new SpotifyWebApi({
      accessToken: accessToken
    });
 
    playNextSong(spotifyApi);
  }
 
  res.sendStatus(200);
});
 
server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
 