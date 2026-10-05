"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

export type PanelItem = {
  label: string
  icon?: React.ReactNode
  destructive?: boolean
  onSelect: () => void
}

/**
 * A small menu opened at the cursor by a secondary click. It closes on selection, Escape,
 * an outside click, scroll or resize, and supports arrow-key navigation.
 */
export function ContextPanel({
  x,
  y,
  title,
  items,
  onClose,
}: {
  x: number
  y: number
  title?: string
  items: PanelItem[]
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })

  // Keep the panel inside the viewport.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setPos({
      left: Math.max(8, Math.min(x, window.innerWidth - width - 8)),
      top: Math.max(8, Math.min(y, window.innerHeight - height - 8)),
    })
  }, [x, y])

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus()
  }, [])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", onClose)
    window.addEventListener("scroll", onClose, true)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onClose)
      window.removeEventListener("scroll", onClose, true)
    }
  }, [onClose])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    e.preventDefault()
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = e.key === "ArrowDown" ? i + 1 : i - 1
    buttons[(next + buttons.length) % buttons.length]?.focus()
  }

  return createPortal(
    <div
      ref={ref}
      role="menu"
      data-editor-ui
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      style={pos}
      className="fixed z-[60] min-w-48 rounded-lg border border-neutral-200 bg-white p-1 text-sm text-neutral-900 shadow-lg"
    >
      {title && (
        <div className="px-2 py-1.5 text-xs font-medium text-neutral-500 select-none">{title}</div>
      )}
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={() => {
            onClose()
            item.onSelect()
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100 [&_svg]:size-4",
            item.destructive && "text-red-600 hover:bg-red-50 focus-visible:bg-red-50"
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  )
}
