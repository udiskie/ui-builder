import { CATALOG, CATALOG_BY_TYPE } from "@/lib/catalog"
import { FONT_NAME, fontStylesheetUrl } from "@/lib/google-fonts"
import { ICON_PACK_KEYS } from "@/lib/icon-packs"
import {
  isLayout,
  type Item,
  type Layout,
  type LayoutKind,
  type UIComponent,
} from "@/lib/layout-store"
import {
  ALIGN_CONTENT,
  BASIS,
  COLOR_TOKENS,
  DEFAULT_GLOBALS,
  DIRECTION,
  FONT,
  FONT_SIZE,
  FONT_WEIGHT,
  GAP,
  GAP_X,
  GAP_Y,
  GROW,
  ITEMS,
  JUSTIFY,
  JUSTIFY_SELF,
  MAX_WIDTH,
  ORDER,
  PADDING,
  ROUNDED,
  SELF,
  SHRINK,
  TEXT_ALIGN,
  THEME,
  WIDTH,
  WRAP,
  containerClasses,
  gapClass,
  normalizeGap,
  pageClasses,
  styleClasses,
  type GlobalProps,
  type ItemStyle,
} from "@/lib/tailwind"

export const DESIGN_FORMAT = "ui-builder"
export const DESIGN_VERSION = 2

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

/** Allowed values for every style key; anything else is dropped on import. */
const STYLE_OPTIONS: Record<keyof ItemStyle, readonly string[]> = {
  width: Object.keys(WIDTH),
  justify: Object.keys(JUSTIFY),
  items: Object.keys(ITEMS),
  padding: Object.keys(PADDING),
  background: COLOR_TOKENS,
  textColor: COLOR_TOKENS,
  fontSize: Object.keys(FONT_SIZE),
  fontWeight: Object.keys(FONT_WEIGHT),
  rounded: Object.keys(ROUNDED),
  direction: Object.keys(DIRECTION),
  wrap: Object.keys(WRAP),
  alignContent: Object.keys(ALIGN_CONTENT),
  gapX: Object.keys(GAP_X),
  gapY: Object.keys(GAP_Y),
  grow: Object.keys(GROW),
  shrink: Object.keys(SHRINK),
  basis: Object.keys(BASIS),
  self: Object.keys(SELF),
  justifySelf: Object.keys(JUSTIFY_SELF),
  order: Object.keys(ORDER),
}

/** Options for the globals that are picked from a fixed list. */
const GLOBAL_OPTIONS: Record<Exclude<keyof GlobalProps, "headingFont" | "bodyFont">, readonly string[]> = {
  background: COLOR_TOKENS,
  textColor: COLOR_TOKENS,
  theme: Object.keys(THEME),
  padding: Object.keys(PADDING),
  gap: Object.keys(GAP),
  maxWidth: Object.keys(MAX_WIDTH),
  font: Object.keys(FONT),
  fontSize: Object.keys(FONT_SIZE),
  textAlign: Object.keys(TEXT_ALIGN),
  iconLibrary: ICON_PACK_KEYS,
}

// ---------------------------------------------------------------- names

const pascal = (slug: string) =>
  slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("")

/** Catalog type -> node `component` name, e.g. "alert-dialog" -> "AlertDialog". */
const componentName = (type: string) => pascal(type)

const TYPE_BY_COMPONENT = new Map(CATALOG.map((c) => [componentName(c.type), c.type]))

/** Node names that are structural rather than catalog components. */
const GRID = "Grid"
const FLEX = "Flex"
const COLUMN = "Column"

// ---------------------------------------------------------------- export

const FIRST = ["format", "version", "id", "component", "props"]
const LAST = ["children", "layouts"]

/** JSON with a fixed key order and 2-space indent, so the same design always yields the same text. */
function stableStringify(value: Json): string {
  const rank = (k: string) => (FIRST.includes(k) ? FIRST.indexOf(k) - 100 : LAST.includes(k) ? 100 : 0)
  const sort = (v: Json): Json =>
    Array.isArray(v)
      ? v.map(sort)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
              .map((k) => [k, sort(v[k])])
          )
        : v
  return JSON.stringify(sort(value), null, 2) + "\n"
}

type Node = { id: string; component: string; props: { [key: string]: Json } }

function exportItem(item: Item, nextId: () => string): Node {
  const id = nextId()
  if (isLayout(item)) {
    const kind: LayoutKind = item.kind ?? "grid"
    const gap = normalizeGap(item.gap)
    const props: Node["props"] = {
      gap,
      className: [kind === "flex" ? "flex" : "grid", GAP[gap], styleClasses(item.style)]
        .filter(Boolean)
        .join(" "),
    }
    if (item.style) props.style = item.style as Json
    if (kind === "flex") {
      props.children = (item.cells[0] ?? []).map((c) => exportItem(c, nextId))
      return { id, component: FLEX, props }
    }
    props.columns = item.columns
    props.children = item.cells.map((cell) => ({
      id: nextId(),
      component: COLUMN,
      props: { children: cell.map((c) => exportItem(c, nextId)) },
    }))
    return { id, component: GRID, props }
  }

  const entry = CATALOG_BY_TYPE.get(item.type)
  const props: Node["props"] = {}
  if (item.text) props.text = item.text
  // Effective data (defaults merged in), so the file says exactly what is rendered.
  Object.assign(props, entry?.defaults, item.data)
  // An unset icon is noise: leave `icon` and `iconPosition` out entirely.
  if (props.icon === "") {
    delete props.icon
    delete props.iconPosition
  }
  const classes = styleClasses(item.style)
  if (classes) props.className = classes
  if (item.style) props.style = item.style as Json
  if (item.children?.length) props.children = item.children.map((c) => exportItem(c, nextId))
  return { id, component: componentName(item.type), props }
}

/**
 * Serializes the design as a tree of `{ id, component, props }` nodes. Ids are renumbered in
 * document order and key order is fixed, so output depends only on the design. `className`
 * and `derived` hold computed Tailwind classes for readers (e.g. an LLM); they are ignored on
 * import.
 */
export function exportDesign(layouts: Layout[], globals: GlobalProps): string {
  let n = 0
  const nextId = () => `n${++n}`
  return stableStringify({
    format: DESIGN_FORMAT,
    version: DESIGN_VERSION,
    globals: globals as unknown as Json,
    derived: {
      pageClasses: pageClasses(globals),
      containerClasses: containerClasses(globals),
      layoutGapClass: gapClass(globals),
      fontStylesheets: [globals.headingFont, globals.bodyFont]
        .filter((f, i, all) => f && all.indexOf(f) === i)
        .map(fontStylesheetUrl),
    },
    layouts: layouts.map((l) => exportItem(l, nextId)) as unknown as Json,
  })
}

// ---------------------------------------------------------------- import

export type ParsedDesign = {
  layouts: Layout[]
  globals: GlobalProps
  /** Non-fatal problems, e.g. style values that aren't Tailwind options and were dropped. */
  warnings: string[]
}

export type ParseResult = ({ ok: true } & ParsedDesign) | { ok: false; error: string }

class DesignError extends Error {}

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v)

function sanitizeStyle(raw: unknown, path: string, warnings: string[]): ItemStyle | undefined {
  if (raw === undefined) return undefined
  if (!isObject(raw)) throw new DesignError(`${path}.props.style must be an object`)
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    const allowed = (STYLE_OPTIONS as Record<string, readonly string[]>)[key]
    if (!allowed) warnings.push(`${path}.props.style.${key}: unknown property ignored`)
    else if (typeof value !== "string" || !allowed.includes(value)) {
      warnings.push(`${path}.props.style.${key}: "${String(value)}" is not an option, ignored`)
    } else out[key] = value
  }
  return Object.keys(out).length ? (out as ItemStyle) : undefined
}

/** Reads and validates `{ id?, component, props? }`; returns the parts the caller needs. */
function readNode(raw: unknown, path: string) {
  if (!isObject(raw)) throw new DesignError(`${path} must be an object`)
  if (typeof raw.component !== "string") throw new DesignError(`${path}.component must be a string`)
  if (raw.props !== undefined && !isObject(raw.props)) throw new DesignError(`${path}.props must be an object`)
  return { component: raw.component, props: (raw.props ?? {}) as Record<string, unknown> }
}

function readChildren(props: Record<string, unknown>, path: string): unknown[] {
  if (props.children === undefined) return []
  if (!Array.isArray(props.children)) throw new DesignError(`${path}.props.children must be an array`)
  return props.children
}

function parseItem(raw: unknown, path: string, nextId: () => number, warnings: string[]): Item {
  const { component, props } = readNode(raw, path)

  if (component === GRID || component === FLEX) {
    const id = nextId()
    const style = sanitizeStyle(props.style, path, warnings)
    const gap = normalizeGap(typeof props.gap === "string" || typeof props.gap === "number" ? (props.gap as never) : undefined)
    const children = readChildren(props, path)
    if (component === FLEX) {
      const items = children.map((c, i) => parseItem(c, `${path}.props.children[${i}]`, nextId, warnings))
      return { id, kind: "flex", columns: 1, gap, cells: [items], ...(style && { style }) }
    }
    const columns = props.columns
    if (typeof columns !== "number" || !Number.isInteger(columns) || columns < 1 || columns > 12) {
      throw new DesignError(`${path}.props.columns must be an integer from 1 to 12`)
    }
    if (children.length !== columns) {
      throw new DesignError(`${path}.props.children has ${children.length} ${COLUMN} nodes but columns is ${columns}`)
    }
    const cells = children.map((col, i) => {
      const colPath = `${path}.props.children[${i}]`
      const node = readNode(col, colPath)
      if (node.component !== COLUMN) {
        throw new DesignError(`${colPath}.component must be "${COLUMN}" (children of a ${GRID})`)
      }
      return readChildren(node.props, colPath).map((c, j) =>
        parseItem(c, `${colPath}.props.children[${j}]`, nextId, warnings)
      )
    })
    return { id, columns, gap, cells, ...(style && { style }) }
  }

  if (component === COLUMN) throw new DesignError(`${path}: ${COLUMN} is only valid directly inside a ${GRID}`)
  const type = TYPE_BY_COMPONENT.get(component)
  const entry = type ? CATALOG_BY_TYPE.get(type) : undefined
  if (!type || !entry) throw new DesignError(`${path}.component "${component}" is not a known component`)

  const id = nextId()
  const out: UIComponent = { id, type, text: "" }
  if (props.text !== undefined) {
    if (typeof props.text !== "string") throw new DesignError(`${path}.props.text must be a string`)
    out.text = props.text
  }
  const style = sanitizeStyle(props.style, path, warnings)
  if (style) out.style = style
  const children = readChildren(props, path)
  if (children.length) {
    out.children = children.map((c, i) => parseItem(c, `${path}.props.children[${i}]`, nextId, warnings))
  }
  // Remaining props are the component's data; only keys its editors know about are kept.
  const dataKeys = new Set(entry.fields?.map((f) => f.key))
  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (["text", "style", "children", "className"].includes(key)) continue
    if (dataKeys.has(key)) data[key] = value
    else warnings.push(`${path}.props.${key}: not a property of ${component}, ignored`)
  }
  if (Object.keys(data).length) out.data = data
  return out
}

function parseGlobals(raw: unknown, warnings: string[]): GlobalProps {
  const out: Record<string, string> = { ...DEFAULT_GLOBALS }
  if (raw === undefined) return out as unknown as GlobalProps
  if (!isObject(raw)) throw new DesignError("globals must be an object")
  for (const [key, value] of Object.entries(raw)) {
    if (key === "headingFont" || key === "bodyFont") {
      if (value === "" || (typeof value === "string" && FONT_NAME.test(value))) out[key] = value
      else warnings.push(`globals.${key}: "${String(value)}" is not a Google Fonts family name, ignored`)
      continue
    }
    const allowed = (GLOBAL_OPTIONS as Record<string, readonly string[]>)[key]
    if (!allowed) warnings.push(`globals.${key}: unknown property ignored`)
    else if (typeof value !== "string" || !allowed.includes(value)) {
      warnings.push(`globals.${key}: "${String(value)}" is not an option, using the default`)
    } else out[key] = value
  }
  return out as unknown as GlobalProps
}

/** Validates a design file. Never throws; problems come back as `{ ok: false, error }`. */
export function parseDesign(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (e) {
    return { ok: false, error: `Not valid JSON: ${(e as Error).message}` }
  }
  try {
    if (!isObject(raw) || raw.format !== DESIGN_FORMAT) {
      throw new DesignError(`Not a ${DESIGN_FORMAT} design file (missing "format": "${DESIGN_FORMAT}")`)
    }
    if (raw.version !== DESIGN_VERSION) {
      throw new DesignError(`Unsupported version ${String(raw.version)} (expected ${DESIGN_VERSION})`)
    }
    if (!Array.isArray(raw.layouts)) throw new DesignError("layouts must be an array")
    const warnings: string[] = []
    // Fresh unique ids that sort after any id generated later by Date.now().
    let n = Date.now()
    const nextId = () => n++
    const globals = parseGlobals(raw.globals, warnings)
    const layouts = raw.layouts.map((l, i) => {
      const item = parseItem(l, `layouts[${i}]`, nextId, warnings)
      if (!isLayout(item)) throw new DesignError(`layouts[${i}] must be a ${GRID} or ${FLEX}, not a component`)
      return item
    })
    return { ok: true, layouts, globals, warnings }
  } catch (e) {
    if (e instanceof DesignError) return { ok: false, error: e.message }
    throw e
  }
}
