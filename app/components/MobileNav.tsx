"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Menu, Phone, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SiteSearchItem } from "./SiteSearch";
import { InlineSiteSearch } from "./SiteSearch";
import { LocaleLanguageSwitcher } from "@/components/site/locale-language-switcher";
import type { SupportedLocale } from "@/lib/i18n/config";

type NavGroup = {
  label: string;
  items: {
    label: string;
    href: string;
    description: string;
  }[];
};

export function MobileNav({
  navGroups,
  searchItems,
  phoneHref,
  phoneNumber,
  locale = "en",
}: {
  navGroups: NavGroup[];
  searchItems: SiteSearchItem[];
  phoneHref: string;
  phoneNumber: string;
  locale?: SupportedLocale;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="border-[#cbd7d0] bg-white text-[#17362a] hover:border-[#145c42] hover:text-[#145c42] lg:hidden"
          size="icon"
          variant="outline"
        >
          <Menu aria-hidden="true" className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      {/* !inset-0 !w-screen !max-w-none !h-dvh ensure true full-screen on all breakpoints */}
      <SheetContent
        className="!inset-0 !h-dvh !w-screen !max-w-none overflow-y-auto border-0 bg-white p-0"
        side="right"
      >
        <SheetHeader className="border-b border-[#dce4df] p-5 pr-14">
          <SheetTitle>
            <Image
              alt="JourneyLite Bariatric Physicians"
              className="h-auto w-[190px]"
              height={160}
              src="/journeylite-logo.svg"
              width={560}
            />
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-5 p-5">
          {/* Inline search bar replaces the icon-button variant */}
          <InlineSiteSearch
            items={searchItems}
            onSelect={() => setOpen(false)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SheetClose asChild>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0f4d37]"
                href="/contact"
              >
                Request Appointment
              </Link>
            </SheetClose>
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7d0] bg-white px-4 py-2 text-sm font-semibold text-[#17362a] hover:border-[#145c42] hover:text-[#145c42]"
              href={phoneHref}
            >
              <Phone aria-hidden="true" className="size-4" />
              {phoneNumber}
            </a>
          </div>
          <Accordion className="rounded-xl border border-[#dce4df] bg-[#f8fbf9]" type="multiple">
            {navGroups.map((group) => (
              <AccordionItem className="border-[#dce4df]" key={group.label} value={group.label}>
                <AccordionTrigger className="px-4 py-4 text-left text-sm font-semibold text-[#1f2c25] hover:no-underline">
                  <span>{group.label}</span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 [&_a]:no-underline">
                  <div className="grid gap-1">
                    {group.items.map((item) => (
                      <SheetClose asChild key={`${group.label}-${item.label}`}>
                        <Link
                          className="rounded-lg bg-white px-3 py-3 text-sm font-semibold text-[#26372e] shadow-sm hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                          href={item.href}
                        >
                          <span className="block">{item.label}</span>
                          <span className="mt-1 block text-xs font-normal leading-5 text-[#64736b]">{item.description}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="flex items-center justify-between rounded-xl border border-[#dce4df] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#66756d]">Language</p>
            <LocaleLanguageSwitcher locale={locale} />
          </div>
          <div className="grid gap-3 rounded-xl border border-[#dce4df] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#66756d]">Patient Resources</p>
            <SheetClose asChild>
              <a className="flex items-center gap-3 rounded-lg bg-[#edf4ef] px-3 py-3 text-sm font-semibold text-[#145c42]" href="https://learn.journeylite.com">
                <GraduationCap aria-hidden="true" className="size-4" />
                JourneyLite Learn
              </a>
            </SheetClose>
            <SheetClose asChild>
              <Link className="flex items-center gap-3 rounded-lg bg-[#edf4ef] px-3 py-3 text-sm font-semibold text-[#145c42]" href="/shop">
                <ShoppingBag aria-hidden="true" className="size-4" />
                JourneyLite Shop
              </Link>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
