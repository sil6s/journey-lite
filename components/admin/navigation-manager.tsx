"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SiteNavGroup, SiteSettings } from "@/src/lib/sanity/types";
import { sortedNavGroups } from "@/app/components/data";
import { saveSiteNavigationAction } from "@/app/admin/navigation/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NavigationManager({ settings }: { settings: SiteSettings | null }) {
  const [groups, setGroups] = useState<SiteNavGroup[]>(settings?.navGroups?.length ? settings.navGroups : sortedNavGroups.map((group) => ({ ...group, _key: crypto.randomUUID(), items: group.items.map((item) => ({ ...item, _key: crypto.randomUUID() })) })));
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await saveSiteNavigationAction(settings?._id, groups);
        toast.success("Navigation saved");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Navbar</h1>
          <p className="mt-2 text-muted-foreground">Manage primary navigation groups and dropdown links. Empty Sanity settings fall back to the code-defined navbar.</p>
        </div>
        <Button onClick={save} disabled={isPending}><Save /> {isPending ? "Saving..." : "Save navbar"}</Button>
      </div>

      <div className="grid gap-5">
        {groups.map((group, groupIndex) => (
          <Card key={group._key ?? groupIndex}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{group.label || "Untitled group"}</CardTitle>
                  <CardDescription>{group.items?.length ?? 0} links</CardDescription>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setGroups(groups.filter((_, index) => index !== groupIndex))}><Trash2 /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Group label</Label>
                <Input value={group.label} onChange={(event) => updateGroup(groupIndex, { ...group, label: event.target.value })} />
              </div>
              <div className="grid gap-3">
                {(group.items ?? []).map((item, itemIndex) => (
                  <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_1.4fr_auto]" key={item._key ?? itemIndex}>
                    <Input placeholder="Label" value={item.label} onChange={(event) => updateItem(groupIndex, itemIndex, { ...item, label: event.target.value })} />
                    <Input placeholder="/url" value={item.href} onChange={(event) => updateItem(groupIndex, itemIndex, { ...item, href: event.target.value })} />
                    <Textarea rows={1} placeholder="Description" value={item.description ?? ""} onChange={(event) => updateItem(groupIndex, itemIndex, { ...item, description: event.target.value })} />
                    <div className="flex items-center gap-3">
                      <Checkbox checked={Boolean(item.hidden)} onCheckedChange={(checked) => updateItem(groupIndex, itemIndex, { ...item, hidden: Boolean(checked) })} />
                      <Button size="icon" variant="ghost" onClick={() => updateGroup(groupIndex, { ...group, items: group.items.filter((_, index) => index !== itemIndex) })}><Trash2 /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={() => updateGroup(groupIndex, { ...group, items: [...(group.items ?? []), { _key: crypto.randomUUID(), label: "", href: "", description: "" }] })}><Plus /> Add link</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={() => setGroups([...groups, { _key: crypto.randomUUID(), label: "New group", items: [] }])}><Plus /> Add group</Button>
    </div>
  );

  function updateGroup(index: number, next: SiteNavGroup) {
    setGroups(groups.map((group, groupIndex) => groupIndex === index ? next : group));
  }

  function updateItem(groupIndex: number, itemIndex: number, item: SiteNavGroup["items"][number]) {
    const group = groups[groupIndex];
    updateGroup(groupIndex, { ...group, items: group.items.map((oldItem, oldIndex) => oldIndex === itemIndex ? item : oldItem) });
  }
}
