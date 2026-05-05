import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeQuiz } from "./components/HomeQuiz";
import {
  ComparisonTable,
  ComparisonCard,
  CTAButton,
  FeatureCard,
  FinalCTA,
  LocationCards,
  MedicationCategoryPanel,
  MedicationComparisonGuide,
  MedicationCtaBand,
  MedicationSupportCard,
  PhysicianProfileCard,
  ProcedureCard,
  ReviewBadge,
  ReviewGrid,
  Section,
  SiteFooter,
  SiteHeader,
  StatBand,
} from "./components/marketing";
import {
  injectableMedicationOptions,
  medicationSupportOptions,
  nonSurgicalOptions,
  oralMedicationOptions,
  physicianCards,
  surgicalOptions,
} from "./components/data";

export const metadata: Metadata = {
  title: "JourneyLite Physicians | Weight Loss Surgery and Medical Weight Loss in Ohio",
  description:
    "Compare bariatric surgery, gastric sleeve, gastric bypass, gastric balloon, medications, and medical weight loss options with JourneyLite Physicians in Ohio, Kentucky, and Indiana.",
};

const pathComparisonCards = [
  {
    title: "Surgery may fit if:",
    items: [
      "You want more durable weight-loss support",
      "You have higher weight-loss goals",
      "You may have obesity-related health concerns",
      "You are ready for long-term follow-up",
    ],
  },
  {
    title: "Non-surgical procedures may fit if:",
    items: [
      "You want a less invasive option",
      "You are not ready for surgery",
      "You want portion-control support",
      "You can commit to lifestyle changes and follow-up",
    ],
  },
  {
    title: "Medications may fit if:",
    items: [
      "You want medical appetite or craving support",
      "You prefer oral or injectable treatment",
      "You are managing weight regain or long-term maintenance",
      "You want a structured program with monitoring",
    ],
  },
];

const whyCards = [
  ["Dedicated bariatric surgeons", "Focused physicians help patients understand procedure fit, risk, recovery, and long-term expectations."],
  ["Surgical and non-surgical care paths", "JourneyLite offers multiple options so the conversation can start with your goals, not a one-size-fits-all plan."],
  ["Medication-supported programs", "Eligible patients can discuss prescription-based care alongside nutrition, progress tracking, and provider guidance."],
  ["Personalized follow-up", "Care continues after the first appointment with follow-up designed around progress, questions, and next steps."],
  ["Nutrition and lifestyle guidance", "Patients receive practical support for portions, habits, hydration, protein, and realistic routines."],
  ["Multiple regional locations", "Five clinics support patients across Ohio, Kentucky, and Indiana with convenient regional access."],
];

const outcomeStats = [
  {
    value: "6,000+",
    label: "Gastric sleeve procedures",
    context: "High procedure volume helps patients choose a team familiar with common questions, timelines, and follow-up needs.",
  },
  {
    value: "10,000+",
    label: "Total procedures",
    context: "JourneyLite's experience spans bariatric and related procedures across multiple care pathways.",
  },
  {
    value: "20+",
    label: "Years of experience",
    context: "Long-standing regional care gives patients a consistent place to compare options and plan next steps.",
  },
];

const surgicalGridOptions = [
  ...surgicalOptions.filter((option) =>
    ["gastric-bypass", "sadi-surgery", "lap-band-surgery"].includes(option.id ?? ""),
  ),
  ...surgicalOptions.filter((option) =>
    ["gastric-band-revision", "gastric-sleeve-revision", "general-surgery"].includes(option.id ?? ""),
  ),
];

const homepageBlogPosts = [
  {
    title: "How to compare surgical and non-surgical weight loss options",
    excerpt:
      "A patient-friendly guide to comparing bariatric surgery, gastric balloon treatment, and medication-supported care before consultation.",
    image: "/hero-image.jpg",
    alt: "JourneyLite patient care consultation for weight loss options",
    tag: "Treatment options",
  },
  {
    title: "What to ask before starting prescription weight loss medication",
    excerpt:
      "Questions about eligibility, side effects, follow-up, cost, and long-term expectations for oral or injectable medication programs.",
    image: "/weight-loss-med-featured.jpg",
    alt: "Prescription weight loss medication education",
    tag: "Medical weight loss",
  },
  {
    title: "Preparing for your first bariatric consultation",
    excerpt:
      "What to bring, what to expect, and how to talk through goals, medical history, prior attempts, and comfort level with each path.",
    image: "/weigt-consult-featured.jpg",
    alt: "Patient preparing for a bariatric consultation",
    tag: "Patient resources",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f7f8f6]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow">Bariatric and medical weight loss care</p>
              <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
                Lasting weight loss, guided by experienced bariatric specialists.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#516059]">
                JourneyLite Physicians offers surgical, non-surgical, and medication-supported weight loss care for
                patients across Ohio, Kentucky, and Indiana. Compare options with a medical team that helps you choose a
                plan around your BMI, health history, goals, and comfort level.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href="/contact">Book Consultation</CTAButton>
                <CTAButton href="/#surgical" variant="secondary">
                  View Weight Loss Options
                </CTAButton>
              </div>
            </div>

            <aside
              aria-label="JourneyLite Cincinnati main office"
              className="overflow-hidden rounded-2xl border border-[#d6e1da] bg-white shadow-2xl shadow-[#20372b]/10"
            >
              <Image
                alt="JourneyLite bariatric care team and patient support"
                className="h-[520px] w-full object-cover"
                height={700}
                priority
                src="/hero-image.jpg"
                width={760}
              />
            </aside>
          </div>
        </section>

        <StatBand />

        <Section
          eyebrow="Surgical care"
          id="surgical"
          intro="JourneyLite offers advanced bariatric surgery options for patients seeking durable, medically supervised weight loss. Your care team will help determine which procedure may fit your BMI, health history, weight-loss goals, and long-term needs."
          title="Surgical Weight Loss Options"
          tone="white"
        >
          <article
            className="mt-8 grid gap-6 rounded-2xl border border-[#145c42] bg-[#0f3e2e] p-6 text-white shadow-xl shadow-[#0f3e2e]/15 lg:grid-cols-[1.25fr_0.75fr] lg:p-8"
            id="gastric-sleeve"
          >
            <div>
              <p className="eyebrow text-[#b9d2c5]">Featured surgical option</p>
              <h3 className="mt-3 font-serif text-4xl leading-tight">Gastric Sleeve (VSG)</h3>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#dbe8e1]">
                Our most performed procedure with a clinically proven pathway for durable weight loss and metabolic
                improvement.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Commonly considered for patients seeking long-term weight loss support with structured follow-up."].map((chip) => (
                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-[#edf7f1]" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-white p-5 text-[#1f2c25]">
              <p className="text-sm leading-6 text-[#53635b]">
                Gastric sleeve surgery is a leading option for bariatric surgery in Ohio because it can support durable
                weight loss while preserving a straightforward long-term follow-up plan for eligible patients.
              </p>
              <div className="mt-6">
                <CTAButton href="/services/gastric-sleeve">Explore Gastric Sleeve</CTAButton>
              </div>
            </div>
          </article>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {surgicalGridOptions.map((option) => (
              <ProcedureCard
                className={
                  option.id === "lap-band-surgery"
                    ? "border-[#b7cec2] bg-[#f8fbf9] ring-1 ring-[#dcebe3]"
                    : undefined
                }
                key={option.title}
                {...option}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTAButton href="/#surgical" variant="secondary">
              Explore Surgical Options
            </CTAButton>
            <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
              Compare Procedures
            </CTAButton>
          </div>
        </Section>

        <Section
          eyebrow="Incisionless and less invasive procedures"
          id="non-surgical"
          intro="Not every patient is ready for or needs surgery. JourneyLite offers incisionless and less invasive weight-loss procedures designed to help eligible patients reduce portions, build healthier habits, and receive structured medical support."
          title="Non-Surgical Weight Loss Procedures"
          tone="soft"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nonSurgicalOptions.map((option) => (
              <ProcedureCard key={option.title} {...option} />
            ))}
          </div>
          <p className="mt-5 rounded-lg border border-[#d4ddd7] bg-white p-4 text-sm leading-6 text-[#53635b]">
            Some non-surgical procedures may be shown for education and comparison. Availability depends on JourneyLite&apos;s
            current programs and provider evaluation. JourneyLite currently emphasizes gastric balloon treatment as its
            active non-surgical procedure among the listed procedures.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTAButton href="/services/gastric-balloon" variant="secondary">
              Learn About Gastric Balloon
            </CTAButton>
            <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
              Explore Non-Surgical Options
            </CTAButton>
          </div>
        </Section>

        <Section
          eyebrow="Medical weight loss"
          id="medications"
          intro="Medication-supported weight loss can help eligible patients manage appetite, cravings, and long-term progress with medical supervision. JourneyLite offers oral and injectable medication options as part of a structured care plan."
          title="Prescription Weight Loss Medications"
          tone="white"
        >
          <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-2">
            <MedicationCategoryPanel
              id="oral-medications"
              intro="Oral medications may help appropriate patients manage appetite, cravings, or short-term weight-loss momentum with provider screening and monitoring."
              options={oralMedicationOptions}
              title="Oral Medications"
            />
            <MedicationCategoryPanel
              id="injectable-medications"
              intro="Weekly injectable medications may support appetite regulation and metabolic weight-loss goals for eligible patients with structured follow-up."
              options={injectableMedicationOptions}
              title="Injectable Medications"
            />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {medicationSupportOptions.map((option) => (
              <MedicationSupportCard key={option.title} option={option} />
            ))}
          </div>
          <MedicationComparisonGuide />
          <MedicationCtaBand />
        </Section>

        <Section
          eyebrow="Decision support"
          id="pricing"
          intro="Surgery, non-surgical procedures, and prescription medications can all play different roles in medical weight loss across Ohio, Kentucky, and Indiana."
          title="Which weight-loss path may fit you best?"
          tone="light"
        >
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pathComparisonCards.map((card) => (
              <ComparisonCard key={card.title} {...card} />
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-[#64736b]">
            Final recommendations depend on BMI, medical history, weight-loss goals, medication history, insurance
            coverage, and provider evaluation.
          </p>
          <div className="mt-6">
            <CTAButton href="/contact">Get a Personalized Recommendation</CTAButton>
          </div>
        </Section>

        <section className="bg-[#edf4ef] py-16 lg:py-20" id="quiz">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1fr] lg:items-start lg:px-8">
            <div>
              <p className="eyebrow">60-second guide</p>
              <h2 className="section-title">Compare your likely weight loss care path.</h2>
              <p className="section-intro">
                Answer a few questions to organize your next conversation. The guide does not diagnose or determine
                eligibility, but it can help you prepare for a consultation.
              </p>
            </div>
            <HomeQuiz />
          </div>
        </section>

        <Section eyebrow="Why JourneyLite" id="why" title="Why patients choose JourneyLite" tone="white">
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {whyCards.map(([title, body]) => (
              <FeatureCard key={title} title={title}>
                <p>{body}</p>
              </FeatureCard>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Physicians"
          id="physicians"
          intro="JourneyLite patients are supported by experienced bariatric and minimally invasive weight loss surgeons who help compare surgical, non-surgical, and medical weight loss options with responsible expectations."
          title="Meet the bariatric physicians behind JourneyLite."
          tone="light"
        >
          <div className="mt-8 grid gap-6">
            {physicianCards.map((physician) => (
              <PhysicianProfileCard key={physician.name} physician={physician} />
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Patient feedback"
          id="reviews"
          intro="Patients often describe JourneyLite's communication, follow-up, and supportive care experience throughout their weight loss journey."
          title="Patient reviews from JourneyLite patients"
          tone="white"
        >
          <div className="mt-8">
            <ReviewBadge />
          </div>
          <ReviewGrid />
        </Section>

        <Section
          eyebrow="Outcomes"
          id="outcomes"
          intro="Numbers are most useful when they are paired with context. Procedure choice, medical history, nutrition habits, follow-up, and long-term adherence all influence results."
          title="Real outcomes. Real numbers. Real people."
          tone="white"
        >
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {outcomeStats.map((stat) => (
              <article className="rounded-lg border border-[#dce4df] bg-white p-6 shadow-sm" key={stat.label}>
                <p className="font-serif text-4xl text-[#145c42]">{stat.value}</p>
                <h3 className="mt-3 text-lg font-semibold text-[#1f2c25]">{stat.label}</h3>
                <p className="mt-3 text-sm leading-6 text-[#53635b]">{stat.context}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-[#64736b]">
            Outcomes vary by procedure, medical history, follow-up adherence, nutrition habits, activity, and other
            individual factors.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CTAButton href="/contact">Start Your Journey</CTAButton>
            <CTAButton href="/#outcomes" variant="secondary">
              See Patient Results
            </CTAButton>
          </div>
        </Section>

        <Section
          eyebrow="Option comparison"
          id="compare"
          intro="Use this overview to understand the main differences between common JourneyLite care paths before your consultation."
          title="Compare weight loss options"
          tone="soft"
        >
          <ComparisonTable />
        </Section>

        <Section
          eyebrow="Regional care"
          id="regional"
          intro="JourneyLite serves patients looking for weight loss surgery in Ohio, bariatric surgery in Ohio, non-surgical weight loss care, and medication-supported programs across nearby Kentucky and Indiana communities."
          title="Weight Loss Surgery in Ohio, Kentucky, and Indiana"
          tone="white"
        >
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4 text-base leading-8 text-[#53635b]">
              <p>
                Patients visit JourneyLite Physicians from Cincinnati, Dayton, Columbus, Northern Kentucky,
                Indianapolis, and surrounding communities to compare surgical and non-surgical weight loss options in one
                medical setting.
              </p>
              <p>
                The care team can help eligible patients understand gastric sleeve surgery, gastric bypass surgery,
                gastric balloon treatment, weight loss medications, and medical weight loss clinic support without
                reducing the decision to a single procedure.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <CTAButton href="/#locations" variant="secondary">
                  Find a Location
                </CTAButton>
                <CTAButton href="https://www.google.com/maps?q=10475+Reading+Road+Cincinnati+OH+45241">
                  Get Directions
                </CTAButton>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Cincinnati Weight Loss Care", "/#locations"],
                ["Columbus Bariatric Options", "/#locations"],
                ["Dayton Medical Weight Loss", "/#locations"],
                ["Northern Kentucky Location", "/#locations"],
                ["Indianapolis Area Care", "/#locations"],
                ["Gastric Balloon", "/gastric-balloon"],
              ].map(([label, href]) => (
                <Link
                  className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] shadow-sm transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                  href={href}
                  key={label}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Locations"
          id="locations"
          intro="The Cincinnati main office and JourneyLite Surgery Center anchor the practice, with additional locations supporting patients across Ohio, Kentucky, and Indiana."
          title="Cincinnati Weight Loss Surgery Center and Main Office"
          tone="light"
        >
          <LocationCards />
        </Section>

        <Section
          eyebrow="Blog"
          id="blog"
          intro="Read practical JourneyLite articles about bariatric surgery, non-surgical procedures, prescription weight loss medications, and preparing for care."
          title="Featured weight loss education"
          tone="white"
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {homepageBlogPosts.map((post) => (
              <article
                className="flex h-full flex-col overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-sm shadow-[#20372b]/5 transition hover:-translate-y-0.5 hover:shadow-md"
                key={post.title}
              >
                <Image
                  alt={post.alt}
                  className="h-56 w-full object-cover"
                  height={360}
                  src={post.image}
                  width={620}
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">{post.tag}</p>
                  <h3 className="mt-3 text-xl font-semibold leading-tight text-[#1f2c25]">{post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#53635b]">{post.excerpt}</p>
                  <Link
                    className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    href="/blog"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <CTAButton href="/blog" variant="secondary">
              View Blog
            </CTAButton>
          </div>
        </Section>

        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
