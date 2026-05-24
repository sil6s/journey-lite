import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "../components/marketing";

export function AboutHero({
  eyebrow,
  title,
  intro,
  primaryCta = ["Request an Appointment", "/contact"],
  secondaryCta,
  imageSrc,
  imageAlt,
  imageCaption,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta?: [string, string];
  secondaryCta?: [string, string];
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
}) {
  return (
    <section className="bg-[#f7f8f6]">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="max-w-5xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#516059]">{intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTAButton href={primaryCta[1]}>{primaryCta[0]}</CTAButton>
            {secondaryCta ? (
              <CTAButton href={secondaryCta[1]} variant="secondary">
                {secondaryCta[0]}
              </CTAButton>
            ) : null}
          </div>
        </div>
        {imageSrc ? (
          <figure className="mt-10 overflow-hidden rounded-2xl border border-[#d6e1da] bg-white shadow-2xl shadow-[#20372b]/10">
            <Image
              alt={imageAlt ?? ""}
              className="h-auto w-full"
              height={941}
              priority
              src={imageSrc}
              width={1672}
            />
            {imageCaption ? (
              <figcaption className="border-t border-[#dce4df] bg-white px-5 py-4 text-sm font-medium text-[#53635b]">
                {imageCaption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </section>
  );
}

export function StatStrip({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="border-y border-[#dce4df] bg-white" aria-label="JourneyLite experience and quality statistics">
      <div className="mx-auto grid max-w-7xl gap-px px-5 py-6 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
        {stats.map((item) => (
          <div className="rounded-lg bg-[#f8fbf9] p-4" key={item.label}>
            <p className="text-2xl font-semibold text-[#145c42]">{item.value}</p>
            <p className="mt-1 text-xs font-medium leading-5 text-[#53635b]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CardGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(([title, copy]) => (
        <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm shadow-[#20372b]/5" key={title}>
          <h3 className="text-lg font-semibold text-[#1f2c25]">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#53635b]">{copy}</p>
        </article>
      ))}
    </div>
  );
}

export function BadgeList({ items }: { items: string[] }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {items.map((item) => (
        <span
          className="rounded-full border border-[#b7cec2] bg-white px-4 py-2 text-sm font-semibold leading-6 text-[#145c42] shadow-sm shadow-[#20372b]/5"
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function PathwayCard({ title, copy, href, cta }: { title: string; copy: string; href: string; cta: string }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#dce4df] bg-white p-6 shadow-sm shadow-[#20372b]/5">
      <h3 className="text-2xl font-semibold text-[#1f2c25]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{copy}</p>
      <Link className="mt-auto pt-6 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
        {cta}
      </Link>
    </article>
  );
}

export function LinkCardGrid({
  items,
}: {
  items: { title: string; copy: string; href: string; cta: string }[];
}) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PathwayCard copy={item.copy} cta={item.cta} href={item.href} key={item.title} title={item.title} />
      ))}
    </div>
  );
}

export function DietitianCard({
  dietitian,
}: {
  dietitian: {
    name: string;
    role: string;
    email: string;
    imageSrc: string;
    alt: string;
    description: string;
    focus: string[];
  };
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-xl shadow-[#20372b]/8">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#f1f6f3] p-6">
          <div className="overflow-hidden rounded-2xl border border-[#cbd9d1] bg-white shadow-sm">
            <Image alt={dietitian.alt} className="aspect-[4/5] w-full object-cover object-top" height={560} src={dietitian.imageSrc} width={448} />
          </div>
          <p className="m-4 rounded-full bg-white px-3 py-2 text-center text-xs font-semibold text-[#355346]">
            Registered dietitian nutrition support
          </p>
        </aside>
        <div className="p-6 lg:p-8">
          <p className="eyebrow">Bariatric dietitian</p>
          <h3 className="mt-3 text-3xl font-semibold leading-tight text-[#1f2c25]">{dietitian.name}</h3>
          <p className="mt-2 text-base font-semibold text-[#145c42]">{dietitian.role}</p>
          <p className="mt-4 text-sm leading-7 text-[#53635b]">{dietitian.description}</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {dietitian.focus.map((item) => (
              <li className="rounded-lg border border-[#dce4df] bg-[#fbfdfb] px-3 py-2 text-sm leading-6 text-[#53635b]" key={item}>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTAButton href={`mailto:${dietitian.email}`}>Email {dietitian.role}</CTAButton>
            <CTAButton href="/contact" variant="secondary">
              Request appointment
            </CTAButton>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CTASection({
  eyebrow,
  title,
  copy,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  copy: string;
  primary: [string, string];
  secondary?: [string, string];
}) {
  return (
    <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {eyebrow ? <p className="eyebrow text-[#b9d2c5]">{eyebrow}</p> : null}
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">{copy}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <CTAButton href={primary[1]} variant="light">
            {primary[0]}
          </CTAButton>
          {secondary ? (
            <CTAButton href={secondary[1]} variant="outline">
              {secondary[0]}
            </CTAButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-8 divide-y divide-[#dce4df] rounded-2xl border border-[#dce4df] bg-white">
      {items.map(([question, answer]) => (
        <details className="group p-5" key={question}>
          <summary className="cursor-pointer list-none text-base font-semibold text-[#1f2c25]">
            {question}
          </summary>
          <p className="mt-3 text-sm leading-7 text-[#53635b]">{answer}</p>
        </details>
      ))}
    </div>
  );
}
