import { nextPlayBackTime } from './../bot';
import express from 'express';
import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import https from 'https';
import ip from 'ip';
import * as dotenv from 'dotenv';

import { Handlers } from "./handlers/index"
import { loadAvoidList } from '../helpers/load-avoid-list';
import { LoggerColors } from '../helpers/logger-colors';
import { generateFileName } from '../helpers/generate-file-name';

dotenv.config();

const app = express();
const storage = diskStorage({
    destination: 'sounds/',
    filename: function (_req, file, cb) {
        cb(null, generateFileName(file.originalname));
    }
});

app.use(bodyParser.json());

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: function (_req, file, cb) {
        if (path.extname(file.originalname) !== '.mp3') {
            return cb(new Error('Only .mp3 files are allowed'));
        }
        
        cb(null, true);
    }
});

/**
 * Returns the index.html file.
 * @returns index.html - The index.html file.
 */
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'web/index.html'));
});

/**
 * Uploads a file to the sounds folder.
 * @Body myFile - The file to upload.
 */
app.post('/upload', upload.single('myFile'), async (req, res) => {
    res.send('File uploaded successfully.');
});

app.post('/upload-youtube', async (req, res) => {
    await Handlers.UploadYouTubeFile(res, req);
});

/**
 * Returns a file from the sounds folder by filename
 * @param filename - The name of the file to return.
 * @returns mp3 - The requested file.
 */
app.use('/sounds', express.static(path.join(__dirname, '../sounds')));

app.get('/sounds', (_req, res: express.Response) => {
    return Handlers.GetSoundFiles(res);
});

/**
 * Returns the next playback time.
 * @returns string - The next playback time.
 */
app.get('/nextplaybacktime', (_req, res) => {
    res.send(nextPlayBackTime);
});

app.delete('/sounds/:filename', (_req, res) => {
    Handlers.DeleteSoundFile(res, _req);
});

app.use(express.static(path.join(__dirname, "web")));

app.get('/join', (_req, res) => {
    Handlers.JoinChannel(res);
});

app.post('/avoidlist', (req, res) => {
    Handlers.AddUserToAvoidList(res, req);
});

app.delete('/avoidlist/:user', (req, res) => {
    Handlers.DeleteUserFromAvoidList(res, req);
});

app.get('/avoidlist', (_req, res) => {
    res.send(loadAvoidList());
});

/**
 * Starts the web server on either http or https protocol based on the availability of SSL certificates.
 * @returns void
 */
export function startServer() {
    let port: number = 80;
    let server;
    let ssl: "https" | "http" = "http";

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

    if (process.env.WEBPORT) {
        port = parseInt(process.env.WEBPORT, 10);
    }

    server.listen(port, () => {
        console.log(`Server started at ${ssl}://${ip.address()}:${port}`);
    });
}