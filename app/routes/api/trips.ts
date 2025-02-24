import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '../../../db' // Your fixed Drizzle DB instance
import { busTrips } from '../../../db/schema' // Your schema definition

export const APIRoute = createAPIFileRoute('/api/trips')({
  GET: async ({ request, params }) => {
    try {
      // Query the bus_trips table using Drizzle
      const trips = await db.select().from(busTrips)
      
      // Return the trips data as JSON
      return json({ 
        success: true,
        data: trips 
      })
    } catch (error) {
      // Handle any errors
      console.error('Error fetching trips:', error)
      return json({ 
        success: false, 
        error: 'Failed to fetch trips' 
      }, { status: 500 })
    }
  },
})