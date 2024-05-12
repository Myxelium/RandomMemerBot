import express from 'express';
import ip from 'ip';
import DiscordOauth2 from 'discord-oauth2';
import { ssl } from '../server';
import * as dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const oauth = new DiscordOauth2();

var clientId = process.env.OAUTH_CLIENT_ID;
var clientSecret = process.env.OAUTH_CLIENT_SECRET;
var customRedirectUrl = process.env.OAUTH_REDIRECT_URI;
var scopes = "identify email guilds";

router.get('/login', (req, res) => {
    if(!variablesIsSet(res))
        return;

    var redirect = `${ssl}://${ip.address()}/oauth`

    if(customRedirectUrl && customRedirectUrl != "default")
        redirect = `${customRedirectUrl}/oauth`

    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${clientId}&scope=${scopes.replace(' ', '+')}&response_type=code&redirect_uri=${redirect}`);
});

router.get('/oauth', async (_req: any, res: express.Response) => {
    if(!variablesIsSet(res))
        return;

    var options = {
        url: 'https://discord.com/api/oauth2/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'client_id': clientId!,
          'client_secret': clientSecret!,
          'grant_type': 'client_credentials',
          'code': _req.query.code,
          'redirect_uri': `${ssl}://${ip.address()}`,
          'scope': scopes
        })
      }
      
      var response = await fetch('https://discord.com/api/oauth2/token', options)
      .then((response) => {
        return response.json();
      });

      res.send(response);
});

router.get('/userinfo', async (req, res) => {
    const token = req.headers.authorization;

    if(token == null || token == undefined)
        return res.sendStatus(401);

    var cleanToken = token.replace('Bearer ', '');

    const user = await oauth.getUser(cleanToken);
    
    res.send(user);
});

router.get('/guilds', async (req, res) => {
    const token = req.headers.authorization;

    if(token == null || token == undefined)
        return res.sendStatus(401);

    var cleanToken = token.replace('Bearer ', '');

    const guilds = await oauth.getUserGuilds(cleanToken);
    
    res.send(guilds);
});

function variablesIsSet(response: any): boolean {
    let errorText = "Invalid configuration. Please check your environment variables.";

    if(clientId == undefined || clientSecret == undefined) {
        response.send(errorText);

        return false;
    }
    
    if(clientId.length < 5 && clientSecret.length < 5) {
        response.send(errorText);
        return false;
    }

    return true;
}

export default router;
