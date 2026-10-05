"use client"

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useCallback, useState } from "react"

import { ContextPanel, type PanelItem } from "@/components/context-panel"
import { ItemDialog, type DialogState } from "@/components/item-dialog"
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
  removeItem,
  saveLayouts,
  useLayouts,
} from "@/lib/layout-store"
import { CATALOG_BY_TYPE } from "@/lib/catalog"
import type { LayoutKind } from "@/lib/layout-store"
import type { GapKey } from "@/lib/tailwind"

export function Canvas() {
  const layouts = useLayouts()

  const [layoutOpen, setLayoutOpen] = useState(false)
  const [kind, setKind] = useState<LayoutKind>("grid")
  const [columns, setColumns] = useState(2)
  const [gap, setGap] = useState<GapKey>("4")

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

  const closeMenu = useCallback(() => setMenu(null), [])

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
        setMenu({ x, y, items: [add(id, 0), edit(id, "component"), remove(id, "component")] })
        break
      case "cell": {
        const cell = Number(zone.dataset.cell)
        setMenu({
          x,
          y,
          title: `Column ${cell + 1}`,
          items: [add(id, cell), edit(id, "layout"), remove(id, "layout")],
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
    saveLayouts([...layouts, createLayout(columns, gap, kind)])
    setLayoutOpen(false)
  }

  return (
    <PageShell
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
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <form onSubmit={addLayout} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>New layout</DialogTitle>
              <DialogDescription>
                Choose a grid with fixed columns, or a flex layout that takes any number of children.
              </DialogDescription>
            </DialogHeader>
            <LayoutFields
              idPrefix="new"
              kind={kind}
              onKind={setKind}
              columns={columns}
              gap={gap}
              onColumns={setColumns}
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

      {dialog && (
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
    </PageShell>
  )
}
