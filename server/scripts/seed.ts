/**
 * Loads the bundled sample listings into MongoDB (skipping any slug that
 * already exists). They stay flagged `isDemo: true` so they're labelled as
 * samples and easy to bulk-filter in the admin panel.
 *
 *   npm run db:seed
 */
import type { BusinessDoc } from '../src/db.ts';
import { loadConfig } from '../src/config.ts';
import { connect } from '../src/db.ts';
import { businesses } from '../../src/data/businesses.ts';

export async function seedDemoBusinesses(collections: Awaited<ReturnType<typeof connect>>['collections']) {
  let inserted = 0;
  for (const { id, ...business } of businesses) {
    const now = new Date().toISOString();
    const doc: BusinessDoc = { ...business, _id: id, updatedAt: now, createdAt: business.createdAt ?? now };
    const result = await collections.businesses.updateOne({ slug: doc.slug }, { $setOnInsert: doc }, { upsert: true });
    if (result.upsertedCount) inserted++;
  }
  return { inserted, total: businesses.length };
}

if (import.meta.main) {
  const config = loadConfig();
  const { client, collections } = await connect(config.mongoUri, config.mongoDb);
  const { inserted, total } = await seedDemoBusinesses(collections);
  console.log(`Seeded ${inserted} new sample listings (${total - inserted} already present).`);
  await client.close();
}
