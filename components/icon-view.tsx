"use client"

import { useEffect, useSyncExternalStore } from "react"
import type { IconType } from "react-icons"

import { DEFAULT_ICON_PACK, packOfIcon } from "@/lib/icon-packs"
import { cn } from "@/lib/utils"

type PackModule = Record<string, IconType>

/** Each icon set is its own chunk, loaded only when a design (or the picker) uses it. */
const LOADERS: Record<string, () => Promise<unknown>> = {
  lu: () => import("react-icons/lu"),
  fi: () => import("react-icons/fi"),
  tb: () => import("react-icons/tb"),
  pi: () => import("react-icons/pi"),
  hi2: () => import("react-icons/hi2"),
  fa6: () => import("react-icons/fa6"),
  md: () => import("react-icons/md"),
  ri: () => import("react-icons/ri"),
  bs: () => import("react-icons/bs"),
  io5: () => import("react-icons/io5"),
  rx: () => import("react-icons/rx"),
}

const modules = new Map<string, PackModule>()
const requested = new Set<string>()
const listeners = new Set<() => void>()

function loadPack(key: string) {
  if (requested.has(key) || !LOADERS[key]) return
  requested.add(key)
  LOADERS[key]().then((m) => {
    modules.set(key, m as PackModule)
    listeners.forEach((l) => l())
  })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/** The loaded react-icons module for a pack key, or undefined while it loads. */
export function usePack(key: string): PackModule | undefined {
  useEffect(() => loadPack(key), [key])
  return useSyncExternalStore(subscribe, () => modules.get(key), () => undefined)
}

/** Renders a react-icons icon by export name (e.g. "LuHeart"); sized and colored via className. */
export function IconView({ name, className }: { name: string; className?: string }) {
  const pack = packOfIcon(name)
  const mod = usePack(pack?.key ?? DEFAULT_ICON_PACK)
  const Icon = pack ? mod?.[name] : undefined
  return Icon ? <Icon className={className} aria-hidden /> : <span className={cn("inline-block", className)} aria-hidden />
}
