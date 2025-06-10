import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/app/api/v1/utils/jwt';
import { UrlService } from '@/app/api/v1/services/urlService';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJwt(token);

    if (typeof decoded === 'object' && 'user_id' in decoded) {
      const user_id = decoded.user_id;
      try {
        const urls = await UrlService.getUserUrls(user_id as string);
        return NextResponse.json({ urls });
      } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Error accessing database' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid token structure' }, { status: 401 });
  } catch (error) {
    console.error('Error in my-urls API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
