import { Elysia, t } from 'elysia'
import { generateToken, verifyPassword } from '../utils/crypto'
import { getPasswordHash, createToken } from '../database/queries';

const roleMap = ['admin', 'first_team', 'second_team'];

export const authRoutes = new Elysia()
    .post('/auth', ({ body: { sessionId, role, password }, status }) => {
        const roleName = roleMap[role];
        const passHash = getPasswordHash(sessionId, roleName);

        if(!verifyPassword(password, passHash)) {
            return status(401);
        }
        
        const token = generateToken();
        const expiresAt = Date.now() + 3600_000;

        createToken(token, sessionId, role, expiresAt);

        return { token, expiresAt };
    }, {
        body: t.Object({
            sessionId: t.String(),
            password: t.String(),
            role: t.UnionEnum([0, 1, 2]),
        })
    })