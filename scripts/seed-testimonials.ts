#!/usr/bin/env tsx
/**
 * Seeds the 7 initial JourneyLite patient testimonials into Sanity.
 *
 * Usage:
 *   npx tsx scripts/seed-testimonials.ts
 *   npx tsx scripts/seed-testimonials.ts --dry-run
 *
 * Required env var (write access):
 *   SANITY_WRITE_TOKEN  or  SANITY_API_WRITE_TOKEN
 */

import { createClient } from "@sanity/client";

const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "44pkofuy";
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-05";
const TOKEN =
  process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN || "";

const isDryRun = process.argv.includes("--dry-run");

if (!TOKEN) {
  console.error("❌  No write token found. Set SANITY_WRITE_TOKEN in your .env.local");
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

// Portable-text helper for multi-paragraph full stories
function paragraphs(...texts: string[]) {
  return texts.map((text, i) => ({
    _type: "block" as const,
    _key: `p${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
  }));
}

const testimonials = [
  {
    _type: "testimonial",
    name: "Kelly",
    procedure: "Gastric Sleeve",
    weightLost: 232,
    shortQuote: "I stopped watching life from the sidelines and started saying yes again.",
    slug: { _type: "slug", current: "kelly-gastric-sleeve-success-story" },
    featured: true,
    publishedAt: "2026-06-02T00:00:00.000Z",
    fullStory: paragraphs(
      "Kelly had gastric sleeve surgery with Dr. James Augusta at JourneyLite in November 2022. Before surgery, her weight affected almost every part of daily life. She often had to think ahead about whether she would fit in chairs, whether she could handle walking, whether clothing would fit, or whether she would feel embarrassed in public spaces.",
      "The hardest part was feeling like she was missing moments with her son. She wanted to be active, present, and fully involved, but her weight made simple activities feel overwhelming. Instead of participating, she often found herself watching from the sidelines.",
      "After surgery, Kelly began rebuilding her habits around portions, hydration, nutrition, movement, and follow-up care. The surgery gave her a tool, but her progress came from using that tool consistently and accepting support along the way.",
      "Kelly went from 370 pounds to 138 pounds, losing 232 pounds. Today, she can enjoy family outings, hikes, restaurants, theme parks, and everyday activities with more confidence and comfort.",
      "For Kelly, the biggest change is not just the number on the scale. It is being able to say yes again. She is no longer the mom sitting out. She is the mom who can join in, keep up, and be fully present.",
    ),
  },
  {
    _type: "testimonial",
    name: "Sue",
    procedure: "Gastric Bypass",
    weightLost: 200,
    shortQuote: "I finally believed I was worth the effort, and everything started to change.",
    slug: { _type: "slug", current: "sue-gastric-bypass-success-story" },
    featured: true,
    publishedAt: "2026-06-02T00:00:00.000Z",
    fullStory: paragraphs(
      "Sue's weight-loss journey was about much more than a procedure. For years, she struggled with body image, confidence, and the emotional weight of feeling stuck. Her highest weight reached about 350 pounds, and she knew she needed a change that could help her reclaim her health and her life.",
      "In May 2016, Sue had gastric bypass surgery at JourneyLite. On surgery day, she weighed about 302 pounds. Within the first year, she made major progress and eventually reached the 170 to 180 pound range.",
      "Years later, when some weight started to return, Sue did not give up. She re-engaged with her care, used available support, and continued building healthier patterns. With additional medical guidance and weight-loss support, she reached about 149.6 pounds.",
      "Sue's total weight loss is around 200 pounds. Her transformation gave her new freedom in everyday life, including traveling more comfortably, shopping with more confidence, and feeling more at home in her body.",
      "Her story is powerful because it shows that long-term success is not always a straight line. It can include surgery, support, accountability, renewed effort, and the decision to keep choosing yourself.",
    ),
  },
  {
    _type: "testimonial",
    name: "Bobby",
    procedure: "Gastric Sleeve",
    weightLost: 197,
    shortQuote: "I went from struggling to walk half a mile to running an eight-minute mile.",
    slug: { _type: "slug", current: "bobby-vsg-before-after-testimonial" },
    featured: true,
    publishedAt: "2026-06-02T00:00:00.000Z",
    fullStory: paragraphs(
      "Bobby struggled with weight for much of his life. When he was younger, sports helped him stay active, but as life changed, his weight continued to increase. Over time, his energy decreased, his joints hurt, and daily movement became harder.",
      "At his highest weight, Bobby reached 496 pounds. He was also dealing with serious health concerns, including diabetes and sleep apnea. Those diagnoses helped him realize that he needed a different path.",
      "In October 2024, Bobby had gastric sleeve surgery with Dr. James Augusta at JourneyLite. The procedure became a tool that helped him rebuild his health, his habits, and his confidence.",
      "Bobby has lost 197 pounds, going from 496 pounds to 299 pounds. His progress has changed what daily life feels like. He has more energy, more mobility, and more confidence in what his body can do.",
      "One of the most meaningful parts of Bobby's story is how concrete the change became. He went from struggling to walk half a mile to running an eight-minute mile. He also experienced moments he once thought were out of reach, like fitting comfortably on a roller coaster again.",
    ),
  },
  {
    _type: "testimonial",
    name: "Rebeca",
    procedure: "Gastric Sleeve",
    weightLost: 160,
    shortQuote: "I lost 160 pounds and gained the energy to be present with my child.",
    slug: { _type: "slug", current: "rebeca-gastric-sleeve-success-story" },
    featured: true,
    publishedAt: "2026-06-02T00:00:00.000Z",
    fullStory: paragraphs(
      "Rebeca had struggled with her weight for as long as she could remember. At 340 pounds, she felt exhausted, discouraged, and limited in daily life. One of the hardest parts was not having the energy she wanted as a parent.",
      "She had tried different diets and workout plans, but nothing gave her lasting results. Eventually, she chose gastric sleeve surgery in May 2024.",
      "After surgery, Rebeca began building new habits around portions, food choices, and follow-up care. The procedure helped her feel more in control and gave her a structure she had not been able to maintain before.",
      "In about ten months, Rebeca lost 160 pounds, going from 340 pounds to 180 pounds. She also dropped multiple clothing sizes and experienced a major change in her energy and confidence.",
      "For Rebeca, the most meaningful result is being able to participate in life more fully. She can run, play, and make memories with her child in ways that once felt out of reach. Her story is about gaining her life back, not just losing weight.",
    ),
  },
  {
    _type: "testimonial",
    name: "Michael",
    procedure: "Gastric Sleeve",
    weightLost: 106,
    shortQuote: "I changed my mind, changed my habits, and changed my health.",
    slug: { _type: "slug", current: "michael-gastric-sleeve-success-story" },
    featured: true,
    publishedAt: "2026-06-02T00:00:00.000Z",
    fullStory: paragraphs(
      "Michael had carried extra weight for much of his life. Over time, it began affecting both his confidence and his health. By age 60, he was facing high blood pressure, prediabetes, and fatty liver disease.",
      "He knew he needed to make a serious change, but the decision took time. Eventually, he chose gastric sleeve surgery with Dr. James Augusta at JourneyLite in May 2025.",
      "Michael started at 299 pounds. Through surgery, follow-up care, nutrition support, and a change in mindset, he lost more than 100 pounds and reached about 192.6 pounds.",
      "His health improved in major ways. He no longer needed medication for high blood pressure or prediabetes, and his fatty liver disease reversed.",
      "Michael's story is especially powerful because it shows how weight loss can affect more than appearance. It changed his health markers, his confidence, his clothing size, and the way he sees his future. He describes the biggest shift as finally changing his mind and committing to a different life.",
    ),
  },
  {
    _type: "testimonial",
    name: "Callie",
    procedure: "Gastric Sleeve",
    weightLost: 187,
    shortQuote: "I found freedom, confidence, and the energy to show up for my life.",
    slug: { _type: "slug", current: "callie-gastric-sleeve-success-story" },
    featured: true,
    publishedAt: "2026-06-02T00:00:00.000Z",
    fullStory: paragraphs(
      "Callie's journey was deeply emotional. Before surgery, her weight affected how she felt in almost every room she entered. She often compared herself to others and felt like her body, her plate, and her presence were being judged.",
      "In August 2025, Callie had gastric sleeve surgery. After surgery, she began rebuilding her relationship with food, her body, and herself.",
      "Callie lost 187 pounds. Her transformation helped her gain more energy, more confidence, and a stronger sense of peace in her daily life.",
      "One of the most meaningful parts of her story is how much more present she feels. She can play with her kids, wear clothes she loves, speak up more confidently, and feel seen for who she is.",
      "Callie's story is not only about losing weight. It is about gaining freedom from the constant mental burden that weight had placed on her life. She now feels more like herself than she has in years.",
    ),
  },
  {
    _type: "testimonial",
    name: "Bruce",
    procedure: "Gastric Sleeve",
    weightLost: 90,
    shortQuote: "I went from 19 daily medications to a much simpler, healthier life.",
    slug: { _type: "slug", current: "bruce-gastric-sleeve-medication-success-story" },
    featured: false,
    publishedAt: "2026-06-02T00:00:00.000Z",
    fullStory: paragraphs(
      "Before gastric sleeve surgery, Bruce was taking 19 medications a day. His health concerns included diabetes, high blood pressure, and other issues that made him feel like his medication list would only continue to grow.",
      "At 270 pounds, Bruce knew he needed a major change. Because his insurance did not cover the surgery, he made the personal decision to invest in himself and move forward with care at JourneyLite.",
      "Bruce had gastric sleeve surgery in October 2022. After surgery, his health began to improve, and his medication list changed dramatically. Within a month, he was taking far fewer medications than before.",
      "His story is not just about weight loss. It is about regaining control, simplifying his daily health routine, and feeling better in his body.",
      "Bruce also emphasizes that surgery is a tool, not a shortcut. His success came from following the plan, using the support available, and committing to new habits. Today, everyday activities feel easier, and he has a renewed sense of what is possible for his health.",
    ),
  },
];

async function main() {
  console.log(`\n🌱  Seeding ${testimonials.length} testimonials${isDryRun ? " (DRY RUN)" : ""}...\n`);

  for (const t of testimonials) {
    const slug = t.slug.current;

    // Check if document already exists
    const existing = await client.fetch(
      `*[_type == "testimonial" && slug.current == $slug][0]._id`,
      { slug },
    );

    if (existing) {
      console.log(`  ⏭   Skipping "${t.name}" — already exists (${existing})`);
      continue;
    }

    if (isDryRun) {
      console.log(`  ✅  [DRY RUN] Would create "${t.name}" (${slug})`);
      continue;
    }

    const created = await client.create(t);
    console.log(`  ✅  Created "${t.name}" → ${created._id}`);
  }

  console.log("\n✅  Done. Upload before/after photos in Sanity Studio → Patient Stories.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
