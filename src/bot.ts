import { Client } from 'tmi.js';
import dotenv from 'dotenv';
import spotify from './spotify';
import twitch from './twitch';
import TwitchBot from './twitch-bot';
import TMIConnectionAdapter from './tmi-connection-adapter';

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

const tmiAdapter = new TMIConnectionAdapter(client);
const bot = new TwitchBot(tmiAdapter);

bot.addCommandHandler({
  command: 'song',
  async handle(bot, message) {
    const response = await spotify.getMyCurrentPlayingTrack();
    console.log({ message, response })
    if (response.body.item) {
      bot.adapter.sendMessage(message.channel, `Jetzt gerade läuft "${response.body.item.name}" von "${response.body.item.artists[0].name}".`)
    } else {
      bot.adapter.sendMessage(message.channel, 'Aktuell läuft nichts auf Spotify.')
    }
  }
})

bot.addCommandHandler({
  command: 'gutersong',
  async handle(bot, message) {
    const [currentlyPlayingTrack, playListTracks] = await Promise.all([
      spotify.getMyCurrentPlayingTrack(),
      spotify.getPlaylistTracks(FAN_FAVES_PLAYLIST_ID)
    ]);
    if (currentlyPlayingTrack.body.item) {
      if (playListTracks.body.items.find(playlistTrack => playlistTrack.track.id === currentlyPlayingTrack.body.item?.id)) {
        bot.adapter.sendMessage(message.channel, `Der Song ist bereits in der Playlist. Scheinst einen guten Geschmack zu haben, ${message.user.username}`);
      } else {
        await spotify.addTracksToPlaylist(FAN_FAVES_PLAYLIST_ID, [currentlyPlayingTrack.body.item.uri]);
        bot.adapter.sendMessage(message.channel, `Ich habe "${currentlyPlayingTrack.body.item.name}" von "${currentlyPlayingTrack.body.item.artists[0].name}" in die Favoriten gepackt. Danke für den Input, ${message.user.username}.`)
      }
    } else {
      bot.adapter.sendMessage(message.channel, 'Aktuell läuft nichts auf Spotify.')
    }
  }
})


bot.addCommandHandler({
  command: 'viewers',
  async handle(bot, message) {
    const user = await twitch.kraken.users.getUserByName("yanniz0r");
    const [stream] = await Promise.all([
      user?.getStream(),
    ]);
    bot.adapter.sendMessage(message.channel, `Aktuell hat der Stream ${stream?.viewers} Zuschauer`);
  }
})

let badSongId: string;
let badSongVote = new Set<string>();
bot.addCommandHandler({
  command: 'schlechtersong',
  async handle(bot, message) {
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
      bot.adapter.sendMessage(message.channel, 'Aktuell läuft keine Musik.');
      return;
    }
    if (track.body.item.id !== badSongId) {
      badSongVote.clear();
      badSongId = track.body.item?.id;
    }
    badSongVote.add(message.user.username);
    if (badSongVote.size >= necessaryVotes) {
      await spotify.skipToNext();
      badSongVote.clear();
      bot.adapter.sendMessage(message.channel, 'Ist ja gut. Der Song wurde geskipped.')
    } else {
      bot.adapter.sendMessage(message.channel, `${badSongVote.size === 1 ? 'Ein:e Viewer:in findet' : `${badSongVote.size} Viewer:innen finden den`} aktuellen Song schlecht. Schreibe !schlechtersong in den Chat wenn du das auch so siehst. Bei ${necessaryVotes} Hatern skippen wir den Song.`)
    }
  }
})
