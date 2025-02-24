import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create a MySQL connection pool using the connection string
const pool = mysql.createPool(process.env.DATABASE_URL);

// Initialize drizzle with the pool connection
export const db = drizzle(pool, { schema, mode: 'mysql' });