import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer } from '../utils/cosmos';
import { verifyJwt } from '../utils/jwt';

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