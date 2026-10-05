/** Google Fonts family names: letters, digits and spaces (e.g. "Playfair Display", "M PLUS 1p"). */
export const FONT_NAME = /^[A-Za-z0-9][A-Za-z0-9 ]{0,59}$/

/** A short list of popular families offered as suggestions; any Google Fonts family works. */
export const POPULAR_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito", "Raleway",
  "Source Sans 3", "Work Sans", "DM Sans", "Manrope", "Outfit", "Plus Jakarta Sans",
  "Rubik", "Karla", "Barlow", "IBM Plex Sans", "Noto Sans", "Fira Sans",
  "Playfair Display", "Merriweather", "Lora", "Crimson Text", "Libre Baskerville",
  "DM Serif Display", "Bebas Neue", "Oswald", "Anton", "Abril Fatface",
  "Pacifico", "Dancing Script", "Caveat", "Roboto Mono", "JetBrains Mono",
  "Fira Code", "Space Grotesk", "Space Mono", "Archivo", "Sora",
]

const url = (family: string, weights: boolean) =>
  `https://fonts.googleapis.com/css2?family=${family.trim().replace(/ +/g, "+")}${
    weights ? ":wght@400;500;600;700" : ""
  }&display=swap`

/** Stylesheet URL for a family, for readers of the exported design. */
export const fontStylesheetUrl = (family: string) => url(family, true)

const loaded = new Map<string, Promise<boolean>>()

function addStylesheet(href: string): Promise<boolean> {
  return new Promise((resolve) => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.onload = () => resolve(true)
    link.onerror = () => {
      link.remove()
      resolve(false)
    }
    document.head.appendChild(link)
  })
}

/**
 * Adds the family's stylesheet to the page once. Resolves false if Google Fonts doesn't know it.
 * Weights 400-700 are requested first; families that lack some of them (the request 400s) fall
 * back to their default weight.
 */
export function loadGoogleFont(family: string): Promise<boolean> {
  const name = family.trim()
  if (!FONT_NAME.test(name) || typeof document === "undefined") return Promise.resolve(false)
  let p = loaded.get(name)
  if (!p) {
    p = addStylesheet(url(name, true)).then((ok) => ok || addStylesheet(url(name, false)))
    loaded.set(name, p)
    p.then((ok) => ok || loaded.delete(name))
  }
  return p
}

/** CSS font stack for a loaded family, falling back to a generic family. */
export const fontStack = (family: string, generic: "sans-serif" | "serif" | "monospace") =>
  `"${family}", ${generic}`
