/**
 * End-to-end API tests against a real (in-memory) MongoDB.
 *   npm test
 */
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import type { MongoClient } from 'mongodb';
import { createApp } from '../src/app.ts';
import { loadConfig } from '../src/config.ts';
import { connect, type Collections } from '../src/db.ts';
import { hashPassword } from '../src/lib/auth.ts';
import { seedDemoBusinesses } from '../scripts/seed.ts';

let mongod: MongoMemoryServer;
let client: MongoClient;
let c: Collections;
let base: string;
let close: () => void;

const ADMIN = { email: 'admin@test.local', password: 'correct-horse-battery' };

const validRegistration = {
  businessName: 'Test Book House',
  categoryId: 'retail',
  subcategoryId: 'book-stores',
  yearEstablished: '2015',
  shortDescription: 'A neighbourhood book store with school supplies and stationery.',
  district: 'salem',
  city: 'Salem',
  locality: 'Fairlands',
  address: '12 Test Street, Fairlands, Salem',
  pinCode: '636016',
  contactPerson: 'Test Owner',
  phone: '+91 98765 43210',
  whatsapp: '',
  email: 'owner@example.com',
  website: 'www.example.com',
  services: 'Books, Stationery, School supplies',
  openingHours: 'Mon–Sat 9–8',
  serviceAreas: 'Salem, Namakkal',
  logoFileName: '',
  coverFileName: '',
  galleryFileNames: [],
  confirmAccuracy: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loosely typed JSON keeps assertions readable
type Json = any;

async function api(path: string, init: RequestInit & { json?: unknown; cookie?: string; csrf?: boolean } = {}) {
  const headers: Record<string, string> = {};
  if (init.json !== undefined) headers['content-type'] = 'application/json';
  if (init.cookie) headers.cookie = init.cookie;
  if (init.csrf !== false) headers['x-btn-admin'] = '1';
  const res = await fetch(base + path, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
  });
  const body: Json = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  return { status: res.status, body, headers: res.headers };
}

async function login() {
  const res = await api('/api/admin/auth/login', { method: 'POST', json: ADMIN });
  assert.equal(res.status, 200);
  const cookie = res.headers.get('set-cookie')!.split(';')[0];
  return cookie;
}

before(async () => {
  mongod = await MongoMemoryServer.create();
  const config = loadConfig({ MONGODB_URI: mongod.getUri(), MONGODB_DB: 'btn_test', NODE_ENV: 'test' });
  ({ client, collections: c } = await connect(config.mongoUri, config.mongoDb));
  await seedDemoBusinesses(c);
  await c.admins.insertOne({
    _id: randomUUID(),
    email: ADMIN.email,
    name: 'Test Admin',
    passwordHash: await hashPassword(ADMIN.password),
    role: 'admin',
    createdAt: new Date().toISOString(),
  });
  const server = createApp(c, config, { submissionLimit: 1000, loginLimit: 1000 }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});

after(async () => {
  close?.();
  await client?.close();
  await mongod?.stop();
});

describe('public API', () => {
  it('reports health', async () => {
    assert.deepEqual((await api('/api/health')).body, { ok: true });
  });

  it('lists only approved businesses, without internal fields', async () => {
    const { body } = await api('/api/businesses');
    assert.equal(body.items.length, 38);
    assert.ok(body.items.every((b: { status: string; id: string }) => b.status === 'approved' && b.id));
    assert.ok(body.items.every((b: Record<string, unknown>) => !('_id' in b) && !('registrationId' in b)));
  });

  it('rejects invalid registrations with field errors', async () => {
    const res = await api('/api/registrations', { method: 'POST', json: { ...validRegistration, phone: '123', pinCode: '400001', confirmAccuracy: false } });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields.phone);
    assert.ok(res.body.error.fields.pinCode);
    assert.ok(res.body.error.fields.confirmAccuracy);
  });

  it('rejects unknown categories and districts', async () => {
    const res = await api('/api/registrations', { method: 'POST', json: { ...validRegistration, categoryId: 'nope', district: 'atlantis' } });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields.categoryId && res.body.error.fields.district);
  });

  it('stores a valid registration as pending', async () => {
    const res = await api('/api/registrations', { method: 'POST', json: validRegistration });
    assert.equal(res.status, 201);
    assert.match(res.body.reference, /^BTN-\d{4}-[A-F0-9]{6}$/);
    assert.equal(res.body.status, 'pending');
    assert.equal(res.body.website, 'https://www.example.com');
  });

  it('silently drops honeypot submissions', async () => {
    const before = await c.registrations.countDocuments();
    const res = await api('/api/registrations', { method: 'POST', json: { ...validRegistration, hp: 'spam' } });
    assert.equal(res.status, 201);
    assert.equal(await c.registrations.countDocuments(), before);
  });

  it('stores contact messages as new', async () => {
    const res = await api('/api/contact', {
      method: 'POST',
      json: { name: 'Visitor', email: 'v@example.com', phone: '', subject: 'claim', message: 'I would like to claim this business listing please.', businessSlug: 'kovai-prime-builders' },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'new');
  });

  it('returns JSON 404 for unknown endpoints and 400 for bad JSON', async () => {
    assert.equal((await api('/api/nope')).status, 404);
    const res = await fetch(base + '/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' });
    assert.equal(res.status, 400);
  });
});

describe('admin auth', () => {
  it('blocks admin endpoints without a session', async () => {
    assert.equal((await api('/api/admin/stats')).status, 401);
    assert.equal((await api('/api/admin/auth/me')).status, 401);
  });

  it('rejects wrong passwords and unknown emails identically', async () => {
    const a = await api('/api/admin/auth/login', { method: 'POST', json: { ...ADMIN, password: 'wrong-password' } });
    const b = await api('/api/admin/auth/login', { method: 'POST', json: { email: 'nobody@test.local', password: 'whatever-123' } });
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.equal(a.body.error.message, b.body.error.message);
  });

  it('signs in with an httpOnly SameSite=Strict cookie and stores only a token hash', async () => {
    const res = await api('/api/admin/auth/login', { method: 'POST', json: ADMIN });
    const setCookie = res.headers.get('set-cookie')!;
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Strict/i);
    const token = setCookie.split(';')[0].split('=')[1];
    assert.equal(await c.sessions.countDocuments({ tokenHash: token }), 0);
    assert.equal(res.body.admin.email, ADMIN.email);
    assert.ok(!('passwordHash' in res.body.admin));
  });

  it('requires the CSRF header on writes', async () => {
    const cookie = await login();
    const res = await api('/api/admin/businesses/x', { method: 'DELETE', cookie, csrf: false });
    assert.equal(res.status, 403);
  });

  it('invalidates the session on logout', async () => {
    const cookie = await login();
    assert.equal((await api('/api/admin/auth/me', { cookie })).status, 200);
    await api('/api/admin/auth/logout', { method: 'POST', cookie });
    assert.equal((await api('/api/admin/auth/me', { cookie })).status, 401);
  });
});

describe('admin workflows', () => {
  it('approves a registration into a live, verified listing', async () => {
    const cookie = await login();
    const list = await api('/api/admin/registrations?status=pending', { cookie });
    const reg = list.body.items.find((r: { businessName: string }) => r.businessName === 'Test Book House');
    assert.ok(reg);

    const approved = await api(`/api/admin/registrations/${reg.id}/approve`, { method: 'POST', cookie, json: { verified: true, featured: false } });
    assert.equal(approved.status, 200);
    assert.equal(approved.body.slug, 'test-book-house');

    const again = await api(`/api/admin/registrations/${reg.id}/approve`, { method: 'POST', cookie, json: {} });
    assert.equal(again.status, 409);

    const pub = await api('/api/businesses');
    const live = pub.body.items.find((b: { slug: string }) => b.slug === 'test-book-house');
    assert.ok(live);
    assert.equal(live.verified, true);
    assert.equal(live.categoryName, 'Retail');
    assert.deepEqual(live.services, ['Books', 'Stationery', 'School supplies']);
    assert.equal(live.whatsapp, '919876543210');
  });

  it('rejects and reopens a registration', async () => {
    const cookie = await login();
    const created = await api('/api/registrations', { method: 'POST', json: { ...validRegistration, businessName: 'Reject Me Traders' } });
    const id = created.body.id;
    assert.equal((await api(`/api/admin/registrations/${id}/reject`, { method: 'POST', cookie, json: { reason: '' } })).status, 400);
    assert.equal((await api(`/api/admin/registrations/${id}/reject`, { method: 'POST', cookie, json: { reason: 'Duplicate listing' } })).status, 200);
    const doc = await api(`/api/admin/registrations/${id}`, { cookie });
    assert.equal(doc.body.status, 'rejected');
    assert.equal(doc.body.rejectionReason, 'Duplicate listing');
    assert.equal((await api(`/api/admin/registrations/${id}/reopen`, { method: 'POST', cookie })).status, 200);
    assert.equal((await api(`/api/admin/registrations/${id}`, { cookie })).body.status, 'pending');
  });

  it('manages listings: create, unique slugs, update, toggle, suspend, delete', async () => {
    const cookie = await login();
    const input = {
      name: 'Kovai Prime Builders',
      categoryId: 'real-estate',
      subcategoryIds: ['builders'],
      district: 'coimbatore',
      description: 'A second business with an existing name to test slug generation.',
      openingHours: { mon: { open: '09:00', close: '18:00' }, sun: null },
    };
    const created = await api('/api/admin/businesses', { method: 'POST', cookie, json: input });
    assert.equal(created.status, 201);
    assert.equal(created.body.slug, 'kovai-prime-builders-2');
    assert.equal(created.body.categoryName, 'Real Estate & Construction');
    assert.ok(created.body.latitude, 'defaults coordinates from district');

    const clash = await api(`/api/admin/businesses/${created.body.id}`, { method: 'PUT', cookie, json: { ...input, slug: 'kovai-prime-builders' } });
    assert.equal(clash.status, 409);
    assert.ok(clash.body.error.fields.slug);

    const badHours = await api('/api/admin/businesses', { method: 'POST', cookie, json: { ...input, openingHours: { mon: { open: '18:00', close: '09:00' } } } });
    assert.equal(badHours.status, 400);

    const updated = await api(`/api/admin/businesses/${created.body.id}`, { method: 'PUT', cookie, json: { ...input, name: 'Prime Builders Two', slug: 'prime-builders-two', verified: true } });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.slug, 'prime-builders-two');
    assert.equal(updated.body.createdAt, created.body.createdAt);

    const toggled = await api(`/api/admin/businesses/${created.body.id}`, { method: 'PATCH', cookie, json: { featured: true, status: 'suspended' } });
    assert.equal(toggled.body.featured, true);
    const pub = await api('/api/businesses');
    assert.ok(!pub.body.items.some((b: { slug: string }) => b.slug === 'prime-builders-two'), 'suspended listings are hidden');

    assert.equal((await api(`/api/admin/businesses/${created.body.id}`, { method: 'DELETE', cookie })).status, 200);
    assert.equal((await api(`/api/admin/businesses/${created.body.id}`, { cookie })).status, 404);
  });

  it('filters and paginates listings', async () => {
    const cookie = await login();
    const page = await api('/api/admin/businesses?pageSize=5&page=2&sort=name', { cookie });
    assert.equal(page.body.items.length, 5);
    assert.equal(page.body.page, 2);
    const demo = await api('/api/admin/businesses?demo=false', { cookie });
    assert.ok(demo.body.items.every((b: { isDemo?: boolean }) => !b.isDemo));
    const search = await api('/api/admin/businesses?q=madurai%20dental', { cookie });
    assert.equal(search.body.items[0]?.slug, 'madurai-dental-studio');
    const regex = await api('/api/admin/businesses?q=(.*', { cookie });
    assert.equal(regex.status, 200, 'user input is regex-escaped');
  });

  it('updates message status and reports stats and activity', async () => {
    const cookie = await login();
    const inbox = await api('/api/admin/messages', { cookie });
    const msg = inbox.body.items[0];
    assert.equal((await api(`/api/admin/messages/${msg.id}`, { method: 'PATCH', cookie, json: { status: 'archived' } })).status, 200);
    const stats = await api('/api/admin/stats', { cookie });
    assert.equal(stats.body.messages.archived, 1);
    assert.ok(stats.body.registrations.approved >= 1);
    assert.equal(stats.body.businesses.demo, 38);
    const activity = await api('/api/admin/activity', { cookie });
    assert.ok(activity.body.items.some((a: { action: string }) => a.action === 'registration.approved'));
  });

  it('changes password, keeping the current session and revoking others', async () => {
    const current = await login();
    const other = await login();
    const wrong = await api('/api/admin/auth/password', { method: 'POST', cookie: current, json: { currentPassword: 'nope', newPassword: 'another-long-password' } });
    assert.equal(wrong.status, 400);
    const ok = await api('/api/admin/auth/password', { method: 'POST', cookie: current, json: { currentPassword: ADMIN.password, newPassword: 'another-long-password' } });
    assert.equal(ok.status, 200);
    assert.equal((await api('/api/admin/auth/me', { cookie: current })).status, 200);
    assert.equal((await api('/api/admin/auth/me', { cookie: other })).status, 401);
    ADMIN.password = 'another-long-password';
  });
});
