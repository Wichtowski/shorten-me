'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUsersContainer } from '@/app/api/v1/utils/cosmos';
import { verifyPassword } from '@/app/api/v1/utils/hash';
import { signJwt } from '@/app/api/v1/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const users = await getUsersContainer();
    const query = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }],
    };

    const { resources } = await users.items.query(query).fetchAll();
    if (resources.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const user = resources[0];
    const valid = await verifyPassword(password, user.password);

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
        token: token, // Make sure token is a string
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
