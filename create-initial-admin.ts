const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

dotenv.config({ path: '.env.local' });

async function main() {
  const email = process.argv[2];
  const plainPassword = process.argv[3];

  if (!email || !plainPassword) {
    console.error(
      '❌ E-Mail und Passwort müssen als Argumente übergeben werden.'
    );
    console.error(
      '👉 Beispiel: npx ts-node create-initial-admin.ts admin@example.com MeinSicheresPasswort123'
    );
    process.exit(1);
  }

  if (!process.env.MONGO_DB_URI || !process.env.DB_NAME) {
    console.error(
      '❌ MONGO_DB_URI oder DB_NAME fehlt in der .env.local-Datei.'
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const client = await MongoClient.connect(process.env.MONGO_DB_URI);
  const db = client.db(process.env.DB_NAME);

  const workspacesCollection = db.collection('workspaces');
  const usersCollection = db.collection('users');

  // ❗ Prüfe, ob es bereits einen Admin in irgendeinem Workspace gibt
  const existingAdmin = await workspacesCollection.findOne({
    access: { $elemMatch: { role: 'ADMIN' } },
  });

  if (existingAdmin) {
    console.log(
      '⚠️ Es existiert bereits ein Admin im System. Initial-Setup nicht nötig.'
    );
    await client.close();
    return;
  }

  console.log('🛠 Neuer Workspace wird erstellt...');
  const workspaceId = new ObjectId();
  const workspaceName = 'Erstes Team';

  const newWorkspace = {
    _id: workspaceId,
    name: workspaceName,
    thumbnail: '',
    access: [],
  };

  await workspacesCollection.insertOne(newWorkspace);
  console.log(`✅ Workspace '${workspaceName}' erstellt (ID: ${workspaceId})`);

  console.log('👤 Admin-Benutzer wird angelegt...');
  const newUserId = new ObjectId();

  const newUser = {
    _id: newUserId,
    email,
    verified: true,
    password: hashedPassword,
    passwordUpdatedAt: new Date(),
    createdAt: new Date(),
    currentWorkspaceId: workspaceId.toHexString(),
    workspaces: [workspaceId.toHexString()],
  };

  await usersCollection.insertOne(newUser);
  console.log(`✅ Benutzer ${email} wurde vollständig erstellt.`);

  console.log('🔗 Verknüpfe Benutzer mit Workspace als ADMIN...');
  await workspacesCollection.updateOne(
    { _id: workspaceId },
    {
      $push: {
        access: {
          userId: newUserId.toHexString(),
          role: 'ADMIN',
        },
      },
    }
  );

  console.log(`🎉 Initialer Admin wurde erfolgreich angelegt und verknüpft.`);
  await client.close();
}

main().catch((err) => {
  console.error('❌ Fehler beim Ausführen:', err);
  process.exit(1);
});
