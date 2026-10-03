"use client"

import { LayoutView } from "@/components/layout-view"
import { PageShell } from "@/components/page-shell"
import { useLayouts } from "@/lib/layout-store"

export default function PreviewPage() {
  const layouts = useLayouts()
  return (
    <PageShell>
      <LayoutView layouts={layouts} />
    </PageShell>
  )
}
