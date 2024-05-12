import { Client, GatewayIntentBits } from "discord.js";

export function SetupDiscordCLient(): Client{
    const discordClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildIntegrations,
        ],
    });
    const discordApplicationToken = process.env.TOKEN; // Discord bot token from .env file (required) More info: https://discordgsm.com/guide/how-to-get-a-discord-bot-token

    discordClient.login(discordApplicationToken);

    return discordClient;
}