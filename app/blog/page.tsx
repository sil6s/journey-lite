import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTAButton, SiteFooter, SiteHeader } from "../components/marketing";

export const metadata: Metadata = {
  title: "JourneyLite Blog | Bariatric Surgery and Medical Weight Loss Education",
  description:
    "Educational articles from JourneyLite Physicians about bariatric surgery, gastric balloon, weight loss medications, and medical weight loss care.",
};

const featuredTopics = [
  {
    title: "How to compare surgical and non-surgical weight loss options",
    description:
      "A practical overview of the questions patients can bring to a consultation when comparing gastric sleeve, gastric balloon, and medication-supported care.",
    category: "Treatment options",
    image: "/hero-image.jpg",
    alt: "JourneyLite patient care consultation for weight loss options",
  },
  {
    title: "What to ask before starting prescription weight loss medication",
    description:
      "Common discussion points around eligibility, side effects, follow-up, insurance, and long-term expectations for oral or injectable medications.",
    category: "Medical weight loss",
    image: "/weight-loss-med-featured.jpg",
    alt: "Prescription weight loss medication education",
  },
  {
    title: "Preparing for your first bariatric consultation",
    description:
      "A simple guide to health history, prior weight loss attempts, goals, and questions that can help your provider recommend next steps.",
    category: "Patient resources",
    image: "/weigt-consult-featured.jpg",
    alt: "Patient preparing for a bariatric consultation",
  },
];

const placeholderPosts = [
  {
    title: "Gastric sleeve vs gastric balloon: what is different?",
    excerpt:
      "Learn how a surgical option and a temporary non-surgical procedure differ in treatment approach, follow-up, and patient fit.",
    tag: "Bariatric education",
  },
  {
    title: "Understanding follow-up after weight loss surgery",
    excerpt:
      "Follow-up visits, nutrition support, and long-term habits can all influence progress after bariatric surgery.",
    tag: "Surgical care",
  },
  {
    title: "Oral vs injectable weight loss medications",
    excerpt:
      "A quick comparison of medication categories patients may discuss with a medical weight loss provider.",
    tag: "Medications",
  },
  {
    title: "Questions to ask about gastric balloon pricing",
    excerpt:
      "Program cost, placement, removal, follow-up, and availability are all worth clarifying before treatment.",
    tag: "Non-surgical care",
  },
  {
    title: "What regional patients should know before scheduling",
    excerpt:
      "JourneyLite serves patients across Ohio, Kentucky, and Indiana through Cincinnati and regional office locations.",
    tag: "Locations",
  },
  {
    title: "Managing weight regain after prior bariatric surgery",
    excerpt:
      "Some patients benefit from renewed structure, provider evaluation, nutrition review, or medication-supported care.",
    tag: "Long-term support",
  },
];

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f7f8f6] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow">JourneyLite Blog</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
              Bariatric surgery and medical weight loss education.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#53635b]">
              Placeholder articles for patient-friendly education about surgical procedures, non-surgical weight loss,
              prescription medications, preparation, pricing, and follow-up care.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/#quiz">Book Consultation</CTAButton>
              <CTAButton href="/#compare" variant="secondary">
                Compare Options
              </CTAButton>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow">Featured topics</p>
              <h2 className="section-title">Helpful starting points for your weight loss research.</h2>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {featuredTopics.map((post) => (
                <article
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-[#dce4df] bg-[#f8fbf9] shadow-sm"
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
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">{post.category}</p>
                    <h3 className="mt-3 text-xl font-semibold text-[#1f2c25]">{post.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#53635b]">{post.description}</p>
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
          </div>
        </section>

        <section className="bg-[#edf4ef] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow">Latest posts</p>
              <h2 className="section-title">Placeholder blog posts</h2>
              <p className="section-intro">
                These draft cards give the blog page structure now and can be replaced with live JourneyLite articles
                later.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {placeholderPosts.map((post) => (
                <article className="flex h-full flex-col rounded-lg border border-[#dce4df] bg-white p-6 shadow-sm" key={post.title}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#66756d]">{post.tag}</p>
                  <h3 className="mt-3 text-xl font-semibold text-[#1f2c25]">{post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#53635b]">{post.excerpt}</p>
                  <Link
                    className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                    href="/blog"
                  >
                    Read more
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
