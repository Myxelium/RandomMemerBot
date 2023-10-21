/**
 * Formats a name into a file name with random generated value at the end.
 * @param name - The name to generate a file name for.
 * @returns string - The generated file name.
 */
export function generateFileName(name: string): string {
    const randomHex = [...Array(3)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    const formattedName = name
        .replace(/\(.*?\)|\[.*?\]/g, '')
        .split(' ')
        .filter(word => /^[a-zA-Z0-9]/.test(word))
        .join(' ')
        .replace(/\s+/g, ' ')
        .replace('.mp3', '');

    return `${formattedName}-${randomHex}.mp3`;
}