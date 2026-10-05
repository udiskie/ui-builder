"use client"

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import { CATALOG_BY_TYPE } from "@/lib/catalog"
import { isLayout, type Item } from "@/lib/layout-store"
import { cn } from "@/lib/utils"

const cellId = (i: number) => `cell-${i}`

export function describeItem(item: Item) {
  if (isLayout(item)) {
    const n = item.cells.flat().length
    return `${item.kind === "flex" ? "Flex" : "Grid"} layout · ${n} item${n === 1 ? "" : "s"}`
  }
  const label = CATALOG_BY_TYPE.get(item.type)?.label ?? item.type
  return item.text ? `${label} · ${item.text}` : label
}

function Chip({ item, dragging, handle }: { item: Item; dragging?: boolean; handle?: React.HTMLAttributes<HTMLButtonElement> }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-white px-2 py-2 text-sm shadow-xs",
        dragging && "shadow-lg ring-2 ring-neutral-900"
      )}
    >
      <button
        type="button"
        aria-label={`Drag ${describeItem(item)}`}
        className="cursor-grab touch-none text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
        {...handle}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <span className="min-w-0 truncate">{describeItem(item)}</span>
    </div>
  )
}

function SortableChip({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
    >
      <Chip item={item} handle={{ ...attributes, ...listeners }} />
    </div>
  )
}

function Column({
  id,
  title,
  items,
  onAdd,
}: {
  id: string
  title?: string
  items: Item[]
  onAdd: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {title && <h4 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">{title}</h4>}
      <SortableContext id={id} items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-24 flex-col gap-2 rounded-lg border border-dashed border-sky-700 p-2 transition-colors",
            isOver && "bg-sky-50"
          )}
        >
          {items.map((item) => (
            <SortableChip key={item.id} item={item} />
          ))}
          {items.length === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              className="m-auto flex min-h-16 w-full flex-1 items-center justify-center gap-1.5 rounded-md text-sm text-sky-700 outline-none hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-700"
            >
              <PlusIcon className="size-4" />
              Click here to add items
            </button>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-xs text-sky-700 outline-none hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-700"
            >
              <PlusIcon className="size-3.5" />
              Add item
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

/**
 * Drag-and-drop reordering of a layout's items: within a column, or between columns of a grid.
 * Nested layouts move as one item together with their contents.
 */
export function LayoutItemsSorter({
  cells,
  flex,
  onChange,
  onAdd,
}: {
  cells: Item[][]
  flex: boolean
  onChange: (cells: Item[][]) => void
  /** Add an item to the given column (the dialog is covering the canvas, so it is offered here). */
  onAdd: (cell: number) => void
}) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const containerOf = (id: UniqueIdentifier) => {
    if (typeof id === "string" && id.startsWith("cell-")) return Number(id.slice(5))
    return cells.findIndex((c) => c.some((it) => it.id === id))
  }
  const active = activeId === null ? null : cells.flat().find((it) => it.id === activeId)

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const from = containerOf(active.id)
    const to = containerOf(over.id)
    if (from < 0 || to < 0 || from === to) return
    const moving = cells[from].find((it) => it.id === active.id)
    if (!moving) return
    const target = cells[to]
    const overIndex = target.findIndex((it) => it.id === over.id)
    const translated = active.rect.current.translated
    const below = !!translated && translated.top > over.rect.top + over.rect.height / 2
    const index = overIndex < 0 ? target.length : overIndex + (below ? 1 : 0)
    onChange(
      cells.map((c, i) =>
        i === from
          ? c.filter((it) => it.id !== active.id)
          : i === to
            ? [...target.slice(0, index), moving, ...target.slice(index)]
            : c
      )
    )
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return
    const from = containerOf(active.id)
    const to = containerOf(over.id)
    if (from < 0 || from !== to) return
    const oldIndex = cells[from].findIndex((it) => it.id === active.id)
    const newIndex = cells[to].findIndex((it) => it.id === over.id)
    if (newIndex >= 0 && oldIndex !== newIndex) {
      onChange(cells.map((c, i) => (i === from ? arrayMove(c, oldIndex, newIndex) : c)))
    }
  }

  const empty = cells.every((c) => c.length === 0)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-500">
        {empty
          ? "This layout has no items yet. Click a column below to add some, then reorder them here."
          : flex
            ? "Drag items to change their order."
            : "Drag items to reorder them, or into another column. Press space on a handle to move with the keyboard."}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }: DragStartEvent) => setActiveId(active.id)}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${flex ? 1 : Math.max(1, cells.length)}, minmax(0, 1fr))` }}
        >
          {cells.map((items, i) => (
            <Column key={i} id={cellId(i)} title={flex ? undefined : `Column ${i + 1}`} items={items} onAdd={() => onAdd(i)} />
          ))}
        </div>
        <DragOverlay>{active ? <Chip item={active} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}
