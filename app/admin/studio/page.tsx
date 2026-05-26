import Link from "next/link";
import { ArrowUpRight, BookOpen, BriefcaseMedical, Images, MapPin, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { label: "Guided education builder", href: "/admin/education", icon: BookOpen },
  { label: "Patient education courses", href: "/studio", icon: BookOpen },
  { label: "Patient education lessons", href: "/studio", icon: BookOpen },
  { label: "Blog posts/resources", href: "/studio", icon: BookOpen },
  { label: "Staff profiles", href: "/admin/staff", icon: Users },
  { label: "Services", href: "/admin/services", icon: BriefcaseMedical },
  { label: "Locations", href: "/admin/locations", icon: MapPin },
  { label: "Media/assets", href: "/studio", icon: Images },
  { label: "Site settings", href: "/admin/settings", icon: Settings },
];

export default function AdminStudioPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sanity Studio</CardTitle>
          <CardDescription>Use Studio for advanced content editing. Use Admin pages for guided editing.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/studio">
              Open Studio <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/blog">Return to guided blog admin</Link>
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <item.icon className="size-4" />
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={item.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
