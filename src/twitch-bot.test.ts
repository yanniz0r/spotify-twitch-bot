import TwitchBot, { TwitchUser } from "./twitch-bot"
import TwitchConnectionAdapter from "./twitch-connection-adapter";

const user: TwitchUser = {
  username: 'yanniz0r'
}
const channel = 'test';

describe('TwitchBot', () => {
  it ('calls correct handler with arguments for command', () => {
    const twitchBot = new TwitchBot({ register: jest.fn() } as unknown as TwitchConnectionAdapter);
    const handle = jest.fn();
    twitchBot.addCommandHandler({
      command: 'test',
      handle,
    });
    const message = { text: '!test arg1 arg2 arg3 arg4', user, channel };
    twitchBot.receiveMessage(message);
    twitchBot.receiveMessage({
      ...message,
      text: 'Lorem Ipsum Dolor Sit Amet'
    });
    expect(handle).toBeCalledWith(expect.any(Object), message, ['arg1', 'arg2', 'arg3', 'arg4']);
  })

  it ('calls correct handler based on alias', () => {
    const twitchBot = new TwitchBot({ register: jest.fn() } as unknown as TwitchConnectionAdapter);
    const handle = jest.fn();
    twitchBot.addCommandHandler({
      command: 'test',
      aliases: ['t'],
      handle,
    });
    const message = { text: '!t arg1 arg2 arg3 arg4', user, channel };
    twitchBot.receiveMessage(message);
    expect(handle).toBeCalledWith(expect.any(Object), message, ['arg1', 'arg2', 'arg3', 'arg4']);
  })

  it ('does not call other handlers for command', () => {
    const twitchBot = new TwitchBot({ register: jest.fn() } as unknown as TwitchConnectionAdapter);
    const handle = jest.fn();
    twitchBot.addCommandHandler({
      command: 'test',
      aliases: ['t'],
      handle,
    });
    twitchBot.receiveMessage({ text: '!somecommand arg1 arg2 arg3 arg4', user, channel });
    expect(handle).not.toBeCalled();
    twitchBot.receiveMessage({ text: '!test arg1 arg2 arg3 arg4', user, channel });
    expect(handle).toBeCalledTimes(1);
  })

  it ('does call multiple handlers for the same command until exited', async () => {
    const twitchBot = new TwitchBot({ register: jest.fn() } as unknown as TwitchConnectionAdapter);
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn().mockReturnValue(true);
    const handler4 = jest.fn();
    twitchBot.addCommandHandler({
      command: 'test',
      handle: handler1
    });
    twitchBot.addCommandHandler({
      command: 'test',
      handle: handler2
    });
    twitchBot.addCommandHandler({
      command: 'test',
      handle: handler3
    });
    twitchBot.addCommandHandler({
      command: 'test',
      handle: handler4
    });
    await twitchBot.receiveMessage({
      text: '!test',
      user,
      channel
    });
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
    expect(handler4).not.toBeCalled();
  })
})