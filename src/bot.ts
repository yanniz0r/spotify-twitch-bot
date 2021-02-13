import { Client } from 'tmi.js';
import dotenv from 'dotenv';
import spotify from './spotify';
import TwitchBot from './twitch-bot';
import TMIConnectionAdapter from './tmi-connection-adapter';
import twitch from './twitch';
import BadSongHandler from './commands/bad-song-handler';

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

bot.addCommandHandler(new BadSongHandler())
