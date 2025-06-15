import mongoose, { Document } from 'mongoose';
import { baseUrlSchema } from './baseUrlSchema';

interface IAnonymousUsage extends Document {
    id: string;
    ip_address: string;
    original_url: string;
    short_url: string;
    created_at: Date;
    clicks: number;
}

const anonymousUsageSchema = new mongoose.Schema({
    ...baseUrlSchema,
    ip_address: {
        type: String,
        required: true,
    },
});

export default mongoose.models.AnonymousUsage || mongoose.model<IAnonymousUsage>('Anonymous_Usage', anonymousUsageSchema); 