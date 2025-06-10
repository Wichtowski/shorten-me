'use server';

import { NextRequest, NextResponse } from 'next/server';
import { UrlService } from '../../services/urlService';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.pathname.split('/').pop();
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    const urlDoc = await UrlService.findBySlug(slug);
    if (!urlDoc) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    await UrlService.incrementClicks(urlDoc);
    return NextResponse.json({ original_url: urlDoc.original_url });
  } catch (error) {
    console.error('Error fetching URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
