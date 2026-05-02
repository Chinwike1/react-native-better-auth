import { MongoClient } from 'mongodb'

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined
}

// Create client without connecting immediately
// MongoDB driver handles lazy connection automatically
if (!globalForMongo.mongoClient) {
  globalForMongo.mongoClient = new MongoClient(process.env.MONGODB_URI!)
}

export const dbClient = globalForMongo.mongoClient
