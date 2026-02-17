'use client';

import React, { FC, ChangeEvent, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { LogsProps, Log } from './Logs.types';
import DateRangePicker, { type PresetKey } from '@/components/content-elements/default/core/inputs/date-range-picker/DateRangePicker';
import { Icon } from '@/components/content-elements/default';

/* ---------- Category labels ---------- */
const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Alle Kategorien' },
  { value: 'page', label: 'Seiten' },
  { value: 'template', label: 'Templates' },
  { value: 'page_element', label: 'Seitenelemente' },
  { value: 'media', label: 'Medien' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'user', label: 'Benutzer' },
  { value: 'invitation', label: 'Einladungen' },
  { value: 'language', label: 'Sprachen' },
  { value: 'seo', label: 'SEO' },
  { value: 'ai', label: 'KI' },
  { value: 'auth', label: 'Anmeldung' },
];

const CATEGORY_LABELS: Record<string, string> = {
  page: 'Seite',
  template: 'Template',
  page_element: 'Seitenelement',
  seo: 'SEO',
  media: 'Medien',
  user: 'Benutzer',
  workspace: 'Workspace',
  invitation: 'Einladung',
  language: 'Sprachen',
  ai: 'KI',
  auth: 'Anmeldung',
};

/* ---------- Role-based date presets ---------- */
const ADMIN_PRESETS: PresetKey[] = [
  'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month',
];

const SUPERADMIN_PRESETS: PresetKey[] = [
  'today', 'yesterday', 'this_week', 'last_week',
  'this_month', 'last_month', 'this_year', 'last_year', 'all_time',
];

const Container = styled.div`
  margin-top: 1rem;
`;

const QuickFilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;

  @container resizable-area (max-width: 660px) {
    flex-wrap: wrap;

    & > input {
      flex: 1 1 100%;
    }
  }
`;

const QuickInput = styled.input`
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 14px;
  box-sizing: border-box;
`;

const FilterIconButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  padding: 0;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const FilterDrawer = styled.div<{ $open: boolean }>`
  overflow: hidden;
  transition: all 0.35s ease;
  max-height: ${(p) => (p.$open ? '600px' : '0')};
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: translateY(${(p) => (p.$open ? '0' : '-8px')});
  margin-bottom: ${(p) => (p.$open ? '20px' : '0')};
`;

const DrawerContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
`;

const FilterFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FilterFieldLabel = styled.label`
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
`;

const FilterFieldInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.875rem;
  min-width: 180px;
`;

const FilterFieldSelect = styled.select`
  appearance: none;
  padding: 6px 36px 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: white;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
  cursor: pointer;
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const DeleteButton = styled.button`
  padding: 6px 14px;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background: #dc3545;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background-color: #f5f5f5;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr<{ $expandable?: boolean }>`
  cursor: ${({ $expandable }) => ($expandable ? 'pointer' : 'default')};

  &:nth-child(even) {
    background-color: #fafafa;
  }

  &:hover {
    background-color: ${({ $expandable }) => ($expandable ? '#f0f0f0' : 'inherit')};
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 8px;
  border-bottom: 2px solid #ccc;
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
`;

const PublicIdCell = styled.code`
  font-size: 0.8rem;
  color: #666;
  background: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
`;

const DetailRow = styled.tr`
  background-color: #f8f9fb;
`;

const DetailCell = styled.td`
  padding: 0 8px 12px 8px;
  border-bottom: 1px solid #e0e0e0;
`;

const DetailList = styled.ul`
  margin: 4px 0 0 0;
  padding-left: 1.5rem;
  font-size: 0.85rem;
  color: #444;
  list-style: none;

  li {
    margin-bottom: 6px;
    line-height: 1.4;
  }
`;

const HtmlPreview = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  max-width: 400px;
  overflow: hidden;
  vertical-align: top;

  p { margin: 0; }
  img { max-width: 100%; height: auto; }
`;

const ChangeArrow = styled.span`
  display: inline-block;
  margin: 0 8px;
  color: #999;
`;

const ExpandIcon = styled.span<{ $open: boolean }>`
  display: inline-block;
  width: 18px;
  font-size: 0.7rem;
  color: #999;
  transition: transform 0.15s ease;
  transform: ${({ $open }) => ($open ? 'rotate(90deg)' : 'rotate(0)')};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;

  select {
    padding: 4px;
  }

  button {
    padding: 4px 8px;
    border: none;
    background: #0070f3;
    color: white;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ResultCount = styled.span`
  font-size: 0.85rem;
  color: #666;
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
`;

/* ---------- Helpers ---------- */

function isHtml(val: string): boolean {
  return /<[a-z][\s\S]*>/i.test(val);
}

function isUrl(val: string): boolean {
  return /^(https?:\/\/|\/[\w])/.test(val.trim());
}

function isImageUrl(val: string): boolean {
  return /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)(\?.*)?$/i.test(val) ||
    /\/image\/upload\//i.test(val);
}

function RenderValue({ value, showThumbnail = true }: { value: string; showThumbnail?: boolean }) {
  if (!value || value === '–') return <span style={{ color: '#999' }}>–</span>;
  if (isHtml(value)) {
    return <HtmlPreview dangerouslySetInnerHTML={{ __html: value }} />;
  }
  if (isUrl(value)) {
    const display = value.length > 60 ? value.slice(0, 57) + '…' : value;

    if (isImageUrl(value) && showThumbnail) {
      return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
          <Image
            src={value}
            alt=""
            width={200}
            height={0}
            style={{
              width: 200,
              height: 'auto',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
            unoptimized
          />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0070f3', wordBreak: 'break-all', fontSize: '0.8rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {display}
          </a>
        </span>
      );
    }

    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#0070f3', wordBreak: 'break-all' }}
        onClick={(e) => e.stopPropagation()}
      >
        {display}
      </a>
    );
  }
  return <span>{value}</span>;
}

function formatDate(raw: string | undefined): string {
  if (!raw) return '–';
  return new Date(raw).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function hasDetails(log: Log): boolean {
  const d = log.details;
  if (!d) return false;
  if (d.changes && d.changes.length > 0) return true;
  if (d.ip) return true;
  return false;
}

/* ---------- Field-path humanizer ---------- */

/**
 * Compound path labels — matched against the SUFFIX of the dot-path.
 * Longest match wins, so "image.src" matches both "image.src" and "foo.image.src".
 * Ordered by segment count (most specific first).
 */
const COMPOUND_LABELS: [string, string][] = [
  // Image fields
  ['image.src', 'Bild-URL'],
  ['image.url', 'Bild-URL'],
  ['image.width', 'Bildbreite'],
  ['image.height', 'Bildhöhe'],
  ['image.alt', 'Bild-Alternativtext'],
  ['image.caption', 'Bildunterschrift'],
  ['image.copyright', 'Bild-Copyright'],
  ['image.title', 'Bild-Titel'],
  ['image.description', 'Bildbeschreibung'],
  // Video fields
  ['video.src', 'Video-URL'],
  ['video.url', 'Video-URL'],
  ['video.width', 'Videobreite'],
  ['video.height', 'Videohöhe'],
  ['video.poster', 'Video-Vorschaubild'],
  // Link / button fields
  ['button.href', 'Button-Link'],
  ['button.label', 'Button-Text'],
  ['button.target', 'Button-Ziel'],
  ['link.href', 'Link-URL'],
  ['link.label', 'Link-Text'],
  ['link.target', 'Link-Ziel'],
  // Layout shorthand
  ['layout.outerWidth', 'Äußere Breite'],
  ['layout.innerWidth', 'Innere Breite'],
  ['layout.innerPaddingLeft', 'Innenabstand links'],
  ['layout.innerPaddingRight', 'Innenabstand rechts'],
  ['layout.innerPaddingTop', 'Innenabstand oben'],
  ['layout.innerPaddingBottom', 'Innenabstand unten'],
  ['layout.background', 'Hintergrundfarbe'],
];

/** Known single-segment labels (case-insensitive lookup) */
const SEGMENT_LABELS: Record<string, string> = {
  // Languages
  de: 'Deutsch',
  en: 'Englisch',
  fr: 'Französisch',
  es: 'Spanisch',
  it: 'Italienisch',
  nl: 'Niederländisch',
  pt: 'Portugiesisch',
  pl: 'Polnisch',
  tr: 'Türkisch',
  ru: 'Russisch',
  ja: 'Japanisch',
  zh: 'Chinesisch',
  ko: 'Koreanisch',
  ar: 'Arabisch',
  // Common field segments
  value: 'Wert',
  src: 'URL',
  alt: 'Alternativtext',
  href: 'Link',
  url: 'URL',
  title: 'Titel',
  description: 'Beschreibung',
  name: 'Name',
  label: 'Label',
  text: 'Text',
  content: 'Inhalt',
  image: 'Bild',
  images: 'Bilder',
  icon: 'Symbol',
  color: 'Farbe',
  visible: 'Sichtbarkeit',
  enabled: 'Aktiviert',
  disabled: 'Deaktiviert',
  width: 'Breite',
  height: 'Höhe',
  size: 'Größe',
  position: 'Position',
  layout: 'Layout',
  padding: 'Innenabstand',
  margin: 'Außenabstand',
  gap: 'Abstand',
  background: 'Hintergrund',
  border: 'Rahmen',
  radius: 'Rundung',
  opacity: 'Transparenz',
  alignment: 'Ausrichtung',
  copyright: 'Copyright',
  type: 'Typ',
  variant: 'Variante',
  style: 'Stil',
  target: 'Ziel',
  placeholder: 'Platzhalter',
  maxwidth: 'Max-Breite',
  minwidth: 'Min-Breite',
  items: 'Elemente',
  caption: 'Bildunterschrift',
  subtitle: 'Untertitel',
  headline: 'Überschrift',
  button: 'Button',
  link: 'Link',
  links: 'Links',
  meta: 'Meta',
  seo: 'SEO',
  slug: 'Slug',
  tags: 'Tags',
  category: 'Kategorie',
  date: 'Datum',
  author: 'Autor',
  email: 'E-Mail',
  phone: 'Telefon',
  address: 'Adresse',
};

/** Convert camelCase / PascalCase to spaced words, e.g. "introContent" → "Intro Content" */
function splitCamelCase(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Transform a raw dot-path like "introContent.value.de"
 * into a human-readable label like "Intro Content · Wert · Deutsch".
 *
 * Compound paths like "image.src" are matched first and produce
 * single labels like "Bild-URL" instead of "Bild · URL".
 */
function humanizeFieldPath(path: string): string {
  // Already humanized (starts with uppercase, no dots)
  if (!path.includes('.') && /^[A-ZÄÖÜ]/.test(path)) return path;

  const lower = path.toLowerCase();

  // 1) Check compound suffix matches (e.g. "foo.image.src" → "Bild-URL")
  //    If the path has a prefix beyond the compound match, humanize that separately.
  for (const [suffix, label] of COMPOUND_LABELS) {
    if (lower === suffix) return label;
    if (lower.endsWith('.' + suffix)) {
      const prefixPath = path.slice(0, path.length - suffix.length - 1);
      const humanPrefix = humanizeSegments(prefixPath);
      return humanPrefix + ' · ' + label;
    }
  }

  // 2) Segment-by-segment translation
  return humanizeSegments(path);
}

/** Translate each dot-segment individually and join with " · " */
function humanizeSegments(path: string): string {
  return path
    .split('.')
    .map((segment) => {
      const lower = segment.toLowerCase();
      if (SEGMENT_LABELS[lower]) return SEGMENT_LABELS[lower];
      if (/^\d+$/.test(segment)) return `#${segment}`;
      return splitCamelCase(segment);
    })
    .join(' · ');
}

/** Check if a change entry involves an image value */
function isImageChange(c: { field: string; from: any; to: any }): boolean {
  return (
    (typeof c.from === 'string' && isImageUrl(c.from)) ||
    (typeof c.to === 'string' && isImageUrl(c.to))
  );
}

const ImageToggle = styled.button`
  background: none;
  border: none;
  color: #0070f3;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 0;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

/** Sub-component for log detail content with image toggle */
function LogDetailContent({
  changes,
  ip,
  city,
  country,
}: {
  changes?: { field: string; from: any; to: any }[];
  ip?: string;
  city?: string;
  country?: string;
}) {
  const [imagesExpanded, setImagesExpanded] = useState(true);

  const hasImages = changes?.some((c) => isImageChange(c)) ?? false;

  return (
    <DetailList>
      {/* Image toggle — only shown when there are image changes */}
      {hasImages && (
        <li style={{ listStyle: 'none', marginLeft: '-1.5rem', marginBottom: 4 }}>
          <ImageToggle onClick={(e) => { e.stopPropagation(); setImagesExpanded((v) => !v); }}>
            {imagesExpanded ? '▼' : '▶'}{' '}
            {imagesExpanded ? 'Bilder einklappen' : 'Bilder aufklappen'}
          </ImageToggle>
        </li>
      )}

      {/* All changes — URLs always visible, thumbnails toggled */}
      {changes?.map((c, i) => (
        <li key={i}>
          <strong>{humanizeFieldPath(c.field)}</strong>:{' '}
          <RenderValue value={c.from} showThumbnail={imagesExpanded} />
          <ChangeArrow>→</ChangeArrow>
          <RenderValue value={c.to} showThumbnail={imagesExpanded} />
        </li>
      ))}

      {/* IP info */}
      {ip && (
        <li>
          <strong>IP</strong>: {ip}
          {city || country
            ? ` (${[city, country].filter(Boolean).join(', ')})`
            : ''}
        </li>
      )}
    </DetailList>
  );
}

/* ---------- Component ---------- */
const Logs: FC<LogsProps> = ({ logs, userRole, workspaceId }) => {
  const isSuperAdmin = userRole === 'superadmin';

  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [personQuery, setPersonQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [localLogs, setLocalLogs] = useState<Log[] | null>(logs);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Use localLogs to allow optimistic removal after delete
  const activeLogs = localLogs ?? [];

  // Apply filters
  const filteredLogs = useMemo(() => {
    let result = activeLogs;

    if (categoryFilter) {
      result = result.filter((log) => log.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((log) => {
        const desc = (log.description ?? log.activity ?? '').toLowerCase();
        const user = (log.userName ?? log.userEmail ?? log.email ?? '').toLowerCase();
        const code = (log.code ?? '').toLowerCase();
        const pid = (log.publicId ?? '').toLowerCase();
        return desc.includes(q) || user.includes(q) || code.includes(q) || pid.includes(q);
      });
    }

    if (personQuery.trim()) {
      const pq = personQuery.trim().toLowerCase();
      result = result.filter((log) => {
        const name = (log.userName ?? '').toLowerCase();
        const email = (log.userEmail ?? log.email ?? '').toLowerCase();
        return name.includes(pq) || email.includes(pq);
      });
    }

    if (dateRange.start) {
      const from = new Date(dateRange.start);
      from.setHours(0, 0, 0, 0);
      result = result.filter((log) => {
        const d = new Date(log.createdAt ?? log.timestamp ?? 0);
        return d >= from;
      });
    }
    if (dateRange.end) {
      const to = new Date(dateRange.end);
      to.setHours(23, 59, 59, 999);
      result = result.filter((log) => {
        const d = new Date(log.createdAt ?? log.timestamp ?? 0);
        return d <= to;
      });
    }

    return result;
  }, [activeLogs, categoryFilter, searchQuery, personQuery, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));

  const pagedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /* ---- Selection handlers ---- */
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const pageIds = pagedLogs.map((l) => l._id).filter(Boolean) as string[];
    setSelectedIds((prev) => {
      const allSelected = pageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [pagedLogs]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const confirmed = window.confirm(
      `${selectedIds.size} Log${selectedIds.size > 1 ? 's' : ''} wirklich löschen?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/logs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logIds: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Fehler beim Löschen');
        return;
      }

      // Optimistic removal
      setLocalLogs((prev) =>
        prev ? prev.filter((l) => !selectedIds.has(l._id ?? '')) : prev
      );
      setSelectedIds(new Set());
      setExpandedRows(new Set());
    } catch (err) {
      console.error('Delete error', err);
      alert('Fehler beim Löschen der Logs');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, workspaceId]);

  /* ---- Other handlers ---- */
  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setPage(0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handlePersonChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPersonQuery(e.target.value);
    setPage(0);
  };

  const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
    setDateRange(range);
    setPage(0);
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () =>
    setPage((prev) => Math.min(prev + 1, totalPages - 1));

  const toggleRow = (globalIndex: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(globalIndex)) next.delete(globalIndex);
      else next.add(globalIndex);
      return next;
    });
  };

  const pageIds = pagedLogs.map((l) => l._id).filter(Boolean) as string[];
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  // Column count for colSpan
  const colCount = isSuperAdmin ? 8 : 7;

  return (
    <Container>
      {/* Quick search bar + filter button */}
      <QuickFilterBar>
        <QuickInput
          placeholder="Code, ID, Beschreibung…"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FilterIconButton
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-label="Filter öffnen"
        >
          {(categoryFilter || personQuery || dateRange.start || dateRange.end) ? (
            <Icon name="TbFilterCheck" size={24} />
          ) : (
            <Icon name="TbFilter" size={24} />
          )}
        </FilterIconButton>
      </QuickFilterBar>

      {/* Collapsible filter drawer */}
      <FilterDrawer $open={filtersOpen}>
        <DrawerContent>
          <FilterFieldGroup>
            <FilterFieldLabel htmlFor="logs-person-filter">Person / E-Mail</FilterFieldLabel>
            <FilterFieldInput
              id="logs-person-filter"
              type="text"
              placeholder="Name oder E-Mail…"
              value={personQuery}
              onChange={handlePersonChange}
              style={{ minWidth: 160 }}
            />
          </FilterFieldGroup>

          <FilterFieldGroup>
            <FilterFieldLabel htmlFor="logs-category-filter">Kategorie</FilterFieldLabel>
            <FilterFieldSelect
              id="logs-category-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              aria-label="Kategorie filtern"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </FilterFieldSelect>
          </FilterFieldGroup>

          <FilterFieldGroup>
            <FilterFieldLabel>Zeitraum</FilterFieldLabel>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Zeitraum wählen"
              presets={isSuperAdmin ? SUPERADMIN_PRESETS : ADMIN_PRESETS}
            />
          </FilterFieldGroup>
        </DrawerContent>
      </FilterDrawer>

      {/* Action bar: result count + delete */}
      <ActionBar>
        <ResultCount>
          {filteredLogs.length}{' '}
          {filteredLogs.length === 1 ? 'Eintrag' : 'Einträge'}
          {selectedIds.size > 0 && ` · ${selectedIds.size} ausgewählt`}
        </ResultCount>

        {isSuperAdmin && selectedIds.size > 0 && (
          <DeleteButton onClick={handleDelete} disabled={isDeleting}>
            {isDeleting
              ? 'Lösche…'
              : `${selectedIds.size} Log${selectedIds.size > 1 ? 's' : ''} löschen`}
          </DeleteButton>
        )}
      </ActionBar>

      <StyledTable>
        <Thead>
          <Tr>
            {isSuperAdmin && (
              <Th style={{ width: 36 }}>
                <Checkbox
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  title="Alle auf dieser Seite auswählen"
                />
              </Th>
            )}
            <Th style={{ width: 30 }}></Th>
            <Th>ID</Th>
            <Th>Code</Th>
            <Th>Datum</Th>
            <Th>Beschreibung</Th>
            <Th>Kategorie</Th>
            <Th>Benutzer</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pagedLogs.length > 0 ? (
            pagedLogs.map((log, rowIndex) => {
              const globalIndex = page * rowsPerPage + rowIndex;
              const expandable = hasDetails(log);
              const isOpen = expandedRows.has(globalIndex);
              const logId = log._id ?? '';

              return (
                <React.Fragment key={globalIndex}>
                  <Tr
                    $expandable={expandable}
                    onClick={() => expandable && toggleRow(globalIndex)}
                  >
                    {isSuperAdmin && (
                      <Td
                        style={{ width: 36, textAlign: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          type="checkbox"
                          checked={selectedIds.has(logId)}
                          onChange={() => toggleSelect(logId)}
                        />
                      </Td>
                    )}
                    <Td style={{ width: 30, textAlign: 'center' }}>
                      {expandable && <ExpandIcon $open={isOpen}>▶</ExpandIcon>}
                    </Td>
                    <Td>
                      {log.publicId ? (
                        <PublicIdCell>{log.publicId}</PublicIdCell>
                      ) : '–'}
                    </Td>
                    <Td>{log.code ?? '–'}</Td>
                    <Td>{formatDate(log.createdAt ?? log.timestamp)}</Td>
                    <Td style={{ whiteSpace: 'normal' }}>
                      {log.description ?? log.activity ?? '–'}
                    </Td>
                    <Td>
                      {log.category
                        ? CATEGORY_LABELS[log.category] ?? log.category
                        : '–'}
                    </Td>
                    <Td>
                      {log.userName ?? log.userEmail ?? log.email ?? '–'}
                    </Td>
                  </Tr>
                  {isOpen && (
                    <DetailRow>
                      <DetailCell colSpan={colCount}>
                        <LogDetailContent changes={log.details?.changes} ip={log.details?.ip} city={log.details?.city} country={log.details?.country} />
                      </DetailCell>
                    </DetailRow>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <Tr>
              <Td colSpan={colCount} style={{ textAlign: 'center' }}>
                Keine Daten verfügbar
              </Td>
            </Tr>
          )}
        </Tbody>
      </StyledTable>

      {filteredLogs.length > rowsPerPage && (
        <PaginationControls>
          <span>Einträge pro Seite:</span>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange} aria-label="Einträge pro Seite">
            {[10, 20, 50, filteredLogs.length].map((n) => (
              <option key={n} value={n}>
                {n === filteredLogs.length ? 'Alle' : n}
              </option>
            ))}
          </select>

          <button onClick={handlePrevPage} disabled={page === 0}>
            ◀
          </button>
          <span>
            Seite {page + 1} von {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages - 1}
          >
            ▶
          </button>
        </PaginationControls>
      )}
    </Container>
  );
};

export default Logs;
