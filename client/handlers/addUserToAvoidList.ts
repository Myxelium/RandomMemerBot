import * as fileSystem from 'fs';
import express from 'express';
import { loadAvoidList } from '../../helpers/load-avoid-list';

/**
 * Adds a user to the avoid list.
 * @param user - The user to add to the avoid list.
 * @returns void
 */
export function AddUserToAvoidList(response: express.Response, request: express.Request) {
    const avoidList = loadAvoidList();

    if (avoidList.avoidUsers.includes(request.body.user)) {
        response.send('User already in avoid list.');
    } else {
        avoidList.avoidUsers.push(request.body.user);
        fileSystem.writeFileSync('avoid-list.json', JSON.stringify(avoidList, null, "\t"));
        response.send('User added to avoid list.');
    }
}