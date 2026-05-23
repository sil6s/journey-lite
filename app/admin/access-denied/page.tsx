import Link from "next/link";
import { ArrowLeft, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type AccessDeniedPageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams;
  const email = params?.email;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf7] text-[#173c2b]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(#9ac5a9 2px, transparent 2px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative grid min-h-screen w-full bg-white lg:grid-cols-[0.82fr_1fr]">
        <section className="hidden bg-[#153f2b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-[#0f3322] text-2xl font-bold text-white shadow-inner">
                JL
              </div>
              <div>
                <p className="text-2xl font-semibold">JourneyLite</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#8fd09d]">Admin Portal</p>
              </div>
            </div>
            <h1 className="mt-24 max-w-md text-6xl font-semibold leading-tight tracking-tight text-[#f8f4e9]">
              Access is limited to approved staff.
            </h1>
            <p className="mt-8 max-w-md text-2xl leading-relaxed text-[#9fd4aa]">
              This protected workspace is available only to JourneyLite team members with administrator approval.
            </p>
          </div>
          <div className="space-y-6 border-t border-white/15 pt-8">
            <InfoRow value="Secure" label="Admin dashboard" />
            <InfoRow value="Staff" label="Approved accounts only" />
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-24">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#153f2b] text-base font-bold text-white">
                JL
              </div>
              <div>
                <p className="text-lg font-semibold">JourneyLite</p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Admin Portal</p>
              </div>
            </div>

            <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-[#f6ebe7] text-[#9b3d22]">
              <ShieldAlert className="size-8" aria-hidden="true" />
            </div>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Access denied</h2>
            <p className="mt-5 text-xl leading-relaxed text-[#728178]">
              Your Google account is not currently authorized for the JourneyLite admin dashboard.
            </p>

            {email ? (
              <div className="mt-8 rounded-2xl border border-[#dbe2dd] bg-[#f7faf7] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#84978b]">Signed in account</p>
                <p className="mt-2 break-all text-lg font-semibold text-[#173c2b]">{email}</p>
              </div>
            ) : null}

            <div className="mt-8 rounded-2xl border border-[#f0c8b7] bg-[#fff8f4] p-5 text-[#76351f]">
              <div className="flex gap-3">
                <Mail className="mt-1 size-5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Contact your administrator</p>
                  <p className="mt-1 leading-relaxed">
                    Ask a JourneyLite administrator to add your Google email address to the approved admin access list.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild className="h-14 rounded-xl !bg-[#153f2b] px-6 text-base font-semibold !text-white hover:!bg-[#0f3322]">
                <Link href="/admin/login">Try another account</Link>
              </Button>
              <Button asChild className="h-14 rounded-xl border-[#dbe2dd] px-6 text-base font-semibold text-[#173c2b] hover:bg-[#f7faf7]" variant="outline">
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  Return to public site
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoRow({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center border-b border-white/15 pb-6 last:border-0">
      <span className="text-3xl font-semibold text-[#e9f4ed]">{value}</span>
      <span className="text-xl text-[#85b891]">{label}</span>
    </div>
  );
}
