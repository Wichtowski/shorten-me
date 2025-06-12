'use server';

import { NextRequest, NextResponse } from 'next/server';
import { UrlService } from '../../services/urlService';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.pathname.split('/').pop();
    console.log('API: Received request for slug:', slug);

    if (!slug) {
      console.error('API: Missing slug parameter');
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    const urlDoc = await UrlService.findBySlug(slug);
    console.log('API: URL document found:', urlDoc ? 'Yes' : 'No');

    if (!urlDoc) {
      console.error('API: URL not found for slug:', slug);
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    await UrlService.incrementClicks(urlDoc);
    console.log('API: Successfully incremented clicks for slug:', slug);

    return NextResponse.json({ original_url: urlDoc.original_url });
  } catch (error) {
    console.error('API: Error fetching URL:', error);
    if (error instanceof Error) {
      console.error('API: Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
