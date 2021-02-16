import SpotifyWebApi from "spotify-web-api-node";
import TwitchBot, { TwitchUser } from "../twitch-bot";
import TwitchConnectionAdapter from "../twitch-connection-adapter";
import GoodSongHandler from "./good-song-handler";

jest.mock("spotify-web-api-node");

const whatDoesTheFoxSay = {
  id: "tfwdtfs",
  uri: "tfwdtfs",
  name: "The Fox (What Does the Fox Say?)",
  artists: [
    {
      name: "Ylvis",
    },
  ],
}

describe('GoodSongHandler', () => {

  let handler: GoodSongHandler;
  let spotify: SpotifyWebApi;
  let bot: TwitchBot;
  let adapter: TwitchConnectionAdapter;
  let user: TwitchUser = {
    username: "yanniz0r",
  };

  beforeEach(() => {
    adapter = {
      register: jest.fn(),
      sendMessage: jest.fn(),
    };
    bot = new TwitchBot(adapter);
    spotify = new SpotifyWebApi();
    handler = new GoodSongHandler('test-playlist-id', spotify);
  });

  it ('sends a corresponding message when no track is running', async () => {
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: null
      },
    });
    spotify.getPlaylistTracks = jest.fn().mockReturnValue({
      body: {
        items: []
      },
    });
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    expect(spotify.addTracksToPlaylist).toMatchSnapshot();
  })

  it ('adds a new song to the playlist and sends corresponding message', async () => {
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: whatDoesTheFoxSay
      },
    });
    spotify.getPlaylistTracks = jest.fn().mockReturnValue({
      body: {
        items: []
      },
    });
    spotify.addTracksToPlaylist = jest.fn();
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    expect(spotify.addTracksToPlaylist).toMatchSnapshot();
  })

  it ('does not add duplicates and sends corresponding message', async () => {
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: whatDoesTheFoxSay
      },
    });
    spotify.getPlaylistTracks = jest.fn().mockReturnValue({
      body: {
        items: [{
          track: whatDoesTheFoxSay
        }]
      },
    });
    spotify.addTracksToPlaylist = jest.fn();
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    expect(spotify.addTracksToPlaylist).not.toBeCalled();
    expect(spotify.addTracksToPlaylist).toMatchSnapshot();
  })

})