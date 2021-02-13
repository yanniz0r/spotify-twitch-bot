import TwitchBot from "./twitch-bot";

interface TwitchConnectionAdapter {
  register(bot: TwitchBot): void;
  sendMessage(channel: string, message: string): void;
}

export default TwitchConnectionAdapter;