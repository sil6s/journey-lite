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

OUTPUT FORMAT
Return ONLY a single valid JSON object — no markdown fences, no explanatory text before or after. Schema:
{
  "title": string,            // 50-70 chars, keyword near start, compelling
  "slug": string,             // lowercase, hyphens, max 80 chars
  "excerpt": string,          // 150-220 chars, includes keyword, ends with value promise
  "htmlBody": string,         // Full article body as HTML. Use <h2>, <h3>, <p>, <ul>/<ol>/<li>, <strong>, <a href="...">...</a>. Do NOT include <html>, <head>, <body> or the article <h1> (that is the title). Escape quotes inside attribute values.
  "seoTitle": string,         // 50-60 chars for <title> tag
  "seoDescription": string,   // 150-160 chars for meta description, includes keyword + soft CTA
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
PRIMARY KEYWORD: "${opts.keyword}"
TARGET AUDIENCE: ${opts.audience}
ARTICLE LENGTH: ${lengths[opts.length] ?? lengths.medium}
TONE: ${opts.tone}
${opts.extraInstructions ? `ADDITIONAL INSTRUCTIONS: ${opts.extraInstructions}` : ""}

Remember:
- Keyword "${opts.keyword}" must appear in: title (first 60 chars), opening paragraph, ≥2 H2 headings, meta description
- Keyword density 1.0–1.5%
- Return ONLY valid JSON, no other text`;
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
  const { topic, keyword, audience, length, tone, extraInstructions } = body as {
    topic: string; keyword: string; audience?: string; length?: string;
    tone?: string; extraInstructions?: string;
  };

  if (!topic?.trim() || !keyword?.trim()) {
    return new Response(JSON.stringify({ error: "topic and keyword are required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const userPrompt = buildUserPrompt({
    topic: topic.trim(),
    keyword: keyword.trim(),
    audience: audience || "Adults in Ohio, Kentucky, and Indiana exploring weight loss surgery and non-surgical options",
    length: length || "medium",
    tone: tone || "warm, expert, patient-focused",
    extraInstructions: extraInstructions || "",
  });

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
        { role: "system", content: SYSTEM_PROMPT },
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
