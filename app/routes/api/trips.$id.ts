import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '../../../db'
import { busTrips, tickets } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/trips/$id')({
  GET: async ({ request, params }) => {
    try {
      const tripId = parseInt(params.id)
      
      if (isNaN(tripId)) {
        return json({ 
          success: false, 
          error: 'Invalid trip ID' 
        }, { status: 400 })
      }
      
      // Query the specific trip by ID
      const trip = await db
        .select()
        .from(busTrips)
        .where(eq(busTrips.id, tripId))
        .limit(1)
      
      if (!trip || trip.length === 0) {
        return json({ 
          success: false, 
          error: 'Trip not found' 
        }, { status: 404 })
      }
      
      // Query tickets associated with this trip
      const tripTickets = await db
        .select({
          id: tickets.id
        })
        .from(tickets)
        .where(eq(tickets.busTripId, tripId))
      
      // Return the trip data along with tickets as JSON
      return json({ 
        success: true,
        data: {
          ...trip[0],
          tickets: tripTickets
        }
      })
    } catch (error) {
      // Handle any errors
      console.error('Error fetching trip:', error)
      return json({ 
        success: false, 
        error: 'Failed to fetch trip' 
      }, { status: 500 })
    }
  },
})