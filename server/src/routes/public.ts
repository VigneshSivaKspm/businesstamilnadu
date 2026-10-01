import { randomBytes, randomUUID } from 'node:crypto';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Collections } from '../db.ts';
import { toApi } from '../db.ts';
import { PUBLIC_PROJECTION } from '../lib/businesses.ts';
import { parse } from '../lib/http.ts';
import { contactInput, registrationInput } from '../schemas.ts';

const makeReference = () => `BTN-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`;

export function publicRoutes(c: Collections, options: { submissionLimit: number }) {
  const router = Router();

  // Throttle form submissions per IP to limit spam.
  const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: options.submissionLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { message: 'Too many submissions from this network. Please try again in a few minutes.' } },
  });

  router.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  /** All live listings. At larger scale, move filtering/pagination here (see README). */
  router.get('/businesses', async (_req, res) => {
    const docs = await c.businesses
      .find({ status: 'approved' }, { projection: PUBLIC_PROJECTION })
      .sort({ name: 1 })
      .toArray();
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ items: docs.map(toApi) });
  });

  router.post('/registrations', submissionLimiter, async (req, res) => {
    const input = parse(registrationInput, req.body);
    // Honeypot filled in → respond like success but store nothing.
    if (input.hp) {
      res.status(201).json({ reference: makeReference(), status: 'pending' });
      return;
    }
    const { hp: _hp, confirmAccuracy: _confirm, ...data } = input;
    void _hp;
    void _confirm;
    const doc = {
      ...data,
      _id: randomUUID(),
      reference: makeReference(),
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
      storage: 'remote' as const,
    };
    await c.registrations.insertOne(doc);
    res.status(201).json(toApi(doc));
  });

  router.post('/contact', submissionLimiter, async (req, res) => {
    const input = parse(contactInput, req.body);
    if (input.hp) {
      res.status(201).json({ ok: true });
      return;
    }
    const { hp: _hp, ...data } = input;
    void _hp;
    const doc = {
      ...data,
      _id: randomUUID(),
      createdAt: new Date().toISOString(),
      storage: 'remote' as const,
      status: 'new' as const,
    };
    await c.messages.insertOne(doc);
    res.status(201).json(toApi(doc));
  });

  return router;
}
