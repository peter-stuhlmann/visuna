# Cookie-Dokumentation

Dieses Dokument listet alle Cookies auf, die von der Anwendung für client-seitige Einstellungen und server-seitiges Rendering verwendet werden.

## Übersicht

Alle Cookies werden gesetzt mit:
- **Ablauf**: 365 Tage (1 Jahr)
- **Zweck**: Speicherung von Nutzereinstellungen für UI-Layout und Verhalten
- **Typ**: Funktionale Cookies (erforderlich für korrektes UI-Rendering)

## Cookie-Liste

### 1. Dock-Position

**Cookie-Name**: `dock-is-fixed`

**Beschreibung**: Speichert, ob das Navigations-Dock fixiert (angepinnt) oder schwebend ist.

**Werte**:
- `"true"` - Dock ist fixiert/angepinnt
- `"false"` - Dock ist schwebend

**Standard**: `true`

**Verwendet in**:
- `utils/useDock.tsx` (Client-seitig)
- `app/(backend)/layout.tsx` (Server-seitig)

**Zweck**: Verhindert Layout-Shift beim Laden der Seite durch korrektes Server-Rendering des Dock-Zustands.

---

### 2. Seiten Split View - Größe

**Cookie-Name**: `pages-split-view-size`

**Beschreibung**: Speichert die Breite (in Pixeln) des linken Panels in der Seiten-Ansicht.

**Werte**: Zahl (Pixel), z.B. `"400"`

**Standard**: `0` (falls kein Cookie gesetzt ist)

**Verwendet in**:
- `components/ResizableSplit.tsx` (Client-seitig)
- `app/(backend)/workspaces/[workspaceId]/seiten/page.tsx` (Server-seitig)

**Zweck**: Bewahrt das vom Nutzer bevorzugte Split-View-Layout über Sitzungen und Seitenladevorgänge hinweg.

---

### 3. Seiten Split View - Ausrichtung

**Cookie-Name**: `pages-split-view-orientation`

**Beschreibung**: Speichert die Ausrichtung der Split-View-Panels.

**Werte**:
- `"horizontal"` - Panels sind nebeneinander
- `"vertical"` - Panels sind übereinander gestapelt

**Standard**: `"horizontal"`

**Verwendet in**:
- `components/ResizableSplit.tsx` (Client-seitig)
- `app/(backend)/workspaces/[workspaceId]/seiten/page.tsx` (Server-seitig)

**Zweck**: Merkt sich die vom Nutzer bevorzugte Panel-Anordnung.

---

### 4. Seiten Split View - Vertauscht

**Cookie-Name**: `pages-split-view-flipped`

**Beschreibung**: Speichert, ob die Split-View-Panels vertauscht (getauscht) sind.

**Werte**:
- `"true"` - Panels sind vertauscht (rechtes Panel ist links, oder unteres ist oben)
- `"false"` - Panels sind in Standard-Position

**Standard**: `false`

**Verwendet in**:
- `components/ResizableSplit.tsx` (Client-seitig)
- `app/(backend)/workspaces/[workspaceId]/seiten/page.tsx` (Server-seitig)

**Zweck**: Bewahrt die vom Nutzer bevorzugte Panel-Anordnung.

---

## Implementierungsdetails

### Cookie-Utilities

Cookies werden mit benutzerdefinierten Utilities verwaltet, die sich hier befinden:
- **Client-seitig**: `components/content-elements/default/utils/cookies.ts`
  - `setClientCookie(name, value, days)` - Setzt ein Cookie
  - `getClientCookie(name)` - Liest ein Cookie

### Server-seitiges Lesen

Server-Komponenten lesen Cookies mit der `cookies()`-API von Next.js aus `next/headers`:

```typescript
import { cookies } from 'next/headers';

const cookieStore = await cookies();
const value = cookieStore.get('cookie-name')?.value;
```

### Vorteile des Cookie-basierten Speichers

1. **Kein Layout-Shift**: Server rendert UI mit korrektem Zustand beim ersten Laden
2. **SSR-kompatibel**: Next.js kann auf Werte während des Server-seitigen Renderings zugreifen
3. **Persistent**: Werte überleben Browser-Neustarts (1 Jahr Ablaufzeit)
4. **Tab-übergreifende Synchronisation**: Zuverlässiger als localStorage

## Datenschutz & Compliance

Diese Cookies sind **streng funktional** und für den ordnungsgemäßen Betrieb der Benutzeroberfläche erforderlich. Sie:
- Verfolgen NICHT das Nutzerverhalten
- Sammeln KEINE persönlichen Informationen
- Teilen KEINE Daten mit Dritten
- Sind für die korrekte Funktion der Anwendung unerlässlich

Für streng funktionale Cookies ist nach DSGVO KEIN Cookie-Consent-Banner erforderlich.
