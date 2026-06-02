import Image from "next/image";
import Link from "next/link";
import { PortableTextRenderer } from "@/app/components/PortableTextRenderer";
import type { BlogPost, CtaLink, FormDefinition, SanityImageAsset, SitePage, SitePageSection } from "@/src/lib/sanity/types";
import { urlFor } from "@/src/lib/sanity/image";
import { SitePageForm } from "./site-page-form";

export function SitePageRenderer({ page }: { page: SitePage }) {
  const heroImageUrl = page.heroImage ? urlFor(page.heroImage).width(1500).height(920).fit("crop").url() : null;

  return (
    <article>
      <header className="bg-[#f7f8f6]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20 lg:items-center">
          <div>
            <p className="eyebrow">{labelForPageType(page.pageType)}</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
              {page.heroHeadline || page.title}
            </h1>
            {page.heroSubheadline ? <p className="mt-6 max-w-2xl text-lg leading-8 text-[#53635b]">{page.heroSubheadline}</p> : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CtaButton cta={page.primaryCta} variant="primary" />
              <CtaButton cta={page.secondaryCta} variant="secondary" />
            </div>
          </div>
          {heroImageUrl ? (
            <Image
              alt={page.heroImageAlt || page.title}
              className="aspect-[4/3] w-full rounded-2xl border border-[#dce4df] object-cover shadow-xl shadow-[#20372b]/8"
              height={920}
              priority
              src={heroImageUrl}
              width={1500}
            />
          ) : null}
        </div>
      </header>
      <div className="bg-white">
        {(page.sections ?? []).map((section) => (
          <SectionRenderer key={section._key ?? section._type} pageSlug={page.slug} section={section} />
        ))}
      </div>
    </article>
  );
}

function SectionRenderer({ section, pageSlug }: { section: SitePageSection; pageSlug: string }) {
  switch (section._type) {
    case "richTextSection":
      return (
        <PageBand>
          <SectionIntro eyebrow={asString(section.eyebrow)} heading={asString(section.heading)} />
          <div className="max-w-3xl">{Array.isArray(section.content) ? <PortableTextRenderer value={section.content} /> : null}</div>
        </PageBand>
      );
    case "imageTextSection":
      return <ImageTextSection section={section} />;
    case "twoColumnSection":
      return (
        <PageBand tint>
          <SectionIntro heading={asString(section.heading)} />
          <div className="grid gap-5 md:grid-cols-2">
            <TextPanel title={asString(section.leftTitle)} text={asString(section.leftText)} />
            <TextPanel title={asString(section.rightTitle)} text={asString(section.rightText)} />
          </div>
        </PageBand>
      );
    case "ctaBanner":
      return (
        <section className="bg-[#0f3e2e] py-14 text-white lg:py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow text-[#b9d2c5]">{asString(section.eyebrow)}</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">{asString(section.heading)}</h2>
            {asString(section.text) ? <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">{asString(section.text)}</p> : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CtaButton cta={section.primaryCta as CtaLink | undefined} variant="light" />
              <CtaButton cta={section.secondaryCta as CtaLink | undefined} variant="outline" />
            </div>
          </div>
        </section>
      );
    case "faqBlock":
      return <FaqSection section={section} />;
    case "testimonialBlock":
      return (
        <PageBand tint>
          <blockquote className="max-w-4xl border-l-4 border-[#145c42] pl-5">
            <p className="font-serif text-3xl leading-tight text-[#1f2c25]">&ldquo;{asString(section.quote)}&rdquo;</p>
            {asString(section.name) ? <footer className="mt-4 text-sm font-semibold text-[#53635b]">{asString(section.name)}{asString(section.context) ? `, ${asString(section.context)}` : ""}</footer> : null}
          </blockquote>
        </PageBand>
      );
    case "statsHighlights":
      return <ItemGrid section={section} variant="stats" />;
    case "cardGrid":
      return <ItemGrid section={section} variant="cards" />;
    case "processSteps":
      return <ItemGrid section={section} variant="steps" />;
    case "calloutBox":
      return (
        <PageBand>
          <aside className="rounded-xl border border-[#d8c88b] bg-[#fffdf4] p-6 text-[#5e5235]">
            {asString(section.heading) ? <h2 className="text-2xl font-semibold text-[#1f2c25]">{asString(section.heading)}</h2> : null}
            {asString(section.text) ? <p className="mt-3 text-base leading-7">{asString(section.text)}</p> : null}
          </aside>
        </PageBand>
      );
    case "buttonGroup":
      return (
        <PageBand compact>
          <div className={asString(section.alignment) === "center" ? "flex flex-wrap justify-center gap-3" : "flex flex-wrap gap-3"}>
            {asArray<CtaLink>(section.buttons).map((button, index) => <CtaButton cta={button} key={`${button.url}-${index}`} variant={index === 0 ? "primary" : "secondary"} />)}
          </div>
        </PageBand>
      );
    case "dividerSpacer":
      return <DividerSpacer section={section} />;
    case "relatedResources":
      return <RelatedResources section={section} />;
    case "embeddedForm":
      return (
        <PageBand tint>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <SectionIntro heading={asString(section.heading)} />
              {asString(section.introText) ? <p className="mt-3 text-base leading-7 text-[#53635b]">{asString(section.introText)}</p> : null}
            </div>
            {section.form ? <SitePageForm form={section.form as FormDefinition} pageSlug={pageSlug} /> : null}
          </div>
        </PageBand>
      );
    default:
      return null;
  }
}

function ImageTextSection({ section }: { section: SitePageSection }) {
  const image = section.image as SanityImageAsset | undefined;
  const src = image ? urlFor(image).width(1000).height(760).fit("crop").url() : null;
  const imageFirst = asString(section.imagePosition) === "left";

  return (
    <PageBand>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        {src ? <Image alt={asString(section.imageAlt) || asString(section.heading) || "JourneyLite page image"} className={`aspect-[4/3] w-full rounded-xl border border-[#dce4df] object-cover ${imageFirst ? "lg:order-first" : "lg:order-last"}`} height={760} src={src} width={1000} /> : null}
        <div>
          <SectionIntro eyebrow={asString(section.eyebrow)} heading={asString(section.heading)} />
          {asString(section.text) ? <p className="mt-4 text-base leading-7 text-[#53635b]">{asString(section.text)}</p> : null}
          <div className="mt-6"><CtaButton cta={section.cta as CtaLink | undefined} variant="primary" /></div>
        </div>
      </div>
    </PageBand>
  );
}

function FaqSection({ section }: { section: SitePageSection }) {
  const items = asArray<{ question?: string; answer?: string }>(section.items);
  return (
    <PageBand>
      <SectionIntro heading={asString(section.heading)} />
      <div className="mt-6 grid gap-3">
        {items.map((item, index) => (
          <details className="rounded-xl border border-[#dce4df] bg-white p-5" key={`${item.question}-${index}`}>
            <summary className="cursor-pointer text-base font-semibold text-[#1f2c25]">{item.question}</summary>
            {item.answer ? <p className="mt-3 text-sm leading-6 text-[#53635b]">{item.answer}</p> : null}
          </details>
        ))}
      </div>
    </PageBand>
  );
}

function ItemGrid({ section, variant }: { section: SitePageSection; variant: "stats" | "cards" | "steps" }) {
  const items = asArray<{ label?: string; value?: string; text?: string; title?: string; link?: CtaLink }>(variant === "steps" ? section.steps : variant === "stats" ? section.items : section.cards);
  return (
    <PageBand tint={variant !== "cards"}>
      <SectionIntro heading={asString(section.heading)} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={`${item.title || item.label || item.value}-${index}`}>
            {variant === "steps" ? <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#145c42]">Step {index + 1}</p> : null}
            {item.value ? <p className="font-serif text-4xl leading-tight text-[#145c42]">{item.value}</p> : null}
            <h3 className="mt-2 text-xl font-semibold leading-tight text-[#1f2c25]">{item.title || item.label}</h3>
            {item.text ? <p className="mt-3 text-sm leading-6 text-[#53635b]">{item.text}</p> : null}
            {item.link?.url && item.link.label ? <div className="mt-4"><CtaButton cta={item.link} variant="secondary" /></div> : null}
          </article>
        ))}
      </div>
    </PageBand>
  );
}

function RelatedResources({ section }: { section: SitePageSection }) {
  const resources = asArray<BlogPost>(section.resources);
  if (!resources.length) return null;
  return (
    <PageBand tint>
      <SectionIntro heading={asString(section.heading) || "Related resources"} />
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {resources.map((resource) => (
          <Link className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#145c42]" href={`/blog/${resource.slug}`} key={resource._id}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">{resource.category?.name ?? "JourneyLite article"}</p>
            <h3 className="mt-3 text-xl font-semibold leading-tight text-[#1f2c25]">{resource.title}</h3>
            {resource.excerpt ? <p className="mt-3 text-sm leading-6 text-[#53635b]">{resource.excerpt}</p> : null}
          </Link>
        ))}
      </div>
    </PageBand>
  );
}

function TextPanel({ title, text }: { title?: string; text?: string }) {
  return (
    <div className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm">
      {title ? <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3> : null}
      {text ? <p className="mt-3 text-sm leading-6 text-[#53635b]">{text}</p> : null}
    </div>
  );
}

function PageBand({ children, tint, compact }: { children: React.ReactNode; tint?: boolean; compact?: boolean }) {
  return (
    <section className={`${tint ? "bg-[#f7f8f6]" : "bg-white"} ${compact ? "py-8" : "py-14 lg:py-16"}`}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">{children}</div>
    </section>
  );
}

function SectionIntro({ eyebrow, heading }: { eyebrow?: string; heading?: string }) {
  if (!eyebrow && !heading) return null;
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {heading ? <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25] md:text-5xl">{heading}</h2> : null}
    </div>
  );
}

function DividerSpacer({ section }: { section: SitePageSection }) {
  const size = asString(section.size);
  const height = size === "large" ? "py-10" : size === "small" ? "py-4" : "py-7";
  return (
    <div className={`bg-white ${height}`}>
      {section.showLine !== false ? <div className="mx-auto h-px max-w-7xl bg-[#dce4df]" /> : null}
    </div>
  );
}

function CtaButton({ cta, variant }: { cta?: CtaLink; variant: "primary" | "secondary" | "light" | "outline" }) {
  const href = cta?.url || cta?.href;
  if (!href || !cta?.label) return null;
  const className =
    variant === "primary"
      ? "inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f4d37]"
      : variant === "light"
        ? "inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#0f3e2e] transition hover:bg-[#edf4ef]"
        : variant === "outline"
          ? "inline-flex min-h-11 items-center justify-center rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          : "inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd9d1] px-5 py-3 text-sm font-semibold text-[#145c42] transition hover:border-[#145c42] hover:bg-[#edf4ef]";
  if (href.startsWith("http")) return <a className={className} href={href} rel="noopener noreferrer" target="_blank">{cta.label}</a>;
  return <Link className={className} href={href}>{cta.label}</Link>;
}

function labelForPageType(type?: string) {
  if (!type) return "JourneyLite";
  return type.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
