"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/src/lib/sanity/client";
import { siteSettingsQuery } from "@/src/lib/sanity/queries";
import type { SiteSettings, SiteNavGroup } from "@/src/lib/sanity/types";

export async function fetchSiteSettings() {
  return adminClient.fetch<SiteSettings | null>(siteSettingsQuery);
}

export async function saveSiteNavigationAction(settingsId: string | undefined, navGroups: SiteNavGroup[]) {
  const cleanGroups = navGroups
    .filter((group) => group.label.trim())
    .map((group) => ({
      _key: group._key,
      _type: "navGroup",
      label: group.label.trim(),
      items: (group.items ?? []).filter((item) => item.label.trim() && item.href.trim()).map((item) => ({
        _key: item._key,
        _type: "navItem",
        label: item.label.trim(),
        href: item.href.trim(),
        description: item.description?.trim() ?? "",
        hidden: Boolean(item.hidden),
      })),
    }));

  if (settingsId) {
    await adminClient.patch(settingsId).set({ navGroups: cleanGroups }).commit();
  } else {
    await adminClient.create({ _type: "siteSettings", title: "JourneyLite site settings", navGroups: cleanGroups });
  }

  revalidatePath("/");
  revalidatePath("/admin/navigation");
}
