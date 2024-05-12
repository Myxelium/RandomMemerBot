import express from 'express';
import path from 'path';
import { Handlers } from "../handlers/index";
import { nextPlayBackTime } from '../../bot';
import { loadAvoidList } from '../../helpers/load-avoid-list';

const router = express.Router();

/**
 * Returns the next playback time.
 * @returns string - The next playback time.
 */
router.get('/nextplaybacktime', (_req, res) => {
    res.send(nextPlayBackTime);
});

/**
 * Returns the index.html file.
 * @returns index.html - The index.html file.
 */
router.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../web/index.html'));
});

router.get('/avoidlist', (_req, res) => {
    res.send(loadAvoidList());
});

router.post('/avoidlist', (req, res) => {
    Handlers.AddUserToAvoidList(res, req);
});

router.delete('/avoidlist/:user', (req, res) => {
    Handlers.DeleteUserFromAvoidList(res, req);
});

router.get('/join', (_req, res) => {
    Handlers.JoinChannel(res);
});

router.use(express.static(path.join(__dirname, "../web")));


export default router;