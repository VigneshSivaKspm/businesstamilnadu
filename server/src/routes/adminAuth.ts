import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Config } from '../config.ts';
import type { Collections } from '../db.ts';
import { logActivity } from '../lib/activity.ts';
import {
  SESSION_COOKIE,
  cookieOptions,
  createSession,
  currentAdmin,
  destroySession,
  getDummyHash,
  hashPassword,
  publicAdmin,
  requireAdmin,
  verifyPassword,
} from '../lib/auth.ts';
import { HttpError, parse } from '../lib/http.ts';
import { loginInput, passwordChangeInput } from '../schemas.ts';

export function adminAuthRoutes(c: Collections, config: Config, options: { loginLimit: number }) {
  const router = Router();
  const secure = config.isProduction;

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: options.loginLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: { message: 'Too many sign-in attempts. Please wait 15 minutes and try again.' } },
  });

  router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = parse(loginInput, req.body);
    const admin = await c.admins.findOne({ email });
    // Always run a password check so response time doesn't reveal whether the email exists.
    const ok = await verifyPassword(password, admin?.passwordHash ?? (await getDummyHash()));
    if (!admin || !ok || admin.disabled) throw new HttpError(401, 'Incorrect email or password.');

    const token = await createSession(c, admin, config.sessionTtlMs, req);
    const lastLoginAt = new Date().toISOString();
    await c.admins.updateOne({ _id: admin._id }, { $set: { lastLoginAt } });
    res.cookie(SESSION_COOKIE, token, cookieOptions(secure, config.sessionTtlMs));
    res.json({ admin: publicAdmin({ ...admin, lastLoginAt }) });
  });

  router.post('/logout', async (req, res) => {
    await destroySession(c, req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE, cookieOptions(secure));
    res.json({ ok: true });
  });

  router.get('/me', requireAdmin(c), (_req, res) => {
    res.json({ admin: publicAdmin(currentAdmin(res)) });
  });

  router.post('/password', requireAdmin(c), async (req, res) => {
    const admin = currentAdmin(res);
    const { currentPassword, newPassword } = parse(passwordChangeInput, req.body);
    if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
      throw new HttpError(400, 'Current password is incorrect.', { currentPassword: 'Current password is incorrect.' });
    }
    if (currentPassword === newPassword) {
      throw new HttpError(400, 'Choose a new password.', { newPassword: 'The new password must be different.' });
    }
    await c.admins.updateOne({ _id: admin._id }, { $set: { passwordHash: await hashPassword(newPassword) } });
    // Sign out every other session for this admin.
    await c.sessions.deleteMany({ adminId: admin._id, _id: { $ne: res.locals.sessionId as string } });
    await logActivity(c, admin, { action: 'password.changed', targetType: 'admin', targetId: admin._id, summary: 'Changed their password' });
    res.json({ ok: true });
  });

  return router;
}
