import SongHandler from "./song-handler";
import SpotifyWebApi from "spotify-web-api-node";
import TwitchBot, { TwitchUser } from "../twitch-bot";
import TwitchConnectionAdapter from "../twitch-connection-adapter";

jest.mock("spotify-web-api-node");

describe("SongHandler", () => {
  let handler: SongHandler;
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
    handler = new SongHandler(spotify);
  });

  it("sends a corresponding message when a track is playing", async () => {
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: {
          name: "The Fox (What Does the Fox Say?)",
          artists: [
            {
              name: "Ylvis",
            },
          ],
        },
      },
    });
    await handler.handle(
      bot,
      {
        channel: "#test",
        text: "!song",
        user,
      },
      []
    );
    expect(adapter.sendMessage).toMatchSnapshot();
  });

  it("sends a corresponding message when no track is playing", async () => {
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: null
      },
    });
    await handler.handle(
      bot,
      {
        channel: "#test",
        text: "!song",
        user,
      },
      []
    );
    expect(adapter.sendMessage).toMatchSnapshot();
  });
});
