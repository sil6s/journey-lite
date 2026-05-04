import Image from "next/image";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const navLinks = [
  { label: "Gastric Sleeve", href: "#services" },
  { label: "Gastric Bypass", href: "#services" },
  { label: "Medications", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Locations", href: "#locations" },
];

const serviceCards = [
  {
    title: "Gastric Sleeve (VSG)",
    summary:
      "Our most performed procedure with a clinically proven pathway for durable weight loss and metabolic improvement.",
    price: "From $6,500",
    featured: true,
  },
  {
    title: "Gastric Bypass",
    summary: "Ideal for advanced obesity and reflux concerns with strong long-term outcomes.",
    price: "From $8,900",
  },
  {
    title: "SADI Surgery",
    summary: "A high-efficacy option for patients needing greater total body weight reduction.",
    price: "From $9,200",
  },
  {
    title: "Gastric Balloon",
    summary: "A non-surgical option for early momentum with physician-guided support.",
    price: "From $3,500",
  },
  {
    title: "Weight Loss Medications",
    summary: "GLP-1 and other evidence-based plans monitored by bariatric specialists.",
    price: "From $250/mo",
  },
];

const locationGroups = [
  {
    state: "Ohio",
    locations: [
      {
        city: "Cincinnati, OH",
        address1: "10475 Reading Rd #117",
        address2: "Cincinnati, OH 45241",
        phone: "(513) 559-1222",
        map: "https://www.google.com/maps?q=10475+Reading+Rd+%23117+Cincinnati+OH+45241&output=embed",
      },
      {
        city: "Columbus, OH",
        address1: "2041 Stringtown Rd",
        address2: "Grove City, OH 43123",
        phone: "(614) 526-4463",
        map: "https://www.google.com/maps?q=2041+Stringtown+Rd+Grove+City+OH+43123&output=embed",
      },
      {
        city: "Dayton, OH",
        address1: "2621 Dryden Rd Suite 301",
        address2: "Moraine, OH 45439",
        phone: "(937) 280-5673",
        map: "https://www.google.com/maps?q=2621+Dryden+Rd+Suite+301+Moraine+OH+45439&output=embed",
      },
    ],
  },
  {
    state: "Indiana",
    locations: [
      {
        city: "Indianapolis, IN",
        address1: "33 E. County Line Road, Suite E",
        address2: "Greenwood, IN",
        phone: "(463) 237-5999",
        map: "https://www.google.com/maps?q=33+E+County+Line+Road+Suite+E+Greenwood+IN&output=embed",
      },
    ],
  },
  {
    state: "Kentucky",
    locations: [
      {
        city: "Northern Kentucky",
        address1: "320 Thomas More Parkway",
        address2: "Crestview Hills, KY",
        phone: "(859) 331-1035",
        map: "https://www.google.com/maps?q=320+Thomas+More+Parkway+Crestview+Hills+KY&output=embed",
      },
    ],
  },
];

export const metadata = {
  title: "JourneyLite Physicians | Weight Loss Surgery Ohio & Gastric Sleeve Cincinnati",
  description:
    "Weight loss surgery Ohio patients trust. JourneyLite Physicians offers gastric sleeve Cincinnati programs, bariatric surgery near me options, and medical weight loss across Ohio, Kentucky, and Indiana.",
};

export default function HomePage() {
  return (
    <div className={`${inter.variable} ${playfair.variable} bg-[#f7f8f6] text-[#37443e]`}>
      <header className="border-b border-[#dde2de]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="text-lg text-[#243129]">
            <span className="font-semibold text-[#145c42]">JourneyLite</span> Physicians
          </a>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-[#145c42]">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:+18774422263" className="hidden text-sm sm:inline">
              (877) 442-2263
            </a>
            <a href="#quiz" className="rounded-md bg-[#145c42] px-4 py-2 text-sm font-medium text-white">
              Book Consultation
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#5f6b64]">20 years • 10,000+ procedures</p>
            <h1 className="font-[var(--font-playfair)] text-5xl leading-tight text-[#1e2b24]">
              Lasting weight loss, backed by <span className="text-[#145c42]">decades</span> of outcomes.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#516059]">
              A high-volume bariatric and medical weight loss practice serving Ohio, Kentucky, and Indiana with surgical,
              non-surgical, and medication-based options.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#quiz" className="rounded-md bg-[#145c42] px-5 py-3 text-sm font-medium text-white">Book Consultation</a>
              <a href="#pricing" className="rounded-md border border-[#cdd5d0] bg-white px-5 py-3 text-sm font-medium">View Pricing</a>
            </div>
          </div>
          <div className="rounded-lg border border-[#d9dfdb] bg-[#e9eeea] p-4">
            <Image src="/hero-placeholder.svg" alt="JourneyLite Physicians clinic" width={640} height={520} className="h-[360px] w-full rounded-md object-cover" priority />
          </div>
        </section>

        <section className="bg-[#0f3e2e] text-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 text-center md:grid-cols-4">
            {[
              ["6,000+", "Gastric Sleeves"],
              ["10,000+", "Procedures"],
              ["20+", "Years Experience"],
              ["5", "Locations"],
            ].map(([n, l]) => (
              <div key={l}><p className="text-4xl font-[var(--font-playfair)]">{n}</p><p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#d0ddd6]">{l}</p></div>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-[var(--font-playfair)] text-4xl text-[#1f2c25]">Surgical, non-surgical, and medication options—chosen with you.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {serviceCards.map((card) => (
              <article key={card.title} className={`rounded-lg border p-5 ${card.featured ? "border-[#145c42] bg-[#145c42] text-white md:col-span-2" : "border-[#d9dfdb] bg-white"}`}>
                <h3 className="font-[var(--font-playfair)] text-2xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-6">{card.summary}</p>
                <p className="mt-4 text-sm font-medium">{card.price}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-y border-[#dde2de] bg-white/70 py-16">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="font-[var(--font-playfair)] text-4xl text-[#1f2c25]">What&apos;s right for you depends on how much you&apos;d like to lose.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["20–50 lbs", "Medication plans and gastric balloon"],
                ["50–150 lbs", "The best fit range for sleeve and bypass", true],
                ["150+ lbs", "Advanced surgery pathways"],
              ].map(([range, text, featured]) => (
                <div key={String(range)} className={`rounded-lg border p-5 text-left ${featured ? "border-[#145c42] bg-[#145c42] text-white" : "border-[#d9dfdb] bg-white"}`}>
                  <h3 className="font-[var(--font-playfair)] text-3xl">{range}</h3>
                  <p className="mt-2 text-sm">{text}</p>
                </div>
              ))}
            </div>
            <a href="#quiz" className="mt-8 inline-block rounded-md bg-[#145c42] px-5 py-3 text-sm font-medium text-white">Get Personalized Plan</a>
          </div>
        </section>

        <section id="quiz" className="bg-[#e8eeea] py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#5f6b64]">Find your fit</p>
              <h2 className="mt-3 font-[var(--font-playfair)] text-4xl text-[#1f2c25]">A 60-second guide to your best-fit option</h2>
              <ul className="mt-6 space-y-3 text-sm leading-6">
                <li>• Clarifies your likely care pathway.</li>
                <li>• Helps estimate timeline and investment.</li>
                <li>• Optional and pressure-free.</li>
              </ul>
            </div>
            <aside className="rounded-xl border border-[#d4dbd6] bg-white p-6">
              <div className="mb-5 flex items-center justify-between text-xs text-[#5f6b64]"><span>Step 1 of 4</span><span>About 60 seconds</span></div>
              <h3 className="font-[var(--font-playfair)] text-3xl text-[#1f2c25]">How much weight are you looking to lose?</h3>
              <div className="mt-6 space-y-3">
                {[
                  "20–50 lbs",
                  "50–100 lbs",
                  "100+ lbs",
                ].map((option, idx) => (
                  <button key={option} className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm ${idx === 1 ? "border-[#145c42] bg-[#f2f8f5]" : "border-[#d6ddd8]"}`}>
                    {option}<span className="h-4 w-4 rounded-full border border-[#b8c4bd]" />
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-[var(--font-playfair)] text-4xl text-[#1f2c25]">Two surgeons. Decades of dedicated bariatric practice.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {["Dr. Trace Curry", "Dr. James Augusta"].map((name) => (
              <article key={name} className="rounded-lg border border-[#d9dfdb] bg-white p-5">
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-md bg-[#e4ebe6]" />
                  <div>
                    <h3 className="font-[var(--font-playfair)] text-2xl text-[#1f2c25]">{name}</h3>
                    <p className="mt-2 text-sm text-[#52615a]">Board-certified bariatric surgeon focused on personalized, evidence-based care.</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#dde2de] bg-white/80 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-[var(--font-playfair)] text-4xl text-[#1f2c25]">Real outcomes. Real numbers. Real people.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[#d9dfdb] bg-white p-5"><p className="text-2xl font-[var(--font-playfair)]">94%</p><p className="text-sm">Would choose JourneyLite again</p></div>
              <div className="rounded-lg border border-[#d9dfdb] bg-white p-5"><p className="text-2xl font-[var(--font-playfair)]">60–70%</p><p className="text-sm">Average excess weight loss</p></div>
              <div className="rounded-lg border border-[#d9dfdb] bg-white p-5"><p className="text-2xl font-[var(--font-playfair)]">&lt;1%</p><p className="text-sm">Major complication rate</p></div>
            </div>
          </div>
        </section>

        <section className="bg-[#e8eeea] py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2">
            <div>
              <h2 className="font-[var(--font-playfair)] text-4xl text-[#1f2c25]">Weight Loss Surgery in Ohio, Kentucky, and Indiana</h2>
              <p className="mt-4 text-sm leading-7 text-[#4f5d57]">
                If you are searching for gastric sleeve Cincinnati expertise, bariatric surgery Ohio patients trust, or a weight loss clinic near me with proven outcomes, JourneyLite Physicians provides comprehensive programs tailored to your medical history and goals.
              </p>
            </div>
            <div>
              <h3 className="font-[var(--font-playfair)] text-2xl text-[#1f2c25]">Services we offer</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• Gastric sleeve and gastric bypass surgery</li>
                <li>• Revisional bariatric procedures</li>
                <li>• Medical weight loss and GLP-1 plans</li>
                <li>• Ongoing nutrition, behavior, and follow-up care</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="locations" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-[var(--font-playfair)] text-4xl text-[#1f2c25]">Five clinics across Ohio, Kentucky, and Indiana</h2>
          <div className="mt-8 space-y-10">
            {locationGroups.map((group) => (
              <section key={group.state}>
                <h3 className="mb-4 font-[var(--font-playfair)] text-2xl text-[#1f2c25]">{group.state}</h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {group.locations.map((loc) => (
                    <article key={loc.city} className="rounded-lg border border-[#d9dfdb] bg-white p-4">
                      <h4 className="font-semibold text-[#1f2c25]">{loc.city}</h4>
                      <p className="mt-2 text-sm">{loc.address1}<br />{loc.address2}<br />{loc.phone}</p>
                      <div className="mt-4 overflow-hidden rounded-md border border-[#d9dfdb]">
                        <iframe src={loc.map} title={`Map for ${loc.city}`} className="h-48 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="bg-[#0f3e2e] py-16 text-center text-white">
          <h2 className="font-[var(--font-playfair)] text-5xl">Start Your Weight Loss Journey</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#d8e4dd]">Free consultation. No pressure. A patient-first roadmap that fits your goals.</p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="#quiz" className="rounded-md bg-white px-5 py-3 text-sm font-medium text-[#0f3e2e]">Book Consultation</a>
            <a href="tel:+18774422263" className="rounded-md border border-[#8ba597] px-5 py-3 text-sm font-medium">(877) 442-2263</a>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b2c21] text-[#d1dfd7]">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
          <div>
            <p className="text-lg"><span className="font-semibold text-white">JourneyLite</span> Physicians</p>
            <p className="mt-3 text-sm">Weight loss surgery and medical weight loss care across Ohio, Kentucky, and Indiana.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <ul className="mt-3 space-y-2 text-sm"><li><a href="#services">Gastric Sleeve</a></li><li><a href="#services">Gastric Bypass</a></li><li><a href="#services">Medications</a></li></ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-2 text-sm"><li><a href="#">About</a></li><li><a href="#locations">Locations</a></li><li><a href="#quiz">Consultation</a></li></ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <p className="mt-3 text-sm">(877) 442-2263</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
