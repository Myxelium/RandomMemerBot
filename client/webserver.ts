import express from 'express';
import multer, { diskStorage } from 'multer';
import path from 'path';
import { LoggerColors } from '../bot';

const app = express();
const storage = diskStorage({
    destination: 'sounds/',
    filename: function (_req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
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

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'web/index.html'));
});

app.post('/upload', upload.single('myFile'), async (req, res) => {
    res.send('File uploaded successfully.');
});

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
    app.listen(port, () => {
        console.log(LoggerColors.Cyan,`Add sounds at http://localhost:${port}, or drop in the sounds folder.`);
    });
}