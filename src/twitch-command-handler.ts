import TwitchBot, { TwitchMessage } from "./twitch-bot";

export default interface TwitchCommandHandler {
  command: string;
  aliases?: string[];
  handle(bot: TwitchBot, message: TwitchMessage, args: string[]): Promise<boolean | void> | void;
}