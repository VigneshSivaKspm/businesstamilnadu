import { Router } from 'express';
import { z } from 'zod';
import type { Filter } from 'mongodb';
import type { BusinessDoc, Collections } from '../db.ts';
import { toApi } from '../db.ts';
import { logActivity } from '../lib/activity.ts';
import { currentAdmin } from '../lib/auth.ts';
import { buildBusiness, uniqueSlug } from '../lib/businesses.ts';
import { HttpError, escapeRegex, notFound, param, parse } from '../lib/http.ts';
import { paginate } from '../lib/paginate.ts';
import { businessInput, businessPatch, listQuery } from '../schemas.ts';

const flag = z.enum(['true', 'false']).optional();
const query = listQuery.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended', 'all']).default('all'),
  district: z.string().max(60).optional(),
  category: z.string().max(60).optional(),
  verified: flag,
  featured: flag,
  demo: flag,
  sort: z.enum(['updated', 'name', 'created']).default('updated'),
});

const sorts = { updated: { updatedAt: -1 }, name: { name: 1 }, created: { createdAt: -1 } } as const;

export function adminBusinessRoutes(c: Collections) {
  const router = Router();

  router.get('/', async (req, res) => {
    const { q, page, pageSize, status, district, category, verified, featured, demo, sort } = parse(query, req.query);
    const filter: Filter<BusinessDoc> = {};
    if (status !== 'all') filter.status = status;
    if (district) filter.district = district;
    if (category) filter.categoryId = category;
    if (verified) filter.verified = verified === 'true';
    if (featured) filter.featured = featured === 'true';
    if (demo) filter.isDemo = demo === 'true' ? true : { $ne: true };
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { slug: rx }, { phone: rx }, { locality: rx }, { city: rx }];
    }
    res.json(await paginate(c.businesses, filter, sorts[sort], page, pageSize));
  });

  router.get('/:id', async (req, res) => {
    const doc = await c.businesses.findOne({ _id: param(req, 'id') });
    if (!doc) throw notFound('Listing');
    res.json(toApi(doc));
  });

  router.post('/', async (req, res) => {
    const admin = currentAdmin(res);
    const input = parse(businessInput, req.body);
    const slug = input.slug ? input.slug : await uniqueSlug(c, input.name);
    if (input.slug && (await c.businesses.findOne({ slug }))) {
      throw new HttpError(409, 'That URL slug is already used by another listing.', { slug: 'This slug is already in use.' });
    }
    const doc = buildBusiness(input, slug);
    await c.businesses.insertOne(doc);
    await logActivity(c, admin, { action: 'business.created', targetType: 'business', targetId: doc._id, summary: `Created ${doc.name}` });
    res.status(201).json(toApi(doc));
  });

  router.put('/:id', async (req, res) => {
    const admin = currentAdmin(res);
    const existing = await c.businesses.findOne({ _id: param(req, 'id') });
    if (!existing) throw notFound('Listing');
    const input = parse(businessInput, req.body);
    const slug = input.slug || existing.slug;
    if (slug !== existing.slug && (await c.businesses.findOne({ slug, _id: { $ne: existing._id } }))) {
      throw new HttpError(409, 'That URL slug is already used by another listing.', { slug: 'This slug is already in use.' });
    }
    const doc = buildBusiness(input, slug, existing);
    await c.businesses.replaceOne({ _id: existing._id }, doc);
    await logActivity(c, admin, { action: 'business.updated', targetType: 'business', targetId: doc._id, summary: `Updated ${doc.name}` });
    res.json(toApi(doc));
  });

  /** Quick toggles from the listings table: verified, featured, status. */
  router.patch('/:id', async (req, res) => {
    const admin = currentAdmin(res);
    const changes = parse(businessPatch, req.body);
    const doc = await c.businesses.findOneAndUpdate(
      { _id: param(req, 'id') },
      { $set: { ...changes, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' },
    );
    if (!doc) throw notFound('Listing');
    const summary = Object.entries(changes)
      .map(([k, v]) => `${k} → ${String(v)}`)
      .join(', ');
    await logActivity(c, admin, { action: 'business.updated', targetType: 'business', targetId: doc._id, summary: `${doc.name}: ${summary}` });
    res.json(toApi(doc));
  });

  router.delete('/:id', async (req, res) => {
    const admin = currentAdmin(res);
    const doc = await c.businesses.findOneAndDelete({ _id: param(req, 'id') });
    if (!doc) throw notFound('Listing');
    await logActivity(c, admin, { action: 'business.deleted', targetType: 'business', targetId: doc._id, summary: `Deleted ${doc.name}` });
    res.json({ ok: true });
  });

  return router;
}
