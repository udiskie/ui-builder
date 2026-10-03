"use client"

import { Settings2Icon, XIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ColorPicker, OptionSelect, Row, Section, keys } from "@/components/property-controls"
import { useGlobals, saveGlobals } from "@/lib/globals-store"
import {
  DEFAULT_GLOBALS,
  FONT,
  FONT_SIZE,
  GAP,
  MAX_WIDTH,
  PADDING,
  TEXT_ALIGN,
  THEME,
  type GlobalProps,
} from "@/lib/tailwind"

/** Floating button that opens a non-modal side panel, so changes show live on the page behind it. */
export function GlobalProperties() {
  const [open, setOpen] = useState(false)
  const globals = useGlobals()

  function set<K extends keyof GlobalProps>(key: K, value: GlobalProps[K]) {
    saveGlobals({ ...globals, [key]: value })
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full bg-white shadow-md"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <Settings2Icon />
        Global properties
      </Button>

      {open && (
        <aside
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col gap-6 overflow-y-auto border-l border-neutral-200 bg-white p-4 text-sm text-neutral-900 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Global properties</h2>
            <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => setOpen(false)}>
              <XIcon />
            </Button>
          </div>

          <Section title="Color">
            <ColorPicker label="Background" value={globals.background} onChange={(v) => set("background", v)} />
            <ColorPicker label="Text" value={globals.textColor} onChange={(v) => set("textColor", v)} />
            <Row label="Components">
              <OptionSelect
                label="Component theme"
                value={globals.theme}
                options={keys(THEME)}
                onChange={(v) => set("theme", v)}
              />
            </Row>
          </Section>

          <Section title="Spacing & size">
            <Row label="Padding">
              <OptionSelect
                label="Padding"
                value={globals.padding}
                options={keys(PADDING)}
                format={(k) => `p-${k}`}
                onChange={(v) => set("padding", v)}
              />
            </Row>
            <Row label="Layout gap">
              <OptionSelect
                label="Gap between layouts"
                value={globals.gap}
                options={keys(GAP)}
                format={(k) => `gap-${k}`}
                onChange={(v) => set("gap", v)}
              />
            </Row>
            <Row label="Max width">
              <OptionSelect
                label="Max width"
                value={globals.maxWidth}
                options={keys(MAX_WIDTH)}
                format={(k) => `max-w-${k}`}
                onChange={(v) => set("maxWidth", v)}
              />
            </Row>
          </Section>

          <Section title="Typography">
            <Row label="Font">
              <OptionSelect
                label="Font"
                value={globals.font}
                options={keys(FONT)}
                format={(k) => `font-${k}`}
                onChange={(v) => set("font", v)}
              />
            </Row>
            <Row label="Size">
              <OptionSelect
                label="Font size"
                value={globals.fontSize}
                options={keys(FONT_SIZE)}
                format={(k) => `text-${k}`}
                onChange={(v) => set("fontSize", v)}
              />
            </Row>
            <Row label="Alignment">
              <OptionSelect
                label="Text alignment"
                value={globals.textAlign}
                options={keys(TEXT_ALIGN)}
                format={(k) => `text-${k}`}
                onChange={(v) => set("textAlign", v)}
              />
            </Row>
          </Section>

          <Button variant="outline" onClick={() => saveGlobals(DEFAULT_GLOBALS)}>
            Reset to defaults
          </Button>
        </aside>
      )}
    </>
  )
}
