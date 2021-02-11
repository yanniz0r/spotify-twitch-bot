import SpotifyWebApi from "spotify-web-api-node";
import express from "express";
import dotenv from 'dotenv';
import open from "open";

dotenv.config();

const PORT = 1337;
const SCOPES = ['user-read-currently-playing', 'playlist-modify-public']

const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `http://localhost:${PORT}/spotify-redirect`
})

const app = express();

app.use('/spotify-redirect', (request, response) => {
  const code = request.query.code as string;
  spotify.authorizationCodeGrant(code, (error, spotifyResponse) => {
    if (error) {
      console.error(error);
    }
    const accessToken = spotifyResponse.body.access_token
    spotify.setAccessToken(accessToken);
    response.sendStatus(200);
  })
})

app.get('/spotify-login', (request, response) => {
  const authorizeUrl = spotify.createAuthorizeURL(SCOPES, '');
  response.redirect(authorizeUrl);
})

app.listen(PORT, () => {
  console.log(`Spotify auth server running on port ${PORT}.`);
  open(`http://localhost:1337/spotify-login`)
})

export default spotify;
