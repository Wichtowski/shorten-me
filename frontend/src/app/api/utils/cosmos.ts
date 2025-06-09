'use server';

import { CosmosClient, Container, Database } from '@azure/cosmos';

const endpoint = process.env.COSMOSDB_ENDPOINT;
const key = process.env.COSMOSDB_KEY;
const databaseName = process.env.COSMOSDB_DATABASE_NAME || 'urlshortener';

if (!endpoint || !key) {
  throw new Error('CosmosDB credentials are not properly configured');
}

const client = new CosmosClient({ endpoint, key });
let db: Database;

async function initializeDatabase() {
  try {
    const { database } = await client.databases.createIfNotExists({
      id: databaseName
    });
    db = database;
    
    // Initialize containers if they don't exist
    await db.containers.createIfNotExists({
      id: 'users',
      partitionKey: { paths: ['/id'] }
    });
    
    // Update URLs container to use user_id as partition key
    await db.containers.createIfNotExists({
      id: 'urls',
      partitionKey: { paths: ['/user_id'] }
    });
    
    await db.containers.createIfNotExists({
      id: 'anonymous_usage',
      partitionKey: { paths: ['/id'] }
    });
    
    console.log('Database and containers initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database on module load
initializeDatabase().catch(console.error);

export async function getUsersContainer(): Promise<Container> {
  if (!db) {
    await initializeDatabase();
  }
  return db.container('users');
}

export async function getUrlsContainer(): Promise<Container> {
  if (!db) {
    await initializeDatabase();
  }
  return db.container('urls');
}

export async function getAnonymousContainer(): Promise<Container> {
  if (!db) {
    await initializeDatabase();
  }
  return db.container('anonymous_usage');
}
