import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { db } from '../../../db';
import { agents } from '..//../../db/schema';

export const APIRoute = createAPIFileRoute('/api/agents')({
  GET : async () => {
    const agentsPayload = await db.select().from(agents);
    return json(agentsPayload);
  }  
  
});