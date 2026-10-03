/**
 * Everything the editor lets you style comes from Tailwind's own scales.
 * Class names are written out in full (or covered by the `@source inline`
 * in globals.css for colors) so Tailwind generates them.
 */

export const COLOR_FAMILIES = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber",
  "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
] as const

export const COLOR_SHADES = [
  "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950",
] as const

/** A Tailwind color token, e.g. "white", "black" or "blue-500". */
export type ColorToken = string

export const COLOR_TOKENS: ColorToken[] = [
  "white",
  "black",
  ...COLOR_FAMILIES.flatMap((f) => COLOR_SHADES.map((s) => `${f}-${s}`)),
]

export function parseColor(token: ColorToken) {
  const [family, shade] = token.split("-")
  return { family, shade: shade ?? "" }
}

/** "none" gives "", meaning "no color set". */
export function joinColor(family: string, shade: string): ColorToken {
  if (family === "none") return ""
  return family === "white" || family === "black" ? family : `${family}-${shade || "500"}`
}

export const PADDING = {
  "0": "p-0", "2": "p-2", "4": "p-4", "6": "p-6", "8": "p-8",
  "10": "p-10", "12": "p-12", "16": "p-16", "24": "p-24",
} as const

export const GAP = {
  "0": "gap-0", "2": "gap-2", "3": "gap-3", "4": "gap-4", "6": "gap-6",
  "8": "gap-8", "10": "gap-10", "12": "gap-12", "16": "gap-16",
} as const

export const MAX_WIDTH = {
  none: "max-w-none", sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg",
  xl: "max-w-xl", "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl",
  "5xl": "max-w-5xl", "6xl": "max-w-6xl", "7xl": "max-w-7xl",
} as const

export const FONT = {
  sans: "font-sans", serif: "font-serif", mono: "font-mono",
} as const

export const FONT_SIZE = {
  xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl",
  "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl",
} as const

export const FONT_WEIGHT = {
  normal: "font-normal", medium: "font-medium", semibold: "font-semibold", bold: "font-bold",
} as const

export const WIDTH = {
  auto: "w-auto", fit: "w-fit", full: "w-full", "1/4": "w-1/4", "1/3": "w-1/3",
  "1/2": "w-1/2", "2/3": "w-2/3", "3/4": "w-3/4",
} as const

export const JUSTIFY = {
  start: "justify-start", center: "justify-center", end: "justify-end",
  between: "justify-between", around: "justify-around", evenly: "justify-evenly",
  stretch: "justify-stretch",
} as const

export const ITEMS = {
  start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch",
  baseline: "items-baseline",
} as const

export const DIRECTION = {
  row: "flex-row", "row-reverse": "flex-row-reverse", col: "flex-col", "col-reverse": "flex-col-reverse",
} as const

export const WRAP = {
  nowrap: "flex-nowrap", wrap: "flex-wrap", "wrap-reverse": "flex-wrap-reverse",
} as const

export const ALIGN_CONTENT = {
  start: "content-start", center: "content-center", end: "content-end",
  between: "content-between", around: "content-around", evenly: "content-evenly",
  stretch: "content-stretch", baseline: "content-baseline",
} as const

export const GAP_X = {
  "0": "gap-x-0", "2": "gap-x-2", "3": "gap-x-3", "4": "gap-x-4", "6": "gap-x-6",
  "8": "gap-x-8", "10": "gap-x-10", "12": "gap-x-12", "16": "gap-x-16",
} as const

export const GAP_Y = {
  "0": "gap-y-0", "2": "gap-y-2", "3": "gap-y-3", "4": "gap-y-4", "6": "gap-y-6",
  "8": "gap-y-8", "10": "gap-y-10", "12": "gap-y-12", "16": "gap-y-16",
} as const

export const GROW = { "0": "grow-0", "1": "grow" } as const
export const SHRINK = { "0": "shrink-0", "1": "shrink" } as const

export const BASIS = {
  auto: "basis-auto", "0": "basis-0", full: "basis-full", "1/4": "basis-1/4",
  "1/3": "basis-1/3", "1/2": "basis-1/2", "2/3": "basis-2/3", "3/4": "basis-3/4",
} as const

export const SELF = {
  auto: "self-auto", start: "self-start", center: "self-center", end: "self-end",
  stretch: "self-stretch", baseline: "self-baseline",
} as const

export const ORDER = {
  first: "order-first", "1": "order-1", "2": "order-2", "3": "order-3", "4": "order-4",
  last: "order-last",
} as const

export const ROUNDED = {
  none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg",
  xl: "rounded-xl", full: "rounded-full",
} as const

export type GapKey = keyof typeof GAP

/** Layouts saved before gaps used Tailwind's scale stored px; map those to the nearest key. */
export function normalizeGap(gap: GapKey | number | undefined): GapKey {
  if (typeof gap === "string" && gap in GAP) return gap
  if (typeof gap === "number") {
    const key = String(Math.round(gap / 4))
    if (key in GAP) return key as GapKey
  }
  return "4"
}

/** Optional per-item styling. Every value is a key of one of the Tailwind maps above. */
export type ItemStyle = {
  width?: keyof typeof WIDTH
  justify?: keyof typeof JUSTIFY
  items?: keyof typeof ITEMS
  padding?: keyof typeof PADDING
  background?: ColorToken
  textColor?: ColorToken
  fontSize?: keyof typeof FONT_SIZE
  fontWeight?: keyof typeof FONT_WEIGHT
  rounded?: keyof typeof ROUNDED
  // Flex container options (layouts of kind "flex").
  direction?: keyof typeof DIRECTION
  wrap?: keyof typeof WRAP
  alignContent?: keyof typeof ALIGN_CONTENT
  gapX?: keyof typeof GAP_X
  gapY?: keyof typeof GAP_Y
  // Flex item options (any item inside a flex layout).
  grow?: keyof typeof GROW
  shrink?: keyof typeof SHRINK
  basis?: keyof typeof BASIS
  self?: keyof typeof SELF
  order?: keyof typeof ORDER
}

export function styleClasses(style: ItemStyle | undefined) {
  if (!style) return ""
  return [
    style.width && WIDTH[style.width],
    style.justify && JUSTIFY[style.justify],
    style.items && ITEMS[style.items],
    style.padding && PADDING[style.padding],
    style.background && `bg-${style.background}`,
    style.textColor && `text-${style.textColor}`,
    style.fontSize && FONT_SIZE[style.fontSize],
    style.fontWeight && FONT_WEIGHT[style.fontWeight],
    style.rounded && ROUNDED[style.rounded],
    style.direction && DIRECTION[style.direction],
    style.wrap && WRAP[style.wrap],
    style.alignContent && ALIGN_CONTENT[style.alignContent],
    style.gapX && GAP_X[style.gapX],
    style.gapY && GAP_Y[style.gapY],
    style.grow && GROW[style.grow],
    style.shrink && SHRINK[style.shrink],
    style.basis && BASIS[style.basis],
    style.self && SELF[style.self],
    style.order && ORDER[style.order],
  ]
    .filter(Boolean)
    .join(" ")
}

export const TEXT_ALIGN = {
  left: "text-left", center: "text-center", right: "text-right",
} as const

export const THEME = { light: "", dark: "dark" } as const

export type GlobalProps = {
  background: ColorToken
  textColor: ColorToken
  theme: keyof typeof THEME
  padding: keyof typeof PADDING
  gap: keyof typeof GAP
  maxWidth: keyof typeof MAX_WIDTH
  font: keyof typeof FONT
  fontSize: keyof typeof FONT_SIZE
  textAlign: keyof typeof TEXT_ALIGN
}

export const DEFAULT_GLOBALS: GlobalProps = {
  background: "white",
  textColor: "neutral-900",
  theme: "light",
  padding: "6",
  gap: "6",
  maxWidth: "none",
  font: "sans",
  fontSize: "base",
  textAlign: "left",
}

/** Classes for the page background, text and typography. */
export function pageClasses(g: GlobalProps) {
  return [
    `bg-${g.background}`,
    `text-${g.textColor}`,
    THEME[g.theme],
    FONT[g.font],
    FONT_SIZE[g.fontSize],
    TEXT_ALIGN[g.textAlign],
  ]
    .filter(Boolean)
    .join(" ")
}

/** Classes for the centered content column. */
export function containerClasses(g: GlobalProps) {
  return `${PADDING[g.padding]} ${MAX_WIDTH[g.maxWidth]}`
}

export function gapClass(g: GlobalProps) {
  return GAP[g.gap]
}
