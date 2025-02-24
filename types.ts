// TypeScript interfaces for the bus booking system

// Agent type
export interface Agent {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  }
  
  // Admin type
  export interface Admin {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  }
  
  // BusTrip type
  export interface BusTrip {
    id: number;
    departureCity: string;
    destinationCity: string;
    departureDate: Date;
    price: number;
    createdBy: number;
    createdAt: Date;
    
    // Relations
    admin?: Admin;
    tickets?: Ticket[];
  }
  
  // Ticket type
  export interface Ticket {
    id: number;
    busTripId: number;
    seatNumber: number;
    passengerName: string;
    passengerPhone: string;
    isPaid: boolean;
    paymentMethod: string;
    soldBy: number;
    soldAt: Date;
    
    // Relations
    busTrip?: BusTrip;
    agent?: Agent;
    salesRecord?: SalesRecord;
  }
  
  // SalesRecord type
  export interface SalesRecord {
    id: number;
    ticketId: number;
    amount: number;
    soldBy: number;
    soldAt: Date;
    
    // Relations
    ticket?: Ticket;
    agent?: Agent;
  }
  
  // Types with relations fully populated
  export interface AgentWithRelations extends Agent {
    salesRecords: SalesRecord[];
    tickets: Ticket[];
  }
  
  export interface AdminWithRelations extends Admin {
    busTrips: BusTrip[];
  }
  
  export interface BusTripWithRelations extends BusTrip {
    tickets: Ticket[];
    admin: Admin;
  }
  
  export interface TicketWithRelations extends Ticket {
    busTrip: BusTrip;
    agent: Agent;
    salesRecord: SalesRecord;
  }
  
  export interface SalesRecordWithRelations extends SalesRecord {
    ticket: Ticket;
    agent: Agent;
  }