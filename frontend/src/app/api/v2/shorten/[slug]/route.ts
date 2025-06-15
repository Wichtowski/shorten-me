'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getMongoCluster } from '@/app/api/v2/utils/mongodb';
import Url from '@/app/api/v2/models/Url';
import AnonymousUsage from '@/app/api/v2/models/AnonymousUsage';

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const slug = request.nextUrl.pathname.split('/').pop();

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    await getMongoCluster();

    // Search in anonymous_usage
    const anonUrl = await AnonymousUsage.findOne({ short_url: slug });
    if (anonUrl) {
      return NextResponse.json({ url: anonUrl });
    }

    // Search in urls
    const url = await Url.findOne({ short_url: slug });
    if (url) {
      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: 'slug not found' }, { status: 404 });
  } catch (error) {
    console.error('Error finding URL:', error);
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
