"use client"

import { CATALOG_BY_TYPE } from "@/lib/catalog"
import { useGlobals } from "@/lib/globals-store"
import { GAP, gapClass, normalizeGap, styleClasses } from "@/lib/tailwind"
import { cn } from "@/lib/utils"
import { isLayout, type Item, type Layout, type UIComponent } from "@/lib/layout-store"

/*
 * In the editor (`editing`) every interactive region carries data attributes that the canvas
 * reads on secondary click to build its menu:
 *   data-zone="component"  data-id           -> a component
 *   data-zone="layout"     data-id           -> a layout (a flex layout's whole area)
 *   data-zone="cell"       data-id data-cell -> one column of a grid layout
 *   data-zone="slot"       data-id           -> the children area of a container component
 * Empty cells, flex layouts and slots also carry data-empty: a plain click on them adds an item.
 */

/** Shown in empty drop zones while editing. */
function EmptyPrompt() {
  return (
    <span className="pointer-events-none m-auto text-xs text-sky-700 select-none">
      Click here to add items
    </span>
  )
}

type ViewProps = { editing?: boolean }

/** A column of items: components and nested layouts, in order. */
function ItemList({ items, inFlex = false, editing }: { items: Item[]; inFlex?: boolean } & ViewProps) {
  return items.map((item) =>
    isLayout(item) ? (
      <LayoutBlock key={item.id} layout={item} inFlex={inFlex} editing={editing} />
    ) : (
      <ComponentBlock key={item.id} component={item} inFlex={inFlex} editing={editing} />
    )
  )
}

function ComponentBlock({
  component,
  inFlex,
  editing,
}: { component: UIComponent; inFlex: boolean } & ViewProps) {
  const entry = CATALOG_BY_TYPE.get(component.type)
  const items = component.children ?? []

  let children: React.ReactNode
  if (entry?.container) {
    if (editing) {
      children = (
        <div
          data-zone="slot"
          data-id={component.id}
          data-empty={items.length === 0 ? "true" : undefined}
          className="flex min-h-10 w-full min-w-0 flex-col items-start gap-3 rounded-md border border-dashed border-neutral-300 p-2"
        >
          {items.length === 0 && <EmptyPrompt />}
          <ItemList items={items} editing={editing} />
        </div>
      )
    } else {
      children = items.length ? (
        <div className="flex w-full min-w-0 flex-col items-start gap-3">
          <ItemList items={items} />
        </div>
      ) : null
    }
  }

  return (
    <div
      data-zone={editing ? "component" : undefined}
      data-id={component.id}
      className={cn("flex", !inFlex && "w-full", entry?.wrapperClass, styleClasses(component.style))}
    >
      {entry?.render(component.text, children, { ...entry.defaults, ...component.data }) ?? null}
    </div>
  )
}

function LayoutBlock({
  layout,
  inFlex,
  editing,
}: { layout: Layout; inFlex: boolean } & ViewProps) {
  const isFlex = layout.kind === "flex"
  if (isFlex) {
    return (
      <div
        data-zone={editing ? "layout" : undefined}
        data-id={layout.id}
        data-empty={editing && !layout.cells[0]?.length ? "true" : undefined}
        className={cn(
          "relative flex min-w-0",
          !inFlex && "w-full",
          GAP[normalizeGap(layout.gap)],
          editing && "min-h-24 rounded-md border border-dashed border-sky-700 p-2",
          styleClasses(layout.style)
        )}
      >
        {editing && !layout.cells[0]?.length && <EmptyPrompt />}
        <ItemList items={layout.cells[0] ?? []} inFlex editing={editing} />
      </div>
    )
  }

  return (
    <div
      data-zone={editing ? "layout" : undefined}
      data-id={layout.id}
      className={cn(
        "relative grid",
        !inFlex && "w-full",
        GAP[normalizeGap(layout.gap)],
        styleClasses(layout.style)
      )}
      style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}
    >
      {layout.cells.map((items, i) => (
        <div
          key={i}
          data-zone={editing ? "cell" : undefined}
          data-id={layout.id}
          data-cell={i}
          data-empty={editing && items.length === 0 ? "true" : undefined}
          className={cn(
            "flex min-w-0 flex-col items-start gap-3",
            editing && "min-h-24 rounded-md border border-dashed border-sky-700 p-2"
          )}
        >
          {editing && items.length === 0 && <EmptyPrompt />}
          <ItemList items={items} editing={editing} />
        </div>
      ))}
    </div>
  )
}

export function LayoutView({ layouts, editing }: { layouts: Layout[] } & ViewProps) {
  const globals = useGlobals()
  return (
    <div className={cn("flex w-full flex-col", gapClass(globals))}>
      {layouts.map((layout) => (
        <LayoutBlock key={layout.id} layout={layout} inFlex={false} editing={editing} />
      ))}
    </div>
  )
}
