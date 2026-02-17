'use client';

import React, { useCallback } from 'react';
import SortableList, { makeReindexer } from '../../SortableListWrapper';

type CardInput = {
  id: string;
  title: string;
  teaser?: string;
  href?: string;
  openInNewTab?: boolean;
  order?: number;
};

const reindexCards = makeReindexer<CardInput>((it, order) => ({
  ...it,
  order,
}));

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (crypto as any).randomUUID()
    : `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export default function CardsGridInputBlock({
  items,
  onChange,
}: {
  items: CardInput[];
  onChange: (next: CardInput[]) => void;
}) {
  const addCard = useCallback(() => {
    const next: CardInput[] = [
      ...(items ?? []),
      { id: genId(), title: '', teaser: '', href: '', openInNewTab: false },
    ];
    onChange(reindexCards(next));
  }, [items, onChange]);

  const deleteCard = useCallback(
    (_item: CardInput, index: number) => {
      const next = (items ?? []).filter((_, i) => i !== index);
      onChange(reindexCards(next));
    },
    [items, onChange]
  );

  const updateAt = useCallback(
    (index: number, patch: Partial<CardInput>) => {
      const next = (items ?? []).map((it, i) =>
        i === index ? { ...it, ...patch } : it
      );
      onChange(next); // no reindex needed for field edits
    },
    [items, onChange]
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SortableList<CardInput>
        items={items ?? []}
        getId={(it) => it.id}
        onChange={(next) => onChange(reindexCards(next))}
        reindex={reindexCards}
        onDelete={deleteCard}
        className="grid"
        style={{ display: 'grid', gap: 16 }}
        itemStyle={{
          border: '1px solid #e3e3e3',
          borderRadius: 12,
          padding: 16,
          background: '#fff',
        }}
        labels={{ delete: 'Card löschen' }}
        renderItem={(item, index) => (
          <>
            {/* Titel */}
            <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
              <label style={{ fontWeight: 600 }}>Titel</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateAt(index, { title: e.target.value })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #d0d0d0',
                }}
              />
            </div>

            {/* Teaser */}
            <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
              <label style={{ fontWeight: 600 }}>Teaser (optional)</label>
              <textarea
                value={item.teaser ?? ''}
                onChange={(e) => updateAt(index, { teaser: e.target.value })}
                rows={3}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #d0d0d0',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Link */}
            <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
              <label style={{ fontWeight: 600 }}>Link (optional)</label>
              <input
                type="text"
                value={item.href ?? ''}
                onChange={(e) => {
                  const href = e.target.value;
                  // Clear checkbox if href removed
                  updateAt(index, {
                    href,
                    openInNewTab: href ? item.openInNewTab : false,
                  });
                }}
                placeholder="/ziel-oder-https://…"
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #d0d0d0',
                }}
              />
            </div>

            {/* Open in new tab (only if href set) */}
            {item.href?.trim() ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!item.openInNewTab}
                  onChange={(e) =>
                    updateAt(index, { openInNewTab: e.target.checked })
                  }
                />
                In neuem Tab öffnen
              </label>
            ) : null}
          </>
        )}
      />

      <div>
        <button
          type="button"
          onClick={addCard}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #ddd',
            background: '#f5f5f5',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Card hinzufügen
        </button>
      </div>
    </div>
  );
}
