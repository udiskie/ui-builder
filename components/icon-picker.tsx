"use client"

import { useMemo, useState } from "react"

import { IconView, usePack } from "@/components/icon-view"
import { OptionSelect } from "@/components/property-controls"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGlobals } from "@/lib/globals-store"
import { ICON_PACK_KEYS, iconPack, packOfIcon } from "@/lib/icon-packs"
import { cn } from "@/lib/utils"

const MAX_RESULTS = 96

/** Search and pick a react-icons icon. Opens on the icon's own library, else the global default. */
export function IconField({
  value,
  onChange,
  optional = false,
}: {
  value: string
  onChange: (name: string) => void
  /** Show a "No icon" button that clears the value. */
  optional?: boolean
}) {
  const globals = useGlobals()
  const [lib, setLib] = useState(packOfIcon(value)?.key ?? globals.iconLibrary)
  const [query, setQuery] = useState("")
  const pack = iconPack(lib)
  const mod = usePack(pack.key)

  const names = useMemo(
    () =>
      mod
        ? Object.keys(mod).filter(
            (k) => k.startsWith(pack.prefix) && /^[A-Z0-9]/.test(k[pack.prefix.length] ?? "") && typeof mod[k] === "function"
          )
        : [],
    [mod, pack.prefix]
  )
  const q = query.trim().toLowerCase().replace(/\s+/g, "")
  const matches = useMemo(
    () => names.filter((n) => !q || n.slice(pack.prefix.length).toLowerCase().includes(q)),
    [names, q, pack.prefix]
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-md border bg-neutral-50 p-2">
        <IconView name={value} className="size-6" />
        <span className="min-w-0 flex-1 truncate text-sm">{value || "No icon"}</span>
        {optional && value && (
          <Button type="button" variant="ghost" size="xs" onClick={() => onChange("")}>
            Remove
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <OptionSelect<string>
          label="Icon library"
          value={lib}
          options={ICON_PACK_KEYS}
          format={(k) => iconPack(k).label}
          onChange={setLib}
        />
        <Input
          type="search"
          aria-label="Search icons"
          placeholder="Search icons..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter here is part of searching, not "save the dialog".
            if (e.key === "Enter") e.preventDefault()
          }}
        />
      </div>
      <div className="grid max-h-56 grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 overflow-y-auto rounded-md border p-1">
        {!mod && <p className="col-span-full p-2 text-xs text-neutral-500">Loading {pack.label} icons…</p>}
        {mod && matches.length === 0 && (
          <p className="col-span-full p-2 text-xs text-neutral-500">No icons match &ldquo;{query}&rdquo;.</p>
        )}
        {matches.slice(0, MAX_RESULTS).map((name) => {
          const Icon = mod![name]
          return (
            <button
              key={name}
              type="button"
              title={name.slice(pack.prefix.length)}
              aria-label={name}
              aria-pressed={name === value}
              onClick={() => onChange(name)}
              className={cn(
                "flex size-10 items-center justify-center rounded-md hover:bg-neutral-100",
                name === value && "bg-neutral-900 text-white hover:bg-neutral-900"
              )}
            >
              <Icon className="size-5" aria-hidden />
            </button>
          )
        })}
      </div>
      {matches.length > MAX_RESULTS && (
        <p className="text-xs text-neutral-500">
          Showing {MAX_RESULTS} of {matches.length}. Type to narrow the results.
        </p>
      )}
    </div>
  )
}
