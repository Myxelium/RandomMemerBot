import https from 'https';
import fs from 'fs';
import path from 'path';
import { LoggerColors } from '../helpers/logger-colors';
import ip from 'ip';
import { Express } from 'express';

export var ssl: "https" | "http" = "http";

export function startServer(app: Express) {
    let port: 80 | 443 = 80;
    let server;
    
    try {
        const options = {
            requestCert: true,
            rejectUnauthorized: false,
            key: fs.readFileSync(path.join(__dirname, '/certs/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '/certs/cert.pem')),
        };
        server = https.createServer(options, app);
        ssl = "https";
        port = 443;
    } catch (error) {
        console.log(LoggerColors.Yellow, 'Could not find SSL certificates, falling back to http.');
        server = app;
        ssl = "http";
    }

    server.listen(port, () => {
        console.log(`Server started at ${ssl}://${ip.address()}:${port}`);
    });
}
