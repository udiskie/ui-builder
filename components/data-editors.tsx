"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"

import { IconField } from "@/components/icon-picker"
import { OptionSelect } from "@/components/property-controls"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  dataNumber,
  dataPairs,
  dataPoints,
  dataString,
  dataTable,
  type ComponentData,
  type DataField,
} from "@/lib/catalog-types"

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon-xs" aria-label={label} onClick={onClick}>
      <Trash2Icon />
    </Button>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" className="self-start" onClick={onClick}>
      <PlusIcon />
      {label}
    </Button>
  )
}

function ListEditor({ items, onChange, itemLabel }: { items: string[]; onChange: (v: string[]) => void; itemLabel: string }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            aria-label={`${itemLabel} ${i + 1}`}
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <RemoveButton label={`Remove ${itemLabel} ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddButton label={`Add ${itemLabel.toLowerCase()}`} onClick={() => onChange([...items, `${itemLabel} ${items.length + 1}`])} />
    </div>
  )
}

function PairsEditor({
  pairs,
  onChange,
  a,
  b,
}: {
  pairs: { a: string; b: string }[]
  onChange: (v: { a: string; b: string }[]) => void
  a: string
  b: string
}) {
  const set = (i: number, patch: Partial<{ a: string; b: string }>) =>
    onChange(pairs.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  return (
    <div className="flex flex-col gap-2">
      {pairs.map((p, i) => (
        <div key={i} className="flex items-start gap-1 rounded-md border p-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Input aria-label={`${a} ${i + 1}`} placeholder={a} value={p.a} onChange={(e) => set(i, { a: e.target.value })} />
            <Input aria-label={`${b} ${i + 1}`} placeholder={b} value={p.b} onChange={(e) => set(i, { b: e.target.value })} />
          </div>
          <RemoveButton label={`Remove item ${i + 1}`} onClick={() => onChange(pairs.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddButton label="Add item" onClick={() => onChange([...pairs, { a: `${a} ${pairs.length + 1}`, b: "" }])} />
    </div>
  )
}

function PointsEditor({
  points,
  onChange,
}: {
  points: { label: string; value: number }[]
  onChange: (v: { label: string; value: number }[]) => void
}) {
  const set = (i: number, patch: Partial<{ label: string; value: number }>) =>
    onChange(points.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  return (
    <div className="flex flex-col gap-2">
      {points.map((p, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input aria-label={`Label ${i + 1}`} placeholder="Label" value={p.label} onChange={(e) => set(i, { label: e.target.value })} />
          <Input
            aria-label={`Value ${i + 1}`}
            type="number"
            className="w-28"
            value={p.value}
            onChange={(e) => set(i, { value: Number(e.target.value) || 0 })}
          />
          <RemoveButton label={`Remove point ${i + 1}`} onClick={() => onChange(points.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddButton label="Add point" onClick={() => onChange([...points, { label: `Point ${points.length + 1}`, value: 0 }])} />
    </div>
  )
}

function TableEditor({ table, onChange }: { table: { columns: string[]; rows: string[][] }; onChange: (v: { columns: string[]; rows: string[][] }) => void }) {
  const { columns, rows } = table
  const grid = { gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, minmax(7rem, 1fr)) 1.5rem` }
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <div className="grid min-w-max gap-1" style={grid}>
          {columns.map((c, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <Input
                aria-label={`Column ${i + 1}`}
                className="font-medium"
                value={c}
                onChange={(e) => onChange({ ...table, columns: columns.map((x, j) => (j === i ? e.target.value : x)) })}
              />
              {columns.length > 1 && (
                <RemoveButton
                  label={`Remove column ${i + 1}`}
                  onClick={() =>
                    onChange({
                      columns: columns.filter((_, j) => j !== i),
                      rows: rows.map((r) => r.filter((_, j) => j !== i)),
                    })
                  }
                />
              )}
            </div>
          ))}
          <span />
          {rows.map((r, i) => (
            <div key={i} className="contents">
              {columns.map((_, j) => (
                <Input
                  key={j}
                  aria-label={`Row ${i + 1}, column ${j + 1}`}
                  value={r[j] ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...table,
                      rows: rows.map((row, k) => (k === i ? columns.map((_, c) => (c === j ? e.target.value : (row[c] ?? ""))) : row)),
                    })
                  }
                />
              ))}
              <RemoveButton label={`Remove row ${i + 1}`} onClick={() => onChange({ ...table, rows: rows.filter((_, k) => k !== i) })} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <AddButton label="Add row" onClick={() => onChange({ ...table, rows: [...rows, columns.map(() => "")] })} />
        <AddButton
          label="Add column"
          onClick={() =>
            onChange({ columns: [...columns, `Column ${columns.length + 1}`], rows: rows.map((r) => [...r, ""]) })
          }
        />
      </div>
    </div>
  )
}

/** The editor for one data field, driven by `field.kind`. */
function FieldEditor({ field, data, onChange }: { field: DataField; data: ComponentData; onChange: (v: unknown) => void }) {
  switch (field.kind) {
    case "list":
      return <ListEditor items={rawList(data, field.key)} itemLabel={field.itemLabel ?? "Item"} onChange={onChange} />
    case "pairs":
      return <PairsEditor pairs={dataPairs(data, field.key)} a={field.a} b={field.b} onChange={onChange} />
    case "points":
      return <PointsEditor points={dataPoints(data, field.key)} onChange={onChange} />
    case "table":
      return <TableEditor table={dataTable(data, field.key)} onChange={onChange} />
    case "icon":
      return <IconField value={dataString(data, field.key, "")} onChange={onChange} />
    case "number":
      return (
        <Input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          className="w-32"
          value={dataNumber(data, field.key, 0)}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (e.target.value !== "" && Number.isFinite(n)) onChange(n)
          }}
        />
      )
    case "select":
      return (
        <OptionSelect<string>
          label={field.label}
          value={dataString(data, field.key, field.options[0])}
          options={field.options}
          onChange={onChange}
        />
      )
  }
}

/** Lists keep empty strings while editing (unlike `dataList`, which drops them for rendering). */
function rawList(data: ComponentData, key: string): string[] {
  const v = data[key]
  return Array.isArray(v) ? v.map(String) : []
}

/** All data editors for a component, one labelled block per field. */
export function DataFields({
  fields,
  data,
  onChange,
}: {
  fields: DataField[]
  data: ComponentData
  onChange: (key: string, value: unknown) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-2">
          <Label>{f.label}</Label>
          <FieldEditor field={f} data={data} onChange={(v) => onChange(f.key, v)} />
        </div>
      ))}
    </div>
  )
}
