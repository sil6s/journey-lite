import Image from "next/image";
import Link from "next/link";
import { isValidElement, type ReactNode } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "next-sanity";
import { urlFor } from "@/src/lib/sanity/image";

type PortableTextRendererProps = {
  value: PortableTextBlock[];
};

type CtaLink = {
  label?: string;
  href?: string;
};

type FactCard = {
  _key?: string;
  label?: string;
  value?: string;
  description?: string;
};

type FactCardsValue = {
  title?: string;
  cards?: FactCard[];
};

type CtaBlockValue = {
  eyebrow?: string;
  title?: string;
  text?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
};

type SectionBreakValue = {
  label?: string;
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-12 scroll-mt-28 font-serif text-3xl leading-tight text-[#1f2c25] md:text-4xl" id={slugifyNode(children)}>
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className="mt-8 text-2xl font-semibold leading-tight text-[#1f2c25]">{children}</h3>,
    normal: ({ children }) => <p className="mt-5 text-base leading-8 text-[#53635b]">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="mt-8 border-l-4 border-[#145c42] bg-[#edf4ef] px-5 py-4 text-base leading-8 text-[#355346]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 text-base leading-8 text-[#53635b]">{children}</ul>,
    number: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-base leading-8 text-[#53635b]">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = href.startsWith("http");

      if (!isExternal) {
        return (
          <Link className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
            {children}
          </Link>
        );
      }

      return (
        <a
          className="font-semibold text-[#145c42] underline-offset-4 hover:underline"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const alt = value.alt || "JourneyLite blog article image";
      return (
        <figure className="my-10 overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-sm">
          <Image
            alt={alt}
            className="h-auto w-full object-cover"
            height={720}
            src={urlFor(value).width(1100).height(680).fit("crop").url()}
            width={1100}
          />
          {value.alt ? <figcaption className="px-4 py-3 text-sm text-[#64736b]">{value.alt}</figcaption> : null}
        </figure>
      );
    },
    callout: ({ value }) => (
      <aside className="my-8 rounded-xl border border-[#cbd9d1] bg-[#edf4ef] p-5">
        {value?.title ? <h3 className="text-xl font-semibold text-[#1f2c25]">{value.title}</h3> : null}
        {value?.text ? <p className="mt-2 text-sm leading-6 text-[#53635b]">{value.text}</p> : null}
      </aside>
    ),
    factCards: ({ value }) => <FactCards value={value as FactCardsValue} />,
    ctaBlock: ({ value }) => <ArticleCta value={value as CtaBlockValue} />,
    sectionBreak: ({ value }) => <SectionBreak value={value as SectionBreakValue} />,
  },
};

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return <PortableText components={components} value={value} />;
}

function FactCards({ value }: { value: FactCardsValue }) {
  const cards = value.cards?.filter((card) => card.label || card.value || card.description) ?? [];
  if (!cards.length) return null;

  return (
    <section className="my-10 rounded-2xl border border-[#dce4df] bg-[#f8fbf9] p-5">
      <h3 className="font-serif text-2xl leading-tight text-[#1f2c25]">{value.title || "Quick facts"}</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {cards.map((card, index) => (
          <article className="rounded-xl border border-[#dce4df] bg-white p-4 shadow-sm" key={card._key ?? `${card.label}-${index}`}>
            {card.label ? <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">{card.label}</p> : null}
            {card.value ? <p className="mt-2 text-2xl font-semibold leading-tight text-[#1f2c25]">{card.value}</p> : null}
            {card.description ? <p className="mt-2 text-sm leading-6 text-[#53635b]">{card.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ArticleCta({ value }: { value: CtaBlockValue }) {
  if (!value.title && !value.text) return null;

  return (
    <aside className="my-10 rounded-2xl border border-[#145c42]/20 bg-[#0f3e2e] p-6 text-white shadow-lg shadow-[#20372b]/10">
      {value.eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b9d2c5]">{value.eyebrow}</p> : null}
      {value.title ? <h3 className="mt-3 font-serif text-3xl leading-tight">{value.title}</h3> : null}
      {value.text ? <p className="mt-3 text-sm leading-6 text-[#d8e6de]">{value.text}</p> : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <CtaButtonLink cta={value.primaryCta} variant="primary" />
        <CtaButtonLink cta={value.secondaryCta} variant="secondary" />
      </div>
    </aside>
  );
}

function CtaButtonLink({ cta, variant }: { cta?: CtaLink; variant: "primary" | "secondary" }) {
  if (!cta?.href || !cta.label) return null;

  const className =
    variant === "primary"
      ? "inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#0f3e2e] transition hover:bg-[#edf4ef]"
      : "inline-flex rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10";

  if (cta.href.startsWith("http")) {
    return (
      <a className={className} href={cta.href} rel="noopener noreferrer" target="_blank">
        {cta.label}
      </a>
    );
  }

  return (
    <Link className={className} href={cta.href}>
      {cta.label}
    </Link>
  );
}

function SectionBreak({ value }: { value: SectionBreakValue }) {
  return (
    <div className="my-12 flex items-center gap-4" aria-hidden={!value.label}>
      <div className="h-px flex-1 bg-[#dce4df]" />
      {value.label ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64736b]">{value.label}</p> : null}
      <div className="h-px flex-1 bg-[#dce4df]" />
    </div>
  );
}

function slugifyNode(value: ReactNode) {
  return nodeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nodeText(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(value)) return nodeText(value.props.children);
  return "";
}
