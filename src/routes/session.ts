import { Elysia, t } from 'elysia'
import { db } from '../database/connection'
import { generatePassword, hashPassword } from '../utils/crypto'
import { createSession } from '../database/queries'

export const sessionRoutes = new Elysia()
    .post('/create', ({ body: { firstTeamName, secondTeamName, adminName, bestOf, startingTeam } }) => {
        const firstTeamPass = generatePassword();
        const secondTeamPass = generatePassword();
        const adminPass = generatePassword();

        const firstTeamPassHash = hashPassword(firstTeamPass);
        const secondTeamPassHash = hashPassword(secondTeamPass);
        const adminPassHash = hashPassword(adminPass);

        if(startingTeam == -1) {
            startingTeam = Math.floor(Math.random() * 2);
        }

        const sessionId = createSession(
            firstTeamName, secondTeamName, adminName,
            firstTeamPassHash, secondTeamPassHash, adminPassHash,
            bestOf, startingTeam
        );

        return { 
            sessionId, bestOf, startingTeam,
            firstTeamName, firstTeamPass,
            secondTeamName, secondTeamPass,
            adminName, adminPass
        };
    }, {
        body: t.Object({
            firstTeamName: t.String(),
            secondTeamName: t.String(),
            adminName: t.String(),
            bestOf: t.UnionEnum([1, 3, 5]),
            startingTeam: t.UnionEnum([-1, 0, 1]),
        })
    })