"use client"

import { ColorInput } from "@/components/color-input"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  ALIGN_CONTENT,
  BASIS,
  DIRECTION,
  FONT_SIZE,
  FONT_WEIGHT,
  GAP,
  GAP_X,
  GAP_Y,
  GROW,
  ITEMS,
  JUSTIFY,
  JUSTIFY_SELF,
  PADDING,
  ORDER,
  ROUNDED,
  SELF,
  SHRINK,
  WIDTH,
  WRAP,
  type GapKey,
  type ItemStyle,
} from "@/lib/tailwind"
import type { LayoutKind } from "@/lib/layout-store"

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">{title}</h3>
      {children}
    </section>
  )
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export function OptionSelect<K extends string>({
  value,
  options,
  onChange,
  format = (k) => k,
  label,
}: {
  value: K
  options: readonly K[]
  onChange: (k: K) => void
  format?: (k: K) => string
  label: string
}) {
  return (
    <NativeSelect
      aria-label={label}
      className="w-full"
      value={value}
      onChange={(e) => onChange(e.target.value as K)}
    >
      {options.map((o) => (
        <NativeSelectOption key={o} value={o}>
          {format(o)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

export function ColorPicker({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string
  value: string
  onChange: (token: string) => void
  /** Allows clearing the color to "" (no color). */
  optional?: boolean
}) {
  return (
    <Row label={label}>
      <ColorInput
        value={value}
        onChange={onChange}
        placeholder="None"
        clearable={optional}
        className="w-full min-w-0"
      />
    </Row>
  )
}

export const keys = <T extends object>(o: T) => Object.keys(o) as (keyof T)[]


/** Select over the keys of a Tailwind map; "" means "not set" and is shown as "default". */
function StyleSelect<M extends Record<string, string>>({
  label,
  map,
  value,
  onChange,
}: {
  label: string
  map: M
  value: keyof M | undefined
  onChange: (key: keyof M | undefined) => void
}) {
  return (
    <Row label={label}>
      <OptionSelect<string>
        label={label}
        value={(value as string | undefined) ?? ""}
        options={["", ...keys(map)] as string[]}
        format={(k) => (k === "" ? "default" : map[k])}
        onChange={(k) => onChange(k === "" ? undefined : (k as keyof M))}
      />
    </Row>
  )
}

export function LayoutFields({
  idPrefix,
  kind,
  columns,
  gap,
  onKind,
  onColumns,
  onGap,
}: {
  idPrefix: string
  kind: LayoutKind
  columns: number
  gap: GapKey
  onKind: (kind: LayoutKind) => void
  onColumns: (n: number) => void
  onGap: (gap: GapKey) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label>Type</Label>
        <OptionSelect<LayoutKind>
          label="Layout type"
          value={kind}
          options={["grid", "flex"]}
          format={(k) => (k === "grid" ? "Grid (fixed columns)" : "Flex (any number of children)")}
          onChange={onKind}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Gap</Label>
        <OptionSelect
          label="Gap"
          value={gap}
          options={keys(GAP)}
          format={(k) => GAP[k]}
          onChange={onGap}
        />
      </div>
      {kind === "grid" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-columns`}>Columns</Label>
          <Input
            id={`${idPrefix}-columns`}
            type="number"
            min={1}
            max={12}
            value={columns}
            onChange={(e) => onColumns(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>
      )}
    </div>
  )
}

/** Tailwind-based style inputs for a single component or layout. */
export function StyleFields({
  kind,
  flexContainer = false,
  style,
  onChange,
}: {
  kind: "component" | "layout"
  /** Show the flex container options (for layouts of kind "flex"). */
  flexContainer?: boolean
  style: ItemStyle
  onChange: <K extends keyof ItemStyle>(key: K, value: ItemStyle[K] | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <StyleSelect label="Width" map={WIDTH} value={style.width} onChange={(v) => onChange("width", v)} />
      {kind === "component" ? (
        <StyleSelect label="Alignment" map={JUSTIFY} value={style.justify} onChange={(v) => onChange("justify", v)} />
      ) : (
        <StyleSelect label="Align items" map={ITEMS} value={style.items} onChange={(v) => onChange("items", v)} />
      )}
      {flexContainer && (
        <>
          <StyleSelect label="Direction" map={DIRECTION} value={style.direction} onChange={(v) => onChange("direction", v)} />
          <StyleSelect label="Wrap" map={WRAP} value={style.wrap} onChange={(v) => onChange("wrap", v)} />
          <StyleSelect label="Justify content" map={JUSTIFY} value={style.justify} onChange={(v) => onChange("justify", v)} />
          <StyleSelect label="Align content" map={ALIGN_CONTENT} value={style.alignContent} onChange={(v) => onChange("alignContent", v)} />
          <StyleSelect label="Column gap" map={GAP_X} value={style.gapX} onChange={(v) => onChange("gapX", v)} />
          <StyleSelect label="Row gap" map={GAP_Y} value={style.gapY} onChange={(v) => onChange("gapY", v)} />
        </>
      )}
      <StyleSelect label="Padding" map={PADDING} value={style.padding} onChange={(v) => onChange("padding", v)} />
      <ColorPicker optional label="Background" value={style.background ?? ""} onChange={(v) => onChange("background", v || undefined)} />
      {kind === "component" && (
        <>
          <ColorPicker optional label="Text color" value={style.textColor ?? ""} onChange={(v) => onChange("textColor", v || undefined)} />
          <StyleSelect label="Font size" map={FONT_SIZE} value={style.fontSize} onChange={(v) => onChange("fontSize", v)} />
          <StyleSelect label="Font weight" map={FONT_WEIGHT} value={style.fontWeight} onChange={(v) => onChange("fontWeight", v)} />
        </>
      )}
      <StyleSelect label="Rounded" map={ROUNDED} value={style.rounded} onChange={(v) => onChange("rounded", v)} />

      <div className="mt-2 flex flex-col gap-3 border-t pt-3">
        <h4 className="text-xs font-medium text-neutral-500">When inside a flex layout</h4>
        <StyleSelect label="Grow" map={GROW} value={style.grow} onChange={(v) => onChange("grow", v)} />
        <StyleSelect label="Shrink" map={SHRINK} value={style.shrink} onChange={(v) => onChange("shrink", v)} />
        <StyleSelect label="Basis" map={BASIS} value={style.basis} onChange={(v) => onChange("basis", v)} />
        <StyleSelect label="Align self" map={SELF} value={style.self} onChange={(v) => onChange("self", v)} />
        <StyleSelect label="Justify self" map={JUSTIFY_SELF} value={style.justifySelf} onChange={(v) => onChange("justifySelf", v)} />
        <StyleSelect label="Order" map={ORDER} value={style.order} onChange={(v) => onChange("order", v)} />
      </div>
    </div>
  )
}
