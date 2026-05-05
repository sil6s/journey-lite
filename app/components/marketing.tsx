import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  cincinnatiLocation,
  comparisonRows,
  locationGroups,
  medicationComparisonRows,
  navGroups,
  phoneHref,
  phoneNumber,
  reviewBadge,
  reviewCards,
} from "./data";

type ButtonVariant = "primary" | "secondary" | "light" | "outline";

export function CTAButton({
  href,
  children,
  variant = "primary",
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  ariaLabel?: string;
}) {
  const classes: Record<ButtonVariant, string> = {
    primary:
      "bg-[#145c42] text-white shadow-sm shadow-[#145c42]/20 hover:bg-[#0f4d37] focus-visible:ring-[#145c42]",
    secondary:
      "border border-[#cbd7d0] bg-white text-[#17362a] hover:border-[#145c42] hover:text-[#145c42] focus-visible:ring-[#145c42]",
    light:
      "bg-white text-[#0f3e2e] hover:bg-[#eff6f2] focus-visible:ring-white",
    outline:
      "border border-[#90aa9c] text-white hover:bg-white/10 focus-visible:ring-white",
  };

  return (
    <Link
      aria-label={ariaLabel}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${classes[variant]}`}
      href={href}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce4df] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link
          href="/"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-4"
        >
          <Image
            alt="JourneyLite Bariatric Physicians"
            className="h-auto w-[210px] max-w-[58vw] sm:w-[250px] lg:w-[270px]"
            height={160}
            priority
            src="/journeylite-logo.svg"
            width={560}
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {navGroups.map((group) => (
            <div className="group relative" key={group.label}>
              <button
                aria-haspopup="true"
                className="rounded-md px-3 py-2 text-sm font-medium text-[#314139] transition hover:bg-[#f0f5f2] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                type="button"
              >
                {group.label}
                <span aria-hidden="true" className="ml-1 text-[#6b7871]">
                  v
                </span>
              </button>
              <div className="invisible absolute left-0 top-full w-[320px] translate-y-2 rounded-lg border border-[#dce4df] bg-white p-2 opacity-0 shadow-xl shadow-[#21372c]/10 transition group-focus-within:visible group-focus-within:translate-y-1 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                {group.items.map((item) => (
                  <Link
                    className="block rounded-md px-3 py-3 transition hover:bg-[#f2f7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    href={item.href}
                    key={item.label}
                  >
                    <span className="block text-sm font-semibold text-[#203028]">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#64736b]">{item.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-[#314139] transition hover:bg-[#f0f5f2] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            href="/#locations"
          >
            Locations
          </Link>
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-[#314139] transition hover:bg-[#f0f5f2] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            href="/blog"
          >
            Blog
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CallMenu />
          <CTAButton href="/#quiz">Book Consultation</CTAButton>
        </div>

        <details className="group relative lg:hidden">
          <summary className="list-none rounded-md border border-[#cbd7d0] bg-white px-3 py-2 text-sm font-semibold text-[#17362a] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]">
            Menu
          </summary>
          <div className="absolute right-0 top-12 max-h-[80vh] w-[min(92vw,360px)] overflow-y-auto rounded-lg border border-[#dce4df] bg-white p-3 shadow-xl">
            {navGroups.map((group) => (
              <div className="border-b border-[#edf1ee] py-2 last:border-0" key={group.label}>
                <p className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#66756d]">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    className="block rounded-md px-2 py-2 text-sm font-medium text-[#26372e] hover:bg-[#f2f7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    href={item.href}
                    key={item.label}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="grid gap-2 pt-3">
              <CTAButton href="/#quiz">Book Consultation</CTAButton>
              <CallMenu inline />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

export function CallMenu({ inline = false }: { inline?: boolean }) {
  const callOptions = [
    { label: "JourneyLite Main Line", number: phoneNumber, href: phoneHref },
    ...cincinnatiLocation.panels.map((panel) => ({
      label: panel.title,
      number: panel.voice,
      href: panel.voiceHref,
    })),
    ...locationGroups.flatMap((group) =>
      group.locations.map((location) => ({
        label: `${location.city}, ${location.state}`,
        number: location.phone,
        href: `tel:+1${location.phone.replace(/\D/g, "")}`,
      })),
    ),
  ];

  return (
    <details className={inline ? "group" : "group relative"}>
      <summary className="inline-flex min-h-11 w-full cursor-pointer list-none items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-5 py-3 text-sm font-semibold text-[#17362a] transition marker:hidden hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 lg:w-auto">
        Call
      </summary>
      <div
        className={
          inline
            ? "mt-2 rounded-lg border border-[#dce4df] bg-white p-2 shadow-sm"
            : "invisible absolute right-0 top-full z-50 mt-2 w-[340px] translate-y-1 rounded-lg border border-[#dce4df] bg-white p-2 opacity-0 shadow-xl shadow-[#21372c]/10 transition group-open:visible group-open:translate-y-0 group-open:opacity-100"
        }
      >
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#66756d]">
          Call a JourneyLite location
        </p>
        <div className="grid gap-1">
          {callOptions.map((option) => (
            <a
              className="rounded-md px-3 py-3 text-sm transition hover:bg-[#f2f7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              href={option.href}
              key={`${option.label}-${option.number}`}
            >
              <span className="block font-semibold text-[#1f2c25]">{option.label}</span>
              <span className="mt-1 block font-semibold text-[#145c42]">{option.number}</span>
            </a>
          ))}
        </div>
      </div>
    </details>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0b2c21] text-[#d1dfd7]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2 lg:grid-cols-6 lg:px-8">
        <div>
          <div className="inline-flex rounded-md bg-white p-2">
            <Image
              alt="JourneyLite Bariatric Physicians"
              className="h-auto w-[260px]"
              height={160}
              src="/journeylite-logo.svg"
              width={560}
            />
          </div>
          <p className="mt-3 text-sm leading-6">
            Bariatric surgery, non-surgical weight loss, and medication-supported care across Ohio, Kentucky, and
            Indiana.
          </p>
        </div>
        <FooterLinks
          title="Surgical Options"
          links={[
            ["Gastric Sleeve", "/#gastric-sleeve"],
            ["Lap Band", "/#lap-band-surgery"],
            ["Gastric Bypass", "/#gastric-bypass"],
            ["SADI Surgery", "/#sadi-surgery"],
            ["Gastric Band Revision", "/#gastric-band-revision"],
            ["Gastric Sleeve Revision", "/#gastric-sleeve-revision"],
            ["General Surgery", "/#general-surgery"],
          ]}
        />
        <FooterLinks
          title="Non-Surgical"
          links={[
            ["Gastric Balloon", "/gastric-balloon"],
            ["Spatz Adjustable Balloon", "/#spatz-adjustable-gastric-balloon"],
            ["Gastric Balloon Pricing", "/#pricing"],
            ["Balloon Instructions", "/gastric-balloon"],
            ["Appointment Request", "/#quiz"],
          ]}
        />
        <FooterLinks
          title="Medications"
          links={[
            ["Prescription Medication", "/#medications"],
            ["Injectable Medications", "/#injectable-medications"],
            ["Oral Medications", "/#oral-medications"],
            ["After Weight Loss Surgery", "/#post-op-weight-regain"],
            ["Medication Pricing", "/#medication-pricing"],
          ]}
        />
        <FooterLinks
          title="Resources"
          links={[
            ["Compare Options", "/#compare"],
            ["Pricing & Financing", "/#pricing"],
            ["Physicians", "/our-team"],
            ["Locations", "/#locations"],
            ["Testimonials", "/#reviews"],
            ["Blog", "/blog"],
          ]}
        />
        <div>
          <h2 className="text-sm font-semibold text-white">Contact</h2>
          <p className="mt-3 text-sm">{phoneNumber}</p>
          <CTAButton href="/#quiz" variant="light">
            Book Consultation
          </CTAButton>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link className="underline-offset-4 hover:text-white hover:underline" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "light",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  tone?: "light" | "white" | "soft";
}) {
  const toneClass = {
    light: "bg-[#f7f8f6]",
    white: "bg-white",
    soft: "bg-[#edf4ef]",
  };

  return (
    <section className={`${toneClass[tone]} py-16 lg:py-20`} id={id}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 className="section-title">{title}</h2>
          {intro ? <p className="section-intro">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function FeatureCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-lg border border-[#dce4df] bg-white p-6 shadow-sm shadow-[#20372b]/5 ${className}`}>
      <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-[#53635b]">{children}</div>
    </article>
  );
}

export function ProcedureCard({
  id,
  title,
  description,
  bestFor,
  href,
  cta,
  status,
  className = "",
}: {
  id?: string;
  title: string;
  description: string;
  bestFor: string;
  href: string;
  cta: string;
  status?: string;
  className?: string;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-6 shadow-sm shadow-[#20372b]/5 transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
      id={id}
    >
      {status ? (
        <p className="mb-3 inline-flex w-fit rounded-full bg-[#edf4ef] px-3 py-1 text-xs font-semibold text-[#145c42]">
          {status}
        </p>
      ) : null}
      <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{description}</p>
      <p className="mt-4 rounded-md bg-[#f1f6f3] px-3 py-2 text-xs font-medium leading-5 text-[#355346]">
        {bestFor}
      </p>
      <Link
        className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        href={href}
      >
        {cta}
      </Link>
    </article>
  );
}

export function MedicationComparisonTable() {
  return (
    <div>
      <div className="hidden overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-sm lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#0f3e2e] text-white">
            <tr>
              {["Medication type", "Typical dosing", "Best for", "Common considerations"].map((heading) => (
                <th className="px-4 py-4 font-semibold" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1ee]">
            {medicationComparisonRows.map((row) => (
              <tr key={row.type}>
                <td className="px-4 py-4 font-semibold text-[#1f2c25]">{row.type}</td>
                <td className="px-4 py-4 leading-6 text-[#53635b]">{row.dosing}</td>
                <td className="px-4 py-4 leading-6 text-[#53635b]">{row.bestFor}</td>
                <td className="px-4 py-4 leading-6 text-[#53635b]">{row.considerations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:hidden">
        {medicationComparisonRows.map((row) => (
          <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={row.type}>
            <h3 className="text-lg font-semibold text-[#1f2c25]">{row.type}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-[#355346]">Typical dosing</dt>
                <dd className="text-[#53635b]">{row.dosing}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#355346]">Best for</dt>
                <dd className="text-[#53635b]">{row.bestFor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#355346]">Common considerations</dt>
                <dd className="text-[#53635b]">{row.considerations}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

type MedicationOption = {
  id?: string;
  title: string;
  description: string;
  bestFor: string;
  href: string;
  cta: string;
};

export function MedicationCard({ option }: { option: MedicationOption }) {
  return (
    <article
      className="flex min-h-[218px] flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm shadow-[#20372b]/5"
      id={option.id}
    >
      <h4 className="text-lg font-semibold text-[#1f2c25]">{option.title}</h4>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{option.description}</p>
      <p className="mt-4 rounded-md bg-[#f1f6f3] px-3 py-2 text-xs font-medium leading-5 text-[#355346]">
        {option.bestFor}
      </p>
      <Link
        className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        href={option.href}
      >
        {option.cta}
      </Link>
    </article>
  );
}

export function MedicationCategoryPanel({
  id,
  title,
  intro,
  options,
}: {
  id: string;
  title: string;
  intro: string;
  options: MedicationOption[];
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex h-full flex-col rounded-2xl border border-[#cbd9d1] bg-[#f8fbf9] p-5 shadow-sm lg:p-6"
      id={id}
    >
      <h3 className="text-2xl font-semibold text-[#1f2c25]" id={`${id}-title`}>
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{intro}</p>
      <div className="mt-5 grid flex-1 gap-4">
        {options.map((option) => (
          <MedicationCard key={option.title} option={option} />
        ))}
      </div>
    </section>
  );
}

export function MedicationSupportCard({ option }: { option: MedicationOption }) {
  return (
    <article
      className="flex h-full flex-col rounded-xl border border-[#dce4df] bg-white p-6 shadow-sm shadow-[#20372b]/5"
      id={option.id}
    >
      <h3 className="text-xl font-semibold text-[#1f2c25]">{option.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{option.description}</p>
      <p className="mt-4 rounded-md bg-[#f1f6f3] px-3 py-2 text-xs font-medium leading-5 text-[#355346]">
        {option.bestFor}
      </p>
      <Link
        className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
        href={option.href}
      >
        {option.cta}
      </Link>
    </article>
  );
}

export function MedicationComparisonGuide() {
  return (
    <article className="mt-8 rounded-2xl border border-[#cbd9d1] bg-white p-5 shadow-lg shadow-[#20372b]/5 lg:p-8">
      <div className="max-w-4xl">
        <h3 className="text-2xl font-semibold text-[#1f2c25]">Medication comparison guide</h3>
        <p className="mt-3 text-sm leading-6 text-[#53635b]">
          Use this quick guide to understand how JourneyLite organizes medication-supported weight-loss options. Your
          provider will recommend a plan based on your medical history, goals, medication tolerance, and coverage.
        </p>
      </div>
      <div className="mt-6">
        <MedicationComparisonTable />
      </div>
      <p className="mt-6 rounded-lg border border-[#cbd9d1] bg-[#edf4ef] p-4 text-sm leading-6 text-[#355346]">
        Medication choice depends on medical history, current medications, side effect tolerance, pregnancy status,
        insurance coverage, and provider evaluation. JourneyLite&apos;s prescription weight loss medication programs may
        include oral medications, injectable medications, or post-op weight regain support for eligible patients.
      </p>
    </article>
  );
}

export function MedicationCtaBand() {
  return (
    <section className="mt-8 rounded-2xl border border-[#cbd9d1] bg-[#edf4ef] p-6 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-8">
      <div className="max-w-3xl">
        <h3 className="text-2xl font-semibold text-[#1f2c25]">Ready to compare medication options?</h3>
        <p className="mt-3 text-sm leading-6 text-[#53635b]">
          Schedule a consultation to review oral medications, injectable medications, pricing, and follow-up support
          with the JourneyLite team.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
        <CTAButton href="/#medications" variant="secondary">
          View Medication Options
        </CTAButton>
        <CTAButton href="/#quiz">Start Medication Program</CTAButton>
      </div>
    </section>
  );
}

export function ComparisonCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-lg border border-[#dce4df] bg-white p-6 shadow-sm shadow-[#20372b]/5">
      <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[#53635b]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function StatBand() {
  return (
    <section aria-label="JourneyLite experience statistics" className="bg-[#0f3e2e] text-white">
      <div className="mx-auto grid max-w-7xl gap-3 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {[
          ["6,000+", "Gastric sleeves"],
          ["10,000+", "Procedures"],
          ["20+", "Years experience"],
          ["5", "Regional locations"],
        ].map(([value, label]) => (
          <div className="rounded-xl border border-white/15 bg-white/10 p-6 shadow-sm" key={label}>
            <p className="font-serif text-5xl leading-none md:text-6xl">{value}</p>
            <p className="mt-3 text-base font-semibold text-[#d8e6de]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComparisonTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mt-8">
      <div className="hidden overflow-hidden rounded-lg border border-[#dce4df] bg-white shadow-sm md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#0f3e2e] text-white">
            <tr>
              {["Option", "Type", "Typical use case", "Follow-up needs", "Best for", ""].map((heading) => (
                <th className="px-4 py-4 font-semibold" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1ee]">
            {comparisonRows.map((row) => (
              <tr key={row.option}>
                <td className="px-4 py-4 font-semibold text-[#1f2c25]">{row.option}</td>
                <td className="px-4 py-4 text-[#53635b]">{row.type}</td>
                <td className="px-4 py-4 text-[#53635b]">{row.useCase}</td>
                <td className="px-4 py-4 text-[#53635b]">{row.followUp}</td>
                <td className="px-4 py-4 text-[#53635b]">{row.bestFor}</td>
                <td className="px-4 py-4">
                  <Link className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={row.href}>
                    Compare
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 md:hidden">
        {comparisonRows.map((row) => (
          <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm" key={row.option}>
            <h3 className="text-lg font-semibold text-[#1f2c25]">{row.option}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-[#355346]">Type</dt>
                <dd className="text-[#53635b]">{row.type}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#355346]">Typical use case</dt>
                <dd className="text-[#53635b]">{row.useCase}</dd>
              </div>
              {!compact ? (
                <div>
                  <dt className="font-semibold text-[#355346]">Follow-up needs</dt>
                  <dd className="text-[#53635b]">{row.followUp}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-semibold text-[#355346]">Best for</dt>
                <dd className="text-[#53635b]">{row.bestFor}</dd>
              </div>
            </dl>
            <Link className="mt-4 inline-flex font-semibold text-[#145c42]" href={row.href}>
              Compare this option
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FAQAccordion({
  items,
}: {
  items: {
    question: string;
    answer: string;
  }[];
}) {
  return (
    <div className="mt-8 divide-y divide-[#dce4df] overflow-hidden rounded-lg border border-[#dce4df] bg-white">
      {items.map((item) => (
        <details className="group p-5 open:bg-[#fbfdfb]" key={item.question}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-[#1f2c25] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]">
            {item.question}
            <span className="text-lg text-[#145c42]" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53635b]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function LocationCards({ includeMaps = true }: { includeMaps?: boolean }) {
  const secondaryLocations = locationGroups.flatMap((group) => group.locations.map((location) => ({ ...location, group: group.state })));

  return (
    <div className="mt-8 space-y-8">
      <FeaturedLocationCard includeMap={includeMaps} />

      <section aria-labelledby="regional-locations">
        <div className="max-w-3xl">
          <p className="eyebrow">Regional access</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#1f2c25]" id="regional-locations">
            JourneyLite locations across Ohio, Kentucky, and Indiana
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#53635b]">
            Secondary offices support patients seeking bariatric surgery, non-surgical options, and medical weight loss
            care across the region.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {secondaryLocations.map((loc) => (
            <LocationCard key={`${loc.city}-${loc.state}`} location={loc} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function FeaturedLocationCard({ includeMap = true }: { includeMap?: boolean }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#b7cec2] bg-white shadow-xl shadow-[#20372b]/10">
      <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
        <div className="p-6 lg:p-8">
          <p className="eyebrow">Flagship Cincinnati location</p>
          <p className="mt-3 inline-flex rounded-full bg-[#e4f0e9] px-3 py-1.5 text-xs font-semibold text-[#145c42]">
            {cincinnatiLocation.shortTitle}
          </p>
          <h3 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">
            Cincinnati Weight Loss Surgery Center and Main Office
          </h3>
          <p className="mt-4 text-lg font-semibold text-[#145c42]">{cincinnatiLocation.title}</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#53635b]">{cincinnatiLocation.description}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#53635b]">{cincinnatiLocation.overview}</p>
          <address className="mt-5 not-italic text-sm font-semibold leading-6 text-[#1f2c25]">
            {cincinnatiLocation.address1}
            <br />
            {cincinnatiLocation.address2}
          </address>
          <div className="mt-6 overflow-hidden rounded-xl border border-[#dce4df] bg-[#edf4ef]">
            <Image
              alt="JourneyLite Cincinnati main office and surgery center exterior at 10475 Reading Road"
              className="h-72 w-full object-cover"
              height={520}
              src="/journey-lite-main-office.jpg"
              width={920}
            />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-3 [&_a]:w-full">
              <CTAButton href="/#locations" variant="secondary">
                View Cincinnati Location
              </CTAButton>
            </div>
            <CTAButton href={cincinnatiLocation.panels[0].voiceHref}>Call Cincinnati Office</CTAButton>
            <CTAButton href={cincinnatiLocation.panels[1].voiceHref} variant="secondary">
              Call Surgery Center
            </CTAButton>
            <CTAButton href={cincinnatiLocation.directions} variant="secondary">
              Get Directions
            </CTAButton>
          </div>
        </div>
        <div className="flex flex-col border-t border-[#dce4df] bg-[#edf4ef] p-6 lg:border-l lg:border-t-0 lg:p-8">
          <div className="grid gap-4">
            {cincinnatiLocation.panels.map((panel) => (
              <article className="rounded-xl border border-[#d4ddd7] bg-white p-5 shadow-sm" key={panel.title}>
                <h4 className="text-xl font-semibold text-[#1f2c25]">{panel.title}</h4>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-semibold text-[#355346]">Voice</dt>
                    <dd>
                      <a
                        className="text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                        href={panel.voiceHref}
                      >
                        {panel.voice}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#355346]">Fax</dt>
                    <dd className="text-[#53635b]">{panel.fax}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#355346]">Hours</dt>
                    <dd className="text-[#53635b]">{panel.hours}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          {includeMap ? (
            <div className="mt-5 min-h-[320px] flex-1 overflow-hidden rounded-xl border border-[#cbd9d1] bg-white shadow-sm">
              <iframe
                className="h-full min-h-[320px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={cincinnatiLocation.map}
                title="Map for Cincinnati Main Office and JourneyLite Surgery Center at 10475 Reading Road"
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function LocationCard({
  location,
}: {
  location: {
    city: string;
    state: string;
    address1: string;
    address2: string;
    phone: string;
    directions: string;
  };
}) {
  const telHref = `tel:+1${location.phone.replace(/\D/g, "")}`;

  return (
    <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm shadow-[#20372b]/5">
      <h4 className="text-lg font-semibold text-[#1f2c25]">
        {location.city}, {location.state}
      </h4>
      <p className="mt-2 text-sm leading-6 text-[#53635b]">
        {location.address1}
        <br />
        {location.address2}
        <br />
        <a
          className="font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          href={telHref}
        >
          {location.phone}
        </a>
      </p>
      <div className="mt-auto flex flex-col gap-2 pt-5">
        <CTAButton href="/#locations" variant="secondary">
          View Location
        </CTAButton>
        <CTAButton ariaLabel={`Get directions to ${location.city}`} href={location.directions}>
          Get Directions
        </CTAButton>
      </div>
    </article>
  );
}

export type Physician = {
  displayName: string;
  name: string;
  slug: string;
  initials: string;
  imageSrc?: string;
  avatarAlt: string;
  primaryTitle: string;
  email: string;
  bio: string;
  credibility: string;
  insuranceNote?: string;
  roles: string[];
  education: string[];
  certificationLicensure: string[];
  memberships?: string[];
  clinicalFocus: string[];
  cta: string;
};

export function PhysicianAvatar({ physician }: { physician: Physician }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#cbd9d1] bg-white shadow-sm">
      {physician.imageSrc ? (
        <Image
          alt={physician.avatarAlt}
          className="aspect-[4/5] w-full object-cover object-top"
          height={560}
          src={physician.imageSrc}
          width={448}
        />
      ) : (
        <div
          aria-label={physician.avatarAlt}
          className="flex aspect-[4/5] items-center justify-center bg-white/70"
          role="img"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#bdd3c8] bg-[#edf7f1] text-3xl font-semibold text-[#145c42] shadow-sm">
            {physician.initials}
          </div>
        </div>
      )}
      <p className="m-4 rounded-full bg-[#edf7f1] px-3 py-2 text-center text-xs font-semibold text-[#355346]">
        Weight Loss Surgeon
      </p>
    </div>
  );
}

export function CredentialItem({ item }: { item: string }) {
  return <li className="text-sm leading-6 text-[#53635b]">{item}</li>;
}

export function CredentialGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-[#dce4df] bg-[#fbfdfb] p-4" aria-label={title}>
      <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#355346]">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <CredentialItem item={item} key={item} />
        ))}
      </ul>
    </section>
  );
}

export function SpecialtyChip({ specialty }: { specialty: string }) {
  return (
    <span className="rounded-full border border-[#cbd7d0] bg-white px-3 py-1.5 text-xs font-semibold text-[#355346]">
      {specialty}
    </span>
  );
}

export function PhysicianProfileCard({ physician, expanded = false }: { physician: Physician; expanded?: boolean }) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-xl shadow-[#20372b]/8"
      id={expanded ? physician.slug : undefined}
    >
      <div className="grid gap-0 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">
        <aside className="bg-[#edf4ef] p-6 lg:p-8">
          <PhysicianAvatar physician={physician} />
          <div className="mt-6">
            <p className="text-xl font-semibold leading-tight text-[#1f2c25]">{physician.name}</p>
            <a
              className="mt-4 block break-words text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              href={`mailto:${physician.email}`}
            >
              {physician.email}
            </a>
            <div className="mt-5 flex">
              <CTAButton href={expanded ? "/#quiz" : `/our-team#${physician.slug}`}>{expanded ? "Book Consultation" : physician.cta}</CTAButton>
            </div>
          </div>
        </aside>

        <div className="p-6 lg:p-8">
          <p className="eyebrow">Bariatric physician</p>
          <h3 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">{physician.displayName}</h3>
          <p className="mt-2 text-xl font-semibold leading-7 text-[#1f2c25]">{physician.name}</p>
          <p className="mt-4 text-sm leading-7 text-[#53635b]">{physician.bio}</p>
          <p className="mt-4 text-sm leading-7 text-[#53635b]">{physician.credibility}</p>
          {expanded && physician.insuranceNote ? (
            <p className="mt-4 rounded-lg border border-[#dce4df] bg-[#f8fbf9] p-4 text-sm leading-6 text-[#53635b]">
              {physician.insuranceNote}
            </p>
          ) : null}

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <CredentialGroup title="Roles" items={physician.roles} />
            <CredentialGroup title="Education" items={physician.education} />
            <div className="xl:col-span-2">
              <CredentialGroup title="Certification & Licensure" items={physician.certificationLicensure} />
            </div>
            {expanded && physician.memberships ? (
              <div className="xl:col-span-2">
                <CredentialGroup title="Professional Memberships" items={physician.memberships} />
              </div>
            ) : null}
          </div>

          {expanded ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/#quiz">Book Consultation</CTAButton>
              <CTAButton href="/#compare" variant="secondary">
                Compare Options
              </CTAButton>
              <CTAButton href="/#locations" variant="secondary">
                View Locations
              </CTAButton>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ReviewBadge() {
  return (
    <article className="rounded-xl border border-[#d9c77b] bg-[#fffdf4] p-6 text-left shadow-sm lg:flex lg:items-center lg:justify-between lg:gap-8">
      <div>
        <p className="text-sm font-semibold text-[#1f2c25]">{reviewBadge.title}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-3xl font-semibold text-[#1f2c25]">{reviewBadge.rating}</span>
          <span aria-label="Five star rating" className="text-sm font-semibold text-[#c89516]">
            ★★★★★
          </span>
        </div>
        <p className="mt-2 text-sm text-[#53635b]">
          {reviewBadge.reviews} · {reviewBadge.category}
        </p>
      </div>
      <a
        className="mt-5 inline-flex rounded-md border border-[#d9c77b] bg-white px-4 py-2 text-sm font-semibold text-[#145c42] transition hover:border-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] lg:mt-0 lg:shrink-0"
        href={reviewBadge.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        View Google Reviews
      </a>
    </article>
  );
}

export function ReviewCard({ review }: { review: { name: string; excerpt: string } }) {
  return (
    <article className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf4ef] text-sm font-semibold text-[#145c42]">
          {review.name[0]}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1f2c25]">{review.name}</h3>
          <p className="text-xs text-[#64736b]">Google review</p>
        </div>
      </div>
      <p aria-label="Five star rating" className="mt-4 text-sm font-semibold text-[#c89516]">
        ★★★★★
      </p>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{review.excerpt}</p>
    </article>
  );
}

export function ReviewGrid() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {reviewCards.map((review) => (
        <ReviewCard key={review.name} review={review} />
      ))}
    </div>
  );
}

export function FinalCTA() {
  return (
    <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1.4fr_0.8fr] lg:items-center lg:px-8">
        <div>
          <p className="eyebrow text-[#b9d2c5]">Personalized next step</p>
          <h2 className="max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
            Start your weight loss journey with a personalized plan.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
            Schedule a consultation to compare surgical, non-surgical, and medication-supported options with the
            JourneyLite team.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <CTAButton href="/#quiz" variant="light">
            Book Consultation
          </CTAButton>
          <CTAButton href={phoneHref} variant="outline">
            Call {phoneNumber}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
