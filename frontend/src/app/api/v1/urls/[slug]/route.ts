'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer, getAnonymousContainer } from '../../utils/cosmos';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    const containers = [await getAnonymousContainer(), await getUrlsContainer()];

    for (const container of containers) {
      const query = {
        query: 'SELECT * FROM c WHERE c.short_url = @short_url',
        parameters: [{ name: '@short_url', value: slug }],
      };

      const { resources } = await container.items.query(query).fetchAll();
      if (resources.length > 0) {
        const urlDoc = resources[0];
        urlDoc.clicks = (urlDoc.clicks || 0) + 1;
        await container.item(urlDoc.id).replace(urlDoc);
        return NextResponse.json({ original_url: urlDoc.original_url });
      }
    }

    return NextResponse.json({ error: 'URL not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 