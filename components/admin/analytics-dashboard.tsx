"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarDays, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/admin/stat-card";
import type { AnalyticsSummary } from "@/lib/analytics";

const chartConfig = {
  views: { label: "Page views", color: "var(--chart-1)" },
  visitors: { label: "Visitors", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function AnalyticsDashboard({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Website Analytics</h1>
          <p className="mt-2 text-muted-foreground">Performance summary with a mock fallback until analytics are connected.</p>
        </div>
        <Select defaultValue="30">
          <SelectTrigger className="w-full md:w-44" aria-label="Date range">
            <CalendarDays />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Page views" value={data.pageViews.toLocaleString()} detail="Mock data until provider is connected" icon={TrendingUp} />
        <StatCard title="Visitors" value={data.visitors.toLocaleString()} detail="Unique visitor estimate" icon={Users} />
        <StatCard title="CTA clicks" value={data.ctaClicks.toLocaleString()} detail="Appointment and contact clicks" icon={MousePointerClick} />
        <StatCard title="Conversions" value={data.conversions.toLocaleString()} detail="Request placeholder metric" icon={MousePointerClick} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Traffic trend</CardTitle>
            <CardDescription>Page views and visitors over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80 w-full" config={chartConfig}>
              <AreaChart data={data.trend}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="views" type="monotone" fill="var(--color-views)" stroke="var(--color-views)" fillOpacity={0.22} />
                <Area dataKey="visitors" type="monotone" fill="var(--color-visitors)" stroke="var(--color-visitors)" fillOpacity={0.18} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>Acquisition placeholder breakdown.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80 w-full" config={{ visitors: { label: "Visitors", color: "var(--chart-3)" } }}>
              <BarChart data={data.trafficSources} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="source" type="category" tickLine={false} axisLine={false} width={96} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="visitors" fill="var(--color-visitors)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
            <CardDescription>Connect Search Console or analytics for live page data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topPages.map((page) => (
                  <TableRow key={page.path}>
                    <TableCell>
                      <div className="font-medium">{page.title}</div>
                      <div className="text-xs text-muted-foreground">{page.path}</div>
                    </TableCell>
                    <TableCell>{page.views.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={page.change >= 0 ? "default" : "secondary"}>{page.change >= 0 ? "+" : ""}{page.change}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog performance</CardTitle>
            <CardDescription>Views and average read time placeholders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Avg. time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.blogPerformance.map((post) => (
                  <TableRow key={post.title}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.views.toLocaleString()}</TableCell>
                    <TableCell>{post.averageTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
