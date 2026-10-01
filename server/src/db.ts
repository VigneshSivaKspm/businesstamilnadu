import { MongoClient, type Db, type Collection } from 'mongodb';
import type { ActivityEntry, Business, ContactMessage, Registration } from '../../src/types/index.ts';

/**
 * MongoDB documents use string `_id`s (UUIDs) so ids are identical to the
 * `id` field the frontend types expect — no ObjectId conversion anywhere.
 */
export type WithStringId<T extends { id: string }> = Omit<T, 'id'> & { _id: string };

export type BusinessDoc = WithStringId<Business>;
export type RegistrationDoc = WithStringId<Registration>;
export type MessageDoc = WithStringId<ContactMessage>;
export type ActivityDoc = WithStringId<ActivityEntry>;

export interface AdminDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
  lastLoginAt?: string;
  disabled?: boolean;
}

export interface SessionDoc {
  _id: string;
  /** SHA-256 of the cookie token — the raw token is never stored. */
  tokenHash: string;
  adminId: string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}

export interface Collections {
  businesses: Collection<BusinessDoc>;
  registrations: Collection<RegistrationDoc>;
  messages: Collection<MessageDoc>;
  admins: Collection<AdminDoc>;
  sessions: Collection<SessionDoc>;
  activity: Collection<ActivityDoc>;
}

export function getCollections(db: Db): Collections {
  return {
    businesses: db.collection<BusinessDoc>('businesses'),
    registrations: db.collection<RegistrationDoc>('registrations'),
    messages: db.collection<MessageDoc>('messages'),
    admins: db.collection<AdminDoc>('admins'),
    sessions: db.collection<SessionDoc>('sessions'),
    activity: db.collection<ActivityDoc>('activity'),
  };
}

export async function ensureIndexes(c: Collections) {
  await Promise.all([
    c.businesses.createIndex({ slug: 1 }, { unique: true }),
    c.businesses.createIndex({ status: 1, updatedAt: -1 }),
    c.businesses.createIndex({ district: 1 }),
    c.businesses.createIndex({ categoryId: 1 }),
    c.registrations.createIndex({ reference: 1 }, { unique: true }),
    c.registrations.createIndex({ status: 1, submittedAt: -1 }),
    c.messages.createIndex({ status: 1, createdAt: -1 }),
    c.admins.createIndex({ email: 1 }, { unique: true }),
    c.sessions.createIndex({ tokenHash: 1 }, { unique: true }),
    // MongoDB removes expired sessions automatically.
    c.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    c.activity.createIndex({ at: -1 }),
  ]);
}

export async function connect(uri: string, dbName: string) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collections = getCollections(db);
  await ensureIndexes(collections);
  return { client, db, collections };
}

/** Converts a stored document to its API shape (`_id` → `id`). */
export function toApi<T extends { _id: string }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}
