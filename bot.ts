import { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, AudioPlayerStatus, VoiceConnectionStatus, StreamType } from '@discordjs/voice';
import { ChannelType, Client, GatewayIntentBits } from 'discord.js';
require('dotenv').config();

import * as fs from 'fs';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildIntegrations,
	],
});

const token  = process.env.TOKEN;
const soundsDir = './sounds/';

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    joinRandomChannel(); // Bot tries to join a random channel every 10 seconds
  });
  
  client.login(token);
  
async function joinRandomChannel() {
    if (!client.guilds.cache.size) return;
    
    const guild = client.guilds.cache.random();
    const voiceChannels = guild?.channels.cache.filter(c => c.type === ChannelType.GuildVoice && c.members.size > 0);
    
    if (!voiceChannels?.size) return;
    
    const voiceChannel = voiceChannels.random();
    
    try {
    const connection = await joinVoiceChannel({
        channelId: voiceChannel!.id,
        guildId: voiceChannel!.guild.id,
        adapterCreator: voiceChannel!.guild.voiceAdapterCreator,
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
    const soundFiles = fs.readdirSync(soundsDir).filter(file => file.endsWith('.mp3'));
    const soundFile = soundsDir + soundFiles[Math.floor(Math.random() * soundFiles.length)];
    const resource = createAudioResource(soundFile);
    const player = createAudioPlayer();
    
    console.log("\x1b[33m%s\x1b[0m", `Playing ${soundFile} in ${voiceChannel?.name}...`);

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
        "\x1b[36m%s\x1b[0m", `
        Wait time: ${(waitTime / 1000 / 60 > 60) ? (waitTime / 1000 / 60 / 60 + ' hours') : (waitTime / 1000 / 60 + ' minutes')},
        Current time: ${new Date().toLocaleTimeString()}, 
        Next join time: ${new Date(Date.now() + waitTime)
            .toLocaleTimeString()}`
    );
}