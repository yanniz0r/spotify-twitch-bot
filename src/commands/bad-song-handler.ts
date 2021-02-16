import SpotifyWebApi from 'spotify-web-api-node';
import { ApiClient } from 'twitch/lib';
import TwitchBot, { TwitchMessage } from '../twitch-bot';
import TwitchCommandHandler from '../twitch-command-handler';

class BadSongHandler implements TwitchCommandHandler  {

  constructor(
    private spotify: SpotifyWebApi,
    private twitch: ApiClient,
  ) {}

  public command = 'schlechtersong';

  private badSongId?: string;
  private badSongVote = new Set<string>();

  async handle(bot: TwitchBot, message: TwitchMessage) {
    const user = await this.twitch.kraken.users.getUserByName("yanniz0r");
    const [stream, track] = await Promise.all([
      user?.getStream(),
      this.spotify.getMyCurrentPlayingTrack()
    ]);
    if (!stream) {
      return;
    }
    const necessaryVotes = Math.ceil(stream.viewers / 2);
    if (!track.body.item) {
      bot.adapter.sendMessage(message.channel, 'Aktuell läuft keine Musik.');
      return;
    }
    if (track.body.item.id !== this.badSongId) {
      this.badSongVote.clear();
      this.badSongId = track.body.item?.id;
    }
    this.badSongVote.add(message.user.username);
    if (this.badSongVote.size >= necessaryVotes) {
      await this.spotify.skipToNext();
      this.badSongVote.clear();
      bot.adapter.sendMessage(message.channel, 'Ist ja gut. Der Song wurde geskipped.')
    } else {
      bot.adapter.sendMessage(message.channel, `${this.badSongVote.size === 1 ? 'Ein:e Viewer:in findet' : `${this.badSongVote.size} Viewer:innen finden den`} aktuellen Song schlecht. Schreibe !schlechtersong in den Chat wenn du das auch so siehst. Bei ${necessaryVotes} Hatern skippen wir den Song.`)
    }
  }
}

export default BadSongHandler;
