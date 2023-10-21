import { joinRandomChannel } from "../../bot";
import express from 'express';

/**
 * Joins a random channel and plays a random sound file.
 * @returns void
 */
export function JoinChannel(response: express.Response) {
    joinRandomChannel();
    response.send('Joining random channel.');
}