/** Icon sets from react-icons that the editor offers. Icon names are the react-icons export names. */
export const ICON_PACKS = [
  { key: "lu", prefix: "Lu", label: "Lucide" },
  { key: "fi", prefix: "Fi", label: "Feather" },
  { key: "tb", prefix: "Tb", label: "Tabler" },
  { key: "pi", prefix: "Pi", label: "Phosphor" },
  { key: "hi2", prefix: "Hi2", label: "Heroicons 2" },
  { key: "fa6", prefix: "Fa6", label: "Font Awesome 6" },
  { key: "md", prefix: "Md", label: "Material Design" },
  { key: "ri", prefix: "Ri", label: "Remix" },
  { key: "bs", prefix: "Bs", label: "Bootstrap" },
  { key: "io5", prefix: "Io5", label: "Ionicons 5" },
  { key: "rx", prefix: "Rx", label: "Radix" },
] as const

export type IconPackKey = (typeof ICON_PACKS)[number]["key"]

/** Lucide is the default library. */
export const DEFAULT_ICON_PACK: IconPackKey = "lu"

export const ICON_PACK_KEYS: string[] = ICON_PACKS.map((p) => p.key)

export const iconPack = (key: string) => ICON_PACKS.find((p) => p.key === key) ?? ICON_PACKS[0]

/** Which pack an icon name such as "LuHeart" or "Fa6Solid…" belongs to. */
export function packOfIcon(name: string) {
  return ICON_PACKS.find((p) => name.startsWith(p.prefix) && /^[A-Z0-9]/.test(name[p.prefix.length] ?? ""))
}
