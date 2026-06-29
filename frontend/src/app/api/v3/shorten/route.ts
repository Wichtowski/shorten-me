'use server';

import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { createUrlRecord, deleteUrlRecord, resolveAuthToken } from '../_lib/kv';
import { V3Env } from '../_lib/types';

const runtimeEnv = env as unknown as V3Env;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const originalUrl = String(body.original_url || body.originalUrl || '').trim();
    const customSlug = body.custom_slug || body.customSlug;

    if (!originalUrl) {
      return NextResponse.json({ error: 'Missing original_url' }, { status: 400 });
    }

    const authToken = await resolveAuthToken(runtimeEnv, req.headers.get('authorization'));
    const userId = authToken?.user_id || 'anonymous';

    const url = await createUrlRecord(runtimeEnv, {
      originalUrl,
      userId,
      customSlug: customSlug ? String(customSlug) : undefined,
    });

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create short URL';
    const status = message === 'custom_slug already exists' || message === 'Invalid custom slug' ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authToken = await resolveAuthToken(runtimeEnv, req.headers.get('authorization'));
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const urlId = String(body.url_id || body.urlId || '').trim();

    if (!urlId) {
      return NextResponse.json({ error: 'URL ID is required' }, { status: 400 });
    }

    await deleteUrlRecord(runtimeEnv, urlId, authToken.user_id);
    return NextResponse.json({ message: 'URL deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'URL not found or unauthorized' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
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
