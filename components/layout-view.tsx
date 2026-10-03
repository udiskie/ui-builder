"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CATALOG_BY_TYPE } from "@/lib/catalog"
import { useGlobals } from "@/lib/globals-store"
import { GAP, gapClass, normalizeGap, styleClasses } from "@/lib/tailwind"
import { cn } from "@/lib/utils"
import { isLayout, type Item, type Layout, type UIComponent } from "@/lib/layout-store"

type ItemActions = {
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
}

function Toolbar({ item, onEdit, onDelete }: ItemActions & { item: Item }) {
  return (
    <div
      className="absolute -top-3 right-0 z-10 hidden gap-0.5 rounded-md border border-neutral-200 bg-white p-0.5 shadow-sm group-hover/item:flex"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Edit"
        onClick={() => onEdit?.(item)}
      >
        <PencilIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Delete"
        onClick={() => onDelete?.(item)}
      >
        <Trash2Icon />
      </Button>
    </div>
  )
}

type ViewProps = {
  editing?: boolean
  /** Called on ctrl+click of a column (parent = layout id) or a container's slot (cell = 0). */
  onCellClick?: (parentId: number, cellIndex: number) => void
} & ItemActions

/** A column of items: components and nested layouts, in order. */
function ItemList({ items, inFlex = false, ...view }: { items: Item[]; inFlex?: boolean } & ViewProps) {
  return items.map((item) =>
    isLayout(item) ? (
      <LayoutBlock key={item.id} layout={item} inFlex={inFlex} {...view} />
    ) : (
      <ComponentBlock key={item.id} component={item} inFlex={inFlex} {...view} />
    )
  )
}

function ComponentBlock({
  component,
  inFlex,
  ...view
}: { component: UIComponent; inFlex: boolean } & ViewProps) {
  const { editing, onCellClick, onEdit, onDelete } = view
  const entry = CATALOG_BY_TYPE.get(component.type)
  const items = component.children ?? []

  let children: React.ReactNode
  if (entry?.container) {
    if (editing) {
      children = (
        <div
          onClick={(e) => {
            if (!(e.ctrlKey || e.metaKey)) return
            e.stopPropagation()
            onCellClick?.(component.id, 0)
          }}
          className="flex min-h-10 w-full min-w-0 flex-col items-start gap-3 rounded-md border border-dashed border-neutral-300 p-2"
        >
          {items.length === 0 && (
            <span className="pointer-events-none text-xs text-neutral-400 select-none">
              ctrl+click to add children
            </span>
          )}
          <ItemList items={items} {...view} />
        </div>
      )
    } else {
      children = items.length ? (
        <div className="flex w-full min-w-0 flex-col items-start gap-3">
          <ItemList items={items} {...view} />
        </div>
      ) : null
    }
  }

  return (
    <div className={cn("group/item relative flex", !inFlex && "w-full", styleClasses(component.style))}>
      {editing && <Toolbar item={component} onEdit={onEdit} onDelete={onDelete} />}
      {entry?.render(component.text, children, { ...entry.defaults, ...component.data }) ?? null}
    </div>
  )
}

function LayoutBlock({
  layout,
  inFlex,
  ...view
}: { layout: Layout; inFlex: boolean } & ViewProps) {
  const { editing, onCellClick, onEdit, onDelete } = view
  const isFlex = layout.kind === "flex"
  const toolbar = editing && <Toolbar item={layout} onEdit={onEdit} onDelete={onDelete} />
  const zone = (cell: number) => ({
    onClick: (e: React.MouseEvent) => {
      if (!editing || !(e.ctrlKey || e.metaKey)) return
      e.stopPropagation()
      onCellClick?.(layout.id, cell)
    },
  })

  if (isFlex) {
    return (
      <div
        {...zone(0)}
        className={cn(
          "group/item relative flex min-w-0",
          !inFlex && "w-full",
          GAP[normalizeGap(layout.gap)],
          editing && "min-h-24 rounded-md border border-dashed border-neutral-300 p-2",
          styleClasses(layout.style)
        )}
      >
        {toolbar}
        <ItemList items={layout.cells[0] ?? []} inFlex {...view} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group/item relative grid",
        !inFlex && "w-full",
        GAP[normalizeGap(layout.gap)],
        styleClasses(layout.style)
      )}
      style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}
    >
      {toolbar}
      {layout.cells.map((items, i) => (
        <div
          key={i}
          {...zone(i)}
          className={cn(
            "flex min-w-0 flex-col items-start gap-3",
            editing && "min-h-24 rounded-md border border-dashed border-neutral-300 p-2"
          )}
        >
          <ItemList items={items} {...view} />
        </div>
      ))}
    </div>
  )
}

export function LayoutView({
  layouts,
  ...view
}: {
  layouts: Layout[]
} & ViewProps) {
  const globals = useGlobals()
  return (
    <div className={cn("flex w-full flex-col", gapClass(globals))}>
      {layouts.map((layout) => (
        <LayoutBlock key={layout.id} layout={layout} inFlex={false} {...view} />
      ))}
    </div>
  )
}
