"use client"

import { Settings2Icon, XIcon } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ColorPicker, OptionSelect, Row, Section, keys } from "@/components/property-controls"
import { useGlobals, saveGlobals } from "@/lib/globals-store"
import { FONT_NAME, loadGoogleFont, POPULAR_FONTS } from "@/lib/google-fonts"
import { ICON_PACK_KEYS, iconPack } from "@/lib/icon-packs"
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

type FontStatus = "idle" | "loading" | "ok" | "error" | "invalid"

const FONT_STATUS_TEXT: Record<FontStatus, string> = {
  idle: "",
  loading: "Loading from Google Fonts…",
  ok: "Loaded.",
  error: "Not found on Google Fonts.",
  invalid: "Use letters, digits and spaces only.",
}

/**
 * A Google Fonts family input. Typing is debounced; the family is only applied once Google
 * Fonts confirms it exists, so a typo never replaces a working font.
 */
function FontField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (family: string) => void
}) {
  const listId = useId()
  const [draft, setDraft] = useState(value)
  const [status, setStatus] = useState<FontStatus>("idle")
  const latest = useRef({ value, onChange })
  useEffect(() => {
    latest.current = { value, onChange }
  })

  // Follow external changes (Reset to defaults, importing a design).
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setDraft(value)
  }

  useEffect(() => {
    const name = draft.trim()
    if (name === latest.current.value) return
    let cancelled = false
    const timer = setTimeout(async () => {
      if (name === "") {
        latest.current.onChange("")
        setStatus("idle")
      } else if (!FONT_NAME.test(name)) {
        setStatus("invalid")
      } else {
        setStatus("loading")
        const ok = await loadGoogleFont(name)
        if (cancelled) return
        if (ok) latest.current.onChange(name)
        setStatus(ok ? "ok" : "error")
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [draft])

  return (
    <div className="flex flex-col gap-1.5">
      <Row label={label}>
        <Input
          aria-label={`${label} font`}
          list={listId}
          placeholder="Theme default"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <datalist id={listId}>
          {POPULAR_FONTS.map((f) => <option key={f} value={f} />)}
        </datalist>
      </Row>
      {status !== "idle" && (
        <p
          role="status"
          className={`pl-[7.5rem] text-xs ${status === "error" || status === "invalid" ? "text-red-600" : "text-neutral-500"}`}
        >
          {FONT_STATUS_TEXT[status]}
        </p>
      )}
    </div>
  )
}

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

          <Section title="Fonts">
            <FontField label="Headings" value={globals.headingFont} onChange={(v) => set("headingFont", v)} />
            <FontField label="Paragraphs" value={globals.bodyFont} onChange={(v) => set("bodyFont", v)} />
            <p className="text-xs text-neutral-500">
              Any family from fonts.google.com. Leave empty for the theme font.
            </p>
          </Section>

          <Section title="Icons">
            <Row label="Library">
              <OptionSelect<string>
                label="Icon library"
                value={globals.iconLibrary}
                options={ICON_PACK_KEYS}
                format={(k) => iconPack(k).label}
                onChange={(v) => set("iconLibrary", v)}
              />
            </Row>
            <p className="text-xs text-neutral-500">
              react-icons set the Icon picker opens on. Lucide is the default.
            </p>
          </Section>

          <Button variant="outline" onClick={() => saveGlobals(DEFAULT_GLOBALS)}>
            Reset to defaults
          </Button>
        </aside>
      )}
    </>
  )
}
