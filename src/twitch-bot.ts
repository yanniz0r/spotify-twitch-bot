import TwitchCommandHandler from "./twitch-command-handler";
import TwitchConnectionAdapter from "./twitch-connection-adapter";

export interface TwitchMessage {
  user: TwitchUser;
  channel: string;
  text: string;
}

export interface TwitchUser {
  username: string;
}

class TwitchBot {

  private handlers: TwitchCommandHandler[] = [];

  constructor(public adapter: TwitchConnectionAdapter, private commandPrefix = '!') {
    this.adapter.register(this);
  };

  public addCommandHandler(handler: TwitchCommandHandler) {
    this.handlers.push(handler);
  }

  public async receiveMessage(message: TwitchMessage) {
    if (!message.text.startsWith(this.commandPrefix)) return;
    for (const handler of this.handlers) {
      const segments = message.text.split(' ');
      const [command, ...args] = segments;
      if (this.handlerMatchesCommand(handler, command)) {
        const shouldExit = await handler.handle(this, message, args);
        if (shouldExit) {
          return;
        }
      }
    }
  }

  private handlerMatchesCommand(handler: TwitchCommandHandler, command: string): boolean {
    if (`!${handler.command}` === command) return true;
    if (!handler.aliases) return false;
    for (let alias of handler.aliases) {
      if (`!${alias}` === command) return true;
    }
    return false;
  }

}

export default TwitchBot;
