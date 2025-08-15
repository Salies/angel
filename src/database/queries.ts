import { db } from './connection'
import { nanoid } from 'nanoid'

export function createSession(
    firstTeamName: string,
    secondTeamName: string,
    adminName: string,
    firstTeamPassHash: string,
    secondTeamPassHash: string,
    adminPassHash: string,
    bestOf: number,
    startingTeam: number
) {
    const id = nanoid(16);

    const createdAt = Date.now();

    db.exec(`
        INSERT INTO session (
            id, first_team_name, second_team_name, admin_name,
            first_team_pass_hash, second_team_pass_hash, admin_pass_hash,
            best_of, starting_team,
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        id, firstTeamName, secondTeamName, adminName,
        firstTeamPassHash, secondTeamPassHash, adminPassHash,
        bestOf, startingTeam,
        createdAt, createdAt
    ]);

    return id;
};

export function getSessionParams(sessionId: string): {startingTeam: number; currIdx: number;} {
    return db.query(`
        SELECT starting_team AS startingTeam, (SELECT IFNULL(MAX(idx), -1) FROM pick WHERE session_id = ?) AS currIdx
        FROM session
        WHERE id = ?
    `).get(sessionId, sessionId);
}

export function getAvailableMaps(sessionId: string): string[] {
    return db.query(`
        SELECT map.name
        FROM map
        LEFT JOIN pick
        ON map.name = pick.map
        AND pick.session_id = ?
        WHERE pick.map IS NULL
    `).all(sessionId).map(row => row.name);
}

export function createPick(sessionId: string, idx: number, map: string) {
    db.exec(`
        INSERT INTO pick (session_id, idx, map)
        VALUES (?, ?, ?)
    `, [sessionId, idx, map]);
}

export function getPasswordHash(sessionId: string, role: string) {
    const roleFmt = role + '_pass_hash';
    // looks weird but it's safe, since role
    // is picked from a hardcoded array
    return db.query(`
        SELECT ${roleFmt}
        FROM session
        WHERE id = ?
    `).get(sessionId)[roleFmt];
}

export function createToken(token:string, sessionId: string, role: number, expiresAt: number) {
    db.exec(`
        INSERT INTO token (token, session_id, role, expires_at)
        VALUES (?, ?, ?, ?)
    `, [token, sessionId, role, expiresAt]);
}

export function getToken(token: string) {
    return db.query(`
        SELECT *
        FROM token
        WHERE token = ?
    `).get(token);
}