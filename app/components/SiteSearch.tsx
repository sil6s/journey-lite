"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type SiteSearchItem = {
  label: string;
  href: string;
  description: string;
  group?: string;
};

/** Inline search bar — used inside the mobile nav sheet */
export function InlineSiteSearch({
  items,
  onSelect,
}: {
  items: SiteSearchItem[];
  onSelect?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <Command className="rounded-xl border border-[#dce4df] bg-white" filter={fuzzyFilter}>
      <CommandInput
        placeholder="Search procedures, pricing, locations..."
        value={query}
        onValueChange={setQuery}
      />
      {query.trim().length > 0 && (
        <CommandList className="max-h-[260px] border-t border-[#dce4df]">
          <CommandEmpty>No matching JourneyLite pages found.</CommandEmpty>
          <CommandGroup heading="JourneyLite pages">
            {items.map((item) => (
              <CommandItem
                className="grid items-start gap-0.5 px-4 py-2.5 [&>svg:last-child]:hidden"
                key={`${item.href}-${item.label}`}
                onSelect={() => {
                  router.push(item.href);
                  setQuery("");
                  onSelect?.();
                }}
                value={`${item.label} ${item.description} ${item.group ?? ""}`}
                keywords={[item.label, item.description, item.group ?? "", item.href]}
              >
                <p className="text-sm font-semibold text-[#1f2c25]">{item.label}</p>
                <p className="line-clamp-1 text-xs leading-5 text-[#64736b]">{item.description}</p>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
}

/** Icon-button search — used in the desktop header */
export function SiteSearch({ items }: { items: SiteSearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        aria-label="Search JourneyLite site"
        className="border-[#cbd7d0] bg-white text-[#17362a] hover:border-[#145c42] hover:text-[#145c42]"
        size="icon-lg"
        variant="outline"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search aria-hidden="true" className="size-4" />
      </Button>
      <CommandDialog
        title="Search JourneyLite"
        description="Search JourneyLite pages, procedures, resources, and team information."
        // top-4 on mobile (snaps near top edge); sm:top-[12vh] centers nicely on desktop
        // max-w-[calc(100%-2rem)] keeps mobile width; sm:max-w-[min(96vw,1280px)] gives a wide desktop dialog
        className="top-4 w-[calc(100vw-2rem)] translate-y-0 sm:top-[12vh] sm:w-[min(96vw,1280px)] sm:max-w-[1280px]"
        open={open}
        onOpenChange={setOpen}
      >
        <Command className="rounded-xl border border-[#dce4df] bg-white" filter={fuzzyFilter}>
          <CommandInput placeholder="Search procedures, pricing, locations..." />
          <CommandList className="max-h-[min(68vh,620px)]">
            <CommandEmpty>No matching JourneyLite pages found.</CommandEmpty>
            <CommandGroup heading="JourneyLite pages">
              {items.map((item) => (
                <CommandItem
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-4 py-3 [&>svg:last-child]:hidden"
                  key={`${item.href}-${item.label}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                  value={`${item.label} ${item.description} ${item.group ?? ""}`}
                  keywords={[item.label, item.description, item.group ?? "", item.href]}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1f2c25]">{item.label}</p>
                    <p className="line-clamp-2 text-xs leading-5 text-[#64736b]">{item.description}</p>
                  </div>
                  {item.group ? (
                    <span className="hidden min-w-[190px] shrink-0 justify-center rounded-full bg-[#edf4ef] px-2 py-1 text-center text-[11px] font-semibold text-[#355346] md:inline-flex">
                      {item.group}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

function fuzzyFilter(value: string, search: string, keywords?: string[]) {
  const haystack = normalize([value, ...(keywords ?? [])].join(" "));
  const needle = normalize(search);

  if (!needle) {
    return 1;
  }

  if (haystack.includes(needle)) {
    return 1;
  }

  let score = 0;
  let lastIndex = -1;

  for (const char of needle) {
    const index = haystack.indexOf(char, lastIndex + 1);

    if (index === -1) {
      return 0;
    }

    score += index === lastIndex + 1 ? 2 : 1;
    lastIndex = index;
  }

  return score / (needle.length * 2);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
