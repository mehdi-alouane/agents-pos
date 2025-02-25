import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { tickets, busTrips, agents, salesRecords } from '../../../db/schema'

// Define the ticket creation request type
interface CreateTicketRequest {
  busTripId: number;
  seatNumber: number;
  passengerName: string;
  passengerPhone: string;
  isPaid?: boolean;
  paymentMethod?: string;
  agentId: number;
}

export const APIRoute = createAPIFileRoute('/api/ticket')({
  POST: async ({ request }) => {
    try {
      // Parse the request body
      const body = await request.json() as CreateTicketRequest;
      
      console.log('Request body:', body); // Debug log
      
      // Validate required fields
      if (!body.busTripId || !body.seatNumber || !body.passengerName || 
          !body.passengerPhone || !body.agentId) {
        return json({ 
          success: false, 
          message: 'Missing required fields' 
        }, { status: 400 });
      }
      
      // Verify the agent exists
      const agent = await db.query.agents.findFirst({
        where: eq(agents.id, body.agentId)
      });
      
      if (!agent) {
        return json({ 
          success: false, 
          message: 'Agent not found' 
        }, { status: 404 });
      }
      
      // Verify the bus trip exists
      const busTrip = await db.query.busTrips.findFirst({
        where: eq(busTrips.id, body.busTripId)
      });
      
      if (!busTrip) {
        return json({ 
          success: false, 
          message: 'Bus trip not found' 
        }, { status: 404 });
      }
      
      // Check if seat is already taken
      const existingSeat = await db.query.tickets.findFirst({
        where: (tickets) => {
          return eq(tickets.busTripId, body.busTripId) && 
                 eq(tickets.seatNumber, body.seatNumber);
        }
      });
      
      if (existingSeat) {
        return json({ 
          success: false, 
          message: 'Seat is already taken' 
        }, { status: 400 });
      }
      
      // Create the ticket with a simpler approach
      const insertData = {
        busTripId: body.busTripId,
        seatNumber: body.seatNumber,
        passengerName: body.passengerName,
        passengerPhone: body.passengerPhone,
        isPaid: !!body.isPaid,
        paymentMethod: body.paymentMethod || 'Cash',
        soldBy: body.agentId
      };
      
      console.log('Inserting ticket with data:', insertData);
      
      // Insert the ticket and find the most recently created ticket that matches our data
      await db.insert(tickets).values(insertData);
      
      // Find the newly created ticket
      const newTicket = await db.query.tickets.findFirst({
        where: (t) => eq(t.busTripId, body.busTripId) && 
                      eq(t.seatNumber, body.seatNumber) && 
                      eq(t.passengerName, body.passengerName),
        orderBy: (t) => t.id,
        direction: 'desc'
      });
      
      if (!newTicket) {
        throw new Error('Could not find the created ticket');
      }
      
      console.log('Created ticket:', newTicket);
      
      // If ticket is paid, create a sales record
      if (body.isPaid && newTicket) {
        const salesData = {
          ticketId: newTicket.id,
          amount: busTrip.price,
          soldBy: body.agentId
        };
        
        console.log('Creating sales record:', salesData);
        
        await db.insert(salesRecords).values(salesData);
      }
      
      return json({ 
        success: true, 
        message: 'Ticket created successfully',
        ticket: newTicket
      }, { status: 201 });
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      return json({ 
        success: false, 
        message: 'Failed to create ticket',
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  },
});