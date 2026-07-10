import { unstable_noStore as noStore } from "next/cache";
import { client } from "@/src/lib/sanity/client";
import { siteSettingsQuery } from "@/src/lib/sanity/queries";
import type { SiteSettings } from "@/src/lib/sanity/types";
import { sortedNavGroups as fallbackSortedNavGroups } from "@/app/components/data";

export type PublicNavGroup = {
  _key?: string;
  label: string;
  items: { _key?: string; label: string; href: string; description: string }[];
};

export async function getSiteNavGroups(): Promise<PublicNavGroup[]> {
  noStore();
  const settings = await client.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null);
  const groups = settings?.navGroups
    ?.map((group) => ({
      _key: group._key,
      label: group.label,
      items: (group.items ?? [])
        .filter((item) => item.label && item.href && !item.hidden)
        .map((item) => ({
          _key: item._key,
          label: item.label,
          href: item.href,
          description: item.description ?? "",
        })),
    }))
    .filter((group) => group.label && group.items.length);

  if (groups?.length) return groups;
  return fallbackSortedNavGroups;
}

export function buildSiteSearchItems(navGroups: PublicNavGroup[]) {
  return [
    { label: "Home", href: "/", description: "JourneyLite weight loss surgery and medical weight loss overview." },
    { label: "Contact", href: "/contact", description: "Request an appointment or contact JourneyLite." },
    ...navGroups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        description: item.description ?? "",
        group: group.label,
      })),
    ),
  ];
}
