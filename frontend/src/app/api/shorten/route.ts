'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer, getAnonymousContainer } from '../utils/cosmos';
import { v4 as uuidv4 } from 'uuid';

function randomSlug(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  const { original_url, user_id = 'anonymous', custom_slug } = await req.json();
  if (!original_url) {
    return NextResponse.json({ error: 'Missing original_url' }, { status: 400 });
  }
  const slug = custom_slug || randomSlug();
  const container =
    user_id === 'anonymous' ? await getAnonymousContainer() : await getUrlsContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.short_url = @short_url',
    parameters: [{ name: '@short_url', value: slug }],
  };
  const { resources } = await container.items.query(query).fetchAll();
  if (resources.length > 0) {
    return NextResponse.json({ error: 'custom_slug already exists' }, { status: 400 });
  }
  const url_id = uuidv4();
  const urlDoc = {
    id: url_id,
    user_id,
    original_url,
    short_url: slug,
    created_at: new Date().toISOString(),
    clicks: 0,
  };
  await container.items.create(urlDoc);
  return NextResponse.json({ url: urlDoc });
}
