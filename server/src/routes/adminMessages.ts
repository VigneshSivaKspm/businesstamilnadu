import { Router } from 'express';
import { z } from 'zod';
import type { Filter } from 'mongodb';
import type { Collections, MessageDoc } from '../db.ts';
import { toApi } from '../db.ts';
import { logActivity } from '../lib/activity.ts';
import { currentAdmin } from '../lib/auth.ts';
import { escapeRegex, notFound, param, parse } from '../lib/http.ts';
import { paginate } from '../lib/paginate.ts';
import { listQuery, messagePatch } from '../schemas.ts';

const query = listQuery.extend({
  status: z.enum(['new', 'read', 'archived', 'inbox', 'all']).default('inbox'),
  subject: z.string().max(40).optional(),
});

export function adminMessageRoutes(c: Collections) {
  const router = Router();

  router.get('/', async (req, res) => {
    const { q, page, pageSize, status, subject } = parse(query, req.query);
    const filter: Filter<MessageDoc> =
      status === 'all' ? {} : status === 'inbox' ? { status: { $in: ['new', 'read'] } } : { status };
    if (subject) filter.subject = subject;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { message: rx }, { phone: rx }];
    }
    res.json(await paginate(c.messages, filter, { createdAt: -1 }, page, pageSize));
  });

  router.get('/:id', async (req, res) => {
    const doc = await c.messages.findOne({ _id: param(req, 'id') });
    if (!doc) throw notFound('Message');
    res.json(toApi(doc));
  });

  router.patch('/:id', async (req, res) => {
    const { status } = parse(messagePatch, req.body);
    const result = await c.messages.updateOne({ _id: param(req, 'id') }, { $set: { status } });
    if (!result.matchedCount) throw notFound('Message');
    res.json({ ok: true });
  });

  router.delete('/:id', async (req, res) => {
    const admin = currentAdmin(res);
    const doc = await c.messages.findOneAndDelete({ _id: param(req, 'id') });
    if (!doc) throw notFound('Message');
    await logActivity(c, admin, { action: 'message.deleted', targetType: 'message', targetId: doc._id, summary: `Deleted message from ${doc.name}` });
    res.json({ ok: true });
  });

  return router;
}
