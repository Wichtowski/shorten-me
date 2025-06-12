import { getUrlsContainer, getAnonymousContainer } from '@/app/api/v1/utils/cosmos';
import { v4 as uuidv4 } from 'uuid';
import { randomSlug } from '@/app/api/v1/utils/url';
import { UrlDocument } from '@/app/api/v1/types/url';

export class UrlService {
    static async createUrl(original_url: string, user_id: string, custom_slug?: string): Promise<UrlDocument> {
        const container = user_id === 'anonymous' ? await getAnonymousContainer() : await getUrlsContainer();
        const slug = custom_slug || randomSlug();

        const query = {
            query: 'SELECT * FROM c WHERE c.short_url = @short_url',
            parameters: [{ name: '@short_url', value: slug }],
        };

        const { resources } = await container.items.query(query).fetchAll();
        if (resources.length > 0) {
            throw new Error('custom_slug already exists');
        }

        const url_id = uuidv4();
        const urlDoc: UrlDocument = {
            id: url_id,
            user_id,
            original_url,
            short_url: slug,
            created_at: new Date().toISOString(),
            clicks: 0,
        };

        await container.items.create(urlDoc);
        return urlDoc;
    }

    static async deleteUrl(url_id: string, user_id: string): Promise<void> {
        const container = await getUrlsContainer();

        const query = {
            query: 'SELECT * FROM c WHERE c.id = @url_id AND c.user_id = @user_id',
            parameters: [
                { name: '@url_id', value: url_id },
                { name: '@user_id', value: user_id },
            ],
            enableCrossPartitionQuery: true,
        };

        const { resources } = await container.items.query(query).fetchAll();
        if (resources.length === 0) {
            throw new Error('URL not found or unauthorized');
        }

        await container.item(url_id, user_id).delete();
    }

    static async getUserUrls(user_id: string): Promise<UrlDocument[]> {
        const container = await getUrlsContainer();
        const query = {
            query: 'SELECT * FROM c WHERE c.user_id = @user_id',
            parameters: [{ name: '@user_id', value: user_id }],
        };

        const { resources } = await container.items
            .query(query, { partitionKey: [user_id] })
            .fetchAll();

        return resources.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    static async findBySlug(slug: string): Promise<UrlDocument | null> {
        const containers = [await getAnonymousContainer(), await getUrlsContainer()];

        for (const container of containers) {
            const query = {
                query: 'SELECT * FROM c WHERE c.short_url = @short_url',
                parameters: [{ name: '@short_url', value: slug }],
            };

            const { resources } = await container.items.query(query).fetchAll();
            if (resources.length > 0) {
                return resources[0];
            }
        }

        return null;
    }

    static async incrementClicks(urlDoc: UrlDocument): Promise<void> {
        try {
            console.log('UrlService: Incrementing clicks for URL:', {
                id: urlDoc.id,
                user_id: urlDoc.user_id,
                short_url: urlDoc.short_url
            });

            const container = urlDoc.user_id === 'anonymous'
                ? await getAnonymousContainer()
                : await getUrlsContainer();

            // First verify the document exists
            const query = {
                query: 'SELECT * FROM c WHERE c.id = @id AND c.user_id = @user_id',
                parameters: [
                    { name: '@id', value: urlDoc.id },
                    { name: '@user_id', value: urlDoc.user_id }
                ]
            };

            const { resources } = await container.items.query(query).fetchAll();
            if (resources.length === 0) {
                console.error('UrlService: Document not found for update:', {
                    id: urlDoc.id,
                    user_id: urlDoc.user_id
                });
                return; // Silently fail if document not found
            }

            urlDoc.clicks = (urlDoc.clicks || 0) + 1;
            await container.item(urlDoc.id, urlDoc.user_id).replace(urlDoc);
            console.log('UrlService: Successfully incremented clicks for URL:', urlDoc.short_url);
        } catch (error) {
            console.error('UrlService: Error incrementing clicks:', error);
            // Don't throw the error - we don't want to break the redirect if click tracking fails
        }
    }
} 