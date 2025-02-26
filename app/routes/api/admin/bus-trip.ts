import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '../../../../db'
import { busTrips } from '../../../../db/schema'
import { z } from 'zod'

// Define validation schema for bus trip creation
const createBusTripSchema = z.object({
  departureCity: z.string().min(1, "Departure city is required"),
  destinationCity: z.string().min(1, "Destination city is required"),
  departureDate: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Invalid date format"
  }),
  price: z.number().positive("Price must be positive")
});

export const APIRoute = createAPIFileRoute('/api/admin/bus-trip')({
  // Add POST method for creating bus trips
  POST: async ({ request }) => {
    try {
      // Parse request body
      const body = await request.json();
      
      // Validate input
      const result = createBusTripSchema.safeParse(body);
      
      if (!result.success) {
        return json({ 
          success: false, 
          error: result.error.errors 
        }, { status: 400 });
      }
      
      const { departureCity, destinationCity, departureDate, price } = result.data;
      
      // Insert new bus trip into database without using returning()
      await db.insert(busTrips).values({
        departureCity,
        destinationCity,
        departureDate: new Date(departureDate),
        price,
        createdBy: 1, // Using a fixed admin ID for simplicity
      });
      
      return json({ 
        success: true, 
        message: "Bus trip created successfully"
      });
      
    } catch (error) {
      console.error('Failed to create bus trip:', error);
      return json({ 
        success: false, 
        error: 'Failed to create bus trip' 
      }, { status: 500 });
    }
  }
})