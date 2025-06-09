'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer, getAnonymousContainer } from '@/app/api/v1/utils/cosmos';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
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

async function getOriginalUrl(slug: string) {
  // Try to find the URL in both containers
  const containers = [await getUrlsContainer(), await getAnonymousContainer()];

  for (const container of containers) {
    const query = {
      query: 'SELECT * FROM c WHERE c.short_url = @short_url',
      parameters: [{ name: '@short_url', value: slug }],
    };
    const { resources } = await container.items.query(query).fetchAll();

    if (resources.length > 0) {
      const urlDoc = resources[0];

      // Update click count
      urlDoc.clicks += 1;
      await container.item(urlDoc.id).replace(urlDoc);

      return urlDoc.original_url;
    }
  }

  return null;
}

export default async function RedirectPage({ params }: { params: { slug: string } }) {
  const originalUrl = await getOriginalUrl(params.slug);

  if (!originalUrl) {
    return NextResponse.redirect('/404?slug=' + params.slug + '&error=URL not found');
  }

  return NextResponse.redirect(originalUrl);
}
