import { NextRequest, NextResponse } from 'next/server';
import {
  deletePageElementDoc,
  removePageElementRef,
  resequencePageElements,
  updatePageElement,
  fetchPageElements,
} from '@/lib/workspaces/pages/page-elements/page-elements.repo';
import saveLog from '@/components/logs/saveLog';

/**
 * Compute human-readable field-level changes between old and new page element.
 */
function computeChanges(
  oldEl: Record<string, any>,
  newEl: Record<string, any>,
  patch?: Record<string, any>,
  newData?: Record<string, any>
): { field: string; from: any; to: any }[] {
  const changes: { field: string; from: any; to: any }[] = [];

  // Meta fields (name, visible)
  if (patch?.visible !== undefined && oldEl.visible !== patch.visible) {
    changes.push({
      field: 'Sichtbarkeit',
      from: oldEl.visible ? 'live' : 'offline',
      to: patch.visible ? 'live' : 'offline',
    });
  }
  if (patch?.name !== undefined && oldEl.name !== patch.name) {
    changes.push({
      field: 'Name',
      from: oldEl.name ?? '–',
      to: patch.name,
    });
  }

  // Data fields — drill into nested objects to show actual sub-field changes
  if (newData && typeof newData === 'object' && oldEl.data && typeof oldEl.data === 'object') {
    diffObject(oldEl.data, newData, '', changes);
  }

  return changes;
}

/**
 * Recursively diff two objects and push leaf-level changes.
 * prefix is the dot-path so far (e.g. "image" → "image.src").
 */
function diffObject(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
  prefix: string,
  changes: { field: string; from: any; to: any }[]
) {
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Skip if identical
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue;

    // Both are plain objects → recurse
    if (
      oldVal && newVal &&
      typeof oldVal === 'object' && !Array.isArray(oldVal) &&
      typeof newVal === 'object' && !Array.isArray(newVal)
    ) {
      diffObject(oldVal, newVal, path, changes);
      continue;
    }

    // Leaf-level change
    changes.push({
      field: path,
      from: summarizeValue(oldVal),
      to: summarizeValue(newVal),
    });
  }
}

/** Summarize a value for display (truncate long strings, handle objects). */
function summarizeValue(val: any): string {
  if (val === null || val === undefined) return '–';
  if (typeof val === 'boolean') return val ? 'ja' : 'nein';
  if (typeof val === 'string') {
    // Never truncate URLs — they need to stay clickable
    if (/^(https?:\/\/|\/)/.test(val)) return val || '–';
    if (val.length > 120) return val.slice(0, 117) + '…';
    return val || '–';
  }
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return `[${val.length} Einträge]`;
  if (typeof val === 'object') {
    // Small objects: show JSON-like summary
    const entries = Object.entries(val);
    if (entries.length <= 3) {
      return entries.map(([k, v]) => `${k}: ${summarizeValue(v)}`).join(', ');
    }
    return `${entries.length} Felder`;
  }
  return String(val);
}

export const PATCH = async (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      pageId: string;
      pageElementId: string;
    }>;
  }
) => {
  try {
    const { workspaceId, pageId, pageElementId } = await params;
    const body = await req.json();

    const data = body?.data;
    const patch = body?.patch;

    if (!pageElementId || typeof pageElementId !== 'string') {
      return NextResponse.json(
        { message: 'Ungültige pageElementId.' },
        { status: 400 }
      );
    }

    // Fetch old state for diff
    const [oldElement] = await fetchPageElements([pageElementId]);

    const updated = await updatePageElement(pageElementId, data, patch);

    if (!updated) {
      return NextResponse.json(
        { message: 'Seitenelement nicht gefunden.' },
        { status: 404 }
      );
    }

    // Compute detailed changes
    const changes = oldElement
      ? computeChanges(oldElement as any, updated as any, patch, data)
      : [];

    await saveLog({
      workspaceId,
      code: '1204',
      action: 'updated',
      category: 'page_element',
      entityType: 'page_element',
      entityId: pageElementId,
      entityName: (updated as any).name ?? (updated as any).element ?? pageElementId,
      description: `Seitenelement "${(updated as any).name ?? (updated as any).element ?? pageElementId}" aktualisiert.`,
      details: {
        pageId,
        ...(changes.length > 0 ? { changes } : {}),
      },
    });

    return NextResponse.json(
      {
        message: 'Seitenelement aktualisiert.',
        element: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[UPDATE PAGE ELEMENT]', error);

    if (error.message?.includes('must be')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Serverfehler beim Update.' },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      pageId: string;
      pageElementId: string;
    }>;
  }
) => {
  try {
    const { pageElementId } = await params;
    const { pageId } = await req.json();

    if (!pageElementId || typeof pageElementId !== 'string') {
      return NextResponse.json(
        { message: 'Ungültige pageElementId.' },
        { status: 400 }
      );
    }

    if (!pageId || typeof pageId !== 'string') {
      return NextResponse.json({ message: 'pageId fehlt.' }, { status: 400 });
    }

    // 1. Element löschen
    const deleted = await deletePageElementDoc(pageElementId);
    if (!deleted) {
      return NextResponse.json(
        { message: 'Seitenelement nicht gefunden.' },
        { status: 404 }
      );
    }

    // 2. Ref aus Page entfernen
    await removePageElementRef(pageId, pageElementId);

    // 3. Reihenfolge neu berechnen
    await resequencePageElements(pageId);

    return NextResponse.json({
      message: 'Seitenelement gelöscht.',
      pageElementId,
      pageId,
    });
  } catch (error) {
    console.error('[DELETE PAGE ELEMENT]', error);
    return NextResponse.json(
      { message: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
};
