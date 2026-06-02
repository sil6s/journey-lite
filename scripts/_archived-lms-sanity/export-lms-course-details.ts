import fs from "fs";
import path from "path";

type CourseExport = {
  _id: string;
  title: string;
  slug?: string;
  sourceUrl?: string;
  audience?: string;
  courseSummary?: string;
  accessType?: string;
  isPublished?: boolean;
  clinicalReviewRequired?: boolean;
  clinicalReview?: {
    status?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
  };
  sections?: SectionExport[];
  sourceNotes?: string[];
};

type SectionExport = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  order?: number;
  lessons?: LessonExport[];
};

type LessonExport = {
  _id: string;
  title: string;
  slug?: string;
  sectionTitle?: string;
  order?: number;
  estimatedMinutes?: number;
  sourceUrl?: string;
  learningObjectives?: string[];
  contentSections?: { heading?: string; body?: string[] }[];
  completionRequires?: string[];
  patientSafetyFooter?: string;
  safetyEscalationTopics?: string[];
  interactiveComponent?: {
    title?: string;
    interactionType?: string;
    description?: string;
    supabaseEvent?: string;
    required?: boolean;
    config?: string;
  };
  quiz?: {
    title?: string;
    passingScore?: number;
    required?: boolean;
    questions?: {
      question?: string;
      questionType?: string;
      options?: string[];
      correctIndex?: number;
      feedback?: string;
    }[];
  };
  media?: {
    title?: string;
    sourceUrl?: string;
    originalPath?: string;
    localPath?: string;
    contentType?: string;
    altText?: string;
    caption?: string;
  }[];
  evidenceReferences?: {
    label?: string;
    url?: string;
    use?: string;
  }[];
};

const repoRoot = process.cwd();
loadEnvFile(path.join(repoRoot, ".env.local"));

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "44pkofuy";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-05";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;
const exportDir = path.join(repoRoot, "exports");

const query = String.raw`
*[_type == "lmsCourse" && !(_id in path("drafts.**"))] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  sourceUrl,
  audience,
  courseSummary,
  accessType,
  isPublished,
  clinicalReviewRequired,
  "clinicalReview": clinicalReview->{
    status,
    reviewedBy,
    reviewedAt,
    reviewNotes
  },
  sourceNotes,
  "sections": sections[]-> | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    order,
    "lessons": lessons[]-> | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      sectionTitle,
      order,
      estimatedMinutes,
      sourceUrl,
      learningObjectives,
      contentSections[] {
        heading,
        body
      },
      completionRequires,
      patientSafetyFooter,
      safetyEscalationTopics,
      "interactiveComponent": interactiveComponent->{
        title,
        interactionType,
        description,
        supabaseEvent,
        required,
        config
      },
      "quiz": quiz->{
        title,
        passingScore,
        required,
        "questions": questions[]->{
          question,
          questionType,
          options,
          correctIndex,
          feedback
        }
      },
      "media": media[]->{
        title,
        sourceUrl,
        originalPath,
        localPath,
        contentType,
        altText,
        caption
      },
      "evidenceReferences": evidenceReferences[]->{
        label,
        url,
        use
      }
    }
  }
}`;

async function main() {
  const courses = await fetchSanity<CourseExport[]>(query);
  fs.mkdirSync(exportDir, { recursive: true });

  const generatedAt = new Date().toISOString();
  const totals = summarize(courses);
  const payload = {
    generatedAt,
    sanity: { projectId, dataset, apiVersion },
    totals,
    courses,
  };

  fs.writeFileSync(
    path.join(exportDir, "education-course-details.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(exportDir, "education-course-inventory.md"),
    renderInventory(courses, generatedAt),
  );
  fs.writeFileSync(
    path.join(exportDir, "education-content-format.md"),
    renderFormatGuide(generatedAt),
  );

  console.log(`Exported ${courses.length} courses to ${exportDir}`);
  console.log(`Lessons: ${totals.lessons}, sections: ${totals.sections}, quizzes: ${totals.quizzes}, interactions: ${totals.interactions}`);
}

async function fetchSanity<T>(groqQuery: string): Promise<T> {
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", groqQuery);

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Sanity query failed: ${response.status} ${await response.text()}`);
  }

  const json = await response.json() as { result: T };
  return json.result;
}

function summarize(courses: CourseExport[]) {
  let sections = 0;
  let lessons = 0;
  let quizzes = 0;
  let questions = 0;
  let interactions = 0;
  let media = 0;
  let evidenceReferences = 0;

  for (const course of courses) {
    sections += course.sections?.length ?? 0;
    for (const section of course.sections ?? []) {
      lessons += section.lessons?.length ?? 0;
      for (const lesson of section.lessons ?? []) {
        if (lesson.quiz) quizzes += 1;
        questions += lesson.quiz?.questions?.length ?? 0;
        if (lesson.interactiveComponent) interactions += 1;
        media += lesson.media?.length ?? 0;
        evidenceReferences += lesson.evidenceReferences?.length ?? 0;
      }
    }
  }

  return { courses: courses.length, sections, lessons, quizzes, questions, interactions, media, evidenceReferences };
}

function renderInventory(courses: CourseExport[], generatedAt: string) {
  const totals = summarize(courses);
  const lines = [
    "# JourneyLite Education Course Inventory",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Totals",
    "",
    `- Courses: ${totals.courses}`,
    `- Sections/modules: ${totals.sections}`,
    `- Lessons: ${totals.lessons}`,
    `- Interactive activities: ${totals.interactions}`,
    `- Quizzes: ${totals.quizzes}`,
    `- Quiz questions: ${totals.questions}`,
    `- Media references: ${totals.media}`,
    `- Evidence references: ${totals.evidenceReferences}`,
    "",
    "## Courses",
    "",
  ];

  for (const course of courses) {
    const courseLessons = (course.sections ?? []).flatMap((section) => section.lessons ?? []);
    lines.push(`### ${course.title}`);
    lines.push("");
    lines.push(`- Slug: \`${course.slug ?? ""}\``);
    lines.push(`- Published: ${course.isPublished ? "yes" : "no"}`);
    lines.push(`- Access: ${course.accessType ?? "not set"}`);
    lines.push(`- Clinical review: ${course.clinicalReview?.status ?? "not set"}`);
    lines.push(`- Sections/modules: ${course.sections?.length ?? 0}`);
    lines.push(`- Lessons: ${courseLessons.length}`);
    lines.push(`- Required interaction lessons: ${courseLessons.filter((lesson) => lesson.interactiveComponent?.required).length}`);
    lines.push(`- Required quiz lessons: ${courseLessons.filter((lesson) => lesson.quiz?.required).length}`);
    if (course.courseSummary) lines.push(`- Summary: ${course.courseSummary}`);
    lines.push("");

    for (const section of course.sections ?? []) {
      lines.push(`#### ${section.order ?? ""}. ${section.title}`.trim());
      if (section.description) lines.push(`_${section.description}_`);
      lines.push("");
      for (const lesson of section.lessons ?? []) {
        const requirements = lesson.completionRequires?.length ? lesson.completionRequires.join(", ") : "none";
        const flags = [
          lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min` : null,
          lesson.interactiveComponent ? `activity: ${lesson.interactiveComponent.interactionType}` : null,
          lesson.quiz ? `quiz: ${lesson.quiz.questions?.length ?? 0} questions` : null,
          `requires: ${requirements}`,
        ].filter(Boolean);
        lines.push(`- ${lesson.order ?? ""}. **${lesson.title}** (\`${lesson.slug ?? ""}\`)`);
        lines.push(`  - ${flags.join(" | ")}`);
        if (lesson.learningObjectives?.length) {
          lines.push(`  - Objectives: ${lesson.learningObjectives.join("; ")}`);
        }
      }
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderFormatGuide(generatedAt: string) {
  return `# JourneyLite Education Content Format

Generated: ${generatedAt}

## Current Data Model

The patient education system reads enhanced Sanity LMS documents:

- \`lmsCourse\`: top-level course shown in \`/courses\`.
- \`lmsSection\`: ordered course module/section.
- \`lmsLesson\`: lesson content, media, safety footer, completion requirements, activity, quiz, and evidence.
- \`lmsInteractiveComponent\`: optional required activity inside a lesson.
- \`lmsQuiz\` and \`lmsQuestion\`: optional knowledge check.
- \`lmsMediaReference\`: imported/local media attached to lessons.
- \`lmsEvidenceReference\`: optional sources shown under “Sources & references”.
- \`lmsClinicalReviewStatus\`: controls whether a course is patient visible.

## Visibility Rules

Courses show to patients only when:

- \`lmsCourse.isPublished == true\`
- \`lmsCourse.clinicalReview->status == "approved"\`

The public course list queries published and clinically approved courses only.

## Course Shape

\`\`\`json
{
  "_type": "lmsCourse",
  "title": "Course title",
  "slug": { "current": "course-slug" },
  "audience": "Who this course is for",
  "courseSummary": "Patient-facing summary",
  "accessType": "assigned | free | provider-assigned | paid",
  "isPublished": true,
  "clinicalReview": { "_ref": "lmsClinicalReviewStatus id" },
  "sections": [{ "_ref": "lmsSection id" }]
}
\`\`\`

## Section / Module Shape

\`\`\`json
{
  "_type": "lmsSection",
  "title": "Module title",
  "slug": { "current": "module-slug" },
  "description": "Optional short intro",
  "order": 1,
  "lessons": [{ "_ref": "lmsLesson id" }]
}
\`\`\`

## Lesson Shape

\`\`\`json
{
  "_type": "lmsLesson",
  "title": "Lesson title",
  "slug": { "current": "lesson-slug" },
  "sectionTitle": "Parent section label",
  "order": 1,
  "estimatedMinutes": 5,
  "learningObjectives": ["Objective 1", "Objective 2"],
  "contentSections": [
    {
      "heading": "Patient-facing section heading",
      "body": ["Paragraph text", "- Bullet item", "1. Ordered item"]
    }
  ],
  "media": [{ "_ref": "lmsMediaReference id" }],
  "interactiveComponent": { "_ref": "lmsInteractiveComponent id" },
  "quiz": { "_ref": "lmsQuiz id" },
  "completionRequires": ["view_content", "complete_interaction", "pass_knowledge_check"],
  "patientSafetyFooter": "Patient safety note",
  "evidenceReferences": [{ "_ref": "lmsEvidenceReference id" }],
  "clinicalReview": { "_ref": "lmsClinicalReviewStatus id" }
}
\`\`\`

## Lesson Body Rendering

\`contentSections[].body\` is an array of strings. The renderer supports:

- Plain paragraphs
- Headings beginning with \`#\`, \`##\`, or \`###\`
- Bullets beginning with \`-\` or \`*\`
- Ordered list lines like \`1. Item\`
- Inline \`**bold**\`, \`*italic*\`, \\\`code\\\`, and \`[label](url)\`

## Supported Activity Types

The interactive component renderer recognizes these \`interactionType\` values:

- \`calculator\`
- \`tracker\`
- \`drag_drop\`
- \`guided_form\`
- \`scenario_picker\`
- \`medication_checklist\`
- \`timeline\`
- \`triage_cards\`
- \`calendar_builder\`
- \`upload_or_confirm\`
- \`completion_attestation\`
- \`knowledge_card\`

Activities currently render as confirmation-style patient tasks. When completed, they record \`interaction_completed\` and, when configured, the component's \`supabaseEvent\`.

## Completion and Gating

Course lessons unlock sequentially:

- The first incomplete lesson is unlocked.
- Earlier completed lessons remain unlocked.
- Later lessons are locked until prior lessons are completed.

Lesson completion can require:

- \`view_content\`: patient viewed the lesson.
- \`complete_interaction\`: patient completed the activity; requires a recorded \`interaction_completed\` event.
- \`pass_knowledge_check\`: patient passed the quiz; requires a recorded \`knowledge_check_passed\` event.

Progress is stored in Supabase:

- \`user_course_progress\`: lesson status, completed timestamp, last viewed timestamp.
- \`user_lesson_events\`: lesson views, interactions, quiz pass events, completion/reopen events.
- \`user_quiz_attempts\`: submitted answers, score, pass/fail.
- \`course_assignments\` and \`enrollments\`: patient access/assignment.

## Recommended Patient-Facing Editorial Rules

- Do not mention “Sanity”, “Enhanced LMS”, import tooling, or backend tracking in patient-facing copy.
- Use headings that make sense to patients, such as “Why this matters”, “What to do next”, and “When to call JourneyLite”.
- Keep links in standard markdown format: \`[clear label](https://example.com)\`.
- Use bullets only for short scan-friendly lists.
- Put safety escalation details in \`patientSafetyFooter\` and \`safetyEscalationTopics\`.
- Add a short quiz and/or activity for lessons that must be actively completed before the patient advances.
`;
}

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
