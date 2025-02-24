import { db } from './db';
import { agents, admins, busTrips, tickets, salesRecords } from './db/schema';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seed() {
  // Helper for password hashing
  const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  };
  
  console.log('🌱 Seeding database with Moroccan data...');
  
  // Clear existing data
  await db.delete(salesRecords);
  await db.delete(tickets);
  await db.delete(busTrips);
  await db.delete(agents);
  await db.delete(admins);
  
  // Create admins
  const adminData = [
    { name: 'Youssef Alaoui', email: 'youssef.alaoui@buscompany.ma', password: 'admin123' },
    { name: 'Salma Benjelloun', email: 'salma.benjelloun@buscompany.ma', password: 'admin456' },
    { name: 'Hassan El Fassi', email: 'hassan.elfassi@buscompany.ma', password: 'admin789' }
  ];
  
  const adminIds = [];
  
  for (const admin of adminData) {
    const passwordHash = await hashPassword(admin.password);
    const [result] = await db.insert(admins).values({
      name: admin.name,
      email: admin.email,
      passwordHash
    }).execute();
    
    adminIds.push(Number(result.insertId));
    console.log(`Created admin: ${admin.name}`);
  }
  
  // Create agents
  const agentData = [
    { name: 'Karim Tazi', email: 'karim.tazi@buscompany.ma', password: 'agent123' },
    { name: 'Amina Bouabid', email: 'amina.bouabid@buscompany.ma', password: 'agent456' },
    { name: 'Mohammed Ziani', email: 'mohammed.ziani@buscompany.ma', password: 'agent789' },
    { name: 'Nadia El Mansouri', email: 'nadia.elmansouri@buscompany.ma', password: 'agent101' },
    { name: 'Omar Bensouda', email: 'omar.bensouda@buscompany.ma', password: 'agent202' }
  ];
  
  const agentIds = [];
  
  for (const agent of agentData) {
    const passwordHash = await hashPassword(agent.password);
    const [result] = await db.insert(agents).values({
      name: agent.name,
      email: agent.email,
      passwordHash
    }).execute();
    
    agentIds.push(Number(result.insertId));
    console.log(`Created agent: ${agent.name}`);
  }
  
  // Create bus trips
  const moroccanCities = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fez', 'Tangier', 
    'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan',
    'Essaouira', 'Chefchaouen', 'El Jadida', 'Ouarzazate', 'Safi'
  ];
  
  const tripData = [];
  const now = new Date();
  
  // Generate trips for the next 30 days
  for (let day = 1; day <= 30; day++) {
    const departureDate = new Date(now);
    departureDate.setDate(now.getDate() + day);
    
    // Generate multiple trips each day between different cities
    for (let i = 0; i < 8; i++) {
      let departureCity, destinationCity;
      
      // Ensure departure and destination cities are different
      do {
        departureCity = moroccanCities[Math.floor(Math.random() * moroccanCities.length)];
        destinationCity = moroccanCities[Math.floor(Math.random() * moroccanCities.length)];
      } while (departureCity === destinationCity);
      
      // Set different departure times throughout the day
      const hour = 6 + Math.floor(Math.random() * 15); // Between 6 AM and 9 PM
      departureDate.setHours(hour, 0, 0, 0);
      
      // Price based on distance (simulated)
      const price = 50 + Math.floor(Math.random() * 250); // Between 50 and 300 MAD
      
      // Admin who created the trip
      const createdBy = adminIds[Math.floor(Math.random() * adminIds.length)];
      
      tripData.push({
        departureCity,
        destinationCity,
        departureDate: new Date(departureDate),
        price,
        createdBy
      });
    }
  }
  
  const tripIds = [];
  
  for (const trip of tripData) {
    const [result] = await db.insert(busTrips).values({
      ...trip,
      price: trip.price.toString(),
    }).execute();
    tripIds.push(Number(result.insertId));
  }
  
  console.log(`Created ${tripIds.length} bus trips`);
  
  // Create tickets and sales records
  const firstNames = [
    'Mehdi', 'Fatima', 'Ahmed', 'Amal', 'Youssef', 'Leila', 'Hamza', 'Hajar', 
    'Karim', 'Samira', 'Rachid', 'Nora', 'Khalid', 'Zineb', 'Hassan', 'Loubna',
    'Samir', 'Malika', 'Tariq', 'Naima', 'Jamal', 'Amina', 'Abdelali', 'Houda',
    'Ismail', 'Khadija', 'Soufiane', 'Rim', 'Mourad', 'Sanaa'
  ];
  
  const lastNames = [
    'El Amrani', 'Benchekroun', 'Ziani', 'Tahiri', 'Alaoui', 'Benjelloun', 'Chaoui', 
    'El Fassi', 'Lahlou', 'Bouabid', 'El Mansouri', 'Bensouda', 'Berrada', 
    'El Idrissi', 'Bennis', 'Chraibi', 'El Moussa', 'Amrani', 'Benkirane', 'Drissi',
    'Benomar', 'Tazi', 'Sabri', 'El Alami', 'El Kadiri', 'Bennani', 'El Harrak',
    'El Othmani', 'Cherkaoui', 'El Baz'
  ];
  
  const ticketCount = Math.min(tripIds.length * 20, 1000); // Cap at 1000 tickets
  
  for (let i = 0; i < ticketCount; i++) {
    const tripIndex = Math.floor(Math.random() * tripIds.length);
    const tripId = tripIds[tripIndex];
    const seatNumber = 1 + Math.floor(Math.random() * 45); // Buses with 45 seats
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const passengerName = `${firstName} ${lastName}`;
    
    // Generate Moroccan-style phone number
    const passengerPhone = `+212${6 + Math.floor(Math.random() * 3)}${Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}`;
    
    // Random payment status
    const isPaid = Math.random() > 0.1; // 90% of tickets are paid
    
    // Payment methods: Cash, Credit Card, Mobile Payment
    const paymentMethods = ['Cash', 'Credit Card', 'Mobile Payment'];
    const paymentMethod = isPaid ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : 'Cash';
    
    // Agent who sold the ticket
    const soldBy = agentIds[Math.floor(Math.random() * agentIds.length)];
    
    // Sold date within the past 14 days
    const soldAt = new Date(now);
    soldAt.setDate(now.getDate() - Math.floor(Math.random() * 14));
    
    // Create the ticket
    const [ticketResult] = await db.insert(tickets).values({
      busTripId: tripId,
      seatNumber,
      passengerName,
      passengerPhone,
      isPaid,
      paymentMethod,
      soldBy,
      soldAt
    }).execute();
    
    const ticketId = Number(ticketResult.insertId);
    
    // Create sales record if the ticket is paid
    if (isPaid) {
      // Get the trip to determine price
      const [tripData] = await db.select().from(busTrips).where(eq(busTrips.id, tripId)).limit(1).execute();
      const amount = Number(tripData.price);      

      await db.insert(salesRecords).values({
        ticketId,
        amount: amount.toString(), // Convert amount to a string
        soldBy,
        soldAt
      }).execute();
    }
  }
  
  console.log(`Created ${ticketCount} tickets with corresponding sales records`);
  console.log('✅ Seed completed successfully!');
}

// Run the seed function
seed().catch(error => {
  console.error('❌ Seed failed:');
  console.error(error);
  process.exit(1);
});