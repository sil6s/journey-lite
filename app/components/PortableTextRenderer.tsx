import Image from "next/image";
import Link from "next/link";
import { isValidElement, type ReactNode } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "next-sanity";
import { urlFor } from "@/src/lib/sanity/image";

type PortableTextRendererProps = {
  value: PortableTextBlock[];
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
  },
};

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return <PortableText components={components} value={value} />;
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
