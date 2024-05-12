import { database } from "../database";

export function DeleteSoundFromDatabase(
    fileName: string
) {
    database.serialize(async () => {
        await database.run('DELETE FROM sounds WHERE name = ?', [fileName]);
    });
}