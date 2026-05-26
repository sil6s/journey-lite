"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseMedical,
  ExternalLink,
  LogOut,
  FileText,
  Images,
  MapPin,
  Menu,
  MessageSquareQuote,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
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
import { useMemo, useState } from "react";

const navigation = [
  { title: "Web Analytics", href: "/admin", icon: BarChart3 },
  { title: "Blog / Resources", href: "/admin/blog", icon: BookOpen },
  { title: "Education Builder", href: "/admin/education", icon: BookOpen },
  { title: "Education Portal", href: "/courses", icon: BookOpen },
  { title: "AI Blog Builder", href: "/admin/ai-blog-builder", icon: Bot },
  { title: "Services", href: "/admin/services", icon: BriefcaseMedical },
  { title: "Pages / Sections", href: "/admin/pages", icon: FileText },
  { title: "Staff / Providers", href: "/admin/staff", icon: Users },
  { title: "Locations", href: "/admin/locations", icon: MapPin },
  { title: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { title: "Media Library", href: "/admin/media", icon: Images },
  { title: "Sanity Studio", href: "/admin/studio", icon: Sparkles },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

const navSections = [
  { label: "", items: navigation.slice(0, 1) },
  { label: "Content", items: navigation.slice(1, 7) },
  { label: "People & Places", items: navigation.slice(7, 10) },
  { label: "System", items: navigation.slice(10) },
];

type AdminShellUser = {
  email: string;
  name?: string;
  picture?: string;
} | null;

export function AdminShell({ children, user }: { children: React.ReactNode; user?: AdminShellUser }) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const activeItem = useMemo(
    () =>
      navigation.find((item) => (item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href))) ??
      navigation[0],
    [pathname],
  );

  function mockLogout() {
    window.localStorage.removeItem("journeylite-admin-mock-auth");
  }

  if (pathname === "/admin/login" || pathname === "/admin/access-denied") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#193f2c]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[300px] bg-[#153f2b] text-white lg:block">
        <SidebarContent pathname={pathname} user={user} />
      </aside>
      <div className="lg:pl-[300px]">
        <header className="sticky top-0 z-20 border-b border-[#dfe8e2] bg-white/95 backdrop-blur">
          <div className="flex h-[76px] items-center gap-3 px-4 lg:px-8">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button className="lg:hidden" size="icon" variant="outline" aria-label="Open admin navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80 p-0" side="left">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <SidebarContent pathname={pathname} user={user} onNavigate={() => setNavOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0 flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-[#153f2b]">
                      {activeItem.href === "/admin" ? "Dashboard Overview" : activeItem.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Button className="hidden h-11 min-w-72 justify-start rounded-xl border-[#dfe8e2] bg-white text-[#98a8a0] md:inline-flex" variant="outline" onClick={() => setCommandOpen(true)}>
              <Search />
              Search admin
            </Button>
            <Button asChild className="hidden h-11 rounded-xl border-[#dfe8e2] bg-white text-[#153f2b] hover:bg-[#f7faf7] xl:inline-flex" variant="outline">
              <Link href="/studio">
                <ExternalLink /> Open Studio
              </Link>
            </Button>
            <Button asChild className="hidden h-11 rounded-xl !bg-[#153f2b] !text-white hover:!bg-[#0f3322] xl:inline-flex">
              <Link href="/admin/ai-blog-builder">
                <Sparkles /> Build AI post
              </Link>
            </Button>
            <Button className="md:hidden" size="icon" variant="outline" onClick={() => setCommandOpen(true)} aria-label="Search admin">
              <Search />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2" variant="ghost">
                  <Avatar className="size-7">
                    {user?.picture ? <AvatarImage alt={user.name || user.email} src={user.picture} /> : null}
                    <AvatarFallback>{user ? getInitials(user.name || user.email) : <UserRound className="size-4" />}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-36 truncate sm:inline">{user?.name || user?.email || "Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin account</DropdownMenuLabel>
                {user?.email ? <div className="px-2 pb-2 text-xs text-muted-foreground">{user.email}</div> : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/studio">Open Studio</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/logout" onClick={mockLogout}>
                    <LogOut /> Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="px-4 py-8 lg:px-8">{children}</main>
      </div>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search pages, content, and tools..." />
        <CommandList>
          <CommandEmpty>No admin page found.</CommandEmpty>
          <CommandGroup heading="Admin navigation">
            {navigation.map((item) => (
              <CommandItem key={item.href} onSelect={() => setCommandOpen(false)} asChild>
                <Link href={item.href}>
                  <item.icon />
                  {item.title}
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

function SidebarContent({ pathname, user, onNavigate }: { pathname: string; user?: AdminShellUser; onNavigate?: () => void }) {
  function mockLogout() {
    window.localStorage.removeItem("journeylite-admin-mock-auth");
    onNavigate?.();
  }

  return (
    <div className="flex h-full flex-col">
      <Link className="flex h-[92px] items-center gap-4 border-b border-white/10 px-5" href="/admin" onClick={onNavigate}>
        <span className="flex size-12 items-center justify-center rounded-xl border border-white/15 bg-[#0f3322] text-base font-bold tracking-tight text-white shadow-inner">
          JL
        </span>
        <span>
          <span className="block text-lg font-semibold leading-tight text-white">JourneyLite</span>
          <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#8fd09d]">Admin</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-7 overflow-y-auto p-4">
        {navSections.map((section) => (
          <div className="space-y-2" key={section.label || "top"}>
            {section.label ? (
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{section.label}</p>
            ) : null}
            {section.items.map((item) => {
              const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white",
                    active && "bg-[#2e7445] text-white shadow-sm",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={onNavigate}
                >
                  <item.icon className="size-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-auto w-full justify-start gap-3 rounded-xl px-2 py-3 text-white hover:bg-white/10 hover:text-white" variant="ghost">
              <Avatar className="size-11">
                {user?.picture ? <AvatarImage alt={user.name || user.email} src={user.picture} /> : null}
                <AvatarFallback className="bg-[#2e7445] text-white">
                  {user ? getInitials(user.name || user.email) : "A"}
                </AvatarFallback>
              </Avatar>
              <span className="grid text-left">
                <span className="max-w-48 truncate text-sm font-semibold">{user?.name || "Admin"}</span>
                <span className="max-w-48 truncate text-xs text-[#8fb69b]">{user?.email || "Signed in"}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel>Mock account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/api/auth/logout" onClick={mockLogout}>
                <LogOut /> Log out
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
