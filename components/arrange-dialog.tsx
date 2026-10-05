"use client"

import { useRef, useState } from "react"

import { OptionSelect, StyleFields, keys } from "@/components/property-controls"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cleanStyle, DEFAULT_CELL_GAP, type CellConfig } from "@/lib/arrange"
import { submitOnEnter, useEnterOutsideDialog } from "@/lib/dialog-keys"
import { GAP, type GapKey, type ItemStyle } from "@/lib/tailwind"

type Mode = "stack" | "flex" | "grid"

const MODE_LABEL: Record<Mode, string> = {
  stack: "Stack (one under another)",
  flex: "Flex",
  grid: "Grid",
}

/**
 * Chooses how the contents of a grid cell, or of a container component, are arranged:
 * the default stack, a flex, or a grid, with Tailwind options for each.
 */
export function ArrangeDialog({
  title,
  description,
  initial,
  onSave,
  onClose,
}: {
  title: string
  description: string
  initial?: CellConfig
  onSave: (config: CellConfig | undefined) => void
  onClose: () => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [mode, setMode] = useState<Mode>(initial?.kind ?? "stack")
  const [columns, setColumns] = useState(initial?.columns ?? 2)
  const [gap, setGap] = useState<GapKey>(initial?.gap ?? DEFAULT_CELL_GAP)
  const [style, setStyle] = useState<ItemStyle>(initial?.style ?? {})

  useEnterOutsideDialog(true, () => formRef.current?.requestSubmit())

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const config: CellConfig = {}
    if (mode !== "stack") config.kind = mode
    if (mode === "grid") config.columns = columns
    if (gap !== DEFAULT_CELL_GAP) config.gap = gap
    const cleaned = cleanStyle(style)
    if (cleaned) config.style = cleaned
    onSave(Object.keys(config).length ? config : undefined)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => submitOnEnter(e, formRef.current)}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
      >
        <form ref={formRef} onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Arrangement</Label>
              <OptionSelect<Mode>
                label="Arrangement"
                value={mode}
                options={["stack", "flex", "grid"]}
                format={(m) => MODE_LABEL[m]}
                onChange={setMode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Gap</Label>
              <OptionSelect<GapKey>
                label="Gap"
                value={gap}
                options={keys(GAP)}
                format={(k) => GAP[k]}
                onChange={setGap}
              />
            </div>
            {mode === "grid" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="arrange-columns">Columns</Label>
                <Input
                  id="arrange-columns"
                  type="number"
                  min={1}
                  max={12}
                  value={columns}
                  onChange={(e) => setColumns(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                />
              </div>
            )}
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">Style</h3>
            <StyleFields
              kind="layout"
              flexContainer={mode === "flex"}
              style={style}
              onChange={(key, value) => setStyle((s) => ({ ...s, [key]: value }))}
            />
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
