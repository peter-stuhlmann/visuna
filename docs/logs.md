# Log-Codes Dokumentation

Jeder Eintrag im Aktivitätsprotokoll hat einen 4-stelligen Code, der die Art der Aktion beschreibt.

## Übersicht

| Bereich | Code-Bereich |
|---------|-------------|
| Seiten | 10xx |
| Templates | 11xx |
| Seitenelemente | 12xx |
| Medien | 13xx |
| Workspace | 14xx |
| Benutzer | 15xx |
| Einladungen | 16xx |
| Sprachen | 17xx |
| SEO | 18xx |
| Anmeldung | 15xx (🔒 nur SuperAdmin) |
| AI-Aktionen | 20xx |

---

## Seiten (10xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1001` | Erstellt | Neue Seite wurde erstellt |
| `1002` | Gelöscht | Seite wurde gelöscht |
| `1003` | Dupliziert | Seite wurde dupliziert |
| `1004` | Status geändert | Publish-Status einer Seite wurde geändert |

## Templates (11xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1101` | Erstellt | Neues Template wurde erstellt |
| `1102` | Aktualisiert | Template-Daten wurden aktualisiert |
| `1103` | Gelöscht | Template wurde gelöscht |
| `1104` | Status geändert | Template-Status wurde geändert |

## Seitenelemente (12xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1201` | Hinzugefügt | Neues Seitenelement wurde zur Seite hinzugefügt |
| `1202` | Gelöscht | Seitenelement wurde von der Seite entfernt |
| `1203` | Umsortiert | Reihenfolge der Seitenelemente wurde geändert |
| `1204` | Aktualisiert | Daten eines Seitenelements wurden geändert |

## Medien (13xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1301` | Hochgeladen | Neues Bild wurde hochgeladen |
| `1302` | Aktualisiert | Bild-Metadaten (Alt-Text, Titel etc.) wurden aktualisiert |
| `1303` | Gelöscht | Bild wurde aus Cloudinary und der Datenbank gelöscht |

## Workspace (14xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1401` | Erstellt | Neuer Workspace wurde erstellt |
| `1402` | Aktualisiert | Workspace-Einstellungen wurden aktualisiert |
| `1403` | Gelöscht | Workspace und alle zugehörigen Daten wurden gelöscht |

## Benutzer (15xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1501` | Registriert | Neuer Benutzer hat sich registriert |
| `1502` | Aktualisiert | Benutzerprofil wurde aktualisiert |
| `1503` | Gelöscht | Benutzerkonto wurde gelöscht |
| `1504` | 🔒 Login | Benutzer hat sich eingeloggt *(nur SuperAdmin sichtbar)* |
| `1505` | 🔒 Logout | Benutzer hat sich ausgeloggt *(nur SuperAdmin sichtbar)* |

> Login/Logout-Logs enthalten zusätzlich **IP-Adresse**, **Land** und **Stadt** in den Details (Geo-Lookup via ip-api.com). Rechtsgrundlage: Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) — Sicherheitsprotokollierung.

## Einladungen (16xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1601` | Eingeladen | Benutzer wurde zum Workspace eingeladen |
| `1602` | Angenommen | Einladung wurde angenommen |
| `1603` | Abgelehnt | Einladung wurde abgelehnt |
| `1604` | Widerrufen | Einladung wurde widerrufen |
| `1605` | Erneut gesendet | Einladung wurde erneut gesendet |
| `1606` | Gelöscht | Einladung wurde gelöscht |

## Sprachen (17xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1701` | Aktualisiert | Spracheinstellungen des Workspaces wurden gespeichert |

## SEO (18xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `1801` | Aktualisiert | SEO-Daten einer Seite wurden gespeichert |

## AI-Aktionen (20xx)

| Code | Aktion | Beschreibung |
|------|--------|-------------|
| `2001` | AI-Übersetzung | Text wurde mit KI übersetzt |
| `2002` | AI-Metadaten | Bild-Metadaten wurden mit KI generiert |
| `2003` | AI-Chat | AI-Chatbot-Interaktion (inkl. Tool-Aufrufe) |

---

## Sichtbarkeit

Logs mit dem 🔒-Symbol sind nur für **SuperAdmins** sichtbar. Alle anderen Logs sind für Admins und SuperAdmins sichtbar.

## Aufbewahrung

| Rolle | Sichtbare Logs | Anmerkung |
|-------|---------------|-----------|
| Admin | 90 Tage | Standard-Aufbewahrung |
| SuperAdmin | 365 Tage | Erweiterte Aufbewahrung |
| Datenbank | 365 Tage | Automatische Löschung via TTL-Index |

**TTL-Index einrichten:**

```bash
npm run setupLogsTTL
```

Dieser Befehl erstellt einen MongoDB TTL-Index auf `activityLogs.createdAt`, der Logs nach 365 Tagen automatisch löscht.
