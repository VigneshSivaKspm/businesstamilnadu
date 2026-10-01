import { Router } from 'express';
import { z } from 'zod';
import type { Filter } from 'mongodb';
import type { Collections, RegistrationDoc } from '../db.ts';
import { toApi } from '../db.ts';
import { logActivity } from '../lib/activity.ts';
import { currentAdmin } from '../lib/auth.ts';
import { businessFromRegistration, uniqueSlug } from '../lib/businesses.ts';
import { HttpError, escapeRegex, notFound, param, parse } from '../lib/http.ts';
import { paginate } from '../lib/paginate.ts';
import { approveInput, listQuery, notesInput, rejectInput } from '../schemas.ts';

const query = listQuery.extend({ status: z.enum(['pending', 'approved', 'rejected', 'all']).default('pending') });

export function adminRegistrationRoutes(c: Collections) {
  const router = Router();

  router.get('/', async (req, res) => {
    const { q, page, pageSize, status } = parse(query, req.query);
    const filter: Filter<RegistrationDoc> = status === 'all' ? {} : { status };
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ businessName: rx }, { reference: rx }, { contactPerson: rx }, { phone: rx }, { email: rx }, { city: rx }];
    }
    res.json(await paginate(c.registrations, filter, { submittedAt: -1 }, page, pageSize));
  });

  router.get('/:id', async (req, res) => {
    const doc = await c.registrations.findOne({ _id: param(req, 'id') });
    if (!doc) throw notFound('Registration');
    res.json(toApi(doc));
  });

  /** Approves a pending registration and creates its live listing. */
  router.post('/:id/approve', async (req, res) => {
    const admin = currentAdmin(res);
    const options = parse(approveInput, req.body ?? {});
    const reg = await c.registrations.findOne({ _id: param(req, 'id') });
    if (!reg) throw notFound('Registration');
    if (reg.status !== 'pending') throw new HttpError(409, `This registration is already ${reg.status}.`);

    const business = businessFromRegistration(reg, await uniqueSlug(c, reg.businessName), options);
    await c.businesses.insertOne(business);
    const reviewedAt = new Date().toISOString();
    await c.registrations.updateOne(
      { _id: reg._id },
      { $set: { status: 'approved', reviewedAt, reviewedBy: admin.name, businessId: business._id } },
    );
    await logActivity(c, admin, {
      action: 'registration.approved',
      targetType: 'registration',
      targetId: reg._id,
      summary: `Approved ${reg.businessName} (${reg.reference})`,
    });
    res.json({ businessId: business._id, slug: business.slug });
  });

  router.post('/:id/reject', async (req, res) => {
    const admin = currentAdmin(res);
    const { reason } = parse(rejectInput, req.body);
    const reg = await c.registrations.findOne({ _id: param(req, 'id') });
    if (!reg) throw notFound('Registration');
    if (reg.status !== 'pending') throw new HttpError(409, `This registration is already ${reg.status}.`);
    await c.registrations.updateOne(
      { _id: reg._id },
      { $set: { status: 'rejected', rejectionReason: reason, reviewedAt: new Date().toISOString(), reviewedBy: admin.name } },
    );
    await logActivity(c, admin, {
      action: 'registration.rejected',
      targetType: 'registration',
      targetId: reg._id,
      summary: `Rejected ${reg.businessName} (${reg.reference})`,
    });
    res.json({ ok: true });
  });

  /** Returns a rejected registration to the pending queue. */
  router.post('/:id/reopen', async (req, res) => {
    const admin = currentAdmin(res);
    const reg = await c.registrations.findOne({ _id: param(req, 'id') });
    if (!reg) throw notFound('Registration');
    if (reg.status !== 'rejected') throw new HttpError(409, 'Only rejected registrations can be reopened.');
    await c.registrations.updateOne(
      { _id: reg._id },
      { $set: { status: 'pending' }, $unset: { rejectionReason: '', reviewedAt: '', reviewedBy: '' } },
    );
    await logActivity(c, admin, { action: 'registration.reopened', targetType: 'registration', targetId: reg._id, summary: `Reopened ${reg.businessName}` });
    res.json({ ok: true });
  });

  router.patch('/:id', async (req, res) => {
    const { notes } = parse(notesInput, req.body);
    const result = await c.registrations.updateOne({ _id: param(req, 'id') }, { $set: { notes } });
    if (!result.matchedCount) throw notFound('Registration');
    res.json({ ok: true });
  });

  router.delete('/:id', async (req, res) => {
    const admin = currentAdmin(res);
    const reg = await c.registrations.findOneAndDelete({ _id: param(req, 'id') });
    if (!reg) throw notFound('Registration');
    await logActivity(c, admin, {
      action: 'registration.deleted',
      targetType: 'registration',
      targetId: reg._id,
      summary: `Deleted registration ${reg.businessName} (${reg.reference})`,
    });
    res.json({ ok: true });
  });

  return router;
}
