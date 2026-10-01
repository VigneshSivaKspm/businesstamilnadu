import { z } from 'zod';

const bool = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => (v === undefined ? fallback : v === 'true' || v === '1'));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required — see README “Backend setup”.'),
  MONGODB_DB: z.string().min(1).default('business_tamil_nadu'),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(12),
  /** Comma-separated origins allowed to call the API cross-origin. Leave empty when served same-origin. */
  CORS_ORIGIN: z.string().optional(),
  /** Serve the built frontend (dist/) from this server. Defaults to on in production. */
  SERVE_STATIC: z.string().optional(),
  /** Set when running behind a reverse proxy/load balancer so client IPs and HTTPS are detected. */
  TRUST_PROXY: bool(false),
});

export type Config = {
  env: 'development' | 'production' | 'test';
  isProduction: boolean;
  port: number;
  mongoUri: string;
  mongoDb: string;
  sessionTtlMs: number;
  corsOrigins: string[];
  serveStatic: boolean;
  trustProxy: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid server configuration:\n${details}`);
  }
  const c = parsed.data;
  const isProduction = c.NODE_ENV === 'production';
  return {
    env: c.NODE_ENV,
    isProduction,
    port: c.PORT,
    mongoUri: c.MONGODB_URI,
    mongoDb: c.MONGODB_DB,
    sessionTtlMs: c.SESSION_TTL_HOURS * 60 * 60 * 1000,
    corsOrigins: (c.CORS_ORIGIN ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    serveStatic: c.SERVE_STATIC === undefined ? isProduction : c.SERVE_STATIC === 'true',
    trustProxy: c.TRUST_PROXY,
  };
}
