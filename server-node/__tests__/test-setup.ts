import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import db from '~/db';

const mongod = new MongoMemoryServer();

async function removeAllCollections(): Promise<void> {
  const conn = db.getConnection();
  const collections = Object.keys(conn.collections);
  const promises: Promise<unknown>[] = [];

  collections.forEach(collectionName => {
    const collection = conn.collections[collectionName];
    promises.push(collection.deleteMany({}));
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  }
}

async function dropAllCollections(): Promise<void> {
  const conn = db.getConnection();
  const collections = Object.keys(conn.collections);
  const promises: Promise<unknown>[] = [];

  collections.forEach(collectionName => {
    const collection = conn.collections[collectionName];
    promises.push(collection.drop());
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    const error = err as Error;
    // Sometimes this error happens, but you can safely ignore it
    if (error.message === 'ns not found') return;
    // You can safely ignore this error too
    if (error.message.includes('a background operation is currently running'))
      return;
    console.log(error.message);
  }
}

export async function openConnection(): Promise<mongoose.Connection> {
  const uri = await mongod.getUri();
  return db.openConnection(uri);
}

export function getConnection(): mongoose.Connection {
  return db.getConnection();
}

export async function closeConnection(): Promise<mongoose.Connection> {
  const connection = await db.closeConnection();
  await mongod.stop();
  return connection;
}

export function setupDB(): void {
  // Connect to Mongoose
  beforeAll(async () => {
    await openConnection();
  });

  // Cleans up database between each test
  afterEach(async () => {
    await removeAllCollections();
  });

  // Disconnect Mongoose
  afterAll(async () => {
    await dropAllCollections();
    await closeConnection();
  });
}
