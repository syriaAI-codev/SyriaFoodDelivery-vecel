import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';

neonConfig.fetchOptions = {
  cache: 'no-store',
};

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Create a neon client with the DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

// Create a drizzle client with the neon client and schema
export const db = drizzle(sql, { schema });
