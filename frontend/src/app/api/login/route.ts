import { NextRequest, NextResponse } from 'next/server';
import { getUsersContainer } from '../utils/cosmos';
import { verifyPassword } from '../utils/hash';
import { signJwt } from '../utils/jwt';

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
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = resources[0];
    console.log('Found user:', user.email);

    const valid = await verifyPassword(password, user.password);
    console.log('Password verification result:', valid);

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
        token: token // Make sure token is a string
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
