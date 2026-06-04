"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { defaultLocale, isValidLocale, LOCALE_COOKIE, type SupportedLocale } from "@/lib/i18n/config";

const originalText = new WeakMap<Text, string>();
const skippedElementSelector = [
  "script",
  "style",
  "noscript",
  "textarea",
  "input",
  "select",
  "option",
  "pre",
  "code",
  "svg",
  "[contenteditable='true']",
  "[data-no-translate]",
  ".notranslate",
].join(",");

function readCookieLocale(): SupportedLocale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return value && isValidLocale(value) ? value : defaultLocale;
}

function localeFromPath(pathname: string): SupportedLocale | null {
  const maybeLocale = pathname.split("/").filter(Boolean)[0];
  return maybeLocale && isValidLocale(maybeLocale) ? maybeLocale : null;
}

function shouldSkipPath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/_next")
  );
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest(skippedElementSelector)) return true;
  return normalizeText(node.nodeValue ?? "").length < 2;
}

function translateTextNodes(root: ParentNode, dictionary: Record<string, string>) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }

  for (const node of nodes) {
    if (shouldSkipTextNode(node)) continue;

    const source = originalText.get(node) ?? node.nodeValue ?? "";
    originalText.set(node, source);

    const key = normalizeText(source);
    const translated = dictionary[key];

    if (translated) {
      if (node.nodeValue !== translated) node.nodeValue = translated;
    } else {
      if (node.nodeValue !== source) node.nodeValue = source;
    }
  }
}

export function StaticPageTranslator() {
  const pathname = usePathname();

  useEffect(() => {
    if (shouldSkipPath(pathname)) return;

    const locale = localeFromPath(pathname) ?? readCookieLocale();
    let observer: MutationObserver | null = null;
    let cancelled = false;

    async function run() {
      if (locale === defaultLocale) {
        translateTextNodes(document.body, {});
        return;
      }

      const response = await fetch(`/api/i18n/static?locale=${locale}`, {
        headers: { accept: "application/json" },
      });
      const dictionary = response.ok ? ((await response.json()) as Record<string, string>) : {};
      if (cancelled) return;

      translateTextNodes(document.body, dictionary);

      observer = new MutationObserver(() => {
        translateTextNodes(document.body, dictionary);
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    void run().catch(() => {
      translateTextNodes(document.body, {});
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
