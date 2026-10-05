import { FileTextIcon } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { IconView, withIcon } from "@/components/icon-view"
import { ColorPickerDemo, DataTableDemo, DatePickerDemo, ToastDemo } from "@/components/demos"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { DirectionProvider } from "@/components/ui/direction"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  dataList,
  dataPairs,
  dataPoints,
  dataString,
  dataTable,
  slot,
  splitCsv,
  type CatalogEntry,
} from "@/lib/catalog-types"
import { ICON_SIZE } from "@/lib/tailwind"

const outline = <Button variant="outline" />

export const CATALOG_MORE: CatalogEntry[] = [
  { type: "icon", label: "Icon", field: "Unused", initial: "",
    fields: [
      { key: "icon", label: "Icon", kind: "icon" },
      { key: "size", label: "Size", kind: "select", options: Object.keys(ICON_SIZE) },
    ],
    defaults: { icon: "LuStar", size: "6" },
    render: (_t, _k, d) => {
      const size = dataString(d, "size", "6") as keyof typeof ICON_SIZE
      return <IconView name={dataString(d, "icon", "LuStar")} className={ICON_SIZE[size] ?? ICON_SIZE["6"]} />
    } },
  { type: "aspect-ratio", label: "Aspect Ratio", field: "Placeholder", initial: "16:9", container: true,
    fields: [{ key: "ratio", label: "Ratio", kind: "select", options: ["16:9", "4:3", "3:2", "1:1", "21:9"] }],
    defaults: { ratio: "16:9" },
    render: (t, kids, d) => {
      const [w, h] = dataString(d, "ratio", "16:9").split(":").map(Number)
      return (
        <AspectRatio ratio={w / h} className="flex w-full items-center justify-center overflow-hidden rounded-md bg-muted text-sm text-muted-foreground">
          {slot(kids, t)}
        </AspectRatio>
      )
    } },
  { type: "attachment", label: "Attachment", field: "File name", initial: "report.pdf", render: (t) => (
    <Attachment>
      <AttachmentMedia><FileTextIcon /></AttachmentMedia>
      <AttachmentContent><AttachmentTitle>{t}</AttachmentTitle><AttachmentDescription>PDF · 2 MB</AttachmentDescription></AttachmentContent>
    </Attachment>
  ) },
  { type: "bubble", label: "Bubble", field: "Message", initial: "Hello there!", render: (t) => (
    <BubbleGroup><Bubble><BubbleContent>{t}</BubbleContent></Bubble></BubbleGroup>
  ) },
  { type: "message", label: "Message", field: "Message", initial: "How can I help?", render: (t) => (
    <Message>
      <MessageAvatar><Avatar><AvatarFallback>AI</AvatarFallback></Avatar></MessageAvatar>
      <MessageContent>
        <MessageHeader>Assistant</MessageHeader>
        <Bubble variant="secondary"><BubbleContent>{t}</BubbleContent></Bubble>
      </MessageContent>
    </Message>
  ) },
  { type: "message-scroller", label: "Message Scroller", field: "Sample message", initial: "Message", container: true, render: (t, kids) => (
    <MessageScrollerProvider>
      <MessageScroller className="h-48 w-full rounded-md border">
        <MessageScrollerViewport>
          <MessageScrollerContent className="flex flex-col gap-2 p-2">
            {slot(kids, [1, 2, 3, 4].map((n) => (
              <BubbleGroup key={n}><Bubble variant="muted"><BubbleContent>{t} {n}</BubbleContent></Bubble></BubbleGroup>
            )))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
      </MessageScroller>
    </MessageScrollerProvider>
  ) },
  { type: "marker", label: "Marker", field: "Text", initial: "Today", render: (t) => (
    <Marker variant="separator"><MarkerContent>{t}</MarkerContent></Marker>
  ) },
  { type: "questionnaire", label: "Questionnaire", field: "Unused", initial: "",
    fields: [{ key: "questions", label: "Questions", kind: "pairs", a: "Question", b: "Choices (comma separated)" }],
    defaults: { questions: [{ a: "Do you like shadcn/ui?", b: "Yes, No" }] },
    render: (_t, _k, d) => {
      const questions = dataPairs(d, "questions").map((q, i) => ({ name: `q${i}`, title: q.a, choices: splitCsv(q.b) }))
      return (
        <Questionnaire
          key={JSON.stringify(questions)}
          items={questions.map((q) => ({ name: q.name, choices: q.choices.map((value) => ({ value })) }))}
          onSubmit={(e) => e.preventDefault()}
        >
          <QuestionnaireProgress />
          {questions.map((q) => (
            <QuestionnaireItem key={q.name} name={q.name}>
              <QuestionnaireTitle>{q.title}</QuestionnaireTitle>
              <QuestionnaireChoices>
                {q.choices.map((c) => <QuestionnaireChoice key={c} value={c}>{c}</QuestionnaireChoice>)}
              </QuestionnaireChoices>
            </QuestionnaireItem>
          ))}
          <QuestionnaireActions><QuestionnaireSubmit>Submit</QuestionnaireSubmit></QuestionnaireActions>
        </Questionnaire>
      )
    } },
  { type: "chart", label: "Chart", field: "Series label", initial: "Visitors",
    fields: [
      { key: "chartType", label: "Chart type", kind: "select", options: ["bar", "line", "area"] },
      { key: "color", label: "Color", kind: "select", options: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] },
      { key: "points", label: "Data points", kind: "points" },
    ],
    defaults: {
      chartType: "bar",
      color: "chart-1",
      points: [
        { label: "Jan", value: 186 },
        { label: "Feb", value: 305 },
        { label: "Mar", value: 237 },
        { label: "Apr", value: 173 },
      ],
    },
    render: (t, _k, d) => {
      const kind = dataString(d, "chartType", "bar")
      const color = dataString(d, "color", "chart-1")
      const data = dataPoints(d, "points")
      const common = (
        <>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
        </>
      )
      return (
        <ChartContainer config={{ value: { label: t, color: `var(--${color})` } }} className="h-40 w-full">
          {kind === "line" ? (
            <LineChart data={data}>{common}<Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} /></LineChart>
          ) : kind === "area" ? (
            <AreaChart data={data}>{common}<Area dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.3} /></AreaChart>
          ) : (
            <BarChart data={data}>{common}<Bar dataKey="value" fill="var(--color-value)" radius={4} /></BarChart>
          )}
        </ChartContainer>
      )
    } },
  { type: "combobox", label: "Combobox", field: "Placeholder", initial: "Select a framework",
    fields: [{ key: "items", label: "Options", kind: "list" }],
    defaults: { items: ["Next.js", "SvelteKit", "Nuxt", "Remix", "Astro"] },
    render: (t, _k, d) => {
      const items = [...new Set(dataList(d, "items"))]
      return (
        <Combobox key={items.join("|")} items={items}>
          <ComboboxInput placeholder={t} className="w-56" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )
    } },
  { type: "command", label: "Command", field: "Placeholder", initial: "Type a command or search...",
    fields: [{ key: "items", label: "Commands", kind: "list" }],
    defaults: { items: ["Calendar", "Search", "Settings"] },
    render: (t, _k, d) => (
      <Command className="w-full rounded-lg border">
        <CommandInput placeholder={t} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {dataList(d, "items").map((it, i) => <CommandItem key={i}>{it}</CommandItem>)}
          </CommandGroup>
        </CommandList>
      </Command>
    ) },
  { type: "context-menu", label: "Context Menu", field: "Trigger text", initial: "Right click here",
    fields: [{ key: "items", label: "Menu items", kind: "list" }],
    defaults: { items: ["Back", "Reload", "Inspect"] },
    render: (t, _k, d) => (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-24 w-full items-center justify-center rounded-md border border-dashed text-sm">{t}</ContextMenuTrigger>
        <ContextMenuContent>
          {dataList(d, "items").map((it, i) => <ContextMenuItem key={i}>{it}</ContextMenuItem>)}
        </ContextMenuContent>
      </ContextMenu>
    ) },
  { type: "data-table", label: "Data Table", field: "Filter placeholder", initial: "Filter rows...",
    fields: [{ key: "table", label: "Table", kind: "table" }],
    defaults: { table: {
      columns: ["Name", "Role", "Status"],
      rows: [
        ["Ada Lovelace", "Engineer", "Active"],
        ["Grace Hopper", "Admiral", "Active"],
        ["Alan Turing", "Researcher", "Idle"],
        ["Linus Torvalds", "Maintainer", "Active"],
        ["Margaret Hamilton", "Director", "Idle"],
      ],
    } },
    render: (t, _k, d) => <DataTableDemo placeholder={t} {...dataTable(d, "table")} /> },
  { type: "color-picker", label: "Color Picker", field: "Placeholder", initial: "Pick a color",
    fields: [{ key: "value", label: "Initial color", kind: "color" }],
    defaults: { value: "" },
    render: (t, _k, d) => <ColorPickerDemo key={dataString(d, "value", "")} placeholder={t} initial={dataString(d, "value", "")} /> },
  { type: "date-picker", label: "Date Picker", field: "Placeholder", initial: "Pick a date", render: (t) => <DatePickerDemo placeholder={t} /> },
  { type: "direction", label: "Direction", field: "Direction (ltr or rtl)", initial: "rtl", container: true, render: (t, kids) => {
    const dir = t.trim().toLowerCase() === "ltr" ? "ltr" : "rtl"
    return (
      <DirectionProvider direction={dir}>
        <div dir={dir} className="flex w-full flex-col items-start gap-3">
          {slot(kids, <p className="text-sm">Content rendered {dir}.</p>)}
        </div>
      </DirectionProvider>
    )
  } },
  { type: "drawer", label: "Drawer", field: "Title", initial: "Drawer title", container: true, render: (t, kids, d) => (
    <Drawer>
      <DrawerTrigger render={outline}>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>{withIcon(t, d)}</DrawerTitle><DrawerDescription>Drawer description.</DrawerDescription></DrawerHeader>
        {kids && <div className="px-4 pb-4">{kids}</div>}
      </DrawerContent>
    </Drawer>
  ) },
  { type: "menubar", label: "Menubar", field: "Unused", initial: "",
    fields: [{ key: "menus", label: "Menus", kind: "pairs", a: "Menu", b: "Items (comma separated)" }],
    defaults: { menus: [{ a: "File", b: "New, Open" }, { a: "Edit", b: "Undo, Redo" }] },
    render: (_t, _k, d) => (
      <Menubar>
        {dataPairs(d, "menus").map((m, i) => (
          <MenubarMenu key={i}>
            <MenubarTrigger>{m.a}</MenubarTrigger>
            <MenubarContent>{splitCsv(m.b).map((it) => <MenubarItem key={it}>{it}</MenubarItem>)}</MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    ) },
  { type: "navigation-menu", label: "Navigation Menu", field: "Unused", initial: "",
    fields: [{ key: "menus", label: "Menus", kind: "pairs", a: "Menu", b: "Links (comma separated)" }],
    defaults: { menus: [{ a: "Getting started", b: "Introduction, Installation" }, { a: "Components", b: "Accordion, Alert" }] },
    render: (_t, _k, d) => (
      <NavigationMenu>
        <NavigationMenuList>
          {dataPairs(d, "menus").map((m, i) => (
            <NavigationMenuItem key={i}>
              <NavigationMenuTrigger>{m.a}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1">
                  {splitCsv(m.b).map((l) => <li key={l}><NavigationMenuLink href="#">{l}</NavigationMenuLink></li>)}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    ) },
  { type: "resizable", label: "Resizable", field: "Panel text", initial: "Panel", container: true, render: (t, kids) => (
    <ResizablePanelGroup orientation="horizontal" className="min-h-28 w-full rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-3 text-sm">{slot(kids, `${t} 1`)}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-3 text-sm">{t} 2</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ) },
  { type: "sidebar", label: "Sidebar", field: "Group label", initial: "Application", container: true,
    fields: [{ key: "items", label: "Menu items", kind: "list" }],
    defaults: { items: ["Home", "Inbox", "Settings"] },
    render: (t, kids, d) => (
      <SidebarProvider className="h-64 min-h-0 w-full overflow-hidden rounded-lg border">
        <Sidebar collapsible="none" className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dataList(d, "items").map((n, i) => (
                    <SidebarMenuItem key={i}><SidebarMenuButton>{n}</SidebarMenuButton></SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="p-4 text-sm">{slot(kids, "Main content")}</SidebarInset>
      </SidebarProvider>
    ) },
  { type: "toast", label: "Toast", field: "Toast title", initial: "Event created", render: (t, _k, d) => <ToastDemo label={t} icon={dataString(d, "icon", "")} iconPosition={dataString(d, "iconPosition", "left")} /> },
  { type: "typography-h1", label: "Typography · H1", field: "Text", initial: "Heading 1", render: (t, _k, d) => <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">{withIcon(t, d)}</h1> },
  { type: "typography-h2", label: "Typography · H2", field: "Text", initial: "Heading 2", render: (t, _k, d) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">{withIcon(t, d)}</h2> },
  { type: "typography-h3", label: "Typography · H3", field: "Text", initial: "Heading 3", render: (t, _k, d) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{withIcon(t, d)}</h3> },
  { type: "typography-h4", label: "Typography · H4", field: "Text", initial: "Heading 4", render: (t, _k, d) => <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{withIcon(t, d)}</h4> },
  { type: "typography-p", label: "Typography · Paragraph", field: "Text", initial: "The king, seeing how much happier his subjects were, realized the error of his ways.", render: (t, _k, d) => <p className="leading-7">{withIcon(t, d)}</p> },
  { type: "typography-lead", label: "Typography · Lead", field: "Text", initial: "A modal dialog that interrupts the user with important content.", render: (t, _k, d) => <p className="text-xl text-muted-foreground">{withIcon(t, d)}</p> },
  { type: "typography-blockquote", label: "Typography · Blockquote", field: "Text", initial: "After all, everyone enjoys a good joke.", render: (t, _k, d) => <blockquote className="border-l-2 pl-6 italic">{withIcon(t, d)}</blockquote> },
  { type: "typography-list", label: "Typography · List", field: "Items (comma separated)", initial: "First item, Second item, Third item", render: (t) => (
    <ul className="ml-6 list-disc [&>li]:mt-2">{t.split(",").map((i, n) => <li key={n}>{i.trim()}</li>)}</ul>
  ) },
  { type: "typography-code", label: "Typography · Inline code", field: "Code", initial: "@radix-ui/react-alert-dialog", render: (t) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">{t}</code>
  ) },
  { type: "typography-muted", label: "Typography · Muted", field: "Text", initial: "Enter your email address.", render: (t, _k, d) => <p className="text-sm text-muted-foreground">{withIcon(t, d)}</p> },
]
