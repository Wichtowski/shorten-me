'use server';

import { CosmosClient, Container } from '@azure/cosmos';

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseName = process.env.COSMOSDB_DATABASE_NAME || 'urlshortener';

const client = new CosmosClient({ endpoint, key });
const db = client.database(databaseName);

export async function getUsersContainer(): Promise<Container> {
  return db.container('users');
}

export async function getUrlsContainer(): Promise<Container> {
  return db.container('urls');
}

export async function getAnonymousContainer(): Promise<Container> {
  return db.container('anonymous_usage');
}
