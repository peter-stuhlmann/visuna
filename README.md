# VISUNA

## 🛠 Initialen Admin & Workspace anlegen

Bevor du die Anwendung zum ersten Mal verwendest, musst du einen **Admin-Nutzer** und einen ersten **Workspace** erstellen.
Führe im Root-Verzeichnis des Projekts folgenden Befehl aus:

```bash
npx ts-node create-initial-admin.ts admin@example.com MeinSicheresPasswort123
```

🔒 Ersetze `admin@example.com` und `MeinSicheresPasswort123` durch die gewünschte E-Mail-Adresse und ein sicheres Passwort. Das Passwort wird automatisch mit **bcrypt** gehasht und in der Datenbank gespeichert. Der Nutzer erhält sofort Zugriff auf den ersten Workspace als `ADMIN`.

### ⚠️ Hinweis

- Dieses Skript kann **nur einmal** erfolgreich ausgeführt werden. Es prüft, ob bereits ein Admin existiert.
- Wenn du später manuell weitere Users oder Workspaces hinzufügen willst, musst du das über die Benutzerverwaltung im Admin-Dashboard machen.
