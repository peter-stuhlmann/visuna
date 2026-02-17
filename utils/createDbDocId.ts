// utils/createDbDocId.ts
export function createDbDocId(prefix?: string): string {
  const base = crypto.randomUUID();
  return prefix ? `${prefix}_${base}` : base;
}
