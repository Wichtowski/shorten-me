'use server';

import { CosmosClient, Container } from '@azure/cosmos';

const endpoint = process.env.COSMOSDB_ENDPOINT;
const key = process.env.COSMOSDB_KEY;
const databaseName = process.env.COSMOSDB_DATABASE_NAME || 'urlshortener';

if (!endpoint || !key) {
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
    return db.container('users');
  } catch (error) {
    console.error('Error getting users container:', error);
    throw error;
  }
}

export async function getUrlsContainer(): Promise<Container> {
  try {
    return db.container('urls');
  } catch (error) {
    console.error('Error getting urls container:', error);
    throw error;
  }
}

export async function getAnonymousContainer(): Promise<Container> {
  try {
    return db.container('anonymous_usage');
  } catch (error) {
    console.error('Error getting anonymous container:', error);
    throw error;
  }
}
