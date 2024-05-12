import express from 'express';
import path from 'path';
import { Handlers } from "../handlers/index";

const router = express.Router();

router.delete('/sounds/:filename', (_req, res) => {
    Handlers.DeleteSoundFile(res, _req);
});

/**
 * Returns a file from the sounds folder by filename
 * @param filename - The name of the file to return.
 * @returns mp3 - The requested file.
 */
router.use('/sounds', express.static(path.join(__dirname, '../../sounds')));

router.get('/sounds', (_req, res: express.Response) => {
    return Handlers.GetSoundFiles(res);
});

export default router;