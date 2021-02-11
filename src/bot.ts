import { Client } from 'tmi.js';
import dotenv from 'dotenv';
import spotify from './spotify';

dotenv.config();

const FAN_FAVES_PLAYLIST_ID = "49RivMoJZhGLlTz3QiEzBo";

const client = new Client({
  identity: {
    username: 'yannib0t',
    password: process.env.TWITCH_SECRET,
  },
  channels: [
    'yanniz0r'
  ]
});

client.connect();

client.on('message', (channel, tags, message, _self) => {
  if (message.toLowerCase() === '!song') {
    spotify.getMyCurrentPlayingTrack()
      .then((response) => {
        if (response.body.item) {
          client.say(channel, `Jetzt gerade läuft "${response.body.item.name}" von "${response.body.item.artists[0].name}".`)
        } else {
          client.say(channel, 'Aktuell läuft nichts auf Spotify.')
        }
      });
  }
  if (message.toLowerCase() === '!gutersong') {
    spotify.getMyCurrentPlayingTrack()
      .then(async (response) => {
        if (response.body.item) {
          await spotify.addTracksToPlaylist(FAN_FAVES_PLAYLIST_ID, [response.body.item.uri]);
          client.say(channel, `Ich habe "${response.body.item.name}" von "${response.body.item.artists[0].name}" in die Favoriten gepackt. Danke für den Input, ${tags.username}.`)
        } else {
          client.say(channel, 'Aktuell läuft nichts auf Spotify.')
        }
      });
  }
})