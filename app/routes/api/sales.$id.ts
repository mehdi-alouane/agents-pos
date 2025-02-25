import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '../../../db'
import { salesRecords, agents, tickets } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/sales/$id')({
  GET: async ({ request, params }) => {
    // Get the agent ID from query params
    const agentId = parseInt(params.id)

    if (!agentId) {
      return json({ error: 'Agent ID is required' }, { status: 400 })
    }

    try {
      // Fetch sales records for the agent, including ticket details
      const records = await db
      .select({
        id: salesRecords.id,
        amount: salesRecords.amount,
        soldAt: salesRecords.soldAt,
        ticketId: salesRecords.ticketId,
        agentName: agents.name, // Get agent name from the agents table
        ticketPassengerName: tickets.passengerName, // Get passenger name from the tickets table
      })
      .from(salesRecords)
      .leftJoin(agents, eq(agents.id, salesRecords.soldBy))
      .leftJoin(tickets, eq(tickets.id, salesRecords.ticketId))
      .where(eq(salesRecords.soldBy, agentId))

      return json(records)
    } catch (error) {
      return json({ error: 'Failed to fetch sales history' }, { status: 500 })
    }
  },
})
