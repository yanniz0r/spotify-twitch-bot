import { ApiClient, ClientCredentialsAuthProvider } from "twitch";
import dotenv from 'dotenv';

dotenv.config();

const twitch = new ApiClient({
  authProvider: new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID!, process.env.TWITCH_CLIENT_SECRET!)
})

export default twitch;
