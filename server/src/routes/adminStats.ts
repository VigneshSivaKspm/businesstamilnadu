import { Router } from 'express';
import type { Collections } from '../db.ts';
import { toApi } from '../db.ts';

export function adminStatsRoutes(c: Collections) {
  const router = Router();

  router.get('/stats', async (_req, res) => {
    const count = (col: keyof Pick<Collections, 'registrations' | 'messages' | 'businesses'>, filter: object) =>
      c[col].countDocuments(filter);
    const [regPending, regApproved, regRejected, msgNew, msgRead, msgArchived, total, approved, suspended, verified, featured, demo] =
      await Promise.all([
        count('registrations', { status: 'pending' }),
        count('registrations', { status: 'approved' }),
        count('registrations', { status: 'rejected' }),
        count('messages', { status: 'new' }),
        count('messages', { status: 'read' }),
        count('messages', { status: 'archived' }),
        count('businesses', {}),
        count('businesses', { status: 'approved' }),
        count('businesses', { status: 'suspended' }),
        count('businesses', { verified: true }),
        count('businesses', { featured: true }),
        count('businesses', { isDemo: true }),
      ]);
    res.json({
      registrations: { pending: regPending, approved: regApproved, rejected: regRejected },
      messages: { new: msgNew, read: msgRead, archived: msgArchived },
      businesses: { total, approved, suspended, verified, featured, demo },
    });
  });

  router.get('/activity', async (_req, res) => {
    const docs = await c.activity.find({}).sort({ at: -1 }).limit(25).toArray();
    res.json({ items: docs.map(toApi) });
  });

  return router;
}
