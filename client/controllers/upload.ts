import express from 'express';
import { UploadYouTubeFile } from "../handlers/index";
import { UploadMp3File } from '../handlers/uploadMp3FIle';

const router = express.Router();

/**
 * Uploads a file to the sounds folder.
 * @Body myFile - The file to upload.
 */
router.post('/upload', async (req, res) => {
    await UploadMp3File(res, req);
});

router.post('/upload-youtube', async (req, res) => {
    await UploadYouTubeFile(res, req);
});

export default router;