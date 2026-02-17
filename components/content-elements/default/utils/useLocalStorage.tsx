'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getClientCookie, setClientCookie } from './cookies';

type StorageType = 'local' | 'session' | 'cookie';

function getStorage(type: StorageType) {
  if (typeof window === 'undefined' || type === 'cookie') return null;
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

/**
 * SSR-safe storage hook supporting localStorage, sessionStorage, and cookies.
 * Synchronizes state across different instances of the same component and across tabs.
 */
export function useClientStorage<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'local'
) {
  const isClient = typeof window !== 'undefined';
  const storage = useMemo(() => getStorage(storageType), [storageType]);
  
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const didInit = useRef(false);
  const skipNextWrite = useRef(false);
  const componentId = useMemo(() => Math.random().toString(36), []);

  const loadFromStorage = useCallback(() => {
    try {
      let raw: string | null = null;
      if (storageType === 'cookie') {
        raw = getClientCookie(key);
        if (raw) {
          try {
            raw = decodeURIComponent(raw);
          } catch (e) {
            console.warn(`Failed to decode cookie value for key "${key}":`, e);
            // Fallback to raw if decoding fails
          }
        }
      } else {
        raw = storage?.getItem(key) ?? null;
      }

      if (raw !== null && raw !== '') {
        const parsed = JSON.parse(raw) as T;
        // Don't re-save what we just loaded
        skipNextWrite.current = true;
        setStoredValue(parsed);
        setTimeout(() => { skipNextWrite.current = false; }, 100);
      }
    } catch (err) {
      console.error(`Error loading storage key "${key}":`, err);
    }
  }, [key, storage, storageType]);

  // Initial Load
  useEffect(() => {
    if (!isClient || didInit.current) return;
    
    loadFromStorage();
    didInit.current = true;
    
    // Sync when tab gets focus again
    window.addEventListener('focus', loadFromStorage);
    return () => window.removeEventListener('focus', loadFromStorage);
  }, [isClient, loadFromStorage]);

  // Sync to Storage
  useEffect(() => {
    if (!isClient || !didInit.current || skipNextWrite.current) return;

    try {
      const jsonValue = JSON.stringify(storedValue);
      
      if (storageType === 'cookie') {
        setClientCookie(key, jsonValue);
      } else {
        storage?.setItem(key, jsonValue);
      }
      
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('page-dock-storage-change', {
        detail: { key, newValue: jsonValue, componentId }
      }));
    } catch (err) {
      console.error(`Error saving storage key "${key}":`, err);
    }
  }, [key, storage, storageType, storedValue, isClient, componentId]);

  // Listen for changes from other components/tabs
  useEffect(() => {
    if (!isClient) return;
    
    const handleStorageChange = (e: any) => {
      // Handle our custom events (same tab)
      if (e instanceof CustomEvent && e.type === 'page-dock-storage-change') {
        if (e.detail?.key === key && e.detail?.componentId !== componentId) {
          try {
            const parsed = JSON.parse(e.detail.newValue) as T;
            skipNextWrite.current = true;
            setStoredValue(parsed);
            setTimeout(() => { skipNextWrite.current = false; }, 100);
          } catch {}
        }
      }
      
      // Handle native storage events (other tabs, non-cookie)
      if (e instanceof StorageEvent && e.key === key && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue) as T;
          skipNextWrite.current = true;
          setStoredValue(parsed);
          setTimeout(() => { skipNextWrite.current = false; }, 100);
        } catch {}
      }
    };

    window.addEventListener('page-dock-storage-change', handleStorageChange as EventListener);
    if (storageType !== 'cookie') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      window.removeEventListener('page-dock-storage-change', handleStorageChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient, key, componentId, storageType]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (!isClient) return;
      setStoredValue(value);
    },
    [isClient]
  );

  const removeValue = useCallback(() => {
    if (!isClient) return;
    try {
      if (storageType === 'cookie') {
        setClientCookie(key, '', -1);
      } else {
        storage?.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch {}
  }, [isClient, key, storage, storageType, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
