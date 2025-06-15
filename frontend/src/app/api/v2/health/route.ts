'use server';

import { NextResponse } from 'next/server';
import { getMongoCluster } from '@/app/api/v2/utils/mongodb';

type HealthStatus = {
  status: string;
  timestamp: string;
  services: {
    mongodb: string;
    database: string;
    collections: {
      users: string;
      urls: string;
      anonymous: string;
    };
  };
};

type ErrorType = { message: string };

export async function GET() {
  const health_status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'healthy',
      database: 'healthy',
      collections: {
        users: 'healthy',
        urls: 'healthy',
        anonymous: 'healthy',
      },
    },
  };

  try {
    await getMongoCluster();
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.mongodb = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  try {
    const mongoose = await getMongoCluster();
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    await mongoose.connection.db.command({ ping: 1 });
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.database = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  try {
    const mongoose = await getMongoCluster();
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    await mongoose.connection.db.collection('users').findOne({});
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.collections.users = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  try {
    const mongoose = await getMongoCluster();
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    await mongoose.connection.db.collection('urls').findOne({});
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.collections.urls = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  try {
    const mongoose = await getMongoCluster();
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    await mongoose.connection.db.collection('anonymous_usage').findOne({});
  } catch (e) {
    const err = e as ErrorType;
    health_status.services.collections.anonymous = `unhealthy: ${err.message}`;
    health_status.status = 'unhealthy';
  }

  return NextResponse.json(health_status);
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
