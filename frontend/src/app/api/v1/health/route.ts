'use server';

import { NextResponse } from 'next/server';
import { CosmosClient } from '@azure/cosmos';

type HealthStatus = {
  status: string;
  timestamp: string;
  services: {
    cosmos_db: string;
    database: string;
    containers: {
      users: string;
      urls: string;
      anonymous: string;
    };
  };
};

type ErrorType = { message: string };

export async function GET() {
  const endpoint = process.env.COSMOSDB_ENDPOINT;
  const key = process.env.COSMOSDB_KEY;
  const databaseName = process.env.COSMOSDB_DATABASE_NAME || 'urlshortener';

  const health_status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      cosmos_db: 'healthy',
      database: 'healthy',
      containers: {
        users: 'healthy',
        urls: 'healthy',
        anonymous: 'healthy',
      },
    },
  };

  try {
    const client = new CosmosClient({ endpoint, key });
    const db = client.database(databaseName);
    await db.read();
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.cosmos_db = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  try {
    const client = new CosmosClient({ endpoint, key });
    const db = client.database(databaseName);
    const users = db.container('users');
    await users.read();
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.containers.users = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  try {
    const client = new CosmosClient({ endpoint, key });
    const db = client.database(databaseName);
    const urls = db.container('urls');
    await urls.read();
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.containers.urls = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  try {
    const client = new CosmosClient({ endpoint, key });
    const db = client.database(databaseName);
    const anonymous = db.container('anonymous_usage');
    await anonymous.read();
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.containers.anonymous = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  return NextResponse.json(health_status);
}
