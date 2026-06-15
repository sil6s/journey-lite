"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  FileText,
  Globe,
  Images,
  LogOut,
  MapPin,
  Menu,
  MessageSquareQuote,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";

// URL of the Patient LMS admin portal — override with NEXT_PUBLIC_LMS_URL env var
const LMS_URL = process.env.NEXT_PUBLIC_LMS_URL ?? "https://learn.journeylite.com";

const navigation = [
  { title: "Dashboard",           href: "/admin",                icon: BarChart3,   exact: true },
  { title: "Content",             href: "/admin/content",        icon: FileText },
  { title: "Forms",               href: "/admin/forms",          icon: ClipboardList },
  { title: "Media Library",       href: "/admin/media",          icon: Images },
  { title: "Translations",        href: "/admin/translations",   icon: Globe },
  { title: "Admin Management",    href: "/admin/admins",         icon: ShieldCheck },
  { title: "Patients",            href: "/admin/patients",       icon: UserRound },
  { title: "Staff / Providers",   href: "/admin/staff",          icon: Users },
  { title: "Locations",           href: "/admin/locations",      icon: MapPin },
  { title: "Testimonials",        href: "/admin/testimonials",   icon: MessageSquareQuote },
  { title: "Settings",            href: "/admin/settings",       icon: Settings },
];

const navSections = [
  { label: "",               items: navigation.slice(0, 1) },
  { label: "Content",        items: navigation.slice(1, 5) },
  { label: "Access",         items: navigation.slice(5, 7) },
  { label: "People & Places",items: navigation.slice(7, 10) },
  { label: "System",         items: navigation.slice(10) },
];

type AdminShellUser = {
  email: string;
  name?: string;
  picture?: string;
  role?: string;
} | null;

export function AdminShell({ children, user }: { children: React.ReactNode; user?: AdminShellUser }) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const activeItem = useMemo(
    () => navigation.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    ) ?? navigation[0],
    [pathname],
  );

  if (pathname === "/admin/login" || pathname === "/admin/access-denied") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#fbfcfb] text-[#1f2c25]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-[#dce4df] bg-zinc-50 lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {/* Content area */}
      <div className="lg:pl-[280px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-[#dce4df] bg-white/95 backdrop-blur">
          <div className="flex h-[60px] items-center gap-3 px-4 lg:px-6">
            {/* Mobile menu trigger */}
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button className="lg:hidden" size="icon" variant="outline" aria-label="Open admin navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[280px] p-0" side="left">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <SidebarContent pathname={pathname} user={user} onNavigate={() => setNavOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb */}
            <div className="min-w-0 flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin" className="text-[#5f6f66] hover:text-[#145c42]">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-[#1f2c25]">
                      {activeItem.href === "/admin" ? "Dashboard" : activeItem.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Search */}
            <Button
              className="hidden h-9 min-w-52 justify-start rounded-lg border-[#dce4df] bg-white text-[#9aafa5] hover:bg-[#f3f6f4] md:inline-flex"
              variant="outline"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              Search admin…
            </Button>

            {/* LMS shortcut */}
            <Button
              asChild
              className="hidden h-9 rounded-lg border-[#dce4df] bg-white text-[#1f2c25] hover:bg-[#edf4ef] hover:text-[#145c42] xl:inline-flex"
              variant="outline"
            >
              <a href={`${LMS_URL}/admin/courses`} target="_blank" rel="noopener noreferrer">
                <GraduationCap className="h-4 w-4" />
                Patient LMS
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </Button>

            <Button className="md:hidden" size="icon" variant="outline" onClick={() => setCommandOpen(true)} aria-label="Search">
              <Search />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 rounded-lg hover:bg-[#f3f6f4]" variant="ghost">
                  <Avatar className="size-7">
                    {user?.picture ? <AvatarImage alt={user.name || user.email} src={user.picture} /> : null}
                    <AvatarFallback className="bg-[#edf4ef] text-[#145c42] text-xs font-bold">
                      {user ? getInitials(user.name || user.email) : <UserRound className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-36 truncate text-sm font-medium text-[#1f2c25] sm:inline">
                    {user?.name || user?.email || "Admin"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin account</DropdownMenuLabel>
                {user?.email ? <div className="px-2 pb-2 text-xs text-[#5f6f66]">{user.email}</div> : null}
                {user?.role ? <div className="px-2 pb-1 text-xs font-semibold capitalize text-[#145c42]">{user.role}</div> : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" prefetch={false}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`${LMS_URL}/admin/courses`} target="_blank" rel="noopener noreferrer">
                    Patient LMS <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                  <Link href="/api/auth/logout">
                    <LogOut className="h-4 w-4" /> Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="px-4 py-8 lg:px-8">{children}</main>
      </div>

      {/* Command palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search pages, content, and tools…" />
        <CommandList>
          <CommandEmpty>No admin page found.</CommandEmpty>
          <CommandGroup heading="Admin navigation">
            {navigation.map((item) => (
              <CommandItem key={item.href} onSelect={() => setCommandOpen(false)} asChild>
                <Link href={item.href} prefetch={false}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="External">
            <CommandItem onSelect={() => { window.open(`${LMS_URL}/admin/courses`, '_blank'); setCommandOpen(false) }}>
              <GraduationCap className="h-4 w-4" />
              Patient LMS
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

/* ── Sidebar content ───────────────────────────────────────────────────────── */

function SidebarContent({
  pathname,
  user,
  onNavigate,
}: {
  pathname: string;
  user?: AdminShellUser;
  onNavigate?: () => void;
}) {
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Clear loading state when pathname actually changes
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-[#dce4df] px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D3D24] text-xs font-bold text-white shadow-sm">
          JL
        </div>
        <div>
          <span className="block text-sm font-bold text-[#1f2c25]">JourneyLite</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9aafa5]">Admin Portal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div className="space-y-0.5" key={section.label || "top"}>
            {section.label ? (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aafa5]">
                {section.label}
              </p>
            ) : null}
            {section.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const isNavigating = navigatingTo === item.href && !active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => {
                    if (!active) setNavigatingTo(item.href);
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#0D3D24]/[0.08] text-[#0D3D24] font-semibold"
                      : isNavigating
                        ? "bg-[#0D3D24]/[0.05] text-[#0D3D24]"
                        : "text-[#5f6f66] hover:bg-[#0D3D24]/[0.05] hover:text-[#0D3D24]",
                  )}
                >
                  {isNavigating ? (
                    <span className="h-4 w-4 shrink-0 flex items-center justify-center">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0D3D24]/20 border-t-[#0D3D24]" />
                    </span>
                  ) : (
                    <item.icon className="h-4 w-4 shrink-0" />
                  )}
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Patient LMS external link */}
        <div className="space-y-0.5">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aafa5]">
            Patient Portal
          </p>
          <a
            href={`${LMS_URL}/admin/courses`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className="flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-[#5f6f66] transition-colors hover:bg-[#0D3D24]/[0.05] hover:text-[#0D3D24]"
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            Patient LMS
            <ExternalLink className="ml-auto h-3 w-3 opacity-40" />
          </a>
        </div>
      </nav>

      {/* Bottom user row */}
      <div className="flex-shrink-0 border-t border-[#dce4df] p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-auto w-full justify-start gap-3 rounded-lg px-2 py-2.5 text-[#5f6f66] hover:bg-[#0D3D24]/[0.05] hover:text-[#0D3D24]"
              variant="ghost"
            >
              <Avatar className="size-8">
                {user?.picture ? <AvatarImage alt={user.name || user.email} src={user.picture} /> : null}
                <AvatarFallback className="bg-[#edf4ef] text-[#145c42] text-xs font-bold">
                  {user ? getInitials(user.name || user.email) : "A"}
                </AvatarFallback>
              </Avatar>
              <span className="grid text-left">
                <span className="max-w-[160px] truncate text-xs font-semibold text-[#1f2c25]">
                  {user?.name || "Admin"}
                </span>
                <span className="max-w-[160px] truncate text-[11px] text-[#9aafa5]">
                  {user?.email || "Signed in"}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            {user?.role ? (
              <div className="px-2 pb-1 text-xs font-semibold capitalize text-[#145c42]">{user.role}</div>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
              <Link href="/api/auth/logout">
                <LogOut className="h-4 w-4" /> Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function getInitials(value: string) {
  const parts = value
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  return (parts[0]?.[0] || "A").concat(parts[1]?.[0] || "").toUpperCase();
}
