import express from "express";
import { UploaderInformation } from "../../models/uploaderInformation";
import multer, { diskStorage } from "multer";
import { generateFileName } from "../../helpers/generateFileName";
import { AddSoundToDatabase } from "../data/addSound";
import path from "path";
const destination = "sounds/";

var uploaderInformation : UploaderInformation;

const storage = diskStorage({
    destination: destination,
    filename: function (_req, file, cb) {
        let fileName = generateFileName(file.originalname)

        cb(null, fileName);

        AddSoundToDatabase(fileName);
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

export async function UploadMp3File(response: express.Response, request: express.Request) {
    upload.any()(request, response, function(err) {
        if (err) {
            return response.status(500).json({ error: err.message });
        }
        uploaderInformation = request.body;
        response.send('File uploaded successfully.');
    });
}