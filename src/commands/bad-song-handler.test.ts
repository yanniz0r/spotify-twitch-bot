import SpotifyWebApi from "spotify-web-api-node";
import { ApiClient } from "twitch/lib";
import TwitchBot, { TwitchUser } from "../twitch-bot";
import TwitchConnectionAdapter from "../twitch-connection-adapter";
import BadSongHandler from "./bad-song-handler";

jest.mock("spotify-web-api-node");
jest.mock("twitch");

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
const theOcean = {
  id: "thcn",
  uri: "thcn",
  name: "The Ocean (feat. Shy Martin)",
  artists: [
    {
      name: "Mike Perry",
    },
  ],
}


const user: TwitchUser = {
  username: "yanniz0r",
};

const anotherUser: TwitchUser = {
  username: "luckybulgur",
};



describe('BadSongHandler', () => {

  let handler: BadSongHandler;
  let spotify: SpotifyWebApi;
  let bot: TwitchBot;
  let adapter: TwitchConnectionAdapter;
  let twitch: ApiClient;

  beforeEach(() => {
    adapter = {
      register: jest.fn(),
      sendMessage: jest.fn(),
    };
    bot = new TwitchBot(adapter);
    spotify = new SpotifyWebApi();
    twitch = new ApiClient({});
    (twitch as any).kraken = {
      users: {
        getUserByName: jest.fn()
      }
    }
    handler = new BadSongHandler(spotify, twitch);
  });

  // it ('sends a corresponding message when no track is running', async () => {
  //   spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
  //     body: {
  //       item: null
  //     },
  //   });
  //   spotify.getPlaylistTracks = jest.fn().mockReturnValue({
  //     body: {
  //       items: []
  //     },
  //   });
  //   await handler.handle(bot, {
  //     channel: '#test',
  //     text: '!gutersong',
  //     user,
  //   })
  //   expect(spotify.addTracksToPlaylist).toMatchSnapshot();
  // })

  it ('skips song when more than half of the attending people dislike it', async () => {
    twitch.kraken.users.getUserByName = jest.fn().mockReturnValue({
      getStream: jest.fn().mockReturnValue({
        viewers: 3
      })
    });
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: whatDoesTheFoxSay,
      },
    });
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user: anotherUser,
    })
    expect(spotify.skipToNext).toBeCalledTimes(1);
    expect(adapter.sendMessage).toMatchSnapshot();
  })

  it ('registers that someone does not like the song', async () => {
    twitch.kraken.users.getUserByName = jest.fn().mockReturnValue({
      getStream: jest.fn().mockReturnValue({
        viewers: 6
      })
    });
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: whatDoesTheFoxSay,
      },
    });
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user: anotherUser,
    })
    expect(adapter.sendMessage).toMatchSnapshot();
  })

  it ('restarts counting when song changes', async () => {
    twitch.kraken.users.getUserByName = jest.fn().mockReturnValue({
      getStream: jest.fn().mockReturnValue({
        viewers: 4
      })
    });
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: whatDoesTheFoxSay,
      },
    });
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: theOcean,
      },
    });
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    expect(adapter.sendMessage).toMatchSnapshot();
  })

  it ('sends corresponding message when no track is playing', async () => {
    twitch.kraken.users.getUserByName = jest.fn().mockReturnValue({
      getStream: jest.fn().mockReturnValue({
        viewers: 2
      })
    });
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: null,
      },
    });
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    expect(adapter.sendMessage).toMatchSnapshot();
  })

  it ('does nothing when no stream is active', async () => {
    twitch.kraken.users.getUserByName = jest.fn().mockReturnValue({
      getStream: jest.fn().mockReturnValue(null)
    });
    spotify.getMyCurrentPlayingTrack = jest.fn().mockReturnValue({
      body: {
        item: null,
      },
    });
    await handler.handle(bot, {
      channel: '#test',
      text: '!gutersong',
      user,
    })
    expect(adapter.sendMessage).not.toBeCalled();
  })

})