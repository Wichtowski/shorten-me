import { NextRequest, NextResponse } from 'next/server';
import { getUsersContainer } from '../../utils/cosmos';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    const container = await getUsersContainer();

    // Check if username already exists
    const usernameQuery = {
      query: 'SELECT * FROM c WHERE c.username = @username',
      parameters: [{ name: '@username', value: username }],
    };
    const { resources: existingUsers } = await container.items.query(usernameQuery).fetchAll();
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailQuery = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }],
    };
    const { resources: existingEmails } = await container.items.query(emailQuery).fetchAll();
    
    if (existingEmails.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const userDoc = {
      id: uuidv4(),
      email,
      username,
      password, // Note: password is already hashed in the frontend
      created_at: new Date().toISOString(),
    };

    await container.items.create(userDoc);

    return NextResponse.json({ 
      message: 'User created successfully',
      user: {
        id: userDoc.id,
        email: userDoc.email,
        username: userDoc.username,
        created_at: userDoc.created_at
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 