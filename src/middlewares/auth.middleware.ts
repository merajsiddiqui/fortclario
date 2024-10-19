import { FastifyRequest, FastifyReply } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
    user?: any;
    orgId?: string;
}

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply, next: Function) {
    try {
        const userId = request.headers['x-user-id'];
        const orgId = request.headers['x-org-id'];
        console.log("Calling middleware")
        if (!userId || !orgId) {
            reply.status(401).send({ error: 'Missing user or organization information' });
            return;
        }

        if (userId !== '1') {
            reply.status(401).send({ error: 'Unauthorized user' });
            return;
        }

        request.user = 'meraj';
        request.orgId = orgId as string;
        next();
    } catch (error) {
        reply.status(401).send({ error: 'Authentication failed' });
    }
}

export function authorize(roles: string[]) {
    return async (request: AuthenticatedRequest, reply: FastifyReply) => {
        if (!request.user) {
            reply.status(401).send({ error: 'User not authenticated' });
            return;
        }

        if (!roles.includes(request.user.role)) {
            reply.status(403).send({ error: 'User not authorized' });
            return;
        }
    };
}
