'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer, getAnonymousContainer } from '@/app/api/utils/cosmos';
import { v4 as uuidv4 } from 'uuid';
import { verifyJwt } from '@/app/api/utils/jwt';
import { randomSlug } from '@/app/api/utils/url';

export async function POST(req: NextRequest) {
  try {
    const { original_url, custom_slug } = await req.json();
    if (!original_url) {
      return NextResponse.json({ error: 'Missing original_url' }, { status: 400 });
    }

    // Get user ID from token
    const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader); // Debug log

    let user_id = 'anonymous';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('Extracted token:', token); // Debug log

      try {
        const decoded = await verifyJwt(token);
        console.log('Decoded token:', decoded); // Debug log

        if (typeof decoded === 'object' && 'user_id' in decoded) {
          user_id = decoded.user_id;
          console.log('Authenticated user ID:', user_id); // Debug log
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    const slug = custom_slug || randomSlug();
    console.log('Using container for user_id:', user_id); // Debug log

    const container = user_id === 'anonymous'
      ? await getAnonymousContainer()
      : await getUrlsContainer();

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

    console.log('Creating URL document:', urlDoc); // Debug log

    await container.items.create(urlDoc);
    return NextResponse.json({ url: urlDoc });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
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

      const container = await getUrlsContainer();

      // First verify that the URL belongs to the user
      const query = {
        query: 'SELECT * FROM c WHERE c.id = @url_id AND c.user_id = @user_id',
        parameters: [
          { name: '@url_id', value: url_id },
          { name: '@user_id', value: user_id }
        ],
        enableCrossPartitionQuery: true
      };

      const { resources } = await container.items.query(query).fetchAll();

      if (resources.length === 0) {
        return NextResponse.json({ error: 'URL not found or unauthorized' }, { status: 404 });
      }

      // Delete the URL
      await container.item(url_id, user_id).delete();

      return NextResponse.json({ message: 'URL deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 