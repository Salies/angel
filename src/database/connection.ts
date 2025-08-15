import { Database } from "bun:sqlite";

const mapsFile = Bun.file('mapData.json');
const activeMaps = await mapsFile.json();

export const db = new Database('data.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        first_team_name TEXT NOT NULL,
        second_team_name TEXT NOT NULL,
        admin_name TEXT NOT NULL,
        first_team_pass_hash TEXT NOT NULL,
        second_team_pass_hash TEXT NOT NULL,
        admin_pass_hash TEXT NOT NULL,
        best_of INTEGER NOT NULL,
        starting_team INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS token (
        token TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS map (
        name TEXT PRIMARY KEY,
        pretty_name TEXT NOT NULL,
        image TEXT NOT NULL,
        active BOOLEAN NOT NULL
    );

    -- set all maps as inactive
    UPDATE map SET active = FALSE;

    CREATE TABLE IF NOT EXISTS pick (
        session_id TEXT NOT NULL,
        idx INTEGER NOT NULL,
        map TEXT NOT NULL,
        PRIMARY KEY (session_id, idx)
    );
`)

// active duty refresh
const insertMap = db.query(`
    INSERT INTO map (name, pretty_name, image, active)
    VALUES (?, ?, ?, TRUE)
    ON CONFLICT(name) DO UPDATE SET
        pretty_name = ?,
        image = ?,
        active = TRUE
`);

for (const map of activeMaps) {
    insertMap.run(map.name, map.pretty_name, map.image, map.pretty_name, map.image);
}

// clear tokens
db.query(`
    DELETE FROM token
    WHERE expires_at < ?
`).run(Date.now());