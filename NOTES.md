Wrapper:

id?: TextInput;
className?: TextInput;
element?: Select;
children?: RTEditor;
width?: Select;
innerWidth?: Select;
borderRadius?: Select;
innerBorderRadius?: Select;
marginBottom?: Select;
marginTop?: Select;
paddingTop?: Select;
paddingBottom?: Select;
paddingLeft?: Select;
paddingRight?: Select;
backgroundColor?: ColorInput (string);

Overline / Heading / Subline:

textTransform?: Select;
align?: Select;
color?: ColorInput (string);
fontWeight?: Select;
element?: Select;
value?: TextInput;

unwrapped?: Switch (Wrapped in einem Container: ja / nein, default ja)

ICH BRAUCHE: in /components/blocks/

- TextInput
- Select
- RTEditor
- ColorInput
- Switch

---

########################

### Layout 2 Teile (Webcontent und PageElement Einstellungen)

### Seiten erstellen / bearbeiten / löschen

Bsp. /contact

Ich gehe auf die Seite /contact

Bearbeiten (noch überlegen wie ich den Button elegant einbinde), dann automatisch Weiterleitung zu /workspaces/[id]/seiten/[id]

Die Seite sieht genauso aus, aber im Edit-Layout (2 resizable Areas und Dock)

Änderungen werden erstmal nur im State gespeichert.

Abbrechen und Speichern:
Abbrechen: State wieder zurücksetzen
Speichern: gesamten state (bildet eine ganze Seite ab) order vergeben und dann in der DB speichern. Danach State wieder zurücksetzen und aktualisierten State nutzen.

### Dock

Dock ist unten eingeblendet im Backend-Modus (Default: "Zur Live-Seite", "Seiten", "Explorer" (Benutzerverwaltung, Profil, Medienpool, Logs, Logout, etc), (+ im Edit-Modus: Speichern, Abbrechen))

########################

MVP:

- Seiten erstellen / bearbeiten / löschen
- Beiträge erstellen / bearbeiten / löschen
- Pro Seite/Beitrag: SEO-Einstellungen
- Globale SEO Einstellungen (Unterpunkt von Website-Settings)
- Globale Style Einstellungen (Unterpunkt von Website-Settings)
- Seiten-Elemente erstellen / bearbeiten / löschen
- Seitentypen definieren/zuordnen/nutzen:
  - Startseite
- Header und Footer inkl. Content anlegbar machen (in Website-Settings)
- Sitemap wird automatisch beim Veröffentlichen einer Seite neu generiert
- Rollenverteilung erweitern: Zugriff auf Seiten, Formulare, Nutzerverwaltung etc
- GoogleAnalytics Support
- CookieConsent
- Medienpool (Bilder hochladen/löschen, default alt/descrption - kann individuell überschrieben werden)
- Backend dynamisch 2sprachig (deutsch/englisch)
- Frontend mehrsprachig erstellbar (manuell/OpenAI)
- Benutzerverwaltung
- DB-Backup (über CMS downloaden)
- Alle Listen haben eine Pagination und ein Suchfeld
- Eigenes Profil verwaltbar: Name, Profilbild, Passwort etc
- Formulareingänge verwalten (filterbar nach Formular)
- Custom Content Element: Da kann man dann einfach beliebig viele verschiedene Input-Felder generieren. WICHTIG schon für erste Version!

---

Elemente aus /blocks werden in components\pages\page-edit\AddPageElement.tsx gemapped

Elemente aus /content-elements werden in app\[locale]\[slug]\page.tsx gemapped

2 Ideen:

1. AI-Agent: als ChatInput immer eingeblendet unten. Man kann sagen "Lege eine neue Seite an. Dann fragt er Dich nach dem Titel."

2. Man rendert gar nicht alles durch im externen Frontend: Man installiert ein npm Modul und importiert lediglich den Wrapper. Die Wrappung passiert im Modul.
