import { createHash, randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AdminDoc, Collections } from '../db.ts';
import { HttpError } from './http.ts';

export const SESSION_COOKIE = 'btn_admin';
/** Custom header required on state-changing admin requests (CSRF defence alongside SameSite=Strict). */
export const CSRF_HEADER = 'x-btn-admin';

const scrypt = (password: string, salt: Buffer, keylen: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key))),
  );

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

/** Hashes a password as `scrypt$N$r$p$salt$hash` (base64url parts). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64url'), key.toString('base64url')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, saltB64, hashB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const key = await scrypt(password, Buffer.from(saltB64, 'base64url'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** A real hash of a random password, used to keep login timing constant for unknown emails. */
let dummyHash: Promise<string> | undefined;
export const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

export const PASSWORD_RULES = 'Use at least 10 characters.';
export const isStrongEnough = (password: string) => password.length >= 10 && password.length <= 200;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export async function createSession(c: Collections, admin: AdminDoc, ttlMs: number, req: Request) {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  await c.sessions.insertOne({
    _id: randomUUID(),
    tokenHash: sha256(token),
    adminId: admin._id,
    createdAt: now,
    expiresAt: new Date(now.getTime() + ttlMs),
    userAgent: req.get('user-agent')?.slice(0, 300),
    ip: req.ip,
  });
  return token;
}

export async function destroySession(c: Collections, token: string | undefined) {
  if (token) await c.sessions.deleteOne({ tokenHash: sha256(token) });
}

export function cookieOptions(secure: boolean, maxAge?: number) {
  return { httpOnly: true, secure, sameSite: 'strict' as const, path: '/api', ...(maxAge ? { maxAge } : {}) };
}

/** Admin attached to the response by `requireAdmin`. */
export function currentAdmin(res: Response): AdminDoc {
  const admin = res.locals.admin as AdminDoc | undefined;
  if (!admin) throw new HttpError(401, 'Please sign in.');
  return admin;
}

/** Rejects unauthenticated requests and enforces the CSRF header on writes. */
export function requireAdmin(c: Collections): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!token) throw new HttpError(401, 'Please sign in.');
    const session = await c.sessions.findOne({ tokenHash: sha256(token) });
    if (!session || session.expiresAt.getTime() < Date.now()) throw new HttpError(401, 'Your session has expired. Please sign in again.');
    const admin = await c.admins.findOne({ _id: session.adminId });
    if (!admin || admin.disabled) throw new HttpError(401, 'Please sign in.');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get(CSRF_HEADER) !== '1') {
      throw new HttpError(403, 'Missing request verification header.');
    }
    res.locals.admin = admin;
    res.locals.sessionId = session._id;
    next();
  };
}

export const publicAdmin = (a: AdminDoc) => ({ id: a._id, name: a.name, email: a.email, role: a.role, lastLoginAt: a.lastLoginAt });
