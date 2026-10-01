/**
 * Runs the API against a throwaway in-memory MongoDB, pre-filled with sample
 * listings, a few sample submissions and an admin account — for trying the
 * admin panel before a real database exists. Everything is lost on exit.
 *
 *   npm run dev:demo        (API + frontend together)
 *   npm run api:demo        (API only)
 */
import { randomBytes, randomUUID } from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { createApp } from '../src/app.ts';
import { loadConfig } from '../src/config.ts';
import { connect } from '../src/db.ts';
import { hashPassword } from '../src/lib/auth.ts';
import { seedDemoBusinesses } from './seed.ts';

const mongod = await MongoMemoryServer.create();
const config = loadConfig({ ...process.env, MONGODB_URI: mongod.getUri(), MONGODB_DB: 'btn_demo' });
const { client, collections } = await connect(config.mongoUri, config.mongoDb);
await seedDemoBusinesses(collections);

const email = 'admin@businesstamilnadu.in';
const password = process.env.DEMO_ADMIN_PASSWORD ?? randomBytes(9).toString('base64url');
await collections.admins.insertOne({
  _id: randomUUID(),
  email,
  name: 'Demo Admin',
  passwordHash: await hashPassword(password),
  role: 'admin',
  createdAt: new Date().toISOString(),
});

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
await collections.registrations.insertMany([
  {
    _id: randomUUID(),
    reference: 'BTN-2026-DEMO01',
    status: 'pending',
    submittedAt: hoursAgo(3),
    storage: 'remote',
    businessName: 'Sample Fresh Bakes',
    categoryId: 'food-and-restaurants',
    subcategoryId: 'bakeries',
    yearEstablished: '2018',
    shortDescription: 'Sample submission — a neighbourhood bakery with fresh breads, cakes and evening snacks.',
    district: 'erode',
    city: 'Erode',
    locality: 'Perundurai',
    address: 'Sample Street, Perundurai, Erode',
    pinCode: '638052',
    contactPerson: 'Sample Owner',
    phone: '+91 90000 20001',
    whatsapp: '',
    email: '',
    website: '',
    services: 'Birthday cakes, Breads, Puffs, Party orders',
    openingHours: 'Daily 7:00 AM – 10:00 PM',
    serviceAreas: 'Erode, Perundurai',
    logoFileName: '',
    coverFileName: '',
    galleryFileNames: [],
  },
  {
    _id: randomUUID(),
    reference: 'BTN-2026-DEMO02',
    status: 'pending',
    submittedAt: hoursAgo(26),
    storage: 'remote',
    businessName: 'Sample Auto Care',
    categoryId: 'automobile',
    subcategoryId: 'car-service',
    yearEstablished: '',
    shortDescription: 'Sample submission — multi-brand car servicing, wheel alignment and detailing.',
    district: 'tiruchirappalli',
    city: 'Tiruchirappalli',
    locality: 'K.K. Nagar',
    address: 'Sample Road, K.K. Nagar, Tiruchirappalli',
    pinCode: '620021',
    contactPerson: 'Sample Manager',
    phone: '+91 90000 20002',
    whatsapp: '+91 90000 20002',
    email: 'sample@example.com',
    website: 'www.example.com',
    services: 'General service, Wheel alignment, Detailing',
    openingHours: 'Mon–Sat 9 AM – 7 PM',
    serviceAreas: 'Tiruchirappalli',
    logoFileName: '',
    coverFileName: '',
    galleryFileNames: [],
  },
]);
await collections.messages.insertMany([
  {
    _id: randomUUID(),
    name: 'Sample Visitor',
    email: 'visitor@example.com',
    phone: '',
    subject: 'claim',
    message: 'Sample message — I own Kovai Prime Builders and would like to update our listing details.',
    businessSlug: 'kovai-prime-builders',
    createdAt: hoursAgo(1),
    storage: 'remote',
    status: 'new',
  },
  {
    _id: randomUUID(),
    name: 'Sample Advertiser',
    email: 'ads@example.com',
    phone: '+91 90000 30003',
    subject: 'advertising',
    message: 'Sample message — what options are available for featured placement in Coimbatore?',
    createdAt: hoursAgo(30),
    storage: 'remote',
    status: 'read',
  },
]);

const app = createApp(collections, config);
const server = app.listen(config.port, () => {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │  DEMO API (in-memory database — data is lost on exit)       │
  │  API:      http://localhost:${config.port}/api                         │
  │  Admin:    /admin/login                                     │
  │  Email:    ${email.padEnd(48)} │
  │  Password: ${password.padEnd(48)} │
  └─────────────────────────────────────────────────────────────┘
`);
});

const shutdown = async () => {
  server.close();
  await client.close();
  await mongod.stop();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
