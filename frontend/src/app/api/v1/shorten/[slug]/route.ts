'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer, getAnonymousContainer } from '@/app/api/v1/utils/cosmos';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const slug = request.nextUrl.pathname.split('/').pop();

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  // Search in anonymous_usage
  const anonContainer = await getAnonymousContainer();
  const anonQuery = {
    query: 'SELECT * FROM c WHERE c.short_url = @short_url',
    parameters: [{ name: '@short_url', value: slug }],
  };
  const anonResult = await anonContainer.items.query(anonQuery).fetchAll();
  if (anonResult.resources.length > 0) {
    return NextResponse.json({ url: anonResult.resources[0] });
  }
  // Search in urls
  const urlsContainer = await getUrlsContainer();
  const urlsQuery = {
    query: 'SELECT * FROM c WHERE c.short_url = @short_url',
    parameters: [{ name: '@short_url', value: slug }],
  };
  const urlsResult = await urlsContainer.items.query(urlsQuery).fetchAll();
  if (urlsResult.resources.length > 0) {
    return NextResponse.json({ url: urlsResult.resources[0] });
  }
  return NextResponse.json({ error: 'slug not found' }, { status: 404 });
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
