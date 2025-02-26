import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '../../../../db'
import { salesRecords, tickets, busTrips, agents } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/admin/sales')({
  GET: async () => {
    try {
      // Fetch total sales amount
      const totalSalesResult = await db
        .select({ total: sql<number>`SUM(${salesRecords.amount})` })
        .from(salesRecords)

      const totalSales = totalSalesResult[0]?.total || 0

      // Fetch list of sold tickets with relevant details
      const soldTickets = await db
        .select({
          ticketId: tickets.id,
          passengerName: tickets.passengerName,
          passengerPhone: tickets.passengerPhone,
          paymentMethod: tickets.paymentMethod,
          departureCity: busTrips.departureCity,
          destinationCity: busTrips.destinationCity,
          agentName: agents.name,
          saleAmount: salesRecords.amount,
          soldAt: salesRecords.soldAt,
        })
        .from(salesRecords)
        .innerJoin(tickets, eq(salesRecords.ticketId, tickets.id))
        .innerJoin(busTrips, eq(tickets.busTripId, busTrips.id))
        .innerJoin(agents, eq(salesRecords.soldBy, agents.id))
        .orderBy(salesRecords.soldAt)

      return json({
        success: true,
        data: {
          totalSales: Number(totalSales),
          soldTickets,
        },
      })
    } catch (error) {
      return json({ success: false, error: error.message }, { status: 500 })
    }
  },
})