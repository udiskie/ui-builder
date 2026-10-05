import { withIcon } from "@/components/icon-view"
import { CATALOG_MORE } from "@/lib/catalog-more"
import {
  dataList,
  dataNumber,
  dataPairs,
  dataTable,
  ICON_DEFAULTS,
  ICON_FIELDS,
  slot,
  type CatalogEntry,
} from "@/lib/catalog-types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const outline = <Button variant="outline" />

export const CATALOG: CatalogEntry[] = [
  { type: "heading", label: "Heading", field: "Text", initial: "Heading", render: (t, _k, d) => <h2 className="text-2xl font-semibold">{withIcon(t, d)}</h2> },
  { type: "text", label: "Text", field: "Text", initial: "Some text", render: (t, _k, d) => <p className="text-sm">{withIcon(t, d)}</p> },
  { type: "button", label: "Button", field: "Label", initial: "Click me", render: (t, _k, d) => <Button>{withIcon(t, d)}</Button> },
  { type: "button-group", label: "Button Group", field: "Unused", initial: "",
    fields: [{ key: "buttons", label: "Buttons", kind: "list" }],
    defaults: { buttons: ["Option 1", "Option 2", "Option 3"] },
    render: (_t, _k, d) => (
      <ButtonGroup>
        {dataList(d, "buttons").map((b, i) => <Button key={i} variant="outline">{b}</Button>)}
      </ButtonGroup>
    ) },
  { type: "input", label: "Input", field: "Placeholder", initial: "Type here...", render: (t) => <Input placeholder={t} /> },
  { type: "input-group", label: "Input Group", field: "Prefix", initial: "https://", render: (t) => (
    <InputGroup>
      <InputGroupAddon>{t}</InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ) },
  { type: "input-otp", label: "Input OTP", field: "Label", initial: "Verification code",
    fields: [{ key: "length", label: "Digits", kind: "number", min: 2, max: 8 }],
    defaults: { length: 4 },
    render: (t, _k, d) => {
      const length = Math.min(8, Math.max(2, dataNumber(d, "length", 4)))
      return (
        <div className="flex flex-col gap-2">
          <Label>{t}</Label>
          <InputOTP key={length} maxLength={length}>
            <InputOTPGroup>
              {Array.from({ length }, (_, i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
      )
    } },
  { type: "textarea", label: "Textarea", field: "Placeholder", initial: "Write a message...", render: (t) => <Textarea placeholder={t} /> },
  { type: "label", label: "Label", field: "Text", initial: "Label", render: (t, _k, d) => <Label>{withIcon(t, d)}</Label> },
  { type: "field", label: "Field", field: "Label", initial: "Email", render: (t) => (
    <Field>
      <FieldLabel>{t}</FieldLabel>
      <Input placeholder={t} />
      <FieldDescription>Helper text for {t.toLowerCase()}.</FieldDescription>
    </Field>
  ) },
  { type: "checkbox", label: "Checkbox", field: "Label", initial: "Accept terms", render: (t) => (
    <Label><Checkbox /> {t}</Label>
  ) },
  { type: "switch", label: "Switch", field: "Label", initial: "Airplane mode", render: (t) => (
    <Label><Switch /> {t}</Label>
  ) },
  { type: "radio-group", label: "Radio Group", field: "Unused", initial: "",
    fields: [{ key: "options", label: "Options", kind: "list" }],
    defaults: { options: ["Option 1", "Option 2"] },
    render: (_t, _k, d) => {
      const options = dataList(d, "options")
      return (
        <RadioGroup key={options.join("|")} defaultValue={options[0]}>
          {options.map((o, i) => (
            <Label key={i}><RadioGroupItem value={o} /> {o}</Label>
          ))}
        </RadioGroup>
      )
    } },
  { type: "select", label: "Select", field: "Placeholder", initial: "Pick one",
    fields: [{ key: "options", label: "Options", kind: "list" }],
    defaults: { options: ["Option A", "Option B"] },
    render: (t, _k, d) => {
      const options = [...new Set(dataList(d, "options"))]
      return (
        <Select items={options.map((o) => ({ value: o, label: o }))}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t} /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      )
    } },
  { type: "native-select", label: "Native Select", field: "Unused", initial: "",
    fields: [{ key: "options", label: "Options", kind: "list" }],
    defaults: { options: ["Option A", "Option B"] },
    render: (_t, _k, d) => (
      <NativeSelect>
        {dataList(d, "options").map((o, i) => <NativeSelectOption key={i}>{o}</NativeSelectOption>)}
      </NativeSelect>
    ) },
  { type: "slider", label: "Slider", field: "Label", initial: "Volume",
    fields: [
      { key: "min", label: "Minimum", kind: "number" },
      { key: "max", label: "Maximum", kind: "number" },
      { key: "value", label: "Initial value", kind: "number" },
      { key: "step", label: "Step", kind: "number", min: 1 },
    ],
    defaults: { min: 0, max: 100, value: 50, step: 1 },
    render: (t, _k, d) => {
      const min = dataNumber(d, "min", 0)
      const max = Math.max(min + 1, dataNumber(d, "max", 100))
      const step = Math.max(1, dataNumber(d, "step", 1))
      const value = Math.min(max, Math.max(min, dataNumber(d, "value", 50)))
      return (
        <div className="flex w-full flex-col gap-2">
          <Label>{t}</Label>
          <Slider key={`${min}-${max}-${step}-${value}`} min={min} max={max} step={step} defaultValue={[value]} />
        </div>
      )
    } },
  { type: "toggle", label: "Toggle", field: "Label", initial: "Bold", render: (t, _k, d) => <Toggle variant="outline">{withIcon(t, d)}</Toggle> },
  { type: "toggle-group", label: "Toggle Group", field: "Unused", initial: "",
    fields: [{ key: "items", label: "Items", kind: "list" }],
    defaults: { items: ["Item 1", "Item 2", "Item 3"] },
    render: (_t, _k, d) => (
      <ToggleGroup variant="outline">
        {dataList(d, "items").map((n, i) => <ToggleGroupItem key={i} value={n}>{n}</ToggleGroupItem>)}
      </ToggleGroup>
    ) },
  { type: "calendar", label: "Calendar", field: "Unused", initial: "", render: () => <Calendar mode="single" /> },
  { type: "badge", label: "Badge", field: "Text", initial: "Badge", render: (t, _k, d) => <Badge>{withIcon(t, d)}</Badge> },
  { type: "kbd", label: "Kbd", field: "Keys", initial: "Ctrl", render: (t) => <Kbd>{t}</Kbd> },
  { type: "avatar", label: "Avatar", field: "Initials", initial: "AB", render: (t) => (
    <Avatar><AvatarFallback>{t}</AvatarFallback></Avatar>
  ) },
  { type: "alert", label: "Alert", field: "Title", initial: "Heads up!", container: true, render: (t, kids, d) => (
    <Alert><AlertTitle>{withIcon(t, d)}</AlertTitle><AlertDescription>{slot(kids, "You can add components to your app.")}</AlertDescription></Alert>
  ) },
  { type: "card", label: "Card", field: "Title", initial: "Card title", container: true, render: (t, kids, d) => (
    <Card className="w-full">
      <CardHeader><CardTitle>{withIcon(t, d)}</CardTitle><CardDescription>Card description</CardDescription></CardHeader>
      <CardContent>{slot(kids, "Card content")}</CardContent>
    </Card>
  ) },
  { type: "item", label: "Item", field: "Title", initial: "Item title", container: true, render: (t, kids, d) => (
    <Item variant="outline" className="w-full">
      <ItemContent><ItemTitle>{withIcon(t, d)}</ItemTitle><ItemDescription>Item description</ItemDescription>{kids}</ItemContent>
    </Item>
  ) },
  { type: "empty", label: "Empty", field: "Title", initial: "Nothing here yet", container: true, render: (t, kids, d) => (
    <Empty><EmptyHeader><EmptyTitle>{withIcon(t, d)}</EmptyTitle><EmptyDescription>Add something to get started.</EmptyDescription></EmptyHeader>{kids && <EmptyContent>{kids}</EmptyContent>}</Empty>
  ) },
  { type: "separator", label: "Separator", field: "Unused", initial: "", render: () => <Separator className="w-full" /> },
  { type: "progress", label: "Progress", field: "Label", initial: "Uploading",
    fields: [{ key: "value", label: "Value (%)", kind: "number", min: 0, max: 100 }],
    defaults: { value: 60 },
    render: (t, _k, d) => (
      <div className="flex w-full flex-col gap-2">
        <Label>{t}</Label>
        <Progress value={Math.min(100, Math.max(0, dataNumber(d, "value", 60)))} />
      </div>
    ) },
  { type: "skeleton", label: "Skeleton", field: "Unused", initial: "", render: () => <Skeleton className="h-10 w-full" /> },
  { type: "spinner", label: "Spinner", field: "Unused", initial: "", render: () => <Spinner /> },
  { type: "tabs", label: "Tabs", field: "Unused", initial: "", container: true,
    fields: [{ key: "tabs", label: "Tabs", kind: "pairs", a: "Tab label", b: "Content" }],
    defaults: { tabs: [{ a: "Account", b: "Account content" }, { a: "Password", b: "Password content" }] },
    render: (_t, kids, d) => {
      const tabs = dataPairs(d, "tabs")
      return (
        <Tabs key={tabs.length} defaultValue="0" className="w-full">
          <TabsList>
            {tabs.map((tab, i) => <TabsTrigger key={i} value={String(i)}>{tab.a}</TabsTrigger>)}
          </TabsList>
          {tabs.map((tab, i) => (
            <TabsContent key={i} value={String(i)}>{tab.b}{i === 0 && kids}</TabsContent>
          ))}
        </Tabs>
      )
    } },
  { type: "accordion", label: "Accordion", field: "Unused", initial: "", container: true,
    fields: [{ key: "items", label: "Items", kind: "pairs", a: "Title", b: "Content" }],
    defaults: { items: [
      { a: "Is it accessible?", b: "Yes. It follows the WAI-ARIA pattern." },
      { a: "Is it styled?", b: "Yes. It comes with default styles." },
    ] },
    render: (_t, kids, d) => (
      <Accordion className="w-full">
        {dataPairs(d, "items").map((it, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger>{it.a}</AccordionTrigger>
            <AccordionContent>{it.b}{i === 0 && kids}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ) },
  { type: "collapsible", label: "Collapsible", field: "Trigger", initial: "Toggle", container: true, render: (t, kids) => (
    <Collapsible><CollapsibleTrigger render={outline}>{t}</CollapsibleTrigger><CollapsibleContent className="pt-2 text-sm">{slot(kids, "Hidden content")}</CollapsibleContent></Collapsible>
  ) },
  { type: "table", label: "Table", field: "Unused", initial: "",
    fields: [{ key: "table", label: "Table", kind: "table" }],
    defaults: { table: { columns: ["Name", "Status"], rows: [["Row 1", "Active"], ["Row 2", "Idle"]] } },
    render: (_t, _k, d) => {
      const { columns, rows } = dataTable(d, "table")
      return (
        <Table>
          <TableHeader><TableRow>{columns.map((c, i) => <TableHead key={i}>{c}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>{r.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}</TableRow>
            ))}
          </TableBody>
        </Table>
      )
    } },
  { type: "breadcrumb", label: "Breadcrumb", field: "Unused", initial: "",
    fields: [{ key: "items", label: "Pages (last is current)", kind: "list" }],
    defaults: { items: ["Home", "Components", "Page"] },
    render: (_t, _k, d) => {
      const items = dataList(d, "items")
      return (
        <Breadcrumb><BreadcrumbList>
          {items.map((it, i) => (
            <span key={i} className="contents">
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {i === items.length - 1 ? <BreadcrumbPage>{it}</BreadcrumbPage> : <BreadcrumbLink href="#">{it}</BreadcrumbLink>}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList></Breadcrumb>
      )
    } },
  { type: "pagination", label: "Pagination", field: "Unused", initial: "",
    fields: [
      { key: "pages", label: "Pages", kind: "number", min: 1, max: 20 },
      { key: "current", label: "Current page", kind: "number", min: 1, max: 20 },
    ],
    defaults: { pages: 5, current: 1 },
    render: (_t, _k, d) => {
      const pages = Math.min(20, Math.max(1, dataNumber(d, "pages", 5)))
      const current = Math.min(pages, Math.max(1, dataNumber(d, "current", 1)))
      return (
        <Pagination><PaginationContent>
          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
          {Array.from({ length: pages }, (_, i) => (
            <PaginationItem key={i}><PaginationLink href="#" isActive={i + 1 === current}>{i + 1}</PaginationLink></PaginationItem>
          ))}
          <PaginationItem><PaginationNext href="#" /></PaginationItem>
        </PaginationContent></Pagination>
      )
    } },
  { type: "carousel", label: "Carousel", field: "Unused", initial: "",
    fields: [{ key: "slides", label: "Slides", kind: "list" }],
    defaults: { slides: ["Slide 1", "Slide 2", "Slide 3"] },
    render: (_t, _k, d) => (
      <Carousel className="mx-10 w-full max-w-xs">
        <CarouselContent>
          {dataList(d, "slides").map((s, i) => (
            <CarouselItem key={i}><div className="flex h-24 items-center justify-center rounded-md border">{s}</div></CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious /><CarouselNext />
      </Carousel>
    ) },
  { type: "scroll-area", label: "Scroll Area", field: "Line text", initial: "Scrollable line", container: true, render: (t, kids) => (
    <ScrollArea className="h-24 w-full rounded-md border p-2 text-sm">
      {slot(kids, Array.from({ length: 12 }, (_, i) => <div key={i}>{t} {i + 1}</div>))}
    </ScrollArea>
  ) },
  { type: "tooltip", label: "Tooltip", field: "Tooltip text", initial: "Helpful hint", render: (t) => (
    <Tooltip><TooltipTrigger render={outline}>Hover me</TooltipTrigger><TooltipContent>{t}</TooltipContent></Tooltip>
  ) },
  { type: "popover", label: "Popover", field: "Content", initial: "Popover content", container: true, render: (t, kids) => (
    <Popover><PopoverTrigger render={outline}>Open popover</PopoverTrigger><PopoverContent>{t}{kids}</PopoverContent></Popover>
  ) },
  { type: "hover-card", label: "Hover Card", field: "Content", initial: "Hover card content", container: true, render: (t, kids) => (
    <HoverCard><HoverCardTrigger render={outline}>Hover me</HoverCardTrigger><HoverCardContent>{t}{kids}</HoverCardContent></HoverCard>
  ) },
  { type: "dropdown-menu", label: "Dropdown Menu", field: "Trigger", initial: "Open menu",
    fields: [{ key: "items", label: "Menu items", kind: "list" }],
    defaults: { items: ["Profile", "Settings"] },
    render: (t, _k, d) => (
      <DropdownMenu><DropdownMenuTrigger render={outline}>{withIcon(t, d)}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {dataList(d, "items").map((it, i) => <DropdownMenuItem key={i}>{it}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  { type: "dialog", label: "Dialog", field: "Title", initial: "Dialog title", container: true, render: (t, kids, d) => (
    <Dialog><DialogTrigger render={outline}>Open dialog</DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>{withIcon(t, d)}</DialogTitle><DialogDescription>Dialog description.</DialogDescription></DialogHeader>{kids}</DialogContent>
    </Dialog>
  ) },
  { type: "alert-dialog", label: "Alert Dialog", field: "Title", initial: "Are you sure?", container: true, render: (t, kids, d) => (
    <AlertDialog><AlertDialogTrigger render={outline}>Open alert dialog</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{withIcon(t, d)}</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        {kids}
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) },
  { type: "sheet", label: "Sheet", field: "Title", initial: "Sheet title", container: true, render: (t, kids, d) => (
    <Sheet><SheetTrigger render={outline}>Open sheet</SheetTrigger>
      <SheetContent><SheetHeader><SheetTitle>{withIcon(t, d)}</SheetTitle><SheetDescription>Sheet description.</SheetDescription></SheetHeader>{kids && <div className="px-4">{kids}</div>}</SheetContent>
    </Sheet>
  ) },
]

export { slot, type CatalogEntry }

CATALOG.push(...CATALOG_MORE)

/** Components whose text can carry an icon beside it (data keys `icon` and `iconPosition`). */
const WITH_ICON = new Set([
  "heading", "text", "button", "label", "toggle", "badge", "alert", "card", "item", "empty",
  "dropdown-menu", "dialog", "alert-dialog", "sheet", "drawer", "toast",
  "typography-h1", "typography-h2", "typography-h3", "typography-h4", "typography-p",
  "typography-lead", "typography-blockquote", "typography-muted",
])
CATALOG.forEach((e, i) => {
  if (WITH_ICON.has(e.type)) {
    CATALOG[i] = { ...e, fields: [...(e.fields ?? []), ...ICON_FIELDS], defaults: { ...ICON_DEFAULTS, ...e.defaults } }
  }
})

export const CATALOG_BY_TYPE = new Map(CATALOG.map((c) => [c.type, c]))
