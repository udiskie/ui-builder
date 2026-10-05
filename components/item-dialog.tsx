"use client"

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useRef, useState } from "react"

import { DataFields } from "@/components/data-editors"
import { LayoutItemsSorter } from "@/components/layout-items-sorter"
import { LayoutFields, StyleFields } from "@/components/property-controls"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { CATALOG, CATALOG_BY_TYPE, type CatalogEntry } from "@/lib/catalog"
import {
  addToCell,
  createLayout,
  findItem,
  isLayout,
  removeItem,
  reshapeLayout,
  saveLayouts,
  updateItem,
  type Item,
  type Layout,
  type LayoutKind,
  type UIComponent,
} from "@/lib/layout-store"
import type { ComponentData } from "@/lib/catalog-types"
import { submitOnEnter, useEnterOutsideDialog } from "@/lib/dialog-keys"
import { normalizeGap, type GapKey, type ItemStyle } from "@/lib/tailwind"
import { cn } from "@/lib/utils"

export type DialogState =
  | { mode: "create"; layoutId: number; cell: number }
  | { mode: "edit"; item: Item }

type PickerEntry = Omit<CatalogEntry, "render"> & Partial<Pick<CatalogEntry, "render">>

const LAYOUT_ENTRY: PickerEntry = { type: "layout", label: "Layout", field: "", initial: "" }
const PICKER_ENTRIES: PickerEntry[] = [LAYOUT_ENTRY, ...CATALOG]

/** Drops unset keys so saved items only carry the styles that were actually chosen. */
function cleanStyle(style: ItemStyle): ItemStyle | undefined {
  const entries = Object.entries(style).filter(([, v]) => v)
  return entries.length ? (Object.fromEntries(entries) as ItemStyle) : undefined
}

/** Mount to open; unmount (via onClose) to dismiss, so form state is fresh on every open. */
export function ItemDialog({
  dialog,
  layouts,
  onClose,
  onNavigate,
}: {
  dialog: DialogState
  layouts: Layout[]
  onClose: () => void
  /** Switches to another dialog (e.g. editing or adding a child); the parent remounts this one. */
  onNavigate: (next: DialogState) => void
}) {
  const editing = dialog.mode === "edit" ? dialog.item : null
  const editingLayout = editing && isLayout(editing) ? editing : null
  const editingComponent = editing && !isLayout(editing) ? editing : null

  const [type, setType] = useState(editingComponent?.type ?? CATALOG[0].type)
  const [text, setText] = useState(editingComponent?.text ?? CATALOG[0].initial)
  const [layoutKind, setLayoutKind] = useState<LayoutKind>(editingLayout?.kind ?? "grid")
  const [columns, setColumns] = useState(editingLayout?.columns ?? 2)
  // Working copy of the layout's items; the Items tab edits it and Save writes it back.
  const [cells, setCells] = useState<Item[][]>(editingLayout?.cells ?? [])
  const [gap, setGap] = useState<GapKey>(normalizeGap(editingLayout?.gap))
  const [style, setStyle] = useState<ItemStyle>(editing?.style ?? {})
  const [data, setData] = useState<ComponentData>(() => ({
    ...(editingComponent ? CATALOG_BY_TYPE.get(editingComponent.type)?.defaults : undefined),
    ...editingComponent?.data,
  }))
  const [query, setQuery] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  const entry = editingComponent
    ? CATALOG_BY_TYPE.get(editingComponent.type)
    : PICKER_ENTRIES.find((c) => c.type === type)
  const hasTextField = entry && entry.field !== "Unused" && entry.type !== "layout"

  const q = query.trim().toLowerCase()
  const visible = PICKER_ENTRIES.filter(
    (c) => !q || c.label.toLowerCase().includes(q) || c.type.includes(q)
  )

  /** Adds the selected entry; if the search hides the selection, the first match is used. */
  function acceptPicker(preferred?: PickerEntry) {
    const chosen = preferred ?? visible.find((c) => c.type === type) ?? visible[0]
    if (!chosen) return
    const changed = chosen.type !== type
    if (changed) pick(chosen)
    // State updates from pick() must be applied before the form handler reads them.
    setTimeout(() => formRef.current?.requestSubmit(), 0)
  }

  // Enter works right after opening, before focus has moved into the dialog.
  useEnterOutsideDialog(true, () =>
    dialog.mode === "create" ? acceptPicker() : formRef.current?.requestSubmit()
  )

  function pick(c: PickerEntry) {
    setType(c.type)
    setText(c.initial)
  }

  function setStyleKey<K extends keyof ItemStyle>(key: K, value: ItemStyle[K] | undefined) {
    setStyle((s) => ({ ...s, [key]: value }))
  }

  /** Type/column changes reshape the working items immediately so the Items tab stays accurate. */
  function reshapeEditing(kind: LayoutKind, cols: number) {
    if (!editingLayout) return
    setLayoutKind(kind)
    setColumns(cols)
    setCells(reshapeLayout({ ...editingLayout, kind, cells }, kind, cols, gap).cells)
  }

  /** Writes the edit form to the store (edit mode only). */
  function saveEdits() {
    if (editingLayout) {
      saveLayouts(
        updateItem(layouts, editingLayout.id, (it) => ({
          ...(it as Layout),
          kind: layoutKind === "flex" ? "flex" : undefined,
          columns: cells.length,
          gap,
          cells,
          style: cleanStyle(style),
        }))
      )
    } else if (editingComponent) {
      saveLayouts(
        updateItem(layouts, editingComponent.id, (it) => ({
          ...it,
          text,
          data: entry?.fields ? data : undefined,
          style: cleanStyle(style),
        }))
      )
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (dialog.mode === "create") {
      const item =
        type === "layout" ? createLayout(columns, gap, layoutKind) : { id: Date.now(), type, text }
      saveLayouts(addToCell(layouts, dialog.layoutId, dialog.cell, item))
    } else {
      saveEdits()
    }
    onClose()
  }

  // Children of the component being edited, read from the live store so deletes show up here.
  const liveComponent = editingComponent
    ? (findItem(layouts, editingComponent.id) as UIComponent | undefined)
    : undefined
  const children = liveComponent?.children ?? []

  function describe(item: Item) {
    if (isLayout(item)) return `Layout · ${item.columns} column${item.columns === 1 ? "" : "s"}`
    const label = CATALOG_BY_TYPE.get(item.type)?.label ?? item.type
    return item.text ? `${label} · ${item.text}` : label
  }

  const textField = hasTextField && (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="text">{entry.field}</Label>
      <Input id="text" value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  )

  const deleteButton = editing && (
    <Button
      type="button"
      variant="destructive"
      onClick={() => {
        saveLayouts(removeItem(layouts, editing.id))
        onClose()
      }}
    >
      <Trash2Icon />
      Delete
    </Button>
  )

  const actions = (
    <div className="ml-auto flex gap-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit">{dialog.mode === "create" ? "Add" : "Save"}</Button>
    </div>
  )

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      {dialog.mode === "create" ? (
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.shiftKey || e.defaultPrevented) return
            // Enter in the search box (outside the form) or on the dialog itself accepts.
            if (!submitOnEnter(e, formRef.current)) {
              const t = e.target
              if (t instanceof HTMLInputElement && !formRef.current?.contains(t)) {
                e.preventDefault()
                acceptPicker()
              }
            }
          }}
          className="flex h-dvh w-screen max-w-none flex-col gap-4 rounded-none p-6 sm:max-w-none"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Add component</DialogTitle>
              <DialogDescription>Pick a shadcn component or a nested layout.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              type="search"
              aria-label="Search components"
              placeholder="Search components..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3 overflow-y-auto p-1">
              {visible.length === 0 && (
                <p className="col-span-full text-sm text-neutral-500">
                  No components match &ldquo;{query}&rdquo;.
                </p>
              )}
              {visible.map((c) => (
                <div
                  key={c.type}
                  role="button"
                  tabIndex={0}
                  aria-pressed={c.type === type}
                  onClick={() => pick(c)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return
                    if (e.key === " ") {
                      e.preventDefault()
                      pick(c)
                    } else if (e.key === "Enter") {
                      e.preventDefault()
                      acceptPicker(c)
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-lg border bg-white p-3 text-left transition-colors hover:border-neutral-400",
                    c.type === type && "border-neutral-900 ring-2 ring-neutral-900"
                  )}
                >
                  <span className="text-sm font-medium">{c.label}</span>
                  <span className="pointer-events-none flex h-32 items-center justify-center overflow-hidden rounded-md bg-neutral-50 p-2">
                    {c.render ? (
                      c.render(c.initial, undefined, c.defaults)
                    ) : (
                      <span className="grid w-full grid-cols-2 gap-2">
                        <span className="h-16 rounded border border-dashed border-neutral-300" />
                        <span className="h-16 rounded border border-dashed border-neutral-300" />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {/* Previews above can contain forms of their own, so only the fields are in this form. */}
            <form ref={formRef} onSubmit={submit} className="flex items-end gap-4">
              {type === "layout" ? (
                <div className="w-80">
                  <LayoutFields
                    idPrefix="item"
                    kind={layoutKind}
                    onKind={setLayoutKind}
                    columns={columns}
                    gap={gap}
                    onColumns={setColumns}
                    onGap={setGap}
                  />
                </div>
              ) : (
                textField
              )}
              {actions}
            </form>
          </div>
        </DialogContent>
      ) : editingLayout ? (
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => submitOnEnter(e, formRef.current)}
          className="flex h-dvh w-screen max-w-none flex-col gap-4 rounded-none p-6 sm:max-w-none"
        >
          <form ref={formRef} onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Edit layout</DialogTitle>
              <DialogDescription>
                Reorder its items, change its structure, and style it with Tailwind.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="items" className="flex min-h-0 flex-1 flex-col gap-4">
              <TabsList>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>
              <TabsContent value="items" className="min-h-0 flex-1 overflow-y-auto p-1">
                <LayoutItemsSorter
                  cells={cells}
                  flex={layoutKind === "flex"}
                  onChange={setCells}
                  onAdd={(cell) => {
                    saveEdits()
                    onNavigate({ mode: "create", layoutId: editingLayout.id, cell })
                  }}
                />
              </TabsContent>
              <TabsContent value="layout" className="min-h-0 flex-1 overflow-y-auto p-1">
                <div className="flex max-w-xl flex-col gap-3">
                  <LayoutFields
                    idPrefix="edit"
                    kind={layoutKind}
                    onKind={(k) => reshapeEditing(k, columns)}
                    columns={columns}
                    gap={gap}
                    onColumns={(c) => reshapeEditing(layoutKind, c)}
                    onGap={setGap}
                  />
                  <p className="text-sm text-neutral-500">
                    Removed columns merge their content into the last one. Switching type keeps all items.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="style" className="min-h-0 flex-1 overflow-y-auto p-1">
                <div className="max-w-xl">
                  <StyleFields
                    kind="layout"
                    flexContainer={layoutKind === "flex"}
                    style={style}
                    onChange={setStyleKey}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex">{deleteButton}{actions}</div>
          </form>
        </DialogContent>
      ) : (
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => submitOnEnter(e, formRef.current)}
          className={cn("max-h-[90dvh] overflow-y-auto sm:max-w-lg", entry?.fields && "sm:max-w-2xl")}
        >
          <form ref={formRef} onSubmit={submit} className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>
                {`Edit ${entry?.label ?? "component"}`}
              </DialogTitle>
              <DialogDescription>
                Content and Tailwind styling for this component.
              </DialogDescription>
            </DialogHeader>

            {hasTextField && (
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                  Content
                </h3>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="text">{entry?.field}</Label>
                  <Input id="text" value={text} onChange={(e) => setText(e.target.value)} />
                </div>
              </section>
            )}

            {entry?.fields && editingComponent && (
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                  Data
                </h3>
                <DataFields
                  fields={entry.fields}
                  data={data}
                  onChange={(key, value) => setData((d) => ({ ...d, [key]: value }))}
                />
              </section>
            )}

            {entry?.container && editingComponent && (
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                  Children
                </h3>
                {children.length === 0 && (
                  <p className="text-sm text-neutral-500">Nothing inside yet.</p>
                )}
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <span className="min-w-0 truncate">{describe(child)}</span>
                    <span className="flex shrink-0 gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Edit child"
                        onClick={() => {
                          saveEdits()
                          onNavigate({ mode: "edit", item: child })
                        }}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Delete child"
                        onClick={() => saveLayouts(removeItem(layouts, child.id))}
                      >
                        <Trash2Icon />
                      </Button>
                    </span>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => {
                    saveEdits()
                    onNavigate({ mode: "create", layoutId: editingComponent.id, cell: 0 })
                  }}
                >
                  <PlusIcon />
                  Add child
                </Button>
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                Style
              </h3>
              <StyleFields
                kind="component"
                style={style}
                onChange={setStyleKey}
              />
            </section>

            <div className="flex">{deleteButton}{actions}</div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}
