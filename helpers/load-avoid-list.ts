import * as fileSystem from 'fs';
import { AvoidList } from '../models/avoid-list';

/**
 * Returns a list of users that the bot should avoid being in same channel as.
 * @returns avoidList
 */
export function loadAvoidList(): AvoidList {
    return JSON.parse(fileSystem.readFileSync("avoid-list.json", 'utf-8'));
}