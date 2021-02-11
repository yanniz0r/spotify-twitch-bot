import SpotifyWebApi from "spotify-web-api-node";
import express from "express";
import dotenv from 'dotenv';
import open from "open";

dotenv.config();

const PORT = 1337;
const SCOPES = ['user-read-currently-playing', 'playlist-modify-public', 'user-modify-playback-state']

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
      console.error("Could not authorize code grant", error);
    }
    const accessToken = spotifyResponse.body.access_token
    spotify.setAccessToken(accessToken);
    response.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Eingerichtet</title>
          <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="max-w-screen-md mx-auto py-10">
            <h1 class="text-5xl text-center font-bold">Spotify wurde eingerichtet!</h1>
            <p class="text-center text-xl mt-4 text-gray-500">Deine Zuschauer:innen können nun mit deiner Musik interagieren 🥰</p>
            <p class="text-center text-green-500 mt-4">Du kannst dieses Fenster nun schließen</p>
            <h2 class="mt-4 text-center text-gray-500">Probier doch mal die folgenden Commands aus:</h2>
            <div class="flex justify-center mt-4">
              <span class="inline-block bg-blue-100 mx-1 p-1 rounded-lg text-blue-700">!spotify</span>
              <span class="inline-block bg-blue-100 mx-1 p-1 rounded-lg text-blue-700">!song</span>
              <span class="inline-block bg-blue-100 mx-1 p-1 rounded-lg text-blue-700">!gutersong</span>
              <span class="inline-block bg-blue-100 mx-1 p-1 rounded-lg text-blue-700">!schlechtersong</span>
            </div>
          </div>
        </body>
      </html>
    `);
  })
})

app.get('/spotify-login', (request, response) => {
  const authorizeUrl = spotify.createAuthorizeURL(SCOPES, '');
  response.redirect(authorizeUrl);
})

app.listen(PORT, () => {
  console.log(`Spotify auth server running on port ${PORT}.`);
  open(`http://localhost:${PORT}/spotify-login`)
})

export default spotify;
