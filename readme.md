![randommemer discord bot logotype](/client/web/assets/logo.svg)

# What is this!? 
this is a discord bot that joins a random voice channel in a random guild and plays a random sound file (mp3). it uses the `@discordjs/voice` library for voice connections and the `node-schedule` library for scheduling the next join. the bot also starts a web server using the `startserver` function from the `webserver` module.

## Get started

to use this project, you'll need to install FFmpeg:

- For Linux, run the command `sudo apt install ffmpeg` in your terminal.
- For other operating systems, download FFmpeg from [the official website](https://ffmpeg.org/download.html) and install it.

once you have FFmpeg installed, follow these steps to get the project up and running:

1. Run `npm i` in your terminal to install all dependencies.
2. Run `npm run create` to create the `.env` file in the root folder.
3. Open the `.env` file and insert your [Discord bot token](#how-to-get-discord-token).
4. Run `npm start` to start the project.

make sure you have those installed:
- Node.js (v16 or later)
- npm (v7 or later)

[OPTIONAL]
on server i run this using [pm2](https://pm2.keymetrics.io/) to manage it.

## Configuration
if the command `npm run create` doesnt work, create a .env file with the following contents in same folder as bot.ts:

```
TOKEN=<your Discord bot token>
INTERVALMIN_MINUTES=<minimum interval in minutes>
INTERVALMAX_HOURS=<maximum interval in hours>
VOICECHANNELRETRIES=<number of retries to find a voice channel with members in it>
```

replace `<your Discord bot token>` with your actual Discord bot token. replace `<minimum interval in minutes>`, `<maximum interval in hours>`, and `<number of retries to find a voice channel with members in it>` with your desired values.

### How to get discord token
Helpful links for creating your Discord application and finding the token:

[Getting token](https://discordgsm.com/guide/how-to-get-a-discord-bot-token) | [Discord Developer Portal](https://discord.com/developers/docs/getting-started)

### How do I get it into my Discord server?
once the bot start successfully youll get the full invitation link in the terminal. 

### Webpage for managing uploads
once the project starts it will host a website where the user can access and upload sound clips.

it will run on ssl ports if certificates exists. you can generate certficates using the script located at:
`./client/certs/create-cert.sh` using git-bash for example. this is not mandatory and the server will use http if no certficates exists.

## Libraries Used

this bot uses the following libraries:

- `@discordjs/voice`: For voice connections.
- `discord.js`: For interacting with the Discord API.
- `dotenv`: For loading environment variables from a `.env` file.
- `fs`: For reading files from the file system.
- `node-schedule`: For scheduling the next join.
- `express`: For starting a web server.

## Contributing
if you'd like to contribute to this project, please fork the repository and create a pull request with your changes.

### Other
  [![HitCount](https://hits.dwyl.com/myxelium/RandomMemerBot.svg?style=flat&show=unique)](http://hits.dwyl.com/myxelium/RandomMemerBot)
