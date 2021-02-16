import { Client } from 'tmi.js';
import dotenv from 'dotenv';
import spotify from './spotify';
import TwitchBot from './twitch-bot';
import TMIConnectionAdapter from './tmi-connection-adapter';
import twitch from './twitch';
import BadSongHandler from './commands/bad-song-handler';
import SongHandler from './commands/song-handler';
import GoodSongHandler from './commands/good-song-handler';
import ViewersHandler from './commands/viewers-handler';

dotenv.config();

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

const FAN_FAVES_PLAYLIST_ID = process.env.SPOTIFY_FAN_FAVES_PLAYLIST_ID as string;

bot.addCommandHandler(new SongHandler(spotify));
bot.addCommandHandler(new GoodSongHandler(FAN_FAVES_PLAYLIST_ID, spotify));
bot.addCommandHandler(new ViewersHandler(twitch));
bot.addCommandHandler(new BadSongHandler(spotify, twitch))
