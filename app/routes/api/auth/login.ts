import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import bcrypt from 'bcryptjs';
import { db } from '../../../../db';
import { agents } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/auth/login')({
    POST: async ({ request }) => {
        try {
            const { email, password } = await request.json();
            if (!email || !password) {
                return json({ success: false, error: 'Email and password are required' }, { status: 400 });
            }

            // Query the agents table using Drizzle
            const agent = await db.select().from(agents).where(eq(agents.email, email)).limit(1);
            if (agent.length === 0) {
                return json({ success: false, error: 'Invalid credentials' }, { status: 401 });
            }

            const passwordMatch = await bcrypt.compare(password, agent[0].passwordHash);
            if (!passwordMatch) {
                return json({ success: false, error: 'Invalid credentials' }, { status: 401 });
            }

            return json({
                success: true,
                message: 'Login successful',
                agent: { id: agent[0].id, name: agent[0].name, email: agent[0].email }
            });
        } catch (error) {
            console.error('Error during login:', error);
            return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
        }
    },
});