'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUsersContainer } from '../../utils/cosmos';
import { hashPassword } from '../../utils/hash';
import { signJwt } from '../../utils/jwt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const { email, username, password } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: 'password is required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'password must be at least 8 characters long' },
      { status: 400 }
    );
  }
  if (username.length < 3) {
    return NextResponse.json(
      { error: 'username must be at least 3 characters long' },
      { status: 400 }
    );
  }
  if (username.length > 20) {
    return NextResponse.json(
      { error: 'username must be less than 20 characters long' },
      { status: 400 }
    );
  }
  const users = await getUsersContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: email }],
  };
  const { resources } = await users.items.query(query).fetchAll();
  if (resources.length > 0) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }
  const hashed = await hashPassword(password);
  const user_id = uuidv4();
  const userDoc = {
    id: user_id,
    username,
    email,
    password: hashed,
    created_at: new Date().toISOString(),
    is_active: true,
  };
  await users.items.create(userDoc);
  const token = signJwt({ user_id, email, username });
  return NextResponse.json({ user: { id: user_id, email, username, token } });
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
