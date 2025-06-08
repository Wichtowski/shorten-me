'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUrlsContainer, getAnonymousContainer } from '@/app/api/v1/utils/cosmos';

export async function POST(
    req: NextRequest,
    context: { params: { slug: string } }
) {
    try {
        const { slug } = context.params;
        if (!slug) {
            return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
        }

        const urlsContainer = await getUrlsContainer();
        const anonContainer = await getAnonymousContainer();

        // Try to find and update in user URLs first
        const urlsQuery = {
            query: 'SELECT * FROM c WHERE c.short_url = @short_url',
            parameters: [{ name: '@short_url', value: slug }],
        };
        const urlsResult = await urlsContainer.items.query(urlsQuery).fetchAll();

        if (urlsResult.resources.length > 0) {
            const item = urlsResult.resources[0];
            item.clicks = (item.clicks || 0) + 1;
            await urlsContainer.item(item.id).replace(item);
            return NextResponse.json({ success: true });
        }

        // If not found in user URLs, try anonymous URLs
        const anonQuery = {
            query: 'SELECT * FROM c WHERE c.short_url = @short_url',
            parameters: [{ name: '@short_url', value: slug }],
        };
        const anonResult = await anonContainer.items.query(anonQuery).fetchAll();

        if (anonResult.resources.length > 0) {
            const item = anonResult.resources[0];
            item.clicks = (item.clicks || 0) + 1;
            await anonContainer.item(item.id).replace(item);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    } catch (error) {
        console.error('Error updating clicks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 