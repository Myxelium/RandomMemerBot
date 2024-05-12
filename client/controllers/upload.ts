import express from 'express';
import multer, { diskStorage } from 'multer';
import path from 'path';
import { Handlers } from "../handlers/index";
import { generateFileName } from '../../helpers/generate-file-name';

const router = express.Router();

const storage = diskStorage({
    destination: 'sounds/',
    filename: function (_req, file, cb) {
        cb(null, generateFileName(file.originalname));
    }
});

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
 * Uploads a file to the sounds folder.
 * @Body myFile - The file to upload.
 */
router.post('/upload', upload.single('myFile'), async (req, res) => {
    res.send('File uploaded successfully.');
});

router.post('/youtube', async (req, res) => {
    await Handlers.UploadYouTubeFile(res, req);
});

router.post('/upload-youtube', async (req, res) => {
    await Handlers.UploadYouTubeFile(res, req);
});

export default router;