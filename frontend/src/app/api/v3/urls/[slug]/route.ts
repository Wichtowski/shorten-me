'use server';

import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { findUrlBySlug, incrementUrlClicks } from '../../_lib/kv';
import { V3Env } from '../../_lib/types';

const runtimeEnv = env as unknown as V3Env;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const slug = request.nextUrl.pathname.split('/').pop();

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    const url = await findUrlBySlug(runtimeEnv, slug);
    if (!url) {
      return NextResponse.json({ error: 'slug not found' }, { status: 404 });
    }

    const updated = await incrementUrlClicks(runtimeEnv, url);
    return NextResponse.json({ url: updated, original_url: updated.original_url });
  } catch (error) {
    console.error('Error resolving URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
