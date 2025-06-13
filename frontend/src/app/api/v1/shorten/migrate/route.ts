import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/app/api/v1/utils/jwt';

// MIGRATION ENDPOINT
export async function PUT(req: NextRequest) {
    // Only handle /api/v1/shorten/migrate
    if (!req.nextUrl.pathname.endsWith('/migrate')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = await verifyJwt(token);
        if (typeof decoded !== 'object' || !('user_id' in decoded)) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const user_id = decoded.user_id as string;
        const { shortens } = await req.json(); // [{original_url, short_url, ...}]
        if (!Array.isArray(shortens) || shortens.length === 0) {
            return NextResponse.json({ error: 'No shortens to migrate' }, { status: 400 });
        }
        const userContainer = await import('@/app/api/v1/utils/cosmos').then(m => m.getUrlsContainer());
        const anonContainer = await import('@/app/api/v1/utils/cosmos').then(m => m.getAnonymousContainer());
        const migrated: any[] = [];
        for (const shorten of shortens) {
            // Find anonymous doc
            const query = {
                query: 'SELECT * FROM c WHERE c.short_url = @short_url',
                parameters: [{ name: '@short_url', value: shorten.shortUrl }],
            };
            const { resources } = await anonContainer.items.query(query).fetchAll();
            if (resources.length > 0) {
                const doc = resources[0];
                // Create in user container
                const newDoc = {
                    ...doc,
                    user_id,
                    id: doc.id || doc.short_url, // fallback if no id
                };
                await userContainer.items.create(newDoc);
                // Remove from anonymous
                await anonContainer.item(doc.id, doc.ip_address || doc.id).delete();
                migrated.push(newDoc);
            }
        }
        // Return all user shortens
        const userShortens = await userContainer.items.query({
            query: 'SELECT * FROM c WHERE c.user_id = @user_id',
            parameters: [{ name: '@user_id', value: user_id }],
        }).fetchAll();
        return NextResponse.json({ migrated, userShortens: userShortens.resources });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST() {
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