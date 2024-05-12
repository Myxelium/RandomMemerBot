import express from 'express';
import path from 'path';
import * as fileSystem from 'fs';
import { LoggerColors } from '../../helpers/loggerColors';

/**
 * Returns a list of all sound files in the sounds directory.
 * @returns string[] - An array of all sound files in the sounds directory.
 */
export function GetSoundFiles(response: express.Response) {
    const directoryPath = path.join(__dirname, '../../sounds');
    fileSystem.readdir(directoryPath, function (error: any, files: any[]) {
        if (error) {
            return console.log(LoggerColors.Red, 'Unable to scan directory: ' + error);
        }
        response.send(files);
    });
}