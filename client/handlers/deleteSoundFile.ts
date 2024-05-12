import express from 'express';
import path from 'path';
import * as fileSystem from 'fs';
import { LoggerColors } from '../../helpers/loggerColors';
import { DeleteSoundFromDatabase } from '../data/deleteSound';

/**
 * Deletes a file from the sounds folder by filename
 */
export function DeleteSoundFile(response: express.Response, request: express.Request) {
    const directoryPath = path.join(__dirname, '../../sounds');
    const filePath = directoryPath + '/' + request.params.filename;
    
    fileSystem.unlink(filePath, (err: any) => {
        if (err) {
            return console.log(LoggerColors.Red, 'Unable to delete file: ' + err);
        }
        response.send('File deleted successfully.');
    });

    DeleteSoundFromDatabase(request.params.filename);
}