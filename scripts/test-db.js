import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.POSTGRES_URL;
console.log('Testing connection to:', connectionString ? connectionString.replace(/:[^:]*@/, ':****@') : 'undefined');

if (!connectionString) {
    console.error('POSTGRES_URL is not defined');
    process.exit(1);
}

const sql = postgres(connectionString);

async function testConnection() {
    try {
        const result = await sql`SELECT version()`;
        console.log('Connection successful!');
        console.log('Database version:', result[0].version);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await sql.end();
    }
}

testConnection();
