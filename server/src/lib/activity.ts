import { randomUUID } from 'node:crypto';
import type { ActivityEntry } from '../../../src/types/index.ts';
import type { AdminDoc, Collections } from '../db.ts';

/** Records an admin action for the dashboard's activity feed. Never throws. */
export async function logActivity(
  c: Collections,
  admin: AdminDoc,
  entry: Pick<ActivityEntry, 'action' | 'targetType' | 'targetId' | 'summary'>,
) {
  try {
    await c.activity.insertOne({
      _id: randomUUID(),
      at: new Date().toISOString(),
      adminId: admin._id,
      adminName: admin.name,
      ...entry,
    });
  } catch (error) {
    console.error('[api] Failed to log activity:', error);
  }
}
