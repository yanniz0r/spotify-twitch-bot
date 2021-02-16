import SpotifyWebApi from "spotify-web-api-node";
import TwitchBot, { TwitchMessage } from "../twitch-bot";
import TwitchCommandHandler from "../twitch-command-handler";

class GoodSongHandler implements TwitchCommandHandler {
  constructor(private playlistId: string, private spotify: SpotifyWebApi) {}
  aliases = ['goodsong']
  command = 'gutersong'

  async handle(bot: TwitchBot, message: TwitchMessage) {
    const [currentlyPlayingTrack, playListTracks] = await Promise.all([
      this.spotify.getMyCurrentPlayingTrack(),
      this.spotify.getPlaylistTracks(this.playlistId)
    ]);
    if (currentlyPlayingTrack.body.item) {
      if (playListTracks.body.items.find(playlistTrack => playlistTrack.track.id === currentlyPlayingTrack.body.item?.id)) {
        bot.adapter.sendMessage(message.channel, `Der Song ist bereits in der Playlist. Scheinst einen guten Geschmack zu haben, ${message.user.username}`);
      } else {
        await this.spotify.addTracksToPlaylist(this.playlistId, [currentlyPlayingTrack.body.item.uri]);
        bot.adapter.sendMessage(message.channel, `Ich habe "${currentlyPlayingTrack.body.item.name}" von "${currentlyPlayingTrack.body.item.artists[0].name}" in die Favoriten gepackt. Danke für den Input, ${message.user.username}.`)
      }
    } else {
      bot.adapter.sendMessage(message.channel, 'Aktuell läuft nichts auf Spotify.')
    }
  }
}

export default GoodSongHandler;
