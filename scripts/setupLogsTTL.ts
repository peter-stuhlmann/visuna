/**
 * Setup TTL (Time-To-Live) index on activityLogs collection.
 *
 * Logs older than 365 days will be automatically deleted by MongoDB.
 *
 * Run once:  npx tsx scripts/setupLogsTTL.ts
 */
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_DB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGO_URI || !DB_NAME) {
  console.error('❌ MONGO_DB_URI and DB_NAME must be set.');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI!);
  await client.connect();
  const db = client.db(DB_NAME);

  const collection = db.collection('activityLogs');

  // Create TTL index: auto-delete documents 365 days after createdAt
  await collection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 365 * 24 * 60 * 60, name: 'ttl_createdAt_365d' }
  );

  console.log('✅ TTL-Index erstellt: activityLogs.createdAt — Logs werden nach 365 Tagen automatisch gelöscht.');

  await client.close();
}

main().catch((err) => {
  console.error('❌ Fehler:', err);
  process.exit(1);
});
