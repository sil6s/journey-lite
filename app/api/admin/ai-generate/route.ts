import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccessForEmail } from "@/lib/admin/users";

export const runtime = "nodejs";
export const maxDuration = 120;

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-flash-lite-latest";

const SYSTEM_PROMPT = `You are a senior SEO content strategist and medical content writer for JourneyLite Bariatric Physicians — a bariatric surgery and medical weight loss practice serving Ohio, Kentucky, and Indiana (Cincinnati area and beyond).

CONTENT GUIDELINES
- Practice services: Gastric Sleeve, Gastric Bypass, Lap Band, Gastric Balloon, Semaglutide/GLP-1 injections, oral weight loss medications
- Main website: journeylite.com
- Tone: warm, expert, patient-focused, medically accurate yet accessible
- Reading level: target Flesch-Kincaid Grade 8 (clear, plain language)
- All medical claims must be appropriately hedged ("may", "studies suggest", "can help", "for many patients")
- Never promise specific outcomes or state guaranteed results
- Encourage consulting a physician before making medical decisions
- Include a brief medical disclaimer reminder at the end if the content is about medical procedures

SEO REQUIREMENTS (CRITICAL — follow exactly)
0. PRIMARY KEYWORD: If the user did not supply one, choose the single best primary SEO
   keyword phrase for this topic yourself (what a real patient would actually search for
   on Google) before writing anything else. Report your chosen keyword in the "keyword"
   output field either way.

1. TARGET KEYWORD PLACEMENT:
   - Title: keyword in first 60 characters
   - Opening paragraph: keyword appears naturally within the first 100 words
   - At least TWO H2 subheadings must contain the keyword or a close variant
   - Meta description: keyword in first 20 words

2. KEYWORD DENSITY: 1.0–1.5% of total word count (count carefully, don't keyword-stuff)

3. STRUCTURE (mandatory):
   - Min 3 × H2 subheadings, can have H3 subsections under them
   - Opening paragraph: 2-3 sentences, contains keyword, summarises value of article
   - Body sections: 100-250 words each under each H2
   - Closing section: H2 titled "Ready to Take the Next Step?" with soft CTA
   - At least ONE bullet list or numbered list

4. INTERNAL LINKS: Suggest 2-4 natural anchor text + URL pairs using only these paths:
   /contact · /services/gastric-sleeve · /services/gastric-bypass · /services/gastric-balloon
   /services/prescription-weight-loss-medications · /services/compare-weight-loss-options
   /services/pricing-financing · /#locations

5. E-E-A-T SIGNALS:
   - Include at least one specific statistic or clinical fact (cite a general source like "research published in JAMA" or "the American Society for Metabolic and Bariatric Surgery reports")
   - Demonstrate expertise: mention surgeon involvement, board certifications are common at JourneyLite, long-term follow-up care

VISUAL BLOCKS (use these instead of plain paragraphs where they fit better)
The editor supports styled blocks that render nicely on the live site. Weave 2-4 of these
into htmlBody at natural points — never as the very first or very last element:

- Statistic callout (use for the E-E-A-T stat/clinical fact):
  <div class="jl-callout jl-callout-stat" style="background:#0D3D24;border:1.5px solid #145c42;border-radius:12px;padding:1.25rem 1.5rem;margin:1.5rem 0;"><p style="font-weight:700;font-size:1rem;color:#ffffff;margin:0 0 0.35rem"><span style="font-size:0.65rem;font-weight:800;letter-spacing:0.1em;background:#145c42;color:#ffffff;padding:1px 6px;border-radius:4px;margin-right:8px;vertical-align:middle">STAT</span>SHORT TITLE</p><p style="color:#d1fae5;margin:0;line-height:1.65">The statistic or clinical fact, in full.</p></div>

- Tip callout (practical advice for the reader):
  <div class="jl-callout jl-callout-tip" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:1.25rem 1.5rem;margin:1.5rem 0;"><p style="font-weight:700;font-size:1rem;color:#166534;margin:0 0 0.35rem"><span style="font-size:0.65rem;font-weight:800;letter-spacing:0.1em;background:#86efac;color:#166534;padding:1px 6px;border-radius:4px;margin-right:8px;vertical-align:middle">TIP</span>SHORT TITLE</p><p style="color:#15803d;margin:0;line-height:1.65">The tip text.</p></div>

- Mid-article CTA block (use once, roughly two-thirds through the article — NOT at the very end, the closing section already has its own CTA):
  <div class="jl-cta-block" style="background:#edf7f2;border:1px solid #c8ddd1;border-radius:12px;padding:2rem;margin:2rem 0;text-align:center;"><h3 style="font-size:1.5rem;font-weight:700;color:#0D3D24;margin:0 0 0.5rem">Headline tied to the section above</h3><p style="color:#5f6f66;margin:0 0 1.25rem">One supporting sentence.</p><div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;"><a href="/contact" style="background:#0D3D24;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;text-decoration:none">Book Consultation</a></div></div>

Other callout types follow the same shape with class jl-callout-{type} for type in info/warning/success/highlight/quote.
Only swap in the text content and badge label — keep the inline styles exactly as shown so blocks match the editor's native style.

OUTPUT FORMAT
Return ONLY a single valid JSON object — no markdown fences, no explanatory text before or after. Schema:
{
  "keyword": string,          // the primary SEO keyword used — either the one supplied, or the one you chose
  "title": string,            // 50-70 chars, keyword near start, compelling
  "slug": string,             // lowercase, hyphens, max 80 chars
  "excerpt": string,          // 150-220 chars, includes keyword, ends with value promise
  "htmlBody": string,         // Full article body as HTML. Use <h2>, <h3>, <p>, <ul>/<ol>/<li>, <strong>, <a href="...">...</a>. Do NOT include <html>, <head>, <body> or the article <h1> (that is the title). Escape quotes inside attribute values.
  "seoTitle": string,         // 50-60 chars for <title> tag
  "seoDescription": string,   // 150-160 chars for meta description, includes keyword + soft CTA — also reused as the page meta description when generating for a static page
  "tags": string[],           // 5-8 short tag strings
  "internalLinks": [          // suggested internal links already woven into htmlBody
    { "anchor": string, "href": string }
  ],
  "wordCount": number,        // approximate word count of htmlBody
  "keywordDensity": number    // keyword density percentage (decimal, e.g. 1.2)
}`;

function buildUserPrompt(opts: {
  topic: string;
  keyword: string;
  audience: string;
  length: string;
  tone: string;
  extraInstructions: string;
}) {
  const lengths: Record<string, string> = {
    short: "600-800 words",
    medium: "900-1200 words",
    long: "1400-1800 words",
  };
  return `Generate a complete SEO-optimized blog post with the following parameters:

TOPIC: ${opts.topic}
PRIMARY KEYWORD: ${opts.keyword ? `"${opts.keyword}"` : "(not provided — choose the best one yourself per the system prompt)"}
TARGET AUDIENCE: ${opts.audience}
ARTICLE LENGTH: ${lengths[opts.length] ?? lengths.medium}
TONE: ${opts.tone}
${opts.extraInstructions ? `ADDITIONAL INSTRUCTIONS: ${opts.extraInstructions}` : ""}

Remember:
- The keyword (supplied or chosen) must appear in: title (first 60 chars), opening paragraph, ≥2 H2 headings, meta description
- Keyword density 1.0–1.5%
- Return ONLY valid JSON, no other text`;
}

// ── Testimonial generation ──────────────────────────────────────────────────

const TESTIMONIAL_SYSTEM_PROMPT = `You are a patient-story writer for JourneyLite Bariatric Physicians — a bariatric surgery and medical weight loss practice. You turn a few raw facts about a patient's journey into a polished testimonial for the website.

RULES
- Write in third person about the patient (e.g. "Sue had gastric bypass surgery...").
- Warm, genuine, specific — avoid generic phrases like "changed my life" unless backed by a concrete detail.
- Never invent medical details, dates, or numbers beyond what's given. If something isn't provided, write around it rather than making it up.
- Medical claims stay hedged where appropriate ("can help", "for many patients") — but personal results already given (weight lost, dates) are stated as fact since they're the patient's own data.
- Do not promise outcomes for other readers.

OUTPUT FORMAT
Return ONLY a single valid JSON object — no markdown fences, no explanatory text before or after. Schema:
{
  "shortQuote": string,   // <=120 chars, first-person, punchy, suitable for a homepage card. Written AS the patient (e.g. "I stopped watching life from the sidelines.")
  "fullStory": string     // 4-6 paragraphs, third person, separated by blank lines (\\n\\n). No headings, no markdown — plain prose paragraphs only.
}`;

function buildTestimonialUserPrompt(opts: {
  name: string;
  procedure: string;
  weightLost?: string;
  keyDetails?: string;
}) {
  return `Write a testimonial for:

PATIENT: ${opts.name}
PROCEDURE: ${opts.procedure}
${opts.weightLost ? `WEIGHT LOST: ${opts.weightLost} lbs` : ""}
${opts.keyDetails ? `KEY DETAILS / NOTES FROM THE PATIENT:\n${opts.keyDetails}` : "No additional details provided — keep the story general but still specific to the procedure and weight lost."}

Return ONLY the JSON object described in the system prompt.`;
}

export async function POST(req: NextRequest) {
  // Auth check
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return new Response("Unauthorized", { status: 401 });
    const access = await getAdminAccessForEmail(user.email);
    const isAdmin = access || user.app_metadata?.role === "admin";
    if (!isAdmin) return new Response("Forbidden", { status: 403 });
  } catch {
    return new Response("Auth error", { status: 500 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not configured. Add it to your .env.local file." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();
  const { kind, topic, keyword, audience, length, tone, extraInstructions, name, procedure, weightLost, keyDetails } = body as {
    kind?: "blog" | "testimonial";
    topic?: string; keyword?: string; audience?: string; length?: string; tone?: string; extraInstructions?: string;
    name?: string; procedure?: string; weightLost?: string; keyDetails?: string;
  };

  let systemPrompt: string;
  let userPrompt: string;

  if (kind === "testimonial") {
    if (!name?.trim() || !procedure?.trim()) {
      return new Response(JSON.stringify({ error: "name and procedure are required" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }
    systemPrompt = TESTIMONIAL_SYSTEM_PROMPT;
    userPrompt = buildTestimonialUserPrompt({
      name: name.trim(), procedure: procedure.trim(),
      weightLost: weightLost?.trim(), keyDetails: keyDetails?.trim(),
    });
  } else {
    if (!topic?.trim()) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }
    systemPrompt = SYSTEM_PROMPT;
    userPrompt = buildUserPrompt({
      topic: topic.trim(),
      keyword: keyword?.trim() || "",
      audience: audience || "Adults in Ohio, Kentucky, and Indiana exploring weight loss surgery and non-surgical options",
      length: length || "medium",
      tone: tone || "warm, expert, patient-focused",
      extraInstructions: extraInstructions || "",
    });
  }

  // Call Gemini (OpenAI-compatible endpoint) with streaming
  const aiResponse = await fetch(GEMINI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!aiResponse.ok) {
    const err = await aiResponse.text();
    return new Response(JSON.stringify({ error: `Gemini API error: ${aiResponse.status}`, details: err }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the response directly to the client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = aiResponse.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }
            try {
              const chunk = JSON.parse(data);
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
