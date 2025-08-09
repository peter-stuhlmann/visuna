'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

type StorageType = 'local' | 'session';

function getStorage(type: StorageType) {
  if (typeof window === 'undefined') return null;
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

/**
 * SSR-sicherer Storage-Hook:
 * - Initialwert nur auf dem Client laden (kein Hydration-Flicker)
 * - Boolean/Number/Object werden automatisch JSON-serialisiert
 * - Mit remove() Eintrag löschen (und State resetten)
 */
export function useClientStorage<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'local'
) {
  const isClient = typeof window !== 'undefined';

  // storage stabilisieren, damit es nicht auf jedem Render neu ist
  const storage = useMemo(() => getStorage(storageType), [storageType]);

  const didInitRef = useRef(false);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (!isClient || didInitRef.current) return;
    didInitRef.current = true;

    try {
      const raw = storage?.getItem(key);
      if (raw == null) {
        setStoredValue(initialValue);
        storage?.setItem(key, JSON.stringify(initialValue));
      } else {
        setStoredValue(JSON.parse(raw) as T);
      }
    } catch {
      setStoredValue(initialValue);
    }
  }, [isClient, initialValue, key, storage]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (!isClient) return;

      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          storage?.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [isClient, key, storage]
  );

  const remove = useCallback(() => {
    if (!isClient) return;
    try {
      storage?.removeItem(key);
    } catch {}
    setStoredValue(initialValue);
  }, [isClient, initialValue, key, storage]);

  return [storedValue, setValue, remove] as const;
}
