import { mysqlTable, bigint, varchar, timestamp, boolean, decimal, int, uniqueIndex, foreignKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// Agents table
export const agents = mysqlTable('agents', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
  };
});

// Admins table
export const admins = mysqlTable('admins', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
  };
});

// Bus trips table
export const busTrips = mysqlTable('bus_trips', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  departureCity: varchar('departure_city', { length: 255 }).notNull(),
  destinationCity: varchar('destination_city', { length: 255 }).notNull(),
  departureDate: timestamp('departure_date').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdBy: bigint('created_by', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => {
  return {
    createdByFk: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [admins.id],
    }),
  };
});

// Tickets table
export const tickets = mysqlTable('tickets', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  busTripId: bigint('bus_trip_id', { mode: 'number' }).notNull(),
  seatNumber: int('seat_number').notNull(),
  passengerName: varchar('passenger_name', { length: 255 }).notNull(),
  passengerPhone: varchar('passenger_phone', { length: 50 }).notNull(),
  isPaid: boolean('is_paid').default(false),
  paymentMethod: varchar('payment_method', { length: 50 }).default('Cash'),
  soldBy: bigint('sold_by', { mode: 'number' }).notNull(),
  soldAt: timestamp('sold_at').default(sql`NOW()`),
}, (table) => {
  return {
    busTripIdFk: foreignKey({
      columns: [table.busTripId],
      foreignColumns: [busTrips.id],
    }),
    soldByFk: foreignKey({
      columns: [table.soldBy],
      foreignColumns: [agents.id],
    }),
  };
});

// Sales records table
export const salesRecords = mysqlTable('sales_records', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  ticketId: bigint('ticket_id', { mode: 'number' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  soldBy: bigint('sold_by', { mode: 'number' }).notNull(),
  soldAt: timestamp('sold_at').default(sql`NOW()`),
}, (table) => {
  return {
    ticketIdFk: foreignKey({
      columns: [table.ticketId],
      foreignColumns: [tickets.id],
    }),
    soldByFk: foreignKey({
      columns: [table.soldBy],
      foreignColumns: [agents.id],
    }),
    ticketIdIdx: uniqueIndex('ticket_id_idx').on(table.ticketId),
  };
});

// Example of how to define relationships for use with Drizzle's relations API
export const agentRelations = {
  salesRecords: {
    relation: 'one-to-many',
    schema: salesRecords,
    fields: [agents.id],
    references: [salesRecords.soldBy],
  },
  tickets: {
    relation: 'one-to-many',
    schema: tickets,
    fields: [agents.id],
    references: [tickets.soldBy],
  },
};

export const adminRelations = {
  busTrips: {
    relation: 'one-to-many',
    schema: busTrips,
    fields: [admins.id],
    references: [busTrips.createdBy],
  },
};

export const busTripRelations = {
  tickets: {
    relation: 'one-to-many',
    schema: tickets,
    fields: [busTrips.id],
    references: [tickets.busTripId],
  },
  admin: {
    relation: 'many-to-one',
    schema: admins,
    fields: [busTrips.createdBy],
    references: [admins.id],
  },
};

export const ticketRelations = {
  busTrip: {
    relation: 'many-to-one',
    schema: busTrips,
    fields: [tickets.busTripId],
    references: [busTrips.id],
  },
  agent: {
    relation: 'many-to-one',
    schema: agents,
    fields: [tickets.soldBy],
    references: [agents.id],
  },
  salesRecord: {
    relation: 'one-to-one',
    schema: salesRecords,
    fields: [tickets.id],
    references: [salesRecords.ticketId],
  },
};

export const salesRecordRelations = {
  ticket: {
    relation: 'one-to-one',
    schema: tickets,
    fields: [salesRecords.ticketId],
    references: [tickets.id],
  },
  agent: {
    relation: 'many-to-one',
    schema: agents,
    fields: [salesRecords.soldBy],
    references: [agents.id],
  },
};