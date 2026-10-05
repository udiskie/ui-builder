import type { CSSProperties } from "react"

import { GAP, styleClasses, type GapKey, type ItemStyle } from "@/lib/tailwind"
import { cn } from "@/lib/utils"

/**
 * How the contents of a grid cell, or of a container component's children area, are arranged.
 * Without a config they stack vertically (`gap-3`). A config can make them a flex or a grid.
 */
export type CellConfig = {
  kind?: "flex" | "grid"
  /** Grid columns (only for `kind: "grid"`). */
  columns?: number
  gap?: GapKey
  /** Tailwind styles: flex options, padding, background, rounded, … */
  style?: ItemStyle
}

export const DEFAULT_CELL_GAP: GapKey = "3"

/** Classes (and grid template) for an arranged area, and whether its children are flex items. */
export function arrangement(config?: CellConfig): {
  className: string
  style?: CSSProperties
  inFlex: boolean
} {
  const gap = GAP[config?.gap ?? DEFAULT_CELL_GAP]
  const extra = styleClasses(config?.style)
  if (config?.kind === "flex") return { className: cn("flex min-w-0", gap, extra), inFlex: true }
  if (config?.kind === "grid") {
    const columns = Math.min(12, Math.max(1, config.columns ?? 2))
    return {
      className: cn("grid min-w-0", gap, extra),
      style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
      inFlex: false,
    }
  }
  return { className: cn("flex min-w-0 flex-col items-start", gap, extra), inFlex: false }
}

/** Drops unset keys so saved items only carry the styles that were actually chosen. */
export function cleanStyle(style: ItemStyle): ItemStyle | undefined {
  const entries = Object.entries(style).filter(([, v]) => v)
  return entries.length ? (Object.fromEntries(entries) as ItemStyle) : undefined
}
