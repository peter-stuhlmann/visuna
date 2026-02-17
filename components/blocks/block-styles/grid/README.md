# Grid-Doku – Flexible Karten-Layouts per Props

Mit den Grid-Komponenten (`GridContainer`, `GridItems`, `BlockGrid`) kannst du schnell flexible, responsive Grids bauen:

- **Spaltenzahl je Breakpoint** (`base`/`sm`/`md`/`lg`)
- **Beliebige Items** (1‑basiert) können pro Breakpoint „**full width**“ laufen
- Alle übrigen Items füllen automatisch je **eine Spalte**

> **Hinweis:** Die Breakpoints nutzen **Container-Queries**, nicht Viewport-Breakpoints. Stelle sicher, dass der umgebende Container als _Containment Context_ fungieren kann.

---

## Breakpoints

| Key    | Beschreibung | Container-Query                  |
| ------ | ------------ | -------------------------------- |
| `base` | < 480px      | –                                |
| `sm`   | ≥ 480px      | `@container (min-width: 480px)`  |
| `md`   | ≥ 768px      | `@container (min-width: 768px)`  |
| `lg`   | ≥ 1024px     | `@container (min-width: 1024px)` |

---

## Props / Typen

```ts
type BP = 'base' | 'sm' | 'md' | 'lg';

type ColumnsConfig = Partial<Record<BP, number>>;
// z. B. { base: 1, sm: 2, md: 3, lg: 4 }

type FullRowsConfig = Partial<Record<BP, number[]>>;
// Indizes (1-basiert!) der Items, die full width laufen sollen

export type GridItemsProps = {
  $cols?: ColumnsConfig; // Standard: base:1 / sm:2 / md:3 / lg:4
  $full?: FullRowsConfig; // Standard: keine Full-Items
  $gap?: string; // Standard: '0.5rem'
};
```

- **`$cols`** steuert die **Spaltenanzahl** je Breakpoint.
- **`$full`** nimmt **1‑basierte Indizes** der Items an, die pro Breakpoint **volle Breite** (eine ganze Zeile) einnehmen sollen.
- **`$gap`** setzt den **Abstand** zwischen Grid-Items.

---

## Default-Verhalten

- Ohne `$cols`: 1/2/3/4 Spalten (base/sm/md/lg).
- Ohne `$full`: Alle Items sind **span 1** (z. B. bei `lg` je **¼ Breite**).

---

## Beispiele

### A) Karten – durchgehend je 1/4 (Standard)

```tsx
<BlockGrid title="Karte">
  <CardA /> <CardB /> <CardC /> <CardD /> ...
</BlockGrid>
```

### B) Erstes full width, danach je 1/4 – für alle Breakpoints

```tsx
<BlockGrid title="Titel" full={{ base: [1], sm: [1], md: [1], lg: [1] }}>
  <Input1 /> <Input2 /> <Input3 /> <Input4 /> ...
</BlockGrid>

<BlockGrid title="Untertitel" full={{ base: [1], sm: [1], md: [1], lg: [1] }}>
  ...
</BlockGrid>
```

### C) Jedes 1/4 – explizit (entspricht dem Default)

```tsx
<BlockGrid
  title="Nur Viertel"
  cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
  full={{}} // oder weglassen
>
  <Item1 /> <Item2 /> <Item3 /> <Item4 /> ...
</BlockGrid>
```

### D) Erstes 1/4, dann 3/4, dann je 1/4 (bei `lg`)

> Hier soll **Item 2** eine eigene, volle Zeile bekommen → `full={{ lg: [2] }}`

```tsx
<BlockGrid
  title="Custom"
  cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
  full={{ lg: [2] }}
>
  <Item1 /> {/* 1/4 */}
  <Item2 /> {/* 4/4 (volle Breite) */}
  <Item3 /> {/* 1/4 */}
  <Item4 /> {/* 1/4 */}
  <Item5 /> {/* 1/4 */}
</BlockGrid>
```

### E) 1/4, drittes 4/4 (bei `lg`)

```tsx
<BlockGrid title="Mix" full={{ lg: [3] }}>
  <Item1 /> {/* 1/4 */}
  <Item2 /> {/* 1/4 */}
  <Item3 /> {/* 4/4 */}
  <Item4 /> {/* 1/4 */}
  <Item5 /> {/* 1/4 */}
</BlockGrid>
```

### F) Unterschiedliche Regeln pro Breakpoint

```tsx
<BlockGrid title="Responsive Fulls" full={{ sm: [1], md: [1, 2], lg: [] }}>
  ...
</BlockGrid>
```

### G) Gap anpassen

```tsx
<GridItems $gap="1rem">...</GridItems>
```

---

## Zusammenspiel mit `BlockGrid`

`BlockGrid` ist ein dünner Wrapper um `GridItems` mit Titelzeile. Es reicht die Props weiter:

```tsx
<BlockGrid title="Titel" full={{ lg: [1] }} cols={{ lg: 4 }}>
  <FieldA /> <FieldB /> <FieldC /> <FieldD />
</BlockGrid>
```

---

## Best Practices

- `$full` verwendet **1-basierte** Indizes (wie CSS `:nth-child()`).
- Setze `$full` gezielt dort, wo du volle Reihen brauchst.
- Wenn du `$cols` veränderst, bedenke: „full width“ = `grid-column: 1 / -1`
  (immer ganze Zeile, unabhängig von der Spaltenzahl).
- Container-Queries wirken **innerhalb** des nächstgelegenen _Containment Contexts_.
  Stelle sicher, dass dein Layout dafür vorbereitet ist.

---

## Troubleshooting

- **Item wird nicht full width?** Prüfe den **1‑basierten Index** in `$full`.
- **Spalten greifen nicht?** Dein Container muss _container-query_-fähig sein.
- **Zeilen umbrechen „komisch“?** Prüfe Anzahl und Verteilung deiner Full-Items
  im Verhältnis zur Spaltenzahl und Itemanzahl.
