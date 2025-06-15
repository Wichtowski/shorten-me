import { v4 as uuidv4 } from 'uuid';
import { randomSlug } from '@/app/api/v2/utils/url';
import { UrlDocument } from '@/app/api/v2/types/url';
import { getMongoCluster } from '@/app/api/v2/utils/mongodb';
import Url from '@/app/api/v2/models/Url';
import AnonymousUsage from '@/app/api/v2/models/AnonymousUsage';

export class UrlService {
    static async createUrl(original_url: string, user_id: string, custom_slug?: string): Promise<UrlDocument> {
        await getMongoCluster();
        const slug = custom_slug || randomSlug();

        // Check both collections for existing short_url
        const existingUrl = await Url.findOne({ short_url: slug });
        const existingAnonymousUrl = await AnonymousUsage.findOne({ short_url: slug });

        if (existingUrl || existingAnonymousUrl) {
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

        if (user_id === 'anonymous') {
            const newUrl = await AnonymousUsage.create({
                ...urlDoc,
                ip_address: '0.0.0.0', // This should be set from the request in the API route
            });
            return newUrl.toObject() as UrlDocument;
        } else {
            const newUrl = await Url.create(urlDoc);
            return newUrl.toObject() as UrlDocument;
        }
    }

    static async deleteUrl(url_id: string, user_id: string): Promise<void> {

        await getMongoCluster();
        const url = await Url.findOne({ id: url_id, user_id });

        if (!url) {
            throw new Error('URL not found or unauthorized');
        }

        await url.deleteOne();
    }

    static async getUserUrls(user_id: string): Promise<UrlDocument[]> {

        await getMongoCluster();
        const urls = await Url.find({ user_id })
            .sort({ created_at: -1 })
            .lean()
            .exec();
        return (urls as unknown) as UrlDocument[];
    }

    static async findBySlug(slug: string): Promise<UrlDocument | null> {

        await getMongoCluster();
        // Check both collections
        const url = await Url.findOne({ short_url: slug }).lean().exec();
        if (url) {
            return (url as unknown) as UrlDocument;
        }

        const anonymousUrl = await AnonymousUsage.findOne({ short_url: slug }).lean().exec();
        return (anonymousUrl as unknown) as UrlDocument | null;
    }

    static async incrementClicks(urlDoc: UrlDocument): Promise<void> {
        try {

            await getMongoCluster();
            if (urlDoc.user_id === 'anonymous') {
                await AnonymousUsage.findOneAndUpdate(
                    { id: urlDoc.id },
                    { $inc: { clicks: 1 } }
                );
            } else {
                await Url.findOneAndUpdate(
                    { id: urlDoc.id },
                    { $inc: { clicks: 1 } }
                );
            }
        } catch (error) {
            console.error('UrlService: Error incrementing clicks:', error);
        }
    }
} 