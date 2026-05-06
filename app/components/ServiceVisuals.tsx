import Image from "next/image";
import type { ServicePageData, SupportingVisual } from "./serviceData";

export function ServiceHeroVisual({ service }: { service: ServicePageData }) {
  return (
    <aside className="overflow-hidden rounded-xl border border-[#d6e1da] bg-white shadow-lg shadow-[#20372b]/8">
      <ServiceImageCard
        alt={service.productImageAlt}
        caption={service.productImageCaption}
        image={service.productImage}
        priority
        title={`${service.title} visual`}
      />
      <div className="border-t border-[#edf1ee] bg-[#f8fbf9] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355346]">At a glance</p>
        <div className="mt-3 grid gap-2">
          {service.supportingVisuals.map((item) => (
            <SupportingVisualRow item={item} key={item.title} />
          ))}
        </div>
      </div>
    </aside>
  );
}

export function ServiceImageCard({
  image,
  alt,
  caption,
  title,
  priority = false,
}: {
  image: string;
  alt: string;
  caption: string;
  title: string;
  priority?: boolean;
}) {
  return (
    <figure>
      <div className="relative aspect-[16/10] w-full bg-[#e9f1ec]">
        <Image alt={alt} className="object-cover" fill priority={priority} sizes="(min-width: 1024px) 46vw, 100vw" src={image} />
      </div>
      <ServiceVisualCaption caption={caption} title={title} />
    </figure>
  );
}

export function ServiceVisualCaption({ title, caption }: { title: string; caption: string }) {
  return (
    <figcaption className="border-t border-[#edf1ee] bg-white px-4 py-3">
      <span className="block text-sm font-semibold text-[#1f2c25]">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-[#53635b]">{caption}</span>
    </figcaption>
  );
}

export function ServiceDiagram({ service }: { service: ServicePageData }) {
  const hasPhotoDiagram = service.diagramImage !== "/hero-placeholder.svg";
  const visualImage = hasPhotoDiagram ? service.diagramImage : service.productImage;
  const visualAlt = hasPhotoDiagram ? service.diagramAlt : service.productImageAlt;
  const visualCaption = hasPhotoDiagram ? service.diagramCaption : service.productImageCaption;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm">
      <div className="border-b border-[#edf1ee] bg-[#f8fbf9] p-6">
        <p className="eyebrow">{hasPhotoDiagram ? "Patient example" : "Treatment visual"}</p>
        <h3 className="mt-3 font-serif text-3xl leading-tight text-[#1f2c25]">{service.diagramTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-[#53635b]">{service.diagramDescription}</p>
      </div>
      <div className="p-4 sm:p-6">
        <figure className="overflow-hidden rounded-xl border border-[#dce4df] bg-[#f8fbf9]">
          <div className="relative aspect-[16/9] w-full">
            <Image
              alt={visualAlt}
              className="object-contain"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              src={visualImage}
            />
          </div>
          <ServiceVisualCaption caption={visualCaption} title={service.diagramTitle} />
        </figure>
        <div className="mt-5 rounded-xl border border-[#d8c88b] bg-[#fffdf4] p-4 text-sm leading-6 text-[#5e5235]">
          <p className="font-semibold text-[#1f2c25]">Accessible summary</p>
          <p className="mt-1">{service.diagramAccessibleSummary}</p>
          <p className="mt-3">{service.visualDisclaimer}</p>
        </div>
      </div>
    </article>
  );
}

export function ServiceComparisonDiagram({ service }: { service: ServicePageData }) {
  const paths = service.comparisonRows.slice(0, 3);

  return (
    <article className="mb-6 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <p className="eyebrow">Visual comparison</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#1f2c25]">How related options differ</h3>
          <p className="mt-3 text-sm leading-6 text-[#53635b]">
            Use this simplified comparison to organize questions about treatment type, follow-up, and fit before your
            consultation.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {paths.map((row, index) => (
            <div className="rounded-xl border border-[#dce4df] bg-[#f8fbf9] p-4" key={row.option}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#145c42] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h4 className="mt-3 text-base font-semibold text-[#1f2c25]">{row.option}</h4>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#64736b]">{row.type}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function SupportingVisualRow({ item }: { item: SupportingVisual }) {
  return (
    <div className="grid grid-cols-[10px_1fr] gap-3 rounded-lg border border-[#dce4df] bg-white p-3">
      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#145c42]" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-[#1f2c25]">{item.title}</p>
        <p className="mt-1 text-xs leading-5 text-[#53635b]">{item.description}</p>
      </div>
    </div>
  );
}
