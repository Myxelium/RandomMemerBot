import { nextPlayBackTime } from './../bot';
import express from 'express';
import multer, { diskStorage } from 'multer';
import path from 'path';
import { LoggerColors } from '../bot';
import ytdl from 'ytdl-core';
import fs from 'fs';
import bodyParser from 'body-parser';
import ffmpeg from 'fluent-ffmpeg';
import https from 'https';
import ip from 'ip';

const app = express();
const storage = diskStorage({
    destination: 'sounds/',
    filename: function (_req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
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

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'web/index.html'));
});

app.post('/upload', upload.single('myFile'), async (req, res) => {
    res.send('File uploaded successfully.');
});

app.post('/upload-youtube', async (req, res) => {
    const url = req.body.url;

    if (ytdl.validateURL(url)) {
        const info = await ytdl.getInfo(url);
        // remove special characters from the title and white spaces
        const title = info.videoDetails.title.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, '-').toLowerCase();

        // Create a temporary directory to store the uploaded file so validation can be done
        const tempDir = fs.mkdtempSync('temp');
        const outputFilePath = path.resolve(tempDir, Date.now() + '-' + title + '.mp3');

        const videoReadableStream = ytdl(url, { filter: 'audioonly' });
        const fileWritableStream = fs.createWriteStream(outputFilePath);

        videoReadableStream.pipe(fileWritableStream);

        fileWritableStream.on('finish', () => {
            ffmpeg.ffprobe(outputFilePath, function(err, metadata) {
                if (err) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    return res.status(500).send('Error occurred during processing.');
                }
                const duration = metadata.format.duration;

                if (duration == undefined) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    return res.status(400).send('Something went wrong.');
                }
                if (duration > 10) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    return res.status(400).send('File is longer than 10 seconds.');
                } else {
                    // Move the file from the temporary directory to its final destination
                    const finalFilePath = path.resolve(__dirname, '../sounds/', Date.now() + '-' + title + '.mp3');
                    fs.renameSync(outputFilePath, finalFilePath);

                    res.send('File uploaded successfully.');
                }

                // Remove the temporary directory and its contents once done
                fs.rmSync(tempDir, { recursive: true, force: true });
            });
        });
    } else {
        res.status(400).send('Invalid url provided.');
    }
});

// create a enpoint to return a file from the sounds folder (use the file name) with as little code as possible
app.use('/sounds', express.static(path.join(__dirname, '../sounds')));

app.get('/sounds', (_req, res) => {
    const fs = require('fs');
    const directoryPath = path.join(__dirname, '../sounds');
    fs.readdir(directoryPath, function (err: any, files: any[]) {
        if (err) {
            return console.log(LoggerColors.Red, 'Unable to scan directory: ' + err);
        }
        res.send(files);
    });
});

app.get('/nextplaybacktime', (_req, res) => {
    res.send(nextPlayBackTime);
});

app.delete('/sounds/:filename', (req, res) => {
    const fs = require('fs');
    const directoryPath = path.join(__dirname, '../sounds');
    const filePath = directoryPath + '/' + req.params.filename;
    fs.unlink(filePath, (err: any) => {
        if (err) {
            return console.log(LoggerColors.Red, 'Unable to delete file: ' + err);
        }
        res.send('File deleted successfully.');
    });
});

app.use(express.static(path.join(__dirname, "web")));

export function startServer() {
    const port = 8080;
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
    } catch (error) {
        console.log(LoggerColors.Yellow, 'Could not find SSL certificates, falling back to http.');
        server = app;
        ssl = "http";
    }

    server.listen(port, () => {
        console.log(`Server started at ${ssl}://${ip.address()}:${port}`);
    });
}