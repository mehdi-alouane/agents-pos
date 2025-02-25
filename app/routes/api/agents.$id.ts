import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '../../../db';
import { agents } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/agents/$id')({
  GET: async ({ request, params }) => {
    const agentId = parseInt(params.id);

    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    return json(agent);
  },
})
