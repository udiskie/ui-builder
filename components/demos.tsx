"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"

/** Filterable, sortable table (a lightweight take on the shadcn Data Table recipe). */
export function DataTableDemo({
  placeholder,
  columns,
  rows,
}: {
  placeholder: string
  columns: string[]
  rows: string[][]
}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<{ col: number; asc: boolean } | null>(null)
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = rows.filter((r) => !q || r.some((v) => v.toLowerCase().includes(q)))
    if (!sort) return filtered
    return [...filtered].sort(
      (a, b) => (sort.asc ? 1 : -1) * (a[sort.col] ?? "").localeCompare(b[sort.col] ?? "", undefined, { numeric: true })
    )
  }, [rows, query, sort])

  return (
    <div className="flex w-full flex-col gap-2">
      <Input placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c, i) => (
                <TableHead key={i}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSort((s) => ({ col: i, asc: s?.col === i ? !s.asc : true }))}
                  >
                    {c} {sort?.col === i ? (sort.asc ? "↑" : "↓") : ""}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(1, columns.length)} className="text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
            {shown.map((r, i) => (
              <TableRow key={i}>
                {r.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function DatePickerDemo({ placeholder }: { placeholder: string }) {
  const [date, setDate] = useState<Date | undefined>()
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="w-56 justify-start" />}>
        <CalendarIcon />
        {date ? format(date, "PPP") : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}

export function ToastDemo({ label }: { label: string }) {
  return (
    <Button
      variant="outline"
      onClick={() => toast.add({ title: label, description: "This is a toast notification." })}
    >
      Show toast
    </Button>
  )
}
