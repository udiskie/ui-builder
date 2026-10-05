"use client"

import { DownloadIcon, UploadIcon } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEnterOutsideDialog } from "@/lib/dialog-keys"
import { exportDesign, parseDesign, type ParsedDesign } from "@/lib/design-io"
import { saveGlobals, useGlobals } from "@/lib/globals-store"
import { saveLayouts, useLayouts } from "@/lib/layout-store"

type Notice =
  | { kind: "error"; message: string }
  | { kind: "confirm"; design: ParsedDesign }
  | { kind: "done"; layouts: number; warnings: string[] }

/** Floating buttons to save the design as a JSON file and to load one back. */
export function DesignIO() {
  const layouts = useLayouts()
  const globals = useGlobals()
  const fileInput = useRef<HTMLInputElement>(null)
  const replaceButton = useRef<HTMLButtonElement>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  // Enter accepts: replace on the confirmation, dismiss on the notices.
  useEnterOutsideDialog(notice !== null, () => {
    if (notice?.kind === "confirm") apply(notice.design)
    else setNotice(null)
  })

  function download() {
    const blob = new Blob([exportDesign(layouts, globals)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ui-design.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  function apply(design: ParsedDesign) {
    saveLayouts(design.layouts)
    saveGlobals(design.globals)
    setNotice({ kind: "done", layouts: design.layouts.length, warnings: design.warnings })
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow picking the same file again
    if (!file) return
    const result = parseDesign(await file.text())
    if (!result.ok) return setNotice({ kind: "error", message: result.error })
    if (layouts.length > 0) setNotice({ kind: "confirm", design: result })
    else apply(result)
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full bg-white shadow-md"
        onClick={(e) => {
          e.stopPropagation()
          download()
        }}
      >
        <DownloadIcon />
        Export JSON
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full bg-white shadow-md"
        onClick={(e) => {
          e.stopPropagation()
          fileInput.current?.click()
        }}
      >
        <UploadIcon />
        Import JSON
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
        onClick={(e) => e.stopPropagation()}
      />

      <Dialog open={notice !== null} onOpenChange={(o) => !o && setNotice(null)}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          initialFocus={notice?.kind === "confirm" ? replaceButton : true}
        >
          {notice?.kind === "error" && (
            <DialogHeader>
              <DialogTitle>Couldn&apos;t import</DialogTitle>
              <DialogDescription className="break-words">{notice.message}</DialogDescription>
            </DialogHeader>
          )}
          {notice?.kind === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>Replace the current design?</DialogTitle>
                <DialogDescription>
                  Importing replaces your {layouts.length} layout{layouts.length === 1 ? "" : "s"} and
                  global properties with the file&apos;s. Export first if you want to keep them.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNotice(null)}>
                  Cancel
                </Button>
                <Button ref={replaceButton} onClick={() => apply(notice.design)}>
                  Replace
                </Button>
              </DialogFooter>
            </>
          )}
          {notice?.kind === "done" && (
            <DialogHeader>
              <DialogTitle>Imported</DialogTitle>
              <DialogDescription>
                Loaded {notice.layouts} layout{notice.layouts === 1 ? "" : "s"}.
                {notice.warnings.length > 0 && ` ${notice.warnings.length} value(s) were ignored:`}
              </DialogDescription>
              {notice.warnings.length > 0 && (
                <ul className="max-h-40 list-disc overflow-y-auto pl-5 text-xs text-neutral-600">
                  {notice.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
