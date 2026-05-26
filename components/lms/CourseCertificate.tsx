"use client";

import { useMemo } from "react";
import { Download, Printer } from "lucide-react";
import type { SanityCourse } from "@/src/lib/sanity/lms-types";
import { certificateDisclaimer } from "@/lib/lms/content-rules";

type CertificatePatient = {
  fullName: string | null;
  email?: string | null;
};

export function CourseCertificate({
  course,
  patient,
  completedAt,
}: {
  course: SanityCourse;
  patient: CertificatePatient;
  completedAt: string;
}) {
  const certificate = course.certificate ?? {};
  const certificateId = useMemo(
    () => makeCertificateId(patient.email ?? patient.fullName ?? "patient", course.slug, completedAt, course.versionNumber ?? "1.0"),
    [completedAt, course.slug, course.versionNumber, patient.email, patient.fullName],
  );
  const patientName = patient.fullName || "JourneyLite Patient";
  const completedDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(completedAt));
  const title = certificate.title || "Certificate of Completion";
  const bodyText =
    certificate.bodyText ||
    "has completed the assigned JourneyLite patient education course:";

  async function downloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setDrawColor(20, 92, 66);
    doc.setLineWidth(4);
    doc.rect(36, 36, pageWidth - 72, 540);

    doc.setTextColor(15, 62, 46);
    doc.setFont("times", "bold");
    doc.setFontSize(34);
    doc.text(title, pageWidth / 2, 120, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text("This certifies that", pageWidth / 2, 175, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.text(patientName, pageWidth / 2, 225, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(bodyText, pageWidth / 2, 270, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text(course.title, pageWidth / 2, 318, { align: "center", maxWidth: 620 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text(`Completed on ${completedDate}`, pageWidth / 2, 380, { align: "center" });
    doc.text(`Certificate ID: ${certificateId}`, pageWidth / 2, 410, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(83, 99, 91);
    doc.text(certificateDisclaimer, pageWidth / 2, 462, { align: "center", maxWidth: 650 });

    doc.setTextColor(15, 62, 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(certificate.signatureName || "JourneyLite", pageWidth / 2, 520, { align: "center" });
    if (certificate.signatureTitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(certificate.signatureTitle, pageWidth / 2, 540, { align: "center" });
    }

    doc.save(`${course.slug}-certificate.pdf`);
  }

  return (
    <section className="rounded-2xl border border-[#b7cec2] bg-white p-5 shadow-sm print:shadow-none" aria-labelledby="course-certificate-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">Certificate available</p>
          <h2 className="mt-1 text-lg font-semibold text-[#1f2c25]" id="course-certificate-title">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#53635b]">Print or download a PDF copy for your records.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {certificate.printEnabled !== false ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#17362a] hover:border-[#145c42] hover:text-[#145c42]"
              onClick={() => window.print()}
              type="button"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          ) : null}
          {certificate.downloadPdfEnabled !== false ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f4d37]"
              onClick={downloadPdf}
              type="button"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 border border-[#dce4df] bg-[#fbfdfb] p-8 text-center print:border-0 print:bg-white">
        {certificate.showJourneyLiteLogo !== false ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="JourneyLite" className="mx-auto mb-8 h-auto w-56" src="/journeylite-logo.svg" />
        ) : null}
        <p className="font-serif text-4xl text-[#0f3e2e]">{title}</p>
        {certificate.subtitle ? <p className="mt-2 text-sm font-semibold text-[#53635b]">{certificate.subtitle}</p> : null}
        <p className="mt-8 text-sm text-[#53635b]">This certifies that</p>
        {certificate.showPatientName !== false ? (
          <p className="mt-3 font-serif text-3xl text-[#1f2c25]">{patientName}</p>
        ) : null}
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#53635b]">{bodyText}</p>
        {certificate.showCourseName !== false ? (
          <p className="mx-auto mt-4 max-w-2xl text-xl font-semibold text-[#145c42]">{course.title}</p>
        ) : null}
        {certificate.showCompletionDate !== false ? <p className="mt-6 text-sm text-[#53635b]">Completed on {completedDate}</p> : null}
        <p className="mx-auto mt-6 max-w-2xl text-xs leading-5 text-[#64736b]">{certificateDisclaimer}</p>
        {certificate.showCertificateId !== false ? (
          <p className="mt-5 font-mono text-xs font-semibold text-[#53635b]">Certificate ID: {certificateId}</p>
        ) : null}
        <div className="mx-auto mt-8 h-px w-56 bg-[#b7cec2]" />
        <p className="mt-3 text-sm font-semibold text-[#1f2c25]">{certificate.signatureName || "JourneyLite"}</p>
        {certificate.signatureTitle ? <p className="text-xs text-[#53635b]">{certificate.signatureTitle}</p> : null}
      </div>
    </section>
  );
}

function makeCertificateId(patientKey: string, courseSlug: string, completedAt: string, version: string) {
  const raw = `${patientKey}:${courseSlug}:${completedAt}:${version}`;
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }
  return `JL-${courseSlug.slice(0, 8).toUpperCase()}-${hash.toString(16).toUpperCase().padStart(8, "0")}`;
}
