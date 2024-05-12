import { database } from "../database";

export function AddSoundToDatabase(
    fileName: string, 
    guild: string = "unknown", 
    user: string = "unknown"
) {
    database.serialize(async () => {
        await database.run('INSERT INTO sounds (name, guild, user, date) VALUES (?,?,?,?)', [fileName, guild, user, new Date().toISOString()]);
    });
}