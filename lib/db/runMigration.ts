import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';

dotenv.config();

async function runMigration() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }

  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client);

  const migrationPath = path.join(process.cwd(), 'lib/db/migrations/0001_add_media_relations.sql');
  const migrationContent = await fs.readFile(migrationPath, 'utf-8');

  try {
    await client.unsafe(migrationContent);
    console.log('Migration executed successfully');
  } catch (error) {
    console.error('Error executing migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error); 