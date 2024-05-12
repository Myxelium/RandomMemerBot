import express from 'express';
import path from 'path';
import { DeleteSoundFile, GetSoundFiles } from "../handlers/index";

const router = express.Router();

router.delete('/sounds/:filename', (_req, res) => {
    DeleteSoundFile(res, _req);
});

/**
 * Returns a file from the sounds folder by filename
 * @param filename - The name of the file to return.
 * @returns mp3 - The requested file.
 */
router.use('/sounds', express.static(path.join(__dirname, '../../sounds')));

router.get('/sounds', (_req, res: express.Response) => GetSoundFiles(res));

export default router;