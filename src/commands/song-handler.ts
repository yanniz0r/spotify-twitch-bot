import type SpotifyWebApi from 'spotify-web-api-node';
import TwitchBot, { TwitchMessage } from '../twitch-bot';
import TwitchCommandHandler from '../twitch-command-handler';

class SongHandler implements TwitchCommandHandler {
  
  constructor(private spotify: SpotifyWebApi) {}

  command = 'song';

  async handle(bot: TwitchBot, message: TwitchMessage, args: string[]) {
    const response = await this.spotify.getMyCurrentPlayingTrack();
    console.log({ message, response })
    if (response.body.item) {
      bot.adapter.sendMessage(message.channel, `Jetzt gerade läuft "${response.body.item.name}" von "${response.body.item.artists[0].name}".`)
    } else {
      bot.adapter.sendMessage(message.channel, 'Aktuell läuft nichts auf Spotify.')
    }
  }

}

export default SongHandler;