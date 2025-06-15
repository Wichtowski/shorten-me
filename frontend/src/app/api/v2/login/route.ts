'use server';

import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/app/api/v2/utils/hash';
import { signJwt } from '@/app/api/v2/utils/jwt';
import { getMongoCluster } from '@/app/api/v2/utils/mongodb';
import User from '@/app/api/v2/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await getMongoCluster();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signJwt({ user_id: user.id, email: user.email, username: user.username });
    console.log('Generated token:', token); // Debug log

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        token: token,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
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

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
