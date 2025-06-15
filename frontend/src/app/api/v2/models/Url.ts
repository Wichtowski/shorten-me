import mongoose, { Document } from 'mongoose';
import { UrlDocument } from '../types/url';
import { baseUrlSchema } from './baseUrlSchema';

interface IUrl extends Omit<UrlDocument, 'id'>, Document {
    id: string;
}

const urlSchema = new mongoose.Schema({
    ...baseUrlSchema,
    user_id: {
        type: String,
        required: false,
    },
});

export default mongoose.models.Url || mongoose.model<IUrl>('Url', urlSchema); 