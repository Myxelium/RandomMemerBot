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
import { ChannelType, Collection, GuildBasedChannel, Snowflake, VoiceChannel, VoiceState } from 'discord.js';
import * as dotenv from 'dotenv';
import * as schedule from 'node-schedule';
import { loadAvoidList } from './helpers/loadAvoidList';
import { LoggerColors } from './helpers/loggerColors';
import { getRandomSoundFilePath } from './helpers/getRandomSoundFilePath';
import { logger } from './helpers/logger';
import { SetupDiscordCLient } from './helpers/setupDiscordClient';
import { convertHoursToMinutes, dateToString } from './helpers/converters';
import { AvoidList } from './models/avoid-list';
import { runServer } from './client/router';
import { startDatabase } from './client/database';

dotenv.config();

export var nextPlayBackTime: string = 'Never played'; // Export so it can be used in the webserver module aswell.
const minTimeInterval = parseInt(process.env.INTERVALMIN_MINUTES!, 10); // Minimum interval in minutes.
const maxTimeInterval = convertHoursToMinutes(parseFloat(process.env.INTERVALMAX_HOURS!)); // Maximum interval in minutes.
const voiceChannelRetries = parseInt(process.env.VOICECHANNELRETRIES!, 10); // Number of retries to find a voice channel with members in it.
const discordClient = SetupDiscordCLient();

discordClient.on('ready', async () => {
    console.log(LoggerColors.Green, `Add to server by: https://discord.com/oauth2/authorize?client_id=${discordClient.application?.id}&permissions=70379584&scope=bot`);
    console.log(`Logged in as ${discordClient.user?.tag}!`);

    joinRandomChannel(voiceChannelRetries);
    runServer();
    startDatabase();
});

/**
 * Joins a random voice channel in a random guild and plays a random sound file.
 * @param retries - The number of retries to attempt if no voice channels are found.
 * @returns Promise<void>
 */
export async function joinRandomChannel(retries = 12) {
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
        if(isUserFromAvoidListNotInVoiceChannel(randomlyPickedVoiceChannel!)) {
            
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
        }

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
 * Schedules the next join to a random channel. Using a random interval between minTime and maxTime.
 * It clears the previous schedule before scheduling the next join, to avoid multiple schedules.
 * @see minTimeInterval - time in minutes
 * @see maxTimeInterval - time in hours as minutes
 * @see schedule - node-schedule instance
 */
function scheduleNextJoin(): void {
    const randomInterval = Math.floor(Math.random() * (maxTimeInterval - minTimeInterval + 1)) + minTimeInterval;
    const minutes = randomInterval % 60;
    const hours = Math.floor((randomInterval - minutes) / 60);

    schedule.gracefulShutdown().finally(() => {
        const jobName = schedule.scheduleJob(`${minutes} ${hours == 0 ? '*' : hours } * * *`, function(){
            joinRandomChannel();
        }).name;

        let nextPlaybackDate = schedule.scheduledJobs[jobName].nextInvocation();

        nextPlayBackTime = dateToString(nextPlaybackDate) ?? '';
        logger(nextPlaybackDate, hours, minutes);
    });
}


function isUserFromAvoidListNotInVoiceChannel(channel: GuildBasedChannel): boolean {
    const avoidList: AvoidList = loadAvoidList();
    const voiceChannel = channel as VoiceChannel;
    const voiceStates: Collection<Snowflake, VoiceState> = voiceChannel.guild.voiceStates.cache;
    const membersInVoiceChannel = voiceStates.filter(voiceState => voiceState.channelId === voiceChannel.id);

    if(avoidList.avoidUsers.length === 0)
        return true;
    
    if (channel.type !== ChannelType.GuildVoice)
        return true;

    // Check if any member from the avoid list is in the voice channel
    for (const voiceState of membersInVoiceChannel.values()) {
        if(!voiceState.member)
            continue;
        
        if (avoidList.avoidUsers.includes(voiceState.member.user.username)) {
            console.log(LoggerColors.Yellow, `${voiceState.member.user.username} is in the avoid list, skipping...`);
            return false;
        }
    }

    // No member from the avoid list is in the voice channel
    return true;
}
