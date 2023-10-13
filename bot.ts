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
import { startServer as startWebServer } from './client/webserver';
import * as schedule from 'node-schedule';

dotenv.config();

const minTime = parseInt(process.env.INTERVALMIN_MINUTES!, 10); // Minimum interval in minutes
const maxTime = convertHoursToMinutes(parseInt(process.env.INTERVALMAX_HOURS!, 10)); // Maximum interval in minutes
const voiceChannelRetries = parseInt(process.env.VOICECHANNELRETRIES!, 10); // Number of retries to find a voice channel with members in it

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
    public static readonly Red = "\x1b[31m%s\x1b[0m";
    public static readonly Teal = "\x1b[35m%s\x1b[0m";
}

client.login(token);

client.on('ready', async () => {
    console.log(LoggerColors.Green, `Add to server by: https://discord.com/oauth2/authorize?client_id=${client.application?.id}&permissions=70379584&scope=bot`);
    console.log(`Logged in as ${client.user?.tag}!`);

    joinRandomChannel(voiceChannelRetries);
    startWebServer();
});
  
/**
 * Joins a random voice channel in a random guild and plays a random sound file.
 * @param retries - The number of retries to attempt if no voice channels are found.
 * @returns void
 */
async function joinRandomChannel(retries = 12) {
    if (!client.guilds.cache.size) {
        console.log(LoggerColors.Red, 'No guilds found');
        scheduleNextJoin();
        return;
    }

    const guild = client.guilds.cache.random();
    const voiceChannels = guild?.channels.cache.filter(channel => 
        channel.type === ChannelType.GuildVoice && 
        channel.members.size > 0
    );
    
    if (!voiceChannels?.size) {
        if (retries > 0) {
            console.log(LoggerColors.Yellow, `No voice channels found, retrying in 5 seconds... (${retries} retries left)`);
            setTimeout(() => joinRandomChannel(retries - 1), 5000); // Wait for 5 seconds before retrying
        }

        if(retries === 0) {
            console.log(LoggerColors.Red, 'No voice channels found');
            scheduleNextJoin();
        }
        return;
    }
    
    const voiceChannel = voiceChannels.random();

    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel!.id,
            guildId: voiceChannel!.guild.id,
            adapterCreator: voiceChannel!.guild.voiceAdapterCreator,
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        const soundFiles = fileSystem.readdirSync(soundsDir).filter(file => file.endsWith('.mp3'));
        const soundFile = soundsDir + soundFiles[Math.floor(Math.random() * soundFiles.length)];
        const resource = createAudioResource(soundFile);
        const player = createAudioPlayer();
        
        console.log(LoggerColors.Teal, `Playing ${soundFile} in ${voiceChannel?.name}...`);

        player.play(resource);
        connection.subscribe(player);

        await entersState(player, AudioPlayerStatus.Idle, 300000);
        connection.destroy();
    } catch (error) {
        console.error(error);
    }
    
    scheduleNextJoin();
}

function scheduleNextJoin(){
    const randomInterval = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    log(randomInterval);
    
    schedule.scheduleJob(`*/${randomInterval} * * * *`, function(){
        joinRandomChannel();
    });
}

function convertHoursToMinutes(hours: number){
    return hours * 60;
}

function log(waitTime: number){
    const currentTime = new Date();
    const nextJoinTime = new Date(currentTime.getTime() + waitTime * 60 * 1000); // Convert waitTime from minutes to milliseconds

    console.log(
        LoggerColors.Cyan, `
        Wait time: ${waitTime} minutes,
        Current time: ${currentTime.toLocaleTimeString()}, 
        Next join time: ${nextJoinTime.toLocaleTimeString()}`
    );
}