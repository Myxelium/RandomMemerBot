import { Database } from 'sqlite3';

export const database = new Database('randomMemerDatabase.sqlite');

export function startDatabase() {
    database.serialize(() => {
        database.run('CREATE TABLE IF NOT EXISTS sounds (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, guild TEXT, user TEXT, date TEXT)');
    });
}
