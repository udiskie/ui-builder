"use client"

import { createLocalStore } from "@/lib/local-store"
import type { CellConfig } from "@/lib/arrange"
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
  /** How the children are arranged (stack by default). */
  childrenConfig?: CellConfig
}

export type LayoutKind = "grid" | "flex"

export type Layout = {
  id: number
  /** "grid" (default) has `columns` x `rows` cells; "flex" has one cell holding any number of children. */
  kind?: LayoutKind
  columns: number
  /** Grid rows; absent means 1 (layouts saved before rows existed). Cells are row-major. */
  rows?: number
  /** Tailwind gap key; older saved layouts hold a px number (see `normalizeGap`). */
  gap: GapKey | number
  cells: Item[][]
  /** Arrangement of each cell's contents, aligned with `cells`; null means the default stack. */
  cellConfigs?: (CellConfig | null)[]
  style?: ItemStyle
}

export type Item = UIComponent | Layout

export function isLayout(item: Item): item is Layout {
  return "columns" in item
}

export const layoutRows = (layout: Layout) => layout.rows ?? 1

export function createLayout(
  columns: number,
  gap: GapKey,
  kind: LayoutKind = "grid",
  rows = 1
): Layout {
  if (kind === "flex") {
    return { id: Date.now(), kind, columns: 1, gap, cells: [[]] }
  }
  return {
    id: Date.now(),
    columns,
    ...(rows > 1 && { rows }),
    gap,
    cells: Array.from({ length: columns * rows }, () => []),
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

/**
 * Resizes a grid to `columns` x `rows`. Cells keep their row/column; items of cells that no
 * longer exist merge into the last cell.
 */
function resizeGrid(layout: Layout, columns: number, rows: number) {
  const oldColumns = layout.columns
  const count = columns * rows
  const cells: Item[][] = Array.from({ length: count }, () => [])
  const configs: (CellConfig | null)[] = Array.from({ length: count }, () => null)
  const overflow: Item[] = []
  layout.cells.forEach((items, i) => {
    const r = Math.floor(i / oldColumns)
    const c = i % oldColumns
    if (r < rows && c < columns) {
      cells[r * columns + c] = items
      configs[r * columns + c] = layout.cellConfigs?.[i] ?? null
    } else overflow.push(...items)
  })
  cells[count - 1] = [...cells[count - 1], ...overflow]
  return { columns, rows, cells, cellConfigs: configs.some(Boolean) ? configs : undefined }
}

/**
 * Applies the edit form to a layout, converting between grid and flex without losing items.
 * `layout.columns`/`rows`/`cells` must describe the same grid.
 */
export function reshapeLayout(
  layout: Layout,
  kind: LayoutKind,
  columns: number,
  gap: GapKey,
  rows = 1
): Layout {
  const current: LayoutKind = layout.kind ?? "grid"
  if (kind === current) {
    return kind === "flex" ? { ...layout, gap } : { ...layout, gap, ...resizeGrid(layout, columns, rows) }
  }
  const all = layout.cells.flat()
  if (kind === "flex") {
    return { ...layout, kind, columns: 1, rows: undefined, gap, cells: [all], cellConfigs: undefined }
  }
  return {
    ...layout,
    kind: "grid",
    columns,
    rows,
    gap,
    cells: [all, ...Array.from({ length: columns * rows - 1 }, () => [] as Item[])],
    cellConfigs: undefined,
  }
}

/** Sets (or clears, with undefined) how one grid cell arranges its contents. */
export function setCellConfig(layouts: Layout[], layoutId: number, cell: number, config?: CellConfig): Layout[] {
  return updateItem(layouts, layoutId, (it) => {
    const layout = it as Layout
    const configs = Array.from({ length: layout.cells.length }, (_, i) => layout.cellConfigs?.[i] ?? null)
    configs[cell] = config ?? null
    return { ...layout, cellConfigs: configs.some(Boolean) ? configs : undefined }
  })
}

/** Sets (or clears) how a container component arranges its children. */
export function setChildrenConfig(layouts: Layout[], componentId: number, config?: CellConfig): Layout[] {
  return updateItem(layouts, componentId, (it) => ({ ...(it as UIComponent), childrenConfig: config }))
}
