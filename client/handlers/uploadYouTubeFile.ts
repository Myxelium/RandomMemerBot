import express from 'express';
import path from 'path';
import ytdl from 'ytdl-core';
import * as fileSystem from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { generateFileName } from '../../helpers/generate-file-name';

/**
* Uploads a YouTube video as an mp3 file to the sounds folder.
* The video must be shorter than 10 seconds.
* @Body url - The YouTube video url.
*/
export async function UploadYouTubeFile(response: express.Response, request: express.Request) {
    const url = request.body.url;

    if (ytdl.validateURL(url)) {
        const info = await ytdl.getInfo(url);
        // remove special characters from the title and white spaces
        const title = info.videoDetails.title.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, '-').toLowerCase();

        // Create a temporary directory to store the uploaded file so validation can be done
        const tempDir = fileSystem.mkdtempSync('temp');
        const outputFilePath = path.resolve(tempDir, generateFileName(title));

        const videoReadableStream = ytdl(url, { filter: 'audioonly' });
        const fileWritableStream = fileSystem.createWriteStream(outputFilePath);

        videoReadableStream.pipe(fileWritableStream);

        fileWritableStream.on('finish', () => {
            ffmpeg.ffprobe(outputFilePath, function (err, metadata) {
                if (err) {
                    fileSystem.rmSync(tempDir, { recursive: true, force: true });
                    return response.status(500).send('Error occurred during processing.');
                }
                const duration = metadata.format.duration;

                if (duration == undefined) {
                    fileSystem.rmSync(tempDir, { recursive: true, force: true });
                    return response.status(400).send('Something went wrong.');
                }
                if (duration > 10) {
                    fileSystem.rmSync(tempDir, { recursive: true, force: true });
                    return response.status(400).send('File is longer than 10 seconds.');
                } else {
                    // Move the file from the temporary directory to its final destination
                    const finalFilePath = path.resolve(__dirname, '../../sounds/', generateFileName(title));
                    fileSystem.renameSync(outputFilePath, finalFilePath);

                    response.send('File uploaded successfully.');
                }

                // Remove the temporary directory and its contents once done
                fileSystem.rmSync(tempDir, { recursive: true, force: true });
            });
        });
    } else {
        response.status(400).send('Invalid url provided.');
    }
}