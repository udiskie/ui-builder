"use client"

import { createLocalStore } from "@/lib/local-store"
import { DEFAULT_GLOBALS, type GlobalProps } from "@/lib/tailwind"

const store = createLocalStore<GlobalProps>("ui-builder:globals", DEFAULT_GLOBALS)

export const saveGlobals = store.save

/** Stored values merged over the defaults, so newly added properties always have a value. */
export function useGlobals(): GlobalProps {
  const stored = store.useValue()
  return { ...DEFAULT_GLOBALS, ...stored }
}
