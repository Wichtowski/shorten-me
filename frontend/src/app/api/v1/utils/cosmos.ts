'use server';

import { CosmosClient, Container } from '@azure/cosmos';

const endpoint = process.env.COSMOSDB_ENDPOINT;
const key = process.env.COSMOSDB_KEY;
const databaseName = process.env.COSMOSDB_DATABASE_NAME || 'urlshortener';

console.log('CosmosDB: Initializing with config:', {
  endpoint: endpoint ? 'Set' : 'Not set',
  key: key ? 'Set' : 'Not set',
  databaseName
});

if (!endpoint || !key) {
  console.error('CosmosDB: Missing required environment variables:', {
    COSMOSDB_ENDPOINT: endpoint ? 'Set' : 'Not set',
    COSMOSDB_KEY: key ? 'Set' : 'Not set'
  });
  throw new Error('Missing required environment variables: COSMOSDB_ENDPOINT and/or COSMOSDB_KEY');
}

const client = new CosmosClient({
  endpoint,
  key,
  userAgentSuffix: 'shorten-me-app',
});

const db = client.database(databaseName);

export async function getUsersContainer(): Promise<Container> {
  try {
    console.log('CosmosDB: Getting users container');
    return db.container('users');
  } catch (error) {
    console.error('CosmosDB: Error getting users container:', error);
    throw error;
  }
}

export async function getUrlsContainer(): Promise<Container> {
  try {
    console.log('CosmosDB: Getting urls container');
    return db.container('urls');
  } catch (error) {
    console.error('CosmosDB: Error getting urls container:', error);
    throw error;
  }
}

export async function getAnonymousContainer(): Promise<Container> {
  try {
    console.log('CosmosDB: Getting anonymous container');
    return db.container('anonymous_usage');
  } catch (error) {
    console.error('CosmosDB: Error getting anonymous container:', error);
    throw error;
  }
}
