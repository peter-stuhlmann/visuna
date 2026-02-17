// app/api/workspaces/[workspaceId]/ai-chat/tools/index.ts
//
// Alle Tool-Definitionen und deren Ausführungslogik.
// Die Tools rufen direkt die Service-Funktionen auf (kein HTTP-Overhead).

import type { ChatCompletionTool } from 'openai/resources/chat/completions';

// ── Imports: Pages ──────────────────────────────────────────────
import { getPageById, createPage, deletePage, duplicatePage, updatePagePublishStatus } from '@/lib/workspaces/pages/pages.service';
import { findPageBySlug } from '@/lib/workspaces/pages/pages.repo';
import connectToDatabase from '@/utils/connectToDatabase';

// ── Imports: Page Elements ──────────────────────────────────────
import { createPageElement, deletePageElement } from '@/lib/workspaces/pages/page-elements/page-elements.service';
import { updatePageElement } from '@/lib/workspaces/pages/page-elements/page-elements.repo';
import { getElementDefaults } from './getElementDefaults';
import { deepFillMissing } from '@/utils/elementDefaults';

// ── Imports: Templates ──────────────────────────────────────────
import { listTemplates, getTemplateById, createTemplate, deleteTemplate, updateTemplateService } from '@/lib/workspaces/templates/templates.service';

// ── Imports: Media ──────────────────────────────────────────────
import { listWorkspaceMedia } from '@/lib/workspaces/media/media.service';

// ═══════════════════════════════════════════════════════════════
//  TOOL DEFINITIONS (OpenAI Function Calling Schema)
// ═══════════════════════════════════════════════════════════════

export const toolDefinitions: ChatCompletionTool[] = [
  // ── Pages ─────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'list_pages',
      description: 'Listet alle Seiten im Workspace auf. Gibt Name, Slug und ID zurück.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_pages',
      description: 'Sucht Seiten nach Name oder Slug. Gibt passende Seiten zurück.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Suchbegriff (Name oder Slug der Seite)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_page_by_slug',
      description: 'Findet eine Seite anhand ihres URL-Slugs (exakter Abgleich). Nutze dieses Tool, wenn der User einen Slug nennt (z.B. "hello-world", "ueber-uns"). Gibt die Seite mit ID zurück oder null wenn nicht gefunden.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Exakter URL-Slug der Seite (z.B. "hello-world-qq")' },
        },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_page',
      description: 'Gibt die vollständigen Details einer Seite zurück, inklusive aller Elemente.',
      parameters: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'ID der Seite' },
        },
        required: ['pageId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_page',
      description: 'Erstellt eine neue Seite im Workspace.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name der Seite' },
          slug: { type: 'string', description: 'URL-Slug der Seite (z.B. "ueber-uns")' },
        },
        required: ['name', 'slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_page',
      description: 'LÖSCHT eine Seite PERMANENT und UNWIDERRUFLICH aus der Datenbank. Alle Inhalte und Elemente gehen verloren. NICHT verwenden zum Offline-Stellen! Dafür gibt es update_page_status.',
      parameters: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'ID der zu löschenden Seite' },
        },
        required: ['pageId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_page_status',
      description: 'Ändert den Veröffentlichungs-Status einer Seite (offline/live/maintenance). Nutze dieses Tool zum Offline-Stellen, Live-Schalten oder Wartungsmodus. NICHT delete_page verwenden zum Offline-Stellen!',
      parameters: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'ID der Seite' },
          status: {
            type: 'string',
            enum: ['offline', 'maintenance', 'live'],
            description: 'Neuer Status: offline, maintenance (Wartung) oder live',
          },
        },
        required: ['pageId', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'duplicate_page',
      description: 'Dupliziert eine bestehende Seite mit allen Elementen.',
      parameters: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'ID der zu duplizierenden Seite' },
        },
        required: ['pageId'],
      },
    },
  },

  // ── Page Elements ─────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'list_page_elements',
      description: 'Listet alle Elemente einer Seite auf. Gibt Typ, ID und eine Vorschau des Inhalts zurück.',
      parameters: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'ID der Seite' },
        },
        required: ['pageId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_element',
      description: 'Erstellt ein neues Element auf einer Seite. Übergib data um gleich Inhalte und Layout zu setzen! Element wird standardmäßig sichtbar erstellt.',
      parameters: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'ID der Seite' },
          type: {
            type: 'string',
            description: 'Element-Slug: image-text, intro-text, accordion, spacer, horizontal-line, cards-grid, etc.',
          },
          data: {
            type: 'object',
            description: 'Initiale Daten für das Element. Enthält layout (outerBackgroundColor, Padding etc.) und element-spezifische Felder (children, image etc.). Texte immer als { de: "...", en: "..." }.',
          },
          visible: { type: 'boolean', description: 'Sichtbarkeit, Standard: true' },
        },
        required: ['pageId', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_element',
      description: 'Aktualisiert den Inhalt eines bestehenden Seitenelements. Nutze dieses Tool, um Text, Überschriften oder andere Inhalte eines Elements zu ändern. WICHTIG: Wenn der User bestehende Inhalte ändern will, nutze dieses Tool statt create_element!',
      parameters: {
        type: 'object',
        properties: {
          elementId: { type: 'string', description: 'ID des zu aktualisierenden Elements' },
          data: {
            type: 'object',
            description: 'Neues Datenobjekt für das Element. Beispiel für Text: { text: { de: "Inhalt" } }, für Heading: { text: { de: "Überschrift" }, level: "h2" }',
          },
        },
        required: ['elementId', 'data'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_element',
      description: 'Löscht ein Seitenelement PERMANENT von einer Seite. Frage vorher nach Bestätigung!',
      parameters: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'ID der Seite' },
          elementId: { type: 'string', description: 'ID des zu löschenden Elements' },
        },
        required: ['pageId', 'elementId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'toggle_element_visibility',
      description: 'Ändert die Sichtbarkeit eines Seitenelements (ein-/ausblenden). Sichtbar = wird im Frontend angezeigt.',
      parameters: {
        type: 'object',
        properties: {
          elementId: { type: 'string', description: 'ID des Elements' },
          visible: { type: 'boolean', description: 'true = sichtbar, false = ausgeblendet' },
        },
        required: ['elementId', 'visible'],
      },
    },
  },

  // ── Templates ─────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'list_templates',
      description: 'Listet alle Templates im Workspace auf. Optional nach Typ filtern (header/footer).',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['header', 'footer'],
            description: 'Optional: nur Header- oder Footer-Templates',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_template',
      description: 'Gibt die vollständigen Details eines Templates zurück.',
      parameters: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'ID des Templates' },
        },
        required: ['templateId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_template',
      description: 'Erstellt ein neues Template (Header oder Footer).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name des Templates' },
          type: {
            type: 'string',
            enum: ['header', 'footer'],
            description: 'Typ: header oder footer',
          },
        },
        required: ['name', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_template',
      description: 'Aktualisiert ein bestehendes Template (z.B. Name ändern).',
      parameters: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'ID des Templates' },
          name: { type: 'string', description: 'Neuer Name' },
        },
        required: ['templateId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_template',
      description: 'Löscht ein Template. ACHTUNG: Kann nicht rückgängig gemacht werden.',
      parameters: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'ID des zu löschenden Templates' },
        },
        required: ['templateId'],
      },
    },
  },

  // ── Search ────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'search_content',
      description: 'Durchsucht alle Inhalte (Seiten und Elemente) nach einem Suchbegriff. Gibt Seiten zurück, deren Name, Slug oder Inhalt den Suchbegriff enthält.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Suchbegriff' },
        },
        required: ['query'],
      },
    },
  },

  // ── Navigation ────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'navigate_to',
      description: 'Navigiert im Backend zu einem bestimmten Bereich (Dashboard, Seitenübersicht, Templates, Medienpool, etc.).',
      parameters: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            enum: ['dashboard', 'pages', 'templates', 'media', 'settings', 'default-settings', 'languages', 'logs', 'ai-logs', 'users', 'forms', 'keys', 'profile', 'workspaces', 'logout'],
            description: 'Ziel im Backend: dashboard, pages (Seitenübersicht), templates, media (Medienpool), settings (Workspace-Einstellungen), default-settings (Default-Einstellungen), languages (Spracheinstellungen), logs, ai-logs, users (Benutzerverwaltung), forms (Formularverwaltung), keys (API-Keys), profile (Profil des eingeloggten Users), workspaces (Workspace-Übersicht), logout',
          },
        },
        required: ['target'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_page',
      description: 'Navigiert zur Editor-/Vorschau-Ansicht einer bestimmten Seite. Findet die Seite per Slug und navigiert direkt dorthin. Nutze dieses Tool, wenn der User sagt "geh zur Seite X" oder "öffne Seite X".',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Slug der Seite (z.B. "404", "ueber-uns", "hello-world")' },
          pageId: { type: 'string', description: 'Alternativ: direkte pageId falls bekannt' },
        },
        required: [],
      },
    },
  },

  // ── Preview ───────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'set_preview_language',
      description: 'Ändert die Vorschau-Sprache im Editor.',
      parameters: {
        type: 'object',
        properties: {
          language: { type: 'string', description: 'Sprachcode (z.B. "de", "en", "es")' },
        },
        required: ['language'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_preview_device',
      description: 'Ändert die Geräte-Ansicht der Vorschau.',
      parameters: {
        type: 'object',
        properties: {
          device: {
            type: 'string',
            enum: ['desktop', 'tablet-landscape', 'tablet-portrait', 'phone-landscape', 'phone-portrait'],
            description: 'Geräte-Ansicht',
          },
        },
        required: ['device'],
      },
    },
  },

  // ── Media ──────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'search_media',
      description: 'Durchsucht den Medienpool des Workspaces nach Bildern. Sucht in alt, title und caption Metadaten. Wenn kein query angegeben, werden alle Bilder zurückgegeben (max 10).',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Optionaler Suchbegriff — wird in alt, title und caption gesucht' },
        },
        required: [],
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════
//  TOOL EXECUTION
// ═══════════════════════════════════════════════════════════════

export type ToolResult = {
  name: string;
  result: any;
  /** Für Client-seitige Aktionen (navigate, preview-Änderungen) */
  clientAction?: {
    type: 'navigate' | 'set_preview_language' | 'set_preview_device';
    payload: any;
  };
};

/**
 * Route-Map für Navigation
 */
function getNavigationRoute(workspaceId: string, target: string, id?: string): string {
  const base = `/workspaces/${workspaceId}`;
  switch (target) {
    case 'dashboard':         return `${base}/dashboard`;
    case 'pages':             return `${base}/seiten`;
    case 'templates':         return `${base}/templates`;
    case 'media':             return `${base}/medienpool`;
    case 'settings':          return `${base}/einstellungen`;
    case 'default-settings':  return `${base}/default-einstellungen`;
    case 'languages':         return `${base}/sprachen`;
    case 'logs':              return `${base}/logs`;
    case 'ai-logs':           return `${base}/ai-logs`;
    case 'users':             return `${base}/benutzerverwaltung`;
    case 'forms':             return `${base}/formularverwaltung`;
    case 'keys':              return `${base}/keys`;
    case 'profile':           return `/profil`;
    case 'workspaces':        return `/workspaces`;
    case 'logout':            return '/api/auth/signout';
    default:                  return `${base}/dashboard`;
  }
}

export async function executeToolCall(
  name: string,
  args: Record<string, any>,
  workspaceId: string,
  userId?: string
): Promise<ToolResult> {
  try {
    switch (name) {
      // ── Pages ───────────────────────────────────────────────
      case 'list_pages':
      case 'search_pages':
      case 'search_content': {
        const query = (args.query || '').toLowerCase().trim();
        const { db } = await connectToDatabase(process.env.DB_NAME!);
        const allPages = await db.collection('pages').find({ workspaceId }).toArray();

        // Filtern wenn Suchbegriff vorhanden
        const filtered = query
          ? allPages.filter((p: any) =>
              (p.name || '').toLowerCase().includes(query) ||
              (p.slug || '').toLowerCase().includes(query)
            )
          : allPages;

        const summary = filtered.slice(0, 20).map((p: any) => ({
          id: p._id,
          name: p.name,
          slug: p.slug,
          publishStatus: p.publishStatus ?? 'offline',
          elementsCount: Array.isArray(p.pageElements) ? p.pageElements.length : 0,
        }));
        return { name, result: { pages: summary, count: summary.length } };
      }

      case 'find_page_by_slug': {
        const page = await findPageBySlug(args.slug, workspaceId);
        if (!page) {
          return { name, result: { found: false, slug: args.slug, message: `Keine Seite mit Slug "${args.slug}" gefunden.` } };
        }
        return {
          name,
          result: {
            found: true,
            id: page._id,
            name: page.name,
            slug: page.slug,
          },
        };
      }

      case 'get_page': {
        const page = await getPageById(args.pageId, workspaceId);
        const elements = (page as any).pageElements?.map((el: any, i: number) => ({
          index: i,
          id: el._id,
          type: el.element,
          visible: el.visible !== false,
        })) ?? [];
        return {
          name,
          result: {
            id: (page as any)._id,
            name: (page as any).name,
            slug: (page as any).slug,
            elements,
          },
        };
      }

      case 'create_page': {
        const page = await createPage(
          {
            workspaceId,
            name: args.name,
            slug: args.slug,
          },
          userId
        );
        const pageId = (page as any)._id;
        const pageLink = `/workspaces/${workspaceId}/seiten?pageId=${pageId}`;
        return { name, result: { success: true, pageId, name: args.name, slug: args.slug, link: pageLink } };
      }

      case 'delete_page': {
        await deletePage(args.pageId, workspaceId);
        return { name, result: { success: true, pageId: args.pageId } };
      }

      case 'update_page_status': {
        // GPT sendet manchmal Synonyme statt der exakten Enum-Werte
        const statusMap: Record<string, 'offline' | 'maintenance' | 'live'> = {
          offline: 'offline',
          off: 'offline',
          deaktiviert: 'offline',
          deactivated: 'offline',
          live: 'live',
          online: 'live',
          aktiv: 'live',
          active: 'live',
          published: 'live',
          veröffentlicht: 'live',
          maintenance: 'maintenance',
          wartung: 'maintenance',
        };

        const normalizedStatus = statusMap[(args.status || '').toLowerCase()];
        if (!normalizedStatus) {
          return {
            name,
            result: { error: `Ungültiger Status "${args.status}". Erlaubt: offline, live, maintenance.` },
          };
        }

        const page = await updatePagePublishStatus(
          args.pageId,
          workspaceId,
          normalizedStatus,
          userId
        );
        return {
          name,
          result: {
            success: true,
            pageId: args.pageId,
            newStatus: normalizedStatus,
            pageName: (page as any).name,
          },
        };
      }

      case 'duplicate_page': {
        const dup = await duplicatePage(args.pageId, workspaceId);
        return {
          name,
          result: {
            success: true,
            originalPageId: args.pageId,
            newPageId: (dup as any)?._id,
          },
        };
      }

      // ── Page Elements ───────────────────────────────────────
      case 'list_page_elements': {
        const page = await getPageById(args.pageId, workspaceId);
        const elements = (page as any).pageElements?.map((el: any, i: number) => ({
          index: i,
          id: el._id,
          type: el.element,
          name: el.name,
          visible: el.visible !== false,
          data: el.data ?? {},
        })) ?? [];
        return { name, result: { pageId: args.pageId, elements } };
      }

      case 'create_element': {
        const defaults = getElementDefaults(args.type);
        // Deep-merge: GPT-Daten haben Priorität, fehlende Felder werden aus Defaults gefüllt
        const mergedData = deepFillMissing({ ...(args.data ?? {}) }, defaults);
        const element = await createPageElement({
          pageId: args.pageId,
          element: args.type,
          data: mergedData,
          visible: args.visible !== false,
        });
        const elementId = (element as any)?._id;
        const elementLink = `/workspaces/${workspaceId}/seiten?pageId=${args.pageId}&mode=edit-element&editId=${elementId}`;
        return {
          name,
          result: { success: true, pageId: args.pageId, type: args.type, elementId, link: elementLink },
        };
      }

      case 'update_element': {
        const updated = await updatePageElement(args.elementId, args.data);
        if (!updated) {
          return { name, result: { error: `Element "${args.elementId}" nicht gefunden.` } };
        }
        return {
          name,
          result: {
            success: true,
            elementId: args.elementId,
            updatedData: (updated as any).data,
          },
        };
      }

      case 'delete_element': {
        const result = await deletePageElement({
          workspaceId,
          pageId: args.pageId,
          elementId: args.elementId,
        });
        if (!result) {
          return { name, result: { error: `Element "${args.elementId}" nicht gefunden.` } };
        }
        return { name, result: { success: true, elementId: args.elementId } };
      }

      case 'toggle_element_visibility': {
        const updated = await updatePageElement(args.elementId, undefined, { visible: args.visible });
        if (!updated) {
          return { name, result: { error: `Element "${args.elementId}" nicht gefunden.` } };
        }
        return {
          name,
          result: {
            success: true,
            elementId: args.elementId,
            visible: args.visible,
          },
        };
      }

      // ── Templates ───────────────────────────────────────────
      case 'list_templates': {
        const templates = await listTemplates(workspaceId, args.type);
        const summary = templates.map((t: any) => ({
          id: t._id,
          name: t.name,
          type: t.type,
          isDefault: t.isDefault ?? false,
        }));
        return { name, result: { templates: summary } };
      }

      case 'get_template': {
        const template = await getTemplateById(args.templateId, workspaceId);
        return { name, result: { template } };
      }

      case 'create_template': {
        const template = await createTemplate(
          { workspaceId, name: args.name, template: args.type },
          userId
        );
        const templateId = (template as any)._id;
        const templateLink = `/workspaces/${workspaceId}/templates/${args.type}?templateId=${templateId}`;
        return {
          name,
          result: { success: true, templateId, name: args.name, type: args.type, link: templateLink },
        };
      }

      case 'update_template': {
        const updates: any = {};
        if (args.name) updates.name = args.name;
        const template = await updateTemplateService(args.templateId, workspaceId, updates, userId);
        return { name, result: { success: true, template } };
      }

      case 'delete_template': {
        await deleteTemplate(args.templateId, workspaceId);
        return { name, result: { success: true, templateId: args.templateId } };
      }

      // ── Navigation ──────────────────────────────────────────
      case 'navigate_to': {
        const route = getNavigationRoute(workspaceId, args.target);
        return {
          name,
          result: { route, target: args.target },
          clientAction: { type: 'navigate', payload: { route } },
        };
      }

      case 'navigate_to_page': {
        let pageId = args.pageId;

        // Wenn kein pageId, per Slug suchen
        if (!pageId && args.slug) {
          const page = await findPageBySlug(args.slug, workspaceId);
          if (!page) {
            return { name, result: { error: `Keine Seite mit Slug "${args.slug}" im aktuellen Workspace gefunden.` } };
          }
          pageId = page._id;
        }

        if (!pageId) {
          return { name, result: { error: 'Bitte gib einen Slug oder eine pageId an.' } };
        }

        const route = `/workspaces/${workspaceId}/seiten/${pageId}/preview`;
        return {
          name,
          result: { route, pageId },
          clientAction: { type: 'navigate', payload: { route } },
        };
      }

      // ── Preview ─────────────────────────────────────────────
      case 'set_preview_language': {
        return {
          name,
          result: { language: args.language },
          clientAction: { type: 'set_preview_language', payload: { language: args.language } },
        };
      }

      case 'set_preview_device': {
        return {
          name,
          result: { device: args.device },
          clientAction: { type: 'set_preview_device', payload: { device: args.device } },
        };
      }

      // ── Media ──────────────────────────────────────────────
      case 'search_media': {
        const allMedia = await listWorkspaceMedia(workspaceId);
        const query = (args.query || '').toLowerCase().trim();

        let results = allMedia;
        if (query) {
          results = allMedia.filter((m: any) => {
            const meta = m.meta || {};
            const searchIn = [
              ...Object.values(meta.alt || {}),
              ...Object.values(meta.title || {}),
              ...Object.values(meta.caption || {}),
            ].map((v: any) => String(v).toLowerCase());
            // Auch publicId durchsuchen (oft beschreibend)
            searchIn.push((m.public_id || '').toLowerCase());
            return searchIn.some((text) => text.includes(query));
          });
        }

        // Max 10 zurückgeben, nur relevante Felder
        const limited = results.slice(0, 10).map((m: any) => ({
          secureUrl: m.secure_url,
          publicId: m.public_id,
          width: m.width,
          height: m.height,
          alt: m.meta?.alt,
          title: m.meta?.title,
          caption: m.meta?.caption,
        }));

        return {
          name,
          result: {
            count: limited.length,
            total: allMedia.length,
            media: limited,
          },
        };
      }

      default:
        return { name, result: { error: `Unbekannte Funktion: ${name}` } };
    }
  } catch (err: any) {
    const message = err?.message || 'Unbekannter Fehler';
    console.error(`[AI-Chat Tool] Fehler bei ${name}:`, err);
    return { name, result: { error: message } };
  }
}
