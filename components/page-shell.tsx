"use client"

import { useEffect } from "react"

import { useGlobals } from "@/lib/globals-store"
import { fontStack, loadGoogleFont } from "@/lib/google-fonts"
import { containerClasses, pageClasses } from "@/lib/tailwind"
import { cn } from "@/lib/utils"

/** The page frame shared by the editor and the preview: applies the global properties. */
export function PageShell({ className, style, children, ...props }: React.ComponentProps<"main">) {
  const globals = useGlobals()
  const { headingFont, bodyFont, font } = globals

  useEffect(() => {
    if (headingFont) void loadGoogleFont(headingFont)
    if (bodyFont) void loadGoogleFont(bodyFont)
  }, [headingFont, bodyFont])

  const generic = font === "serif" ? "serif" : font === "mono" ? "monospace" : "sans-serif"
  return (
    <main
      {...props}
      data-ui-heading-font={headingFont ? "" : undefined}
      style={
        {
          ...style,
          ...(bodyFont && { fontFamily: fontStack(bodyFont, generic) }),
          ...(headingFont && { "--ui-heading-font": fontStack(headingFont, generic) }),
        } as React.CSSProperties
      }
      className={cn("relative min-h-svh", pageClasses(globals), className)}
    >
      <div className={cn("mx-auto w-full", containerClasses(globals))}>{children}</div>
    </main>
  )
}
