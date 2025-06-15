import mongoose, { Document } from 'mongoose';

interface IUser extends Document {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
}

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password_hash: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 