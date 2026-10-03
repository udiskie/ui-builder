"use client"

import { useMemo, useSyncExternalStore } from "react"

/**
 * A tiny localStorage-backed store. Writes notify subscribers in this tab,
 * and the `storage` event keeps other tabs (e.g. the preview) in sync.
 */
export function createLocalStore<T>(key: string, fallback: T) {
  const fallbackRaw = JSON.stringify(fallback)
  const listeners = new Set<() => void>()

  function subscribe(listener: () => void) {
    listeners.add(listener)
    window.addEventListener("storage", listener)
    return () => {
      listeners.delete(listener)
      window.removeEventListener("storage", listener)
    }
  }

  function getSnapshot() {
    try {
      return localStorage.getItem(key) ?? fallbackRaw
    } catch {
      return fallbackRaw
    }
  }

  function save(value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
    listeners.forEach((l) => l())
  }

  function useValue(): T {
    const raw = useSyncExternalStore(subscribe, getSnapshot, () => fallbackRaw)
    return useMemo(() => {
      try {
        return JSON.parse(raw) as T
      } catch {
        return fallback
      }
    }, [raw])
  }

  return { save, useValue }
}
