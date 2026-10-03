"use client"

import { ExternalLinkIcon } from "lucide-react"

import { DesignIO } from "@/components/design-io"
import { GlobalProperties } from "@/components/global-properties"
import { Button } from "@/components/ui/button"

/** Floating bottom-left bar: open the preview tab, edit global properties, export/import JSON. */
export function PreviewButton() {
  return (
    <div className="fixed bottom-4 left-4 z-40 flex gap-2">
      <Button
        size="sm"
        className="rounded-full shadow-md"
        onClick={(e) => {
          e.stopPropagation()
          window.open("/preview", "_blank")
        }}
      >
        <ExternalLinkIcon />
        Preview
      </Button>
      <GlobalProperties />
      <DesignIO />
    </div>
  )
}
