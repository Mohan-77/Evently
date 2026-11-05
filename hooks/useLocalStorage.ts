"use client";

import { useCallback, useSyncExternalStore, type SetStateAction } from "react";

type StorageStore = { value: unknown; loaded: boolean; listeners: Set<() => void> };
const stores = new Map<string, StorageStore>();

function getStore<T>(key: string, initialValue: T) {
  let store = stores.get(key);
  if (!store) {
    store = { value: initialValue, loaded: false, listeners: new Set() };
    stores.set(key, store);
  }
  return store;
}

function loadStore<T>(key: string, store: StorageStore, isValid?: (value: unknown) => value is T) {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (!isValid || isValid(parsed)) store.value = parsed;
    }
  } catch {
    // Keep the safe in-memory value if storage is malformed or unavailable.
  }
  store.loaded = true;
}

function updateStore<T>(key: string, nextValue: T) {
  const store = stores.get(key);
  if (!store) return;
  store.value = nextValue;
  store.loaded = true;
  try {
    window.localStorage.setItem(key, JSON.stringify(nextValue));
  } catch {
    // Keep the update in memory for this session if persistent storage is blocked.
  }
  store.listeners.forEach((notify) => notify());
}

export function useLocalStorage<T>(key: string, initialValue: T, isValid?: (value: unknown) => value is T) {
  const store = getStore<T>(key, initialValue);
  const subscribe = useCallback((listener: () => void) => {
    store.listeners.add(listener);
    if (typeof window !== "undefined" && !store.loaded) {
      loadStore(key, store, isValid);
      store.listeners.forEach((notify) => notify());
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key && event.key !== null) return;
      loadStore(key, store, isValid);
      store.listeners.forEach((notify) => notify());
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      store.listeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isValid, key, store]);
  const getSnapshot = useCallback(() => store.value as T, [store]);
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback((action: SetStateAction<T>) => {
    const previous = store.value as T;
    const nextValue = typeof action === "function" ? (action as (current: T) => T)(previous) : action;
    updateStore(key, nextValue);
  }, [key, store]);

  return [value, setValue] as const;
}
