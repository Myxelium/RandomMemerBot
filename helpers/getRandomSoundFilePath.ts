import * as fileSystem from 'fs';

export const soundsDirectory = './sounds/';
/**
 * Returns a random sound file from the sounds directory.
 * @returns string - The path to a random sound file.
 */
export function getRandomSoundFilePath(): string {
    const allSoundFilesAsArray = fileSystem.readdirSync(soundsDirectory).filter(file => file.endsWith('.mp3'));
    return soundsDirectory + allSoundFilesAsArray[Math.floor(Math.random() * allSoundFilesAsArray.length)];
}