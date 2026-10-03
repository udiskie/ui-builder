"use client"

import { useGlobals } from "@/lib/globals-store"
import { containerClasses, pageClasses } from "@/lib/tailwind"
import { cn } from "@/lib/utils"

/** The page frame shared by the editor and the preview: applies the global properties. */
export function PageShell({ className, children, ...props }: React.ComponentProps<"main">) {
  const globals = useGlobals()
  return (
    <main
      {...props}
      className={cn("relative min-h-svh", pageClasses(globals), className)}
    >
      <div className={cn("mx-auto w-full", containerClasses(globals))}>{children}</div>
    </main>
  )
}
