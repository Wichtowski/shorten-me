import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/app/api/v2/utils/jwt';
import { UrlDocument } from '@/app/api/v2/types/url';
import { getMongoCluster } from '@/app/api/v2/utils/mongodb';
import Url from '@/app/api/v2/models/Url';
import AnonymousUsage from '@/app/api/v2/models/AnonymousUsage';

// MIGRATION ENDPOINT
export async function PUT(req: NextRequest) {
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

        await getMongoCluster();

        const migrated: UrlDocument[] = [];
        for (const shorten of shortens) {
            // Find anonymous doc
            const anonDoc = await AnonymousUsage.findOne({ short_url: shorten.shortUrl });
            if (anonDoc) {
                // Create in user collection
                const newDoc = {
                    ...anonDoc.toObject(),
                    user_id,
                    id: anonDoc.id || anonDoc.short_url, // fallback if no id
                };
                await Url.create(newDoc);
                // Remove from anonymous
                await AnonymousUsage.deleteOne({ _id: anonDoc._id });
                migrated.push(newDoc);
            }
        }

        // Return all user shortens
        const userShortens = await Url.find({ user_id });
        return NextResponse.json({ migrated, userShortens });
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