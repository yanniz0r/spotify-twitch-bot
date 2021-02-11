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

client.on('message', async (channel, tags, message, _self) => {
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
    const [currentlyPlayingTrack, playListTracks] = await Promise.all([
      spotify.getMyCurrentPlayingTrack(),
      spotify.getPlaylistTracks(FAN_FAVES_PLAYLIST_ID)
    ]);
    if (currentlyPlayingTrack.body.item) {
      if (playListTracks.body.items.find(playlistTrack => playlistTrack.track.id === currentlyPlayingTrack.body.item?.id)) {
        client.say(channel, `Der Song ist bereits in der Playlist. Scheinst einen guten Geschmack zu haben, ${tags.username}`);
      } else {
        await spotify.addTracksToPlaylist(FAN_FAVES_PLAYLIST_ID, [currentlyPlayingTrack.body.item.uri]);
        client.say(channel, `Ich habe "${currentlyPlayingTrack.body.item.name}" von "${currentlyPlayingTrack.body.item.artists[0].name}" in die Favoriten gepackt. Danke für den Input, ${tags.username}.`)
      }
    } else {
      client.say(channel, 'Aktuell läuft nichts auf Spotify.')
    }
  }
})