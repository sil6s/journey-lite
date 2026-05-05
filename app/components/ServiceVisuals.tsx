import Image from "next/image";
import type { ServiceDiagramType, ServicePageData, SupportingVisual } from "./serviceData";

export function ServiceHeroVisual({ service }: { service: ServicePageData }) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-[#d6e1da] bg-white shadow-2xl shadow-[#20372b]/10">
      <ServiceImageCard
        alt={service.productImageAlt}
        caption={service.productImageCaption}
        image={service.productImage}
        priority
        title={`${service.title} visual`}
      />
      <div className="border-t border-[#edf1ee] bg-[#f8fbf9] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355346]">At a glance</p>
        <div className="mt-4 grid gap-3">
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
      <div className="relative aspect-[4/3] w-full bg-[#e9f1ec]">
        <Image alt={alt} className="object-cover" fill priority={priority} sizes="(min-width: 1024px) 46vw, 100vw" src={image} />
      </div>
      <ServiceVisualCaption caption={caption} title={title} />
    </figure>
  );
}

export function ServiceVisualCaption({ title, caption }: { title: string; caption: string }) {
  return (
    <figcaption className="border-t border-[#edf1ee] bg-white px-5 py-4">
      <span className="block text-sm font-semibold text-[#1f2c25]">{title}</span>
      <span className="mt-1 block text-sm leading-6 text-[#53635b]">{caption}</span>
    </figcaption>
  );
}

export function ServiceDiagram({ service }: { service: ServicePageData }) {
  const labels = diagramLabels(service.diagramType);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm">
      <div className="border-b border-[#edf1ee] bg-[#f8fbf9] p-6">
        <p className="eyebrow">Educational diagram</p>
        <h3 className="mt-3 font-serif text-3xl leading-tight text-[#1f2c25]">{service.diagramTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-[#53635b]">{service.diagramDescription}</p>
      </div>
      <div className="p-4 sm:p-6">
        <DiagramSvg
          accessibleSummary={service.diagramAccessibleSummary}
          labels={labels}
          title={service.diagramTitle}
          type={service.diagramType}
        />
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
    <div className="grid grid-cols-[34px_1fr] gap-3 rounded-lg border border-[#dce4df] bg-white p-3">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#dfece5] text-sm font-bold text-[#145c42]">
        JL
      </span>
      <div>
        <p className="text-sm font-semibold text-[#1f2c25]">{item.title}</p>
        <p className="mt-1 text-xs leading-5 text-[#53635b]">{item.description}</p>
      </div>
    </div>
  );
}

function DiagramSvg({
  type,
  title,
  accessibleSummary,
  labels,
}: {
  type: ServiceDiagramType;
  title: string;
  accessibleSummary: string;
  labels: string[];
}) {
  if (type === "stomach-reduction") return <StomachReductionSvg accessibleSummary={accessibleSummary} title={title} />;
  if (type === "bypass-pathway" || type === "sadi-pathway") {
    return <PathwaySvg accessibleSummary={accessibleSummary} labels={labels} title={title} type={type} />;
  }
  if (type === "band-placement") return <BandSvg accessibleSummary={accessibleSummary} title={title} />;
  if (type.includes("balloon")) return <BalloonSvg accessibleSummary={accessibleSummary} labels={labels} title={title} type={type} />;

  return <NodeDiagramSvg accessibleSummary={accessibleSummary} labels={labels} title={title} />;
}

function StomachReductionSvg({ title, accessibleSummary }: { title: string; accessibleSummary: string }) {
  return (
    <svg aria-labelledby="sleeve-diagram-title sleeve-diagram-desc" className="h-auto w-full" role="img" viewBox="0 0 760 420">
      <title id="sleeve-diagram-title">{title}</title>
      <desc id="sleeve-diagram-desc">{accessibleSummary}</desc>
      <rect fill="#edf4ef" height="420" rx="28" width="760" />
      <text fill="#1f2c25" fontSize="22" fontWeight="700" x="76" y="66">Before</text>
      <text fill="#1f2c25" fontSize="22" fontWeight="700" x="516" y="66">After sleeve</text>
      <path d="M186 98 C116 118 99 204 130 273 C162 343 238 346 276 291 C317 232 292 128 226 104 C211 99 198 97 186 98Z" fill="#ffffff" stroke="#145c42" strokeWidth="8" />
      <path d="M560 98 C521 136 503 205 518 271 C533 337 585 344 610 291 C640 226 618 141 582 103 C574 96 566 95 560 98Z" fill="#ffffff" stroke="#145c42" strokeWidth="8" />
      <path d="M352 206 H440" stroke="#c99300" strokeLinecap="round" strokeWidth="8" />
      <path d="M421 179 L448 206 L421 233" fill="none" stroke="#c99300" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
      <text fill="#53635b" fontSize="18" x="106" y="374">Larger stomach volume</text>
      <text fill="#53635b" fontSize="18" x="497" y="374">Reduced stomach volume</text>
    </svg>
  );
}

function PathwaySvg({
  title,
  accessibleSummary,
  labels,
  type,
}: {
  title: string;
  accessibleSummary: string;
  labels: string[];
  type: ServiceDiagramType;
}) {
  const accent = type === "sadi-pathway" ? "#c99300" : "#145c42";
  return (
    <svg aria-labelledby="pathway-diagram-title pathway-diagram-desc" className="h-auto w-full" role="img" viewBox="0 0 760 420">
      <title id="pathway-diagram-title">{title}</title>
      <desc id="pathway-diagram-desc">{accessibleSummary}</desc>
      <rect fill="#edf4ef" height="420" rx="28" width="760" />
      <circle cx="170" cy="190" fill="#ffffff" r="64" stroke="#145c42" strokeWidth="8" />
      <rect fill="#ffffff" height="118" rx="44" stroke="#145c42" strokeWidth="8" width="88" x="328" y="132" />
      <path d="M416 190 C500 190 500 98 594 98 C662 98 670 182 598 204 C520 228 506 310 594 318" fill="none" stroke={accent} strokeLinecap="round" strokeWidth="10" />
      <path d="M234 190 H320" stroke={accent} strokeLinecap="round" strokeWidth="10" />
      <text fill="#1f2c25" fontSize="18" fontWeight="700" textAnchor="middle" x="170" y="306">{labels[0]}</text>
      <text fill="#1f2c25" fontSize="18" fontWeight="700" textAnchor="middle" x="372" y="306">{labels[1]}</text>
      <text fill="#1f2c25" fontSize="18" fontWeight="700" textAnchor="middle" x="592" y="354">{labels[2]}</text>
    </svg>
  );
}

function BandSvg({ title, accessibleSummary }: { title: string; accessibleSummary: string }) {
  return (
    <svg aria-labelledby="band-diagram-title band-diagram-desc" className="h-auto w-full" role="img" viewBox="0 0 760 420">
      <title id="band-diagram-title">{title}</title>
      <desc id="band-diagram-desc">{accessibleSummary}</desc>
      <rect fill="#edf4ef" height="420" rx="28" width="760" />
      <path d="M360 80 C270 106 246 208 286 293 C328 382 433 368 472 294 C516 211 462 99 389 82 C378 79 368 78 360 80Z" fill="#ffffff" stroke="#145c42" strokeWidth="8" />
      <ellipse cx="374" cy="150" fill="none" rx="88" ry="26" stroke="#c99300" strokeWidth="12" />
      <line stroke="#c99300" strokeLinecap="round" strokeWidth="8" x1="464" x2="548" y1="150" y2="118" />
      <circle cx="570" cy="110" fill="#ffffff" r="28" stroke="#c99300" strokeWidth="8" />
      <text fill="#1f2c25" fontSize="22" fontWeight="700" x="70" y="92">Adjustable band</text>
      <text fill="#53635b" fontSize="18" x="70" y="126">Upper stomach support</text>
      <text fill="#1f2c25" fontSize="18" fontWeight="700" x="515" y="198">Access port</text>
    </svg>
  );
}

function BalloonSvg({
  title,
  accessibleSummary,
  labels,
  type,
}: {
  title: string;
  accessibleSummary: string;
  labels: string[];
  type: ServiceDiagramType;
}) {
  return (
    <svg aria-labelledby="balloon-diagram-title balloon-diagram-desc" className="h-auto w-full" role="img" viewBox="0 0 760 420">
      <title id="balloon-diagram-title">{title}</title>
      <desc id="balloon-diagram-desc">{accessibleSummary}</desc>
      <rect fill="#edf4ef" height="420" rx="28" width="760" />
      <path d="M362 76 C274 102 250 202 290 288 C332 374 430 364 472 292 C518 213 462 98 390 80 C379 77 370 76 362 76Z" fill="#ffffff" stroke="#145c42" strokeWidth="8" />
      <circle cx="380" cy="214" fill="#dfece5" r="72" stroke="#145c42" strokeWidth="8" />
      {type === "adjustable-balloon" ? <path d="M380 142 V286" stroke="#c99300" strokeLinecap="round" strokeWidth="8" /> : null}
      {type === "swallowable-balloon" ? <path d="M226 98 C274 108 309 124 338 160" fill="none" stroke="#c99300" strokeDasharray="10 12" strokeLinecap="round" strokeWidth="8" /> : null}
      <text fill="#1f2c25" fontSize="18" fontWeight="700" textAnchor="middle" x="138" y="338">{labels[0]}</text>
      <text fill="#1f2c25" fontSize="18" fontWeight="700" textAnchor="middle" x="380" y="338">{labels[1]}</text>
      <text fill="#1f2c25" fontSize="18" fontWeight="700" textAnchor="middle" x="612" y="338">{labels[2]}</text>
      <circle cx="138" cy="288" fill="#ffffff" r="24" stroke="#c99300" strokeWidth="6" />
      <circle cx="612" cy="288" fill="#ffffff" r="24" stroke="#c99300" strokeWidth="6" />
    </svg>
  );
}

function NodeDiagramSvg({ title, accessibleSummary, labels }: { title: string; accessibleSummary: string; labels: string[] }) {
  return (
    <svg aria-labelledby="node-diagram-title node-diagram-desc" className="h-auto w-full" role="img" viewBox="0 0 760 420">
      <title id="node-diagram-title">{title}</title>
      <desc id="node-diagram-desc">{accessibleSummary}</desc>
      <rect fill="#edf4ef" height="420" rx="28" width="760" />
      {[120, 310, 500].map((x, index) => (
        <g key={x}>
          <circle cx={x} cy="162" fill="#ffffff" r="58" stroke="#145c42" strokeWidth="7" />
          <text fill="#145c42" fontSize="30" fontWeight="800" textAnchor="middle" x={x} y="173">{index + 1}</text>
          <foreignObject height="78" width="160" x={x - 80} y="250">
            <p className="m-0 text-center text-base font-semibold leading-6 text-[#1f2c25]">{labels[index]}</p>
          </foreignObject>
          {index < 2 ? (
            <>
              <path d={`M${x + 64} 162 H${x + 124}`} stroke="#c99300" strokeLinecap="round" strokeWidth="7" />
              <path d={`M${x + 108} 142 L${x + 130} 162 L${x + 108} 182`} fill="none" stroke="#c99300" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
            </>
          ) : null}
        </g>
      ))}
      <rect fill="#ffffff" height="72" rx="18" stroke="#d6e1da" width="160" x="582" y="126" />
      <text fill="#1f2c25" fontSize="16" fontWeight="700" x="606" y="157">Provider</text>
      <text fill="#53635b" fontSize="15" x="606" y="181">evaluation</text>
    </svg>
  );
}

function diagramLabels(type: ServiceDiagramType) {
  const labels: Record<ServiceDiagramType, string[]> = {
    "stomach-reduction": ["Before", "Sleeve shape", "Follow-up"],
    "bypass-pathway": ["Small pouch", "New pathway", "Monitoring"],
    "sadi-pathway": ["Sleeve", "Rerouting", "Nutrition follow-up"],
    "band-placement": ["Band", "Port", "Adjustments"],
    "revision-pathway": ["Evaluate history", "Review anatomy", "Choose next step"],
    "care-pathway": ["Consultation", "Procedure plan", "Follow-up"],
    "balloon-placement": ["Placement", "Balloon support", "Removal"],
    "balloon-timeline": ["Placement", "Support period", "Removal"],
    "adjustable-balloon": ["Placement", "Adjustment", "Removal"],
    "swallowable-balloon": ["Education", "Monitoring", "Comparison"],
    "endoscopic-sleeve": ["Endoscopy", "Volume reduction", "Follow-up"],
    "device-education": ["Education", "Device concept", "Comparison"],
    "medication-pathway": ["Screening", "Medication plan", "Follow-up"],
    "dose-timeline": ["Start dose", "Titrate", "Monitor"],
    "daily-monitoring": ["Daily dosing", "Vitals review", "Refills"],
    "appetite-monitoring": ["Appetite support", "Safety checks", "Progress"],
    "craving-pathway": ["Cravings", "Appetite support", "Monitoring"],
    "glp1-signaling": ["GLP-1 support", "Titration", "Follow-up"],
    "gip-glp1-signaling": ["Dual support", "Titration", "Follow-up"],
    "regain-support": ["Evaluate regain", "Renew plan", "Follow-up"],
    "pricing-factors": ["Treatment type", "Coverage", "Plan cost"],
    "option-comparison": ["Surgery", "Procedures", "Medications"],
  };

  return labels[type];
}
