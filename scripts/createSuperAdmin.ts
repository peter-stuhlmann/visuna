/**
 * scripts/createSuperAdmin.ts
 *
 * Creates an initial SuperAdmin user and (optionally) a first workspace.
 *
 * Usage:
 *   npm run createSuperAdmin -- admin@example.com MeinPasswort123
 *
 * Requires MONGO_DB_URI and DB_NAME in .env.local.
 */

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config({ path: '.env.local' });

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function main() {
  const email = process.argv[2];
  const plainPassword = process.argv[3];

  if (!email || !plainPassword) {
    console.error(
      '❌ E-Mail und Passwort müssen als Argumente übergeben werden.'
    );
    console.error(
      '   Beispiel: npm run createSuperAdmin -- admin@example.com MeinPasswort123'
    );
    process.exit(1);
  }

  if (!process.env.MONGO_DB_URI || !process.env.DB_NAME) {
    console.error(
      '❌ MONGO_DB_URI oder DB_NAME fehlt in der .env.local-Datei.'
    );
    process.exit(1);
  }

  const client = await MongoClient.connect(process.env.MONGO_DB_URI);

  try {
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');
    const workspacesCollection = db.collection('workspaces');

    // ── Check: already a superadmin? ────────────────────────────
    const existingSuperAdmin = await workspacesCollection.findOne({
      access: { $elemMatch: { role: 'superadmin' } },
    });

    if (existingSuperAdmin) {
      console.log(
        '⚠️  Es existiert bereits ein SuperAdmin im System. Abbruch.'
      );
      return;
    }

    // ── Check: E-Mail already taken? ────────────────────────────
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log(
        `⚠️  Ein Benutzer mit der E-Mail "${email}" existiert bereits.`
      );
      return;
    }

    // ── Create user ─────────────────────────────────────────────
    const userId = createId('user');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = {
      _id: userId,
      email: email.toLowerCase(),
      name: 'SuperAdmin',
      verified: true,
      password: hashedPassword,
      passwordUpdatedAt: new Date(),
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);
    console.log(`✅ Benutzer angelegt: ${email} (ID: ${userId})`);

    // ── Create initial workspace ────────────────────────────────
    const workspaceId = createId('ws');

    const newWorkspace = {
      _id: workspaceId,
      name: 'Mein Workspace',
      domain: '',
      thumbnail: '',
      pages: [],
      access: [
        {
          userId,
          role: 'superadmin',
        },
      ],
      languages: {
        frontendLanguages: ['de'],
        contentLanguages: ['de'],
        mainLanguage: 'de',
      },
      features: {
        aiTokens: 100000,
        allowedUsers: 5,
        mediaLimit: 500,
        customDomain: false,
      },
      plan: 'free',
      createdAt: new Date(),
    };

    await workspacesCollection.insertOne(newWorkspace);
    console.log(`✅ Workspace angelegt: "Mein Workspace" (ID: ${workspaceId})`);

    // ── Link workspace to user ──────────────────────────────────
    await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          currentWorkspaceId: workspaceId,
          workspaces: [workspaceId],
        },
      }
    );

    console.log('');
    console.log('🎉 SuperAdmin erfolgreich eingerichtet!');
    console.log(`   E-Mail:     ${email}`);
    console.log(`   Workspace:  Mein Workspace`);
    console.log('');
    console.log('   Du kannst dich jetzt mit diesen Zugangsdaten einloggen.');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('❌ Fehler beim Ausführen:', err);
  process.exit(1);
});
