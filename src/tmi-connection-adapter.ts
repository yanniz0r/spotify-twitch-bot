import * as TMI from 'tmi.js';
import TwitchBot from './twitch-bot';
import TwitchConnectionAdapter from './twitch-connection-adapter';

class TMIConnectionAdapter implements TwitchConnectionAdapter {

  constructor(private client: TMI.Client) {
    client.connect();
  }

  register(bot: TwitchBot) {
    this.client.on('message', (channel, userstate, message, _self) => {
      bot.receiveMessage({
        channel,
        user: {
          username: userstate.username!,
        },
        text: message,
      })
    });
  }

  sendMessage(channel: string, message: string) {
    this.client.say(channel, message);
  }

}

export default TMIConnectionAdapter;
