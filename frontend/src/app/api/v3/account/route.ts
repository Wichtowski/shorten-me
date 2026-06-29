'use server';

import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { deleteAllUrlsForUser, deleteUserRecord, resolveAuthToken } from '../_lib/kv';
import { V3Env } from '../_lib/types';

const runtimeEnv = env as unknown as V3Env;

export async function DELETE(req: NextRequest) {
  try {
    const authToken = await resolveAuthToken(runtimeEnv, req.headers.get('authorization'));
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteAllUrlsForUser(runtimeEnv, authToken.user_id);
    await deleteUserRecord(runtimeEnv, authToken.user_id);

    return NextResponse.json({ message: 'Account and associated URLs deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
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
