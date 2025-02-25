import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { db } from '../../../db'
import { tickets, busTrips, salesRecords, agents } from '../../../db/schema'

export const APIRoute = createAPIFileRoute('/api/tickets')({
  GET: async ({ request }) => {
    try {
      // Get URL parameters
      const url = new URL(request.url)
      const busTripId = url.searchParams.get('busTripId')
      const isPaid = url.searchParams.get('isPaid')
      const departureDate = url.searchParams.get('departureDate')
      
      // Make page and limit optional with defaults
      const pageParam = url.searchParams.get('page')
      const limitParam = url.searchParams.get('limit')
      
      // Set default values if not provided
      const page = pageParam ? parseInt(pageParam) : 1
      const limit = limitParam ? parseInt(limitParam) : 10
      
      console.log('Query parameters:', { busTripId, isPaid, departureDate, page, limit });
      
      // Calculate offset for pagination (only if pagination is requested)
      const offset = (page - 1) * limit;
      
      // Build conditions array
      let conditions = [];
      
      // Filter by busTripId
      if (busTripId) {
        const tripId = parseInt(busTripId);
        if (!isNaN(tripId)) {
          conditions.push(eq(tickets.busTripId, tripId));
        }
      }
      
      // Filter by payment status
      if (isPaid !== null && isPaid !== undefined) {
        conditions.push(eq(tickets.isPaid, isPaid === 'true'));
      }
      
      // Handle departure date filter
      let eligibleTripIds = [];
      if (departureDate) {
        // First, find eligible bus trips
        const eligibleTrips = await db.query.busTrips.findMany({
          where: (trips) => {
            const date = new Date(departureDate);
            // Format date as SQL string in ISO format (YYYY-MM-DD)
            const formattedDate = date.toISOString().split('T')[0];
            // Compare just the date part
            return sql`DATE(${trips.departureDate}) = ${formattedDate}`;
          },
          columns: {
            id: true
          }
        });
        
        eligibleTripIds = eligibleTrips.map(trip => trip.id);
        
        // If we have eligible trips, add the condition
        if (eligibleTripIds.length > 0) {
          conditions.push(inArray(tickets.busTripId, eligibleTripIds));
        } else {
          // No trips match the date criteria, return empty result
          return json({
            success: true,
            data: {
              tickets: [],
              totalCount: 0,
              currentPage: pageParam ? page : null,
              totalPages: pageParam ? 0 : null
            }
          });
        }
      }
      
      // Get total count for pagination
      const countResult = await db.select({ count: sql`COUNT(*)` })
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      const totalCount = Number(countResult[0]?.count || 0);
      
      // Use the query builder API to get tickets
      let ticketsQuery = db.query.tickets.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: (tickets) => tickets.id
      });
      
      // Add pagination if requested
      if (pageParam || limitParam) {
        ticketsQuery.limit = limit;
        ticketsQuery.offset = offset;
      }
      
      // Execute the query to get tickets
      const ticketResults = await ticketsQuery;
      
      // Get additional data for each ticket
      const formattedTickets = await Promise.all(ticketResults.map(async (ticket) => {
        // Get related bus trip
        const busTrip = await db.query.busTrips.findFirst({
          where: eq(busTrips.id, ticket.busTripId)
        });
        
        // Get related agent
        const agent = await db.query.agents.findFirst({
          where: eq(agents.id, ticket.agentId)
        });
        
        // Get related sales record
        const salesRecord = await db.query.salesRecords.findFirst({
          where: eq(salesRecords.ticketId, ticket.id)
        });
        
        return {
          id: ticket.id,
          passenger: {
            name: ticket.passengerName,
            phone: ticket.passengerPhone
          },
          trip: busTrip ? {
            id: busTrip.id,
            departure: busTrip.departureCity,
            destination: busTrip.destinationCity,
            departureDate: busTrip.departureDate,
            price: busTrip.price
          } : null,
          seat: ticket.seatNumber,
          payment: {
            isPaid: ticket.isPaid,
            method: ticket.paymentMethod,
            amount: salesRecord?.amount || null,
            soldAt: salesRecord?.soldAt || ticket.soldAt
          },
          agent: agent ? {
            id: agent.id,
            name: agent.name,
            email: agent.email
          } : null,
          created: ticket.soldAt
        };
      }));
      
      // Prepare pagination info
      const paginationInfo = pageParam || limitParam ? {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      } : {
        currentPage: null,
        totalPages: null
      };
      
      return json({
        success: true,
        data: {
          tickets: formattedTickets,
          totalCount: totalCount,
          ...paginationInfo
        }
      });
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return json({ 
        success: false, 
        message: 'Failed to fetch tickets',
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
});