"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Enrollment = {
  id: string;
  courseSlug: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  lessonsCompleted: number;
  lessonsTotal: number;
  progressPct: number;
};

type Patient = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  enrollments: Enrollment[];
  overallPct: number;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    expired: "bg-amber-50 text-amber-700 border-amber-200",
    revoked: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Badge
      className={`text-[11px] font-semibold capitalize border ${map[status] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"}`}
      variant="outline"
    >
      {status}
    </Badge>
  );
}

export function PatientsClient({ patients, lmsUrl }: { patients: Patient[]; lmsUrl: string }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [patients, query]);

  const stats = useMemo(() => ({
    total: patients.length,
    active: patients.filter((p) => p.enrollments.some((e) => e.status === "active")).length,
    completed: patients.filter((p) => p.enrollments.some((e) => e.status === "completed")).length,
    noEnrollment: patients.filter((p) => p.enrollments.length === 0).length,
  }), [patients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2c25]">Patients</h1>
          <p className="mt-1 text-sm text-[#5f6f66]">
            Patient LMS progress overview. For course management, go to the{" "}
            <a
              href={`${lmsUrl}/admin/courses`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#145c42] underline underline-offset-2 hover:text-[#0D3D24]"
            >
              Patient LMS
            </a>
            .
          </p>
        </div>
        <Button asChild className="bg-[#0D3D24] hover:bg-[#145c42] text-white">
          <a href={`${lmsUrl}/admin/patients`} target="_blank" rel="noopener noreferrer">
            <GraduationCap className="mr-1.5 h-4 w-4" />
            Manage in LMS
            <ExternalLink className="ml-1.5 h-3 w-3 opacity-70" />
          </a>
        </Button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total patients", value: stats.total, color: "text-[#0D3D24]" },
          { label: "Active courses", value: stats.active, color: "text-emerald-700" },
          { label: "Completed course", value: stats.completed, color: "text-blue-700" },
          { label: "Not enrolled", value: stats.noEnrollment, color: "text-amber-700" },
        ].map((s) => (
          <Card key={s.label} className="border-[#dce4df]">
            <CardContent className="pt-4 pb-3 px-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#9aafa5] mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-[#dce4df]">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold text-[#1f2c25]">Patient Progress</CardTitle>
              <CardDescription className="text-[#5f6f66] text-sm">
                {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#9aafa5]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="pl-8 text-sm h-9 border-[#dce4df] w-64 focus-visible:ring-[#0D3D24]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#dce4df] bg-zinc-50/70">
                <TableHead className="pl-5 text-xs font-semibold text-[#5f6f66]">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-[#5f6f66]">Courses</TableHead>
                <TableHead className="text-xs font-semibold text-[#5f6f66]">Overall progress</TableHead>
                <TableHead className="text-xs font-semibold text-[#5f6f66]">Joined</TableHead>
                <TableHead className="pr-4 text-xs font-semibold text-[#5f6f66] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-[#9aafa5]">
                    <Users className="mx-auto mb-2 h-7 w-7 opacity-30" />
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((patient) => (
                  <>
                    <TableRow
                      key={patient.id}
                      className="border-[#dce4df] cursor-pointer hover:bg-zinc-50/70"
                      onClick={() => setExpanded(expanded === patient.id ? null : patient.id)}
                    >
                      <TableCell className="pl-5 py-3">
                        <div className="flex items-center gap-2">
                          {patient.enrollments.length > 0 ? (
                            expanded === patient.id ? (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#9aafa5]" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aafa5]" />
                            )
                          ) : (
                            <div className="w-3.5" />
                          )}
                          <div>
                            <p className="font-semibold text-sm text-[#1f2c25]">{patient.name}</p>
                            <p className="text-xs text-[#9aafa5]">{patient.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {patient.enrollments.length === 0 ? (
                          <span className="text-xs text-[#9aafa5] italic">None</span>
                        ) : (
                          <span className="text-sm font-medium text-[#1f2c25]">
                            {patient.enrollments.length} course{patient.enrollments.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {patient.enrollments.length > 0 ? (
                          <div className="flex items-center gap-2.5">
                            <Progress
                              value={patient.overallPct}
                              className="h-1.5 w-24 bg-[#dce4df]"
                            />
                            <span className="text-xs font-semibold text-[#1f2c25]">
                              {patient.overallPct}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#9aafa5]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-[#5f6f66]">
                        {fmtDate(patient.joinedAt)}
                      </TableCell>
                      <TableCell className="pr-4 py-3 text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-[#dce4df] text-[#5f6f66] hover:text-[#0D3D24] hover:border-[#0D3D24]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={`${lmsUrl}/admin/patients?userId=${patient.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View in LMS
                            <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded enrollment rows */}
                    {expanded === patient.id &&
                      patient.enrollments.map((enr) => (
                        <TableRow key={enr.id} className="border-[#dce4df] bg-[#f7faf8]">
                          <TableCell className="pl-14 py-2 text-xs text-[#5f6f66]">
                            <span className="font-mono text-[#9aafa5]">{enr.courseSlug}</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <StatusBadge status={enr.status} />
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={enr.progressPct}
                                className="h-1.5 w-20 bg-[#dce4df]"
                              />
                              <span className="text-xs text-[#5f6f66]">
                                {enr.lessonsCompleted}/{enr.lessonsTotal} lessons · {enr.progressPct}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-xs text-[#9aafa5]">
                            Enrolled {fmtDate(enr.enrolledAt)}
                            {enr.completedAt && ` · Completed ${fmtDate(enr.completedAt)}`}
                          </TableCell>
                          <TableCell className="pr-4 py-2 text-right">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-[#145c42] hover:bg-[#edf4ef]"
                            >
                              <a
                                href={`${lmsUrl}/admin/courses?course=${enr.courseSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Course details
                                <ExternalLink className="ml-1 h-2.5 w-2.5 opacity-60" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
