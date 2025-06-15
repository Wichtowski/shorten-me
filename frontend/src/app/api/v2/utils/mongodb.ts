import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

class MongoConnection {
    private static instance: MongoConnection;
    private conn: typeof mongoose | null = null;
    private promise: Promise<typeof mongoose> | null = null;

    private constructor() { }

    static getInstance(): MongoConnection {
        if (!MongoConnection.instance) {
            MongoConnection.instance = new MongoConnection();
        }
        return MongoConnection.instance;
    }

    async connect(): Promise<typeof mongoose> {
        if (this.conn) {
            return this.conn;
        }

        if (!this.promise) {
            const opts = {
                bufferCommands: false,
            };

            this.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
                return mongoose;
            });
        }

        try {
            this.conn = await this.promise;
        } catch (e) {
            this.promise = null;
            throw e;
        }

        return this.conn;
    }
}

export const getMongoCluster = () => MongoConnection.getInstance().connect(); 