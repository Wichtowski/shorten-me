'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer, getAnonymousContainer } from '../utils/cosmos';
import { v4 as uuidv4 } from 'uuid';
import { verifyJwt } from '../utils/jwt';

function randomSlug(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
