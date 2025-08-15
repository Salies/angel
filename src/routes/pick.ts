import { Elysia, t } from 'elysia'
import { getSessionParams, getAvailableMaps, createPick, getToken } from '../database/queries';
import { bearer } from '@elysiajs/bearer'

export const pickRoutes = new Elysia()
    .use(bearer())
    .post('/pick', ({ body: { sessionId, map, role }, status }) => {
        const { startingTeam, currIdx } = getSessionParams(sessionId);
        const teamShouldPick = (startingTeam + currIdx + 1) % 2;

        if( role !== teamShouldPick && role !== -1) {
            return status(403, "It's not your time to pick.");
        }

        const availableMaps = getAvailableMaps(sessionId);

        // this also catches when there's no maps left
        if (!availableMaps.includes(map)) {
            return status(400, 'The selected map is not available.');
        }

        createPick(sessionId, currIdx + 1, map);

        // return maps without the selected one
        return availableMaps.filter(m => m !== map);
    }, {
        beforeHandle({ bearer, body, status }) {
            if (!bearer) return status(400, 'Unauthorized')

            const tokenData = getToken(bearer);

            const currentTime = Date.now();

            if(!tokenData) return status(400, 'Unauthorized');

            if(currentTime > tokenData.expires_at) return status(401, 'Unauthorized');

            // get role from token
            body.role = tokenData.role - 1;
        },

        body: t.Object({
            sessionId: t.String(),
            map: t.String(),
            role: t.UnionEnum([-1, 0, 1])
        })
    })