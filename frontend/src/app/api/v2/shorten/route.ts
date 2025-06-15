'use server';

import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/app/api/v2/utils/jwt';
import { UrlService } from '@/app/api/v2/services/urlService';

export async function POST(req: NextRequest) {
  try {
    const { original_url, custom_slug } = await req.json();
    if (!original_url) {
      return NextResponse.json({ error: 'Missing original_url' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    let user_id = 'anonymous';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = await verifyJwt(token);
        if (typeof decoded === 'object' && 'user_id' in decoded) {
          user_id = decoded.user_id as string;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    try {
      const urlDoc = await UrlService.createUrl(original_url, user_id, custom_slug);
      return NextResponse.json({ url: urlDoc });
    } catch (error) {
      if (error instanceof Error && error.message === 'custom_slug already exists') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json({ error: 'Failed to create short URL' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJwt(token);

    if (typeof decoded === 'object' && 'user_id' in decoded) {
      const user_id = decoded.user_id;
      const { url_id } = await req.json();

      if (!url_id) {
        return NextResponse.json({ error: 'URL ID is required' }, { status: 400 });
      }

      try {
        await UrlService.deleteUrl(url_id, user_id as string);
        return NextResponse.json({ message: 'URL deleted successfully' });
      } catch (error) {
        if (error instanceof Error && error.message === 'URL not found or unauthorized') {
          return NextResponse.json({ error: error.message }, { status: 404 });
        }
        throw error;
      }
    }

    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
