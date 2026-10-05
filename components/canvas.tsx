"use client"

import { LayoutGridIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useCallback, useRef, useState } from "react"

import { ArrangeDialog } from "@/components/arrange-dialog"
import { ContextPanel, type PanelItem } from "@/components/context-panel"
import { ItemDialog, type ArrangeState, type DialogState } from "@/components/item-dialog"
import { LayoutView } from "@/components/layout-view"
import { PageShell } from "@/components/page-shell"
import { PreviewButton } from "@/components/preview-button"
import { LayoutFields } from "@/components/property-controls"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createLayout,
  findItem,
  isLayout,
  layoutRows,
  removeItem,
  saveLayouts,
  setCellConfig,
  setChildrenConfig,
  useLayouts,
} from "@/lib/layout-store"
import { submitOnEnter, useEnterOutsideDialog } from "@/lib/dialog-keys"
import { CATALOG_BY_TYPE } from "@/lib/catalog"
import type { Layout, LayoutKind, UIComponent } from "@/lib/layout-store"
import type { GapKey } from "@/lib/tailwind"

export function Canvas() {
  const layouts = useLayouts()

  const [layoutOpen, setLayoutOpen] = useState(false)
  const [kind, setKind] = useState<LayoutKind>("grid")
  const [columns, setColumns] = useState(2)
  const [rows, setRows] = useState(1)
  const [gap, setGap] = useState<GapKey>("4")

  const layoutForm = useRef<HTMLFormElement>(null)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; title?: string; items: PanelItem[] } | null>(null)

  /**
   * Secondary click is the editor gesture. It is handled in the capture phase so the
   * clicked component never receives it, and the innermost `data-zone` under the cursor
   * decides which menu to show. Returns null for anything that isn't an editor click:
   * portaled UI such as dialogs and the floating buttons keep their native behavior.
   */
  function editorTarget(e: React.MouseEvent<HTMLElement>) {
    const el = e.target
    if (!(el instanceof Element) || !e.currentTarget.contains(el) || el.closest("[data-editor-ui]")) {
      return null
    }
    return { zone: el.closest<HTMLElement>("[data-zone]") }
  }

  /** Stops the press of a secondary click from reaching components (menus that open on press). */
  function swallowSecondary(e: React.MouseEvent<HTMLElement>) {
    if (e.button !== 2 || !editorTarget(e)) return
    e.preventDefault()
    e.stopPropagation()
  }

  /** The grid column of `layoutZone` closest to the pointer (flex layouts have a single cell). */
  function columnAt(layoutZone: HTMLElement, x: number, y: number) {
    const cells = Array.from(layoutZone.querySelectorAll<HTMLElement>(':scope > [data-zone="cell"]'))
    let best = 0
    let bestDistance = Infinity
    cells.forEach((cell, i) => {
      const r = cell.getBoundingClientRect()
      const dx = Math.max(r.left - x, 0, x - r.right)
      const dy = Math.max(r.top - y, 0, y - r.bottom)
      const d = dx * dx + dy * dy
      if (d < bestDistance) {
        best = i
        bestDistance = d
      }
    })
    return best
  }

  useEnterOutsideDialog(layoutOpen, () => layoutForm.current?.requestSubmit())

  const closeMenu = useCallback(() => setMenu(null), [])

  /** A plain click on an empty column, flex layout or children area adds an item to it. */
  function handleClick(e: React.MouseEvent<HTMLElement>) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
    const zone = editorTarget(e)?.zone
    if (!zone || zone.dataset.empty !== "true") return
    const id = Number(zone.dataset.id)
    const cell = zone.dataset.zone === "cell" ? Number(zone.dataset.cell) : 0
    setDialog({ mode: "create", layoutId: id, cell })
  }

  function handleContextMenu(e: React.MouseEvent<HTMLElement>) {
    const hit = editorTarget(e)
    if (!hit) return
    e.preventDefault()
    e.stopPropagation()
    const { clientX: x, clientY: y } = e
    const { zone } = hit

    const add = (layoutId: number, cell: number, label = "Add component"): PanelItem => ({
      label,
      icon: <PlusIcon />,
      onSelect: () => setDialog({ mode: "create", layoutId, cell }),
    })
    const edit = (id: number, noun: string): PanelItem => ({
      label: `Edit ${noun}`,
      icon: <PencilIcon />,
      onSelect: () => {
        const item = findItem(layouts, id)
        if (item) setDialog({ mode: "edit", item })
      },
    })
    const remove = (id: number, noun: string): PanelItem => ({
      label: `Delete ${noun}`,
      icon: <Trash2Icon />,
      destructive: true,
      onSelect: () => saveLayouts(removeItem(layouts, id)),
    })

    const arrange = (target: ArrangeState, label: string): PanelItem => ({
      label,
      icon: <LayoutGridIcon />,
      onSelect: () => setDialog(target),
    })

    if (!zone) {
      setMenu({
        x,
        y,
        items: [
          {
            label: "Add layout",
            icon: <PlusIcon />,
            onSelect: () => {
              setKind("grid")
              setColumns(2)
              setRows(1)
              setGap("4")
              setLayoutOpen(true)
            },
          },
        ],
      })
      return
    }

    const id = Number(zone.dataset.id)
    const item = findItem(layouts, id)
    switch (zone.dataset.zone) {
      case "component":
        setMenu({
          x,
          y,
          title: item && !isLayout(item) ? CATALOG_BY_TYPE.get(item.type)?.label : undefined,
          items: [
            ...(item && !isLayout(item) && CATALOG_BY_TYPE.get(item.type)?.container
              ? [add(id, 0, "Add component inside")]
              : []),
            edit(id, "component"),
            remove(id, "component"),
          ],
        })
        break
      case "slot": // children area of a container component
        setMenu({
          x,
          y,
          items: [
            add(id, 0),
            arrange({ mode: "children", componentId: id }, "Arrange children"),
            edit(id, "component"),
            remove(id, "component"),
          ],
        })
        break
      case "cell": {
        const cell = Number(zone.dataset.cell)
        const layout = item && isLayout(item) ? item : undefined
        const columnsCount = layout?.columns ?? 1
        const rowsCount = layout ? layoutRows(layout) : 1
        const column = (cell % columnsCount) + 1
        setMenu({
          x,
          y,
          title: rowsCount > 1 ? `Row ${Math.floor(cell / columnsCount) + 1} · Column ${column}` : `Column ${column}`,
          items: [
            add(id, cell),
            arrange({ mode: "cell", layoutId: id, cell }, "Arrange cell"),
            edit(id, "layout"),
            remove(id, "layout"),
          ],
        })
        break
      }
      case "layout":
        setMenu({
          x,
          y,
          title: "Layout",
          items: [add(id, columnAt(zone, x, y)), edit(id, "layout"), remove(id, "layout")],
        })
        break
    }
  }

  function addLayout(e: React.FormEvent) {
    e.preventDefault()
    saveLayouts([...layouts, createLayout(columns, gap, kind, rows)])
    setLayoutOpen(false)
  }

  return (
    <PageShell
      onClick={handleClick}
      onContextMenuCapture={handleContextMenu}
      onPointerDownCapture={swallowSecondary}
      onMouseDownCapture={swallowSecondary}
    >
      {layouts.length === 0 ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-500 select-none">
          right-click to add new layout or component
        </p>
      ) : (
        <p className="pointer-events-none fixed right-4 bottom-4 text-xs text-neutral-400 select-none">
          right-click an item or empty space for options
        </p>
      )}

      <LayoutView layouts={layouts} editing />

      <PreviewButton />

      {menu && <ContextPanel {...menu} onClose={closeMenu} />}

      <Dialog open={layoutOpen} onOpenChange={setLayoutOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => submitOnEnter(e, layoutForm.current)}
        >
          <form ref={layoutForm} onSubmit={addLayout} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>New layout</DialogTitle>
              <DialogDescription>
                Choose a grid with rows and columns, or a flex layout that takes any number of children.
              </DialogDescription>
            </DialogHeader>
            <LayoutFields
              idPrefix="new"
              kind={kind}
              onKind={setKind}
              columns={columns}
              rows={rows}
              gap={gap}
              onColumns={setColumns}
              onRows={setRows}
              onGap={setGap}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLayoutOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add layout</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {dialog && (dialog.mode === "create" || dialog.mode === "edit") && (
        <ItemDialog
          key={
            dialog.mode === "edit"
              ? `edit-${dialog.item.id}`
              : `create-${dialog.layoutId}-${dialog.cell}`
          }
          dialog={dialog}
          layouts={layouts}
          onClose={() => setDialog(null)}
          onNavigate={setDialog}
        />
      )}

      {dialog?.mode === "cell" && (
        <ArrangeDialog
          key={`cell-${dialog.layoutId}-${dialog.cell}`}
          title="Arrange cell"
          description="How the items in this cell are laid out."
          initial={(findItem(layouts, dialog.layoutId) as Layout | undefined)?.cellConfigs?.[dialog.cell] ?? undefined}
          onSave={(config) => saveLayouts(setCellConfig(layouts, dialog.layoutId, dialog.cell, config))}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.mode === "children" && (
        <ArrangeDialog
          key={`children-${dialog.componentId}`}
          title="Arrange children"
          description="How the items inside this component are laid out."
          initial={(findItem(layouts, dialog.componentId) as UIComponent | undefined)?.childrenConfig}
          onSave={(config) => saveLayouts(setChildrenConfig(layouts, dialog.componentId, config))}
          onClose={() => setDialog(null)}
        />
      )}
    </PageShell>
  )
}
