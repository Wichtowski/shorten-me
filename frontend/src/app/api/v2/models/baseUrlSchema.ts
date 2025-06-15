    
export const baseUrlSchema = {
    id: {
        type: String,
        required: true,
        unique: true,
    },
    original_url: {
        type: String,
        required: true,
    },
    short_url: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    clicks: {
        type: Number,
        default: 0,
    },
}; 