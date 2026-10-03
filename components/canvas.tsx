"use client"

import { useState } from "react"

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
  removeItem,
  saveLayouts,
  useLayouts,
} from "@/lib/layout-store"
import type { LayoutKind } from "@/lib/layout-store"
import type { GapKey } from "@/lib/tailwind"

export function Canvas() {
  const layouts = useLayouts()

  const [layoutOpen, setLayoutOpen] = useState(false)
  const [kind, setKind] = useState<LayoutKind>("grid")
  const [columns, setColumns] = useState(2)
  const [gap, setGap] = useState<GapKey>("4")

  const [dialog, setDialog] = useState<DialogState | null>(null)

  function handleClick(e: React.MouseEvent) {
    if (e.ctrlKey || e.metaKey) {
      setKind("grid")
      setColumns(2)
      setGap("4")
      setLayoutOpen(true)
    }
  }

  function addLayout(e: React.FormEvent) {
    e.preventDefault()
    saveLayouts([...layouts, createLayout(columns, gap, kind)])
    setLayoutOpen(false)
  }

  function openCreate(layoutId: number, cell: number) {
    setDialog({ mode: "create", layoutId, cell })
  }

  return (
    <PageShell onClick={handleClick}>
      {layouts.length === 0 ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-500 select-none">
          ctrl+click to add new layout or component
        </p>
      ) : (
        <p className="pointer-events-none fixed right-4 bottom-4 text-xs text-neutral-400 select-none">
          ctrl+click a column to add a component, or the background for a new layout. Hover an item to edit or delete it.
        </p>
      )}

      <LayoutView
        layouts={layouts}
        editing
        onCellClick={openCreate}
        onEdit={(item) => setDialog({ mode: "edit", item })}
        onDelete={(item) => saveLayouts(removeItem(layouts, item.id))}
      />

      <PreviewButton />

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
