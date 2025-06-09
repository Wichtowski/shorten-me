'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUsersContainer, getUrlsContainer } from '@/app/api/v1/utils/cosmos';
import { verifyJwt } from '@/app/api/v1/utils/jwt';
import { SqlParameter } from '@azure/cosmos';

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

            // Get containers
            const usersContainer = await getUsersContainer();
            const urlsContainer = await getUrlsContainer();

            // Delete all user's URLs
            const query = {
                query: 'SELECT * FROM c WHERE c.user_id = @user_id',
                parameters: [{ name: '@user_id', value: user_id }] as SqlParameter[]
            };

            const { resources: urls } = await urlsContainer.items.query(query).fetchAll();

            // Delete each URL
            for (const url of urls) {
                await urlsContainer.item(url.id, user_id).delete();
            }

            // Delete user account
            await usersContainer.item(user_id).delete();

            return NextResponse.json({ message: 'Account and associated URLs deleted successfully' });
        }

        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 