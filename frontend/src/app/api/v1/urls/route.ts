import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer } from '@/app/api/v1/utils/cosmos';
import { verifyJwt } from '@/app/api/v1/utils/jwt';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    try {
      const decoded = await verifyJwt(token);
      console.log('Decoded token:', decoded);

      if (typeof decoded === 'object' && 'user_id' in decoded) {
        const user_id = decoded.user_id;
        console.log('User ID:', user_id);

        try {
          const container = await getUrlsContainer();
          console.log('Got container');

          const query = {
            query: 'SELECT * FROM c WHERE c.user_id = @user_id',
            parameters: [{ name: '@user_id', value: user_id }],
            partitionKey: user_id
          };
          console.log('Query:', query);

          const { resources } = await container.items.query(query).fetchAll();
          console.log('Query results:', resources);

          if (!resources || resources.length === 0) {
            console.log('No URLs found for user');
            return NextResponse.json({ urls: [] });
          }

          const sortedUrls = resources.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          console.log('Returning sorted URLs:', sortedUrls);
          return NextResponse.json({ urls: sortedUrls });
        } catch (dbError) {
          console.error('Database error:', dbError);
          return NextResponse.json(
            { error: 'Error accessing database' },
            { status: 500 }
          );
        }
      } else {
        console.log('Invalid token structure:', decoded);
        return NextResponse.json({ error: 'Invalid token structure' }, { status: 401 });
      }
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in my-urls API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 