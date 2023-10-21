import express from 'express';
import fs from 'fs';
import { loadAvoidList } from '../../helpers/load-avoid-list';

/**
 * Removes a user from the avoid list.
 * @param user - The user to remove from the avoid list.
 * @returns void
 */
export function DeleteUserFromAvoidList(response: express.Response, request: express.Request) {
    const avoidList = loadAvoidList();

    if (avoidList.avoidUsers.includes(request.params.user)) {
        avoidList.avoidUsers = avoidList.avoidUsers.filter(user => user !== request.params.user);
        fs.writeFileSync('avoid-list.json', JSON.stringify(avoidList, null, "\t"));
        response.send('User removed from avoid list.');
    } else {
        response.send('User not in avoid list.');
    }
}