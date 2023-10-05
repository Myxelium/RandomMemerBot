import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    entersState, 
    AudioPlayerStatus, 
    VoiceConnectionStatus 
} from '@discordjs/voice';
import { ChannelType, Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fileSystem from 'fs';
import { startServer } from './client/webserver';

dotenv.config();

const token = process.env.TOKEN;
const soundsDir = './sounds/';
const client = new Client({
	intents: [
	    GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildIntegrations,
	],
});

export class LoggerColors {
    public static readonly Green = "\x1b[32m%s\x1b[0m";
    public static readonly Yellow = "\x1b[33m%s\x1b[0m";
    public static readonly Cyan = "\x1b[36m%s\x1b[0m";
}

client.login(token);

client.on('ready', () => {
    
    console.log(LoggerColors.Green, `Add to server by: https://discord.com/oauth2/authorize?client_id=${client.application?.id}&permissions=70379584&scope=bot`);
    startServer();
    console.log(`Logged in as ${client.user?.tag}!`);
    joinRandomChannel();
});
  
async function joinRandomChannel() {
    if (!client.guilds.cache.size) 
        return;
    
    const guild = client.guilds.cache.random();
    const voiceChannels = guild?.channels.cache.filter(channel => 
        channel.type === ChannelType.GuildVoice && 
        channel.members.size > 0
    );
    
    if (!voiceChannels?.size) 
        return;
    
    const voiceChannel = voiceChannels.random();
    
    try {
        const connection = await joinVoiceChannel({
            channelId: voiceChannel!.id,
            guildId: voiceChannel!.guild.id,
            adapterCreator: voiceChannel!.guild.voiceAdapterCreator,
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        const soundFiles = fileSystem.readdirSync(soundsDir).filter(file => file.endsWith('.mp3'));
        const soundFile = soundsDir + soundFiles[Math.floor(Math.random() * soundFiles.length)];
        const resource = createAudioResource(soundFile);
        const player = createAudioPlayer();
        
        console.log(LoggerColors.Yellow, `Playing ${soundFile} in ${voiceChannel?.name}...`);

        player.play(resource);
        connection.subscribe(player);

        await entersState(player, AudioPlayerStatus.Idle, 300000);
        connection.destroy();
    } catch (error) {
        console.error(error);
    }
    
    const waitTime = Math.floor(Math.random() * (43200000 - 10000 + 1)) + 10000;
    log(waitTime);
    setTimeout(joinRandomChannel, waitTime);
}

function log(waitTime: number){
    console.log(
        LoggerColors.Cyan, `
        Wait time: ${(waitTime / 1000 / 60 > 60) ? (waitTime / 1000 / 60 / 60 + ' hours') : (waitTime / 1000 / 60 + ' minutes')},
        Current time: ${new Date().toLocaleTimeString()}, 
        Next join time: ${new Date(Date.now() + waitTime)
            .toLocaleTimeString()}`
    );
}