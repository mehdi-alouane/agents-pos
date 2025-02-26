# 🚌 Bus Ticketing System

A modern bus ticketing system featuring an Agent POS (Point of Sale) interface and Admin Panel for managing bus trips and sales.

## ✨ Features

### Agent Panel (POS Interface)
- **Search Trips**: Find available trips by departure city, destination, and date
- **Book Seats**: Select available seats and enter passenger details (Name, Phone)
- **Sell Tickets**: Process payments (Cash only) and save transaction details
- **Generate Tickets**: Create printable/downloadable PDF tickets
- **View Sales History**: Track all past sales

### Admin Panel
- **Sales Analytics**: View total sales and detailed records of all sold tickets
- **Trip Management**: Add and manage bus trips (departure, destination, date, price)

## 🚀 Tech Stack

- **Frontend**: React (Vite) with TanStack Start
- **Data Fetching**: TanStack Query
- **Styling**: TailwindCSS with Shadcn UI components
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Basic login system

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or newer)
- MySQL (v8.0 or newer)
- Git

### Clone the Repository
```bash
git clone https://github.com/mehdi-alouane/agents-pos bus-ticketing-system
cd bus-ticketing-system
```

### Install Dependencies
```bash
pnpm install
```

### Environment Configuration
Create a `.env` file in the root directory with the following variables:
```
# Database Configuration
DATABASE_URL=
# Application Configuration
JWT_SECRET=
```

### Database Setup
1. Create a MySQL database:
```bash
mysql -u root -p
CREATE DATABASE bus_ticketing;
exit;
```

2. Run Drizzle migrations:
```bash
pnpm run db:migrate
```

3. Seed the database with initial data:
```bash
pnpm run db:seed 
```

OR use the "seed.ts" file to populate data into database

## 🚀 Running the Application

### Development Mode
```bash
pnpm run dev
```
The application will be available at `http://localhost:3000`

### Build for Production
```bash
pnpm run build
pnpm run preview
```

## 📊 Database Schema

The project uses Drizzle ORM with the following main tables:

- **users**: Admin and agent accounts
- **trips**: Bus trip information (routes, times, prices)
- **seats**: Available seats for each trip
- **bookings**: Customer booking information
- **tickets**: Issued ticket details
- **sales**: Sales transaction records
