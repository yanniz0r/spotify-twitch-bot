import { Client } from 'tmi.js';
import dotenv from 'dotenv';
import spotify from './spotify';
import twitch from './twitch';

dotenv.config();

const FAN_FAVES_PLAYLIST_ID = process.env.SPOTIFY_FAN_FAVES_PLAYLIST_ID as string;

const client = new Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_SECRET,
  },
  channels: [
    process.env.TWITCH_CHANNEL as string,
  ]
});

client.connect();

let badSongId: string;
let badSongVote = new Set<string>();

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
  if (message.toLowerCase() === '!viewers') {
    const user = await twitch.kraken.users.getUserByName("yanniz0r");
    const [stream] = await Promise.all([
      user?.getStream(),
    ]);
    client.say(channel, `Aktuell hat der Stream ${stream?.viewers} Zuschauer`);
  }
  if (message.toLowerCase() === '!schlechtersong') {
    const user = await twitch.kraken.users.getUserByName("yanniz0r");
    const [stream, track] = await Promise.all([
      user?.getStream(),
      spotify.getMyCurrentPlayingTrack()
    ]);
    if (!stream) {
      return;
    }
    const necessaryVotes = Math.ceil(stream.viewers / 2);
    if (!track.body.item) {
      client.say(channel, 'Aktuell läuft keine Musik.');
      return;
    }
    if (track.body.item.id !== badSongId) {
      badSongVote.clear();
      badSongId = track.body.item?.id;
    }
    badSongVote.add(tags.username!);
    if (badSongVote.size >= necessaryVotes) {
      await spotify.skipToNext();
      badSongVote.clear();
      client.say(channel, 'Ist ja gut. Der Song wurde geskipped.')
    } else {
      client.say(channel, `${badSongVote.size === 1 ? 'Ein:e Viewer:in findet' : `${badSongVote.size} Viewer:innen finden den`} aktuellen Song schlecht. Schreibe !schlechtersong in den Chat wenn du das auch so siehst. Bei ${necessaryVotes} Hatern skippen wir den Song.`)
    }
  }
  if (message.toLowerCase() === '!spotify') {
    client.say(tags.username!, 'Um die Songs zu Steuern, kannst du die folgenden Commands verwenden: !song (Nennt dir den Namen vom aktuell laufenden Song), !gutersong (Du packst den Song in die Playlist und hörst ihn wieder wenn du treu bist <3), !schlechter (Du votest für einen Skip)')
  }
})