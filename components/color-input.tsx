"use client"

import { CheckIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { COLOR_SHADES } from "@/lib/tailwind"
import { cn } from "@/lib/utils"

/** The Tailwind palette in the order the docs show it: hues first, then the grays. */
const FAMILIES = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
  "slate", "gray", "zinc", "neutral", "stone",
] as const

const COLUMNS = FAMILIES.length

/** Every swatch in grid order: a row per shade, a column per family. */
const CELLS = COLOR_SHADES.flatMap((shade) => FAMILIES.map((family) => `${family}-${shade}`))

/** Whether text on top of this swatch should be light. */
const isDark = (token: string) => token === "black" || Number(token.split("-")[1]) >= 500

/**
 * A color field with the full Tailwind palette (tailwindcss.com/docs/colors). It looks like a
 * select: a button showing the current color that opens an anchored popup, never a modal.
 * The value is a Tailwind color token such as "blue-500", "white" or "black"; "" means none.
 */
export function ColorInput({
  value,
  onChange,
  placeholder = "Pick a color",
  clearable = true,
  className,
}: {
  value: string
  onChange: (token: string) => void
  placeholder?: string
  /** Show a Clear button that sets the value to "". Turn off for colors that must have a value. */
  clearable?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const choose = (token: string) => {
    onChange(token)
    setOpen(false)
  }

  // One tab stop in the grid (the selected swatch, else the first); arrows move within it.
  const stop = Math.max(0, CELLS.indexOf(value))
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS }[e.key]
    if (!step) return
    const current = Number((document.activeElement as HTMLElement | null)?.dataset.i)
    if (Number.isNaN(current)) return
    e.preventDefault()
    const next = current + step
    if (next < 0 || next >= CELLS.length) return
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-i="${next}"]`)?.focus()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" className={cn("w-56 justify-start font-normal", className)} />}
      >
        <span
          aria-hidden
          className={cn(
            "size-4 shrink-0 rounded-sm border border-neutral-300",
            value ? `bg-${value}` : "border-dashed bg-white"
          )}
        />
        <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] gap-3 overflow-x-auto p-3">
        <div className="flex items-center gap-2">
          {["white", "black"].map((token) => (
            <button
              key={token}
              type="button"
              aria-label={token}
              aria-pressed={value === token}
              onMouseEnter={() => setHovered(token)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(token)}
              onBlur={() => setHovered(null)}
              onClick={() => choose(token)}
              className={cn(
                "flex size-6 items-center justify-center rounded-sm border border-neutral-300 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                `bg-${token}`,
                value === token && "ring-2 ring-neutral-900 ring-offset-1"
              )}
            >
              {value === token && <CheckIcon className={cn("size-3.5", token === "white" ? "text-black" : "text-white")} />}
            </button>
          ))}
          <span className="ml-1 min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {hovered ?? (value || "none")}
          </span>
          {value && clearable && (
            <Button type="button" variant="ghost" size="xs" onClick={() => choose("")}>
              Clear
            </Button>
          )}
        </div>

        <div
          role="grid"
          aria-label="Tailwind color palette"
          onKeyDown={onKeyDown}
          className="grid w-max gap-0.5"
          style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1.5rem)` }}
        >
          {CELLS.map((token, i) => (
            <button
              key={token}
              type="button"
              data-i={i}
              tabIndex={i === stop ? 0 : -1}
              aria-label={token}
              aria-pressed={value === token}
              title={token}
              onMouseEnter={() => setHovered(token)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(token)}
              onBlur={() => setHovered(null)}
              onClick={() => choose(token)}
              className={cn(
                "flex size-6 items-center justify-center rounded-sm outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring",
                `bg-${token}`,
                value === token && "ring-2 ring-neutral-900 ring-offset-1"
              )}
            >
              {value === token && (
                <CheckIcon className={cn("size-3.5", isDark(token) ? "text-white" : "text-neutral-900")} />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
