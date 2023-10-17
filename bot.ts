/**
 * This file contains the code for a Discord bot that joins a random voice channel in a random guild and plays a random sound file.
 * It uses the @discordjs/voice library for voice connections and the node-schedule library for scheduling the next join.
 * The bot also starts a web server using the startServer function from the webserver module.
 * 
 * @packageDocumentation
 */
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    entersState, 
    AudioPlayerStatus, 
    VoiceConnectionStatus, 
    VoiceConnection
} from '@discordjs/voice';
import { ChannelType, Client, GatewayIntentBits, GuildBasedChannel } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fileSystem from 'fs';
import { startServer as startWebServer } from './client/webserver';
import * as schedule from 'node-schedule';

dotenv.config();

export var nextPlayBackTime: string = ''; // Export so it can be used in the webserver module aswell.
const minTimeInterval = parseInt(process.env.INTERVALMIN_MINUTES!, 10); // Minimum interval in minutes.
const maxTimeInterval = convertHoursToMinutes(parseFloat(process.env.INTERVALMAX_HOURS!)); // Maximum interval in minutes.
const voiceChannelRetries = parseInt(process.env.VOICECHANNELRETRIES!, 10); // Number of retries to find a voice channel with members in it.

const discordApplicationToken = process.env.TOKEN; // Discord bot token from .env file (required) More info: https://discordgsm.com/guide/how-to-get-a-discord-bot-token
const soundsDirectory = './sounds/';
const discordClient = new Client({
	intents: [
	    GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildIntegrations,
	],
});

export class LoggerColors {
    public static readonly Green: string = "\x1b[32m%s\x1b[0m";
    public static readonly Yellow: string = "\x1b[33m%s\x1b[0m";
    public static readonly Cyan: string = "\x1b[36m%s\x1b[0m";
    public static readonly Red: string = "\x1b[31m%s\x1b[0m";
    public static readonly Teal: string = "\x1b[35m%s\x1b[0m";
}

discordClient.login(discordApplicationToken);

discordClient.on('ready', async () => {
    console.log(LoggerColors.Green, `Add to server by: https://discord.com/oauth2/authorize?client_id=${discordClient.application?.id}&permissions=70379584&scope=bot`);
    console.log(`Logged in as ${discordClient.user?.tag}!`);

    joinRandomChannel(voiceChannelRetries);
    startWebServer();
});
  
/**
 * Joins a random voice channel in a random guild and plays a random sound file.
 * @param retries - The number of retries to attempt if no voice channels are found.
 * @returns Promise<void>
 */
async function joinRandomChannel(retries = 12) {
    if (!discordClient.guilds.cache.size) {
        console.log(LoggerColors.Red, 'No guilds found');
        scheduleNextJoin();
        return;
    }

    const randomlyPickedDiscordServer = discordClient.guilds.cache.random();
    const accessableVoiceChannels = randomlyPickedDiscordServer?.channels.cache.filter(channel => 
        channel.type === ChannelType.GuildVoice && 
        channel.members.size > 0
    );
    
    if (!accessableVoiceChannels?.size) {
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
    
    const randomlyPickedVoiceChannel = accessableVoiceChannels.random();

    try {
        // Join the voice channel
        const voiceChannelConnection = joinVoiceChannel({
            channelId: randomlyPickedVoiceChannel!.id,
            guildId: randomlyPickedVoiceChannel!.guild.id,
            adapterCreator: randomlyPickedVoiceChannel!.guild.voiceAdapterCreator,
        });

        await entersState(voiceChannelConnection, VoiceConnectionStatus.Ready, 30e3);
        const soundFilePath = getRandomSoundFilePath();

        if(!soundFilePath) {
            console.log(LoggerColors.Red, 'No sound files found');
            scheduleNextJoin();
            return;
        }

        await playSoundFile(
            soundFilePath, 
            randomlyPickedVoiceChannel, 
            voiceChannelConnection);

    } catch (error) {
        console.error(error);
    }
    
    scheduleNextJoin();
}

/**
 * Plays a sound file in a voice channel.
 * @param soundFilePath - The path to the sound file to play.
 * @param randomlyPickedVoiceChannel - The voice channel to play the sound file in.
 * @param voiceChannelConnection - The voice channel connection.
 * @returns Promise<void>
 */
async function playSoundFile(
    soundFilePath: string, 
    randomlyPickedVoiceChannel: GuildBasedChannel | undefined, 
    voiceChannelConnection: VoiceConnection
): Promise<void> {
    const audioResource = createAudioResource(soundFilePath);
    const audioPlayer = createAudioPlayer();

    console.log(LoggerColors.Teal, `Playing ${soundFilePath} in ${randomlyPickedVoiceChannel?.name}...`);

    audioPlayer.play(audioResource);
    voiceChannelConnection.subscribe(audioPlayer);

    await entersState(audioPlayer, AudioPlayerStatus.Idle, 300000);
    voiceChannelConnection.destroy();
}

/**
 * Returns a random sound file from the sounds directory.
 * @returns string - The path to a random sound file.
 */
function getRandomSoundFilePath(): string {
    const allSoundFilesAsArray = fileSystem.readdirSync(soundsDirectory).filter(file => file.endsWith('.mp3'));
    return soundsDirectory + allSoundFilesAsArray[Math.floor(Math.random() * allSoundFilesAsArray.length)];
}

/**
 * Schedules the next join to a random channel. Using a random interval between minTime and maxTime.
 * It clears the previous schedule before scheduling the next join, to avoid multiple schedules.
 * @see minTimeInterval - time in minutes
 * @see maxTimeInterval - time in hours
 * @see schedule - node-schedule instance
 */
function scheduleNextJoin(): void {
    const randomInterval = Math.floor(Math.random() * (maxTimeInterval - minTimeInterval + 1)) + minTimeInterval;
    const minutes = randomInterval % 60;
    const hours = Math.floor(randomInterval / 60);

    schedule.gracefulShutdown().finally(() => {
        const jobName = schedule.scheduleJob(`${Math.floor(minutes)} ${Math.floor(hours) == 0 ? '*' : Math.floor(hours) } * * *`, function(){
            joinRandomChannel();
        }).name;

        let nextPlaybackDate = schedule.scheduledJobs[jobName].nextInvocation();

        nextPlayBackTime = dateToString(nextPlaybackDate) ?? '';
        log(nextPlaybackDate, hours, minutes);
    });
}

function convertHoursToMinutes(hours: number): number {
    return hours * 60;
}

/**
 * Logs the wait time, current time, next join time, and cron schedule in the console.
 * @param waitTime - The time to wait until the next join.
 * @param hour - The hour of the cron schedule.
 * @param minute - The minute of the cron schedule.
 */
function log(
    waitTime: Date, 
    hour: number, 
    minute: number
){
    const currentTime = new Date();

    console.log(
        LoggerColors.Cyan, `
        Wait time: ${(waitTime.getTime() - currentTime.getTime()) / 60000} minutes,
        Current time: ${dateToString(currentTime)}, 
        Next join time: ${dateToString(waitTime)},
        Cron: ${Math.floor(minute)} ${Math.floor(hour) == 0 ? '*' : Math.floor(hour) } * * *`
    );
}

function dateToString(date: Date): string {
    return date.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
}