'use server';

import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/app/api/v2/utils/jwt';
import { getMongoCluster } from '@/app/api/v2/utils/mongodb';
import User from '@/app/api/v2/models/User';
import Url from '@/app/api/v2/models/Url';

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJwt(token);

    if (typeof decoded === 'object' && 'user_id' in decoded) {
      const user_id = decoded.user_id as string;

      await getMongoCluster();

      // Delete all user's URLs
      await Url.deleteMany({ user_id });

      // Delete user account
      await User.deleteOne({ id: user_id });

      return NextResponse.json({ message: 'Account and associated URLs deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  } catch (error) {
    console.error('Error deleting account:', error);
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

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}