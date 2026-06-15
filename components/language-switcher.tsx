"use client";

/**
 * LanguageSwitcher
 *
 * Accessible locale picker that:
 * – Shows each language in its native script (Español, العربية, 中文, …)
 * – Preserves the current path when switching locale
 * – Persists the choice in the jl_locale cookie via the URL transition
 * – Supports RTL layout for Arabic (detected from the <html dir> attribute)
 * – Full keyboard navigation with ARIA combobox role
 *
 * Usage:
 *   <LanguageSwitcher locale="en" pathname="/en/resources/some-article" />
 *
 * The `pathname` prop should be the full current URL path including locale prefix.
 */

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback, useEffect, KeyboardEvent } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  defaultLocale,
  supportedLanguages,
  LOCALE_COOKIE,
  type SupportedLocale,
} from "@/lib/i18n/config";

type Props = {
  /** Current active locale */
  locale: SupportedLocale;
  /** Full URL pathname including locale prefix, e.g. "/es/resources/foo" */
  pathname: string;
  /** Extra class names applied to the root button */
  className?: string;
  /** Compact mode: shows only the Globe icon (no language name or chevron) */
  compact?: boolean;
};

const enabledLanguages = supportedLanguages.filter((l) => l.enabled);

export function LanguageSwitcher({ locale, pathname, className = "", compact = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const currentLang = enabledLanguages.find((l) => l.id === locale)!;

  // Build the target path for a given locale:
  // /en/resources/foo  →  /es/resources/foo
  function buildLocalePath(targetLocale: SupportedLocale) {
    // Strip the current locale prefix and replace with target
    const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
    if (targetLocale === defaultLocale) {
      return withoutLocale;
    }
    return `/${targetLocale}${withoutLocale === "/" ? "" : withoutLocale}`;
  }

  function selectLocale(targetLocale: SupportedLocale) {
    setOpen(false);
    if (targetLocale === locale) return;

    // Set the cookie so middleware picks up the choice on the next request
    document.cookie = `${LOCALE_COOKIE}=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    router.push(buildLocalePath(targetLocale));
  }

  // Keyboard navigation for the dropdown list
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocusedIndex(enabledLanguages.findIndex((l) => l.id === locale));
      }
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, enabledLanguages.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0) selectLocale(enabledLanguages[focusedIndex].id);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  // Focus the correct list item when focusedIndex changes
  useEffect(() => {
    if (open && focusedIndex >= 0) {
      const items = listRef.current?.querySelectorAll("[role='option']");
      (items?.[focusedIndex] as HTMLElement)?.focus();
    }
  }, [open, focusedIndex]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" dir="ltr">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-controls={open ? "language-switcher-listbox" : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Select language. Current: ${currentLang.nativeName}`}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setFocusedIndex(enabledLanguages.findIndex((l) => l.id === locale));
        }}
        onKeyDown={handleKeyDown}
        className={[
          compact
            ? "inline-flex items-center justify-center rounded-lg border border-transparent p-1.5"
            : "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5",
          "text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors",
          className,
        ].join(" ")}
      >
        <Globe className={compact ? "size-4 shrink-0" : "size-4 shrink-0 opacity-60"} aria-hidden="true" />
        {!compact && <span>{currentLang.nativeName}</span>}
        {!compact && (
          <ChevronDown
            className={`size-3.5 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          ref={listRef}
          id="language-switcher-listbox"
          role="listbox"
          aria-label="Select language"
          aria-activedescendant={
            focusedIndex >= 0 ? `lang-option-${enabledLanguages[focusedIndex].id}` : undefined
          }
          className={[
            "absolute z-50 mt-1 w-48 overflow-auto rounded-xl border bg-popover",
            "py-1 shadow-lg ring-1 ring-black/5 focus:outline-none",
            // Position to the right if LTR, left if the page is RTL
            "right-0",
          ].join(" ")}
        >
          {enabledLanguages.map((lang, index) => {
            const isSelected = lang.id === locale;
            const isFocused = index === focusedIndex;
            return (
              <li
                key={lang.id}
                id={`lang-option-${lang.id}`}
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => selectLocale(lang.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectLocale(lang.id);
                  }
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={[
                  "flex cursor-pointer items-center justify-between px-3 py-2 text-sm",
                  "focus:outline-none",
                  isSelected
                    ? "bg-primary/8 font-semibold text-primary"
                    : "text-foreground hover:bg-muted",
                  isFocused && !isSelected ? "bg-muted" : "",
                ].join(" ")}
              >
                <span dir={lang.dir}>{lang.nativeName}</span>
                <span className="ml-2 text-xs text-muted-foreground">{lang.title}</span>
                {isSelected && (
                  <Check className="ml-auto size-4 text-primary" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
