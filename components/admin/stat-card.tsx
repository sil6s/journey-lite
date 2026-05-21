import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="rounded-xl border-[#dfe8e2] bg-white shadow-sm">
      <CardHeader className="pb-2">
        <span className="flex size-12 items-center justify-center rounded-xl bg-[#eaf3ee] text-[#153f2b]">
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-4xl font-semibold leading-none text-[#153f2b]">{value}</div>
        <CardTitle className="mt-3 text-base font-semibold text-[#2d4b39]">{title}</CardTitle>
        {detail ? <p className="mt-2 text-sm text-[#98aa9e]">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
