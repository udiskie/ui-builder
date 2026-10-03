"use client"

import { createLocalStore } from "@/lib/local-store"
import type { GapKey, ItemStyle } from "@/lib/tailwind"

export type ComponentType = string

export type UIComponent = {
  id: number
  type: ComponentType
  text: string
  style?: ItemStyle
  /** Values for the component's data editors (see `fields` in the catalog). */
  data?: Record<string, unknown>
  /** Only used by container components (see `container` in the catalog). */
  children?: Item[]
}

export type LayoutKind = "grid" | "flex"

export type Layout = {
  id: number
  /** "grid" (default) has `columns` fixed columns; "flex" has one cell holding any number of children. */
  kind?: LayoutKind
  columns: number
  /** Tailwind gap key; older saved layouts hold a px number (see `normalizeGap`). */
  gap: GapKey | number
  cells: Item[][]
  style?: ItemStyle
}

export type Item = UIComponent | Layout

export function isLayout(item: Item): item is Layout {
  return "columns" in item
}

export function createLayout(columns: number, gap: GapKey, kind: LayoutKind = "grid"): Layout {
  if (kind === "flex") {
    return { id: Date.now(), kind, columns: 1, gap, cells: [[]] }
  }
  return {
    id: Date.now(),
    columns,
    gap,
    cells: Array.from({ length: columns }, () => []),
  }
}

function mapChildren(it: Item, fn: (items: Item[]) => Item[]): Item {
  if (isLayout(it)) return { ...it, cells: it.cells.map(fn) }
  return it.children ? { ...it, children: fn(it.children) } : it
}

/**
 * Appends an item to a column of the layout (or to the children of the component) with the
 * given id, at any depth. For components `cell` is ignored.
 */
export function addToCell(
  layouts: Layout[],
  parentId: number,
  cell: number,
  item: Item
): Layout[] {
  function add(items: Item[]): Item[] {
    return items.map((it) => {
      if (it.id !== parentId) return mapChildren(it, add)
      if (isLayout(it)) {
        return { ...it, cells: it.cells.map((c, i) => (i === cell ? [...c, item] : c)) }
      }
      return { ...it, children: [...(it.children ?? []), item] }
    })
  }
  return add(layouts) as Layout[]
}

/** Finds the component or layout with the given id, at any depth. */
export function findItem(items: Item[], id: number): Item | undefined {
  for (const it of items) {
    if (it.id === id) return it
    const nested = isLayout(it) ? it.cells.flat() : (it.children ?? [])
    const found = findItem(nested, id)
    if (found) return found
  }
}

const store = createLocalStore<Layout[]>("ui-builder:layouts", [])

export const saveLayouts = store.save
export const useLayouts = store.useValue

function transform(items: Item[], id: number, fn: (item: Item) => Item | null): Item[] {
  return items.flatMap((it) => {
    if (it.id === id) {
      const result = fn(it)
      return result ? [result] : []
    }
    return [mapChildren(it, (items) => transform(items, id, fn))]
  })
}

/** Replaces the component or layout with the given id, at any depth. */
export function updateItem(layouts: Layout[], id: number, fn: (item: Item) => Item): Layout[] {
  return transform(layouts, id, fn) as Layout[]
}

/** Removes the component or layout with the given id, at any depth. */
export function removeItem(layouts: Layout[], id: number): Layout[] {
  return transform(layouts, id, () => null) as Layout[]
}

/** Changes column count and gap; content of dropped columns merges into the last kept one. */
export function resizeLayout(layout: Layout, columns: number, gap: GapKey): Layout {
  const cells =
    columns < layout.cells.length
      ? [
          ...layout.cells.slice(0, columns - 1),
          layout.cells.slice(columns - 1).flat(),
        ]
      : [
          ...layout.cells,
          ...Array.from({ length: columns - layout.cells.length }, () => [] as Item[]),
        ]
  return { ...layout, columns, gap, cells }
}

/** Applies the edit form to a layout, converting between grid and flex without losing children. */
export function reshapeLayout(layout: Layout, kind: LayoutKind, columns: number, gap: GapKey): Layout {
  const current: LayoutKind = layout.kind ?? "grid"
  if (kind === current) {
    return kind === "flex" ? { ...layout, gap } : resizeLayout(layout, columns, gap)
  }
  const all = layout.cells.flat()
  if (kind === "flex") return { ...layout, kind, columns: 1, gap, cells: [all] }
  return {
    ...layout,
    kind: "grid",
    columns,
    gap,
    cells: [all, ...Array.from({ length: columns - 1 }, () => [] as Item[])],
  }
}
