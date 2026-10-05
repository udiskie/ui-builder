import type { ReactNode } from "react"

/** Per-component data, edited in the properties dialog. Shape is defined by the entry's `fields`. */
export type ComponentData = Record<string, unknown>

/** A row of a "pairs" field, e.g. an accordion item's title and content. */
export type Pair = { a: string; b: string }
/** A point of a "points" field (chart data). */
export type Point = { label: string; value: number }
/** Value of a "table" field. */
export type TableData = { columns: string[]; rows: string[][] }

/** Describes one editable piece of data and which editor to show for it. */
export type DataField = { key: string; label: string } & (
  | { kind: "list"; itemLabel?: string }
  | { kind: "pairs"; a: string; b: string }
  | { kind: "points" }
  | { kind: "table" }
  | { kind: "color" }
  | { kind: "icon"; /** Offers a "No icon" choice; the value is then "". */ optional?: boolean }
  | { kind: "number"; min?: number; max?: number; step?: number }
  | { kind: "select"; options: string[] }
)

export type CatalogEntry = {
  type: string
  label: string
  /** Name of the single editable text field (also used as the component's main label). */
  field: string
  initial: string
  /**
   * `children` is `undefined` when rendering a sample (picker), `null` for an empty container
   * in the preview, otherwise the rendered child items. `data` is `defaults` merged with the
   * values saved on the component.
   */
  render: (text: string, children?: ReactNode, data?: ComponentData) => ReactNode
  /** Whether the component accepts child items. */
  container?: boolean
  /** Data editors shown in the properties dialog. */
  fields?: DataField[]
  /** Starting values for `fields`. */
  defaults?: ComponentData
}

/** Shows `fallback` only for samples; real (possibly empty) children replace it. */
export const slot = (children: ReactNode | undefined, fallback: ReactNode) =>
  children === undefined ? fallback : children

/** Typed accessors; `defaults` guarantee the shape, these just narrow it and tolerate bad data. */
export const dataList = (d: ComponentData | undefined, key: string): string[] => {
  const v = d?.[key]
  return Array.isArray(v) ? v.map(String).filter((s) => s.length > 0) : []
}
export const dataPairs = (d: ComponentData | undefined, key: string): Pair[] => {
  const v = d?.[key]
  return Array.isArray(v) ? (v as Pair[]).map((p) => ({ a: String(p?.a ?? ""), b: String(p?.b ?? "") })) : []
}
export const dataPoints = (d: ComponentData | undefined, key: string): Point[] => {
  const v = d?.[key]
  return Array.isArray(v)
    ? (v as Point[]).map((p) => ({ label: String(p?.label ?? ""), value: Number(p?.value) || 0 }))
    : []
}
export const dataTable = (d: ComponentData | undefined, key: string): TableData => {
  const v = d?.[key] as Partial<TableData> | undefined
  const columns = Array.isArray(v?.columns) ? v.columns.map(String) : []
  const rows = Array.isArray(v?.rows) ? v.rows.map((r) => columns.map((_, i) => String(r?.[i] ?? ""))) : []
  return { columns, rows }
}
export const dataNumber = (d: ComponentData | undefined, key: string, fallback: number): number => {
  const n = Number(d?.[key])
  return Number.isFinite(n) ? n : fallback
}
export const dataString = (d: ComponentData | undefined, key: string, fallback: string): string => {
  const v = d?.[key]
  return typeof v === "string" && v ? v : fallback
}
/** Splits "a, b, c" into trimmed non-empty parts. */
export const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean)

/** Editors added to every component whose text can carry an icon beside it. */
export const ICON_FIELDS: DataField[] = [
  { key: "icon", label: "Icon beside text", kind: "icon", optional: true },
  { key: "iconPosition", label: "Icon position", kind: "select", options: ["left", "right"] },
]

export const ICON_DEFAULTS: ComponentData = { icon: "", iconPosition: "left" }
