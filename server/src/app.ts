import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import type { Config } from './config.ts';
import type { Collections } from './db.ts';
import { requireAdmin } from './lib/auth.ts';
import { HttpError, errorHandler } from './lib/http.ts';
import { adminAuthRoutes } from './routes/adminAuth.ts';
import { adminBusinessRoutes } from './routes/adminBusinesses.ts';
import { adminMessageRoutes } from './routes/adminMessages.ts';
import { adminRegistrationRoutes } from './routes/adminRegistrations.ts';
import { adminStatsRoutes } from './routes/adminStats.ts';
import { publicRoutes } from './routes/public.ts';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');

export interface AppOptions {
  /** Per-IP limits (15-minute window). Tests raise these. */
  submissionLimit?: number;
  loginLimit?: number;
}

export function createApp(c: Collections, config: Config, options: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: config.isProduction ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Optional cross-origin access when the frontend is hosted separately.
  if (config.corsOrigins.length) {
    app.use('/api', (req, res, next) => {
      const origin = req.get('origin');
      if (origin && config.corsOrigins.includes(origin)) {
        res.set({
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,X-BTN-Admin',
          Vary: 'Origin',
        });
      }
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }
      next();
    });
  }

  app.use('/api', express.json({ limit: '100kb' }), cookieParser());

  app.use('/api', publicRoutes(c, { submissionLimit: options.submissionLimit ?? 10 }));
  app.use('/api/admin/auth', adminAuthRoutes(c, config, { loginLimit: options.loginLimit ?? 10 }));

  const admin = express.Router();
  admin.use(requireAdmin(c));
  admin.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  admin.use('/', adminStatsRoutes(c));
  admin.use('/registrations', adminRegistrationRoutes(c));
  admin.use('/messages', adminMessageRoutes(c));
  admin.use('/businesses', adminBusinessRoutes(c));
  app.use('/api/admin', admin);

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint not found.')));

  // Serve the built frontend with SPA fallback (single-server deployment).
  if (config.serveStatic && existsSync(DIST)) {
    app.use(express.static(DIST, { index: false, maxAge: '1y', immutable: true, setHeaders: noCacheHtml }));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(DIST, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}

function noCacheHtml(res: express.Response, filePath: string) {
  if (filePath.endsWith('.html') || !filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'no-cache');
}
