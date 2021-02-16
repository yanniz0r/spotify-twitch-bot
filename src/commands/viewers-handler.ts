import { ApiClient } from "twitch/lib";
import TwitchBot, { TwitchMessage } from "../twitch-bot";
import TwitchCommandHandler from "../twitch-command-handler";


class ViewersHandler implements TwitchCommandHandler {

  constructor(private twitch: ApiClient) {}

  command = 'viewers'
  async handle(bot: TwitchBot, message: TwitchMessage) {
    const user = await this.twitch.kraken.users.getUserByName("yanniz0r");
    const [stream] = await Promise.all([
      user?.getStream(),
    ]);
    bot.adapter.sendMessage(message.channel, `Aktuell hat der Stream ${stream?.viewers} Zuschauer`);
  }
}

export default ViewersHandler;
