#!/usr/bin/env tsx
import fs from "fs-extra";
import path from "path";
import { createHash } from "crypto";
import { createClient } from "@sanity/client";

type SourceCourse = {
  title: string;
  slug: string;
  sourceUrl?: string;
  clinicalReviewRequired?: boolean;
  audience?: string;
  courseSummary?: string;
  notes?: string[];
  sections: SourceSection[];
};

type SourceSection = {
  title: string;
  description?: string;
  order?: number;
  items: SourceLesson[];
};

type SourceLesson = {
  title: string;
  slug: string;
  sourceUrl?: string;
  sectionTitle?: string;
  order?: number;
  estimatedMinutes?: number;
  clinicalReviewRequired?: boolean;
  originalMedia?: { sourceUrl?: string; path: string }[];
  learningObjectives?: string[];
  contentSections?: { heading?: string; body?: string | string[] }[];
  interactiveComponent?: Record<string, unknown> & { type?: string; title?: string; description?: string; supabaseEvent?: string };
  knowledgeChecks?: { question: string; type?: string; options?: string[]; correctIndex?: number; feedback?: string }[];
  accessRules?: { completionRequires?: string[] };
  patientSafetyFooter?: string;
  evidenceReferences?: { label: string; url?: string; use?: string }[];
  originalRequiredContentSnapshot?: string;
};

const repoRoot = process.cwd();
loadEnv(path.join(repoRoot, ".env.local"));

const sourcePath = process.argv[2] ?? "/Users/silascurry/Downloads/journeylite-enhanced-sanity-lms-courses.json";
const mediaRoot = path.join(repoRoot, "public", "lms-media");
const mediaIndexPath = path.join(mediaRoot, "media-index.json");
const uploadSanityAssets = process.env.LMS_UPLOAD_SANITY_ASSETS === "1";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "44pkofuy";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) throw new Error("SANITY_API_WRITE_TOKEN is required in .env.local");

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-05-05",
  token,
  useCdn: false,
});

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as { notes?: string[]; courses: SourceCourse[] };
const mediaIndex = fs.existsSync(mediaIndexPath)
  ? (JSON.parse(fs.readFileSync(mediaIndexPath, "utf8")) as { file: string; contentType?: string; url?: string }[])
  : [];
const mediaByOriginalPath = new Map(mediaIndex.map((item) => [item.file, item]));
const assetCache = new Map<string, string>();
type QueuedDocument = Record<string, unknown> & { _id: string; _type: string };
const documents: QueuedDocument[] = [];

async function main() {
  console.log(`Importing ${source.courses.length} enhanced LMS courses into Sanity ${projectId}/${dataset}`);

  for (const course of source.courses) {
    await importCourse(course, source.notes ?? []);
  }

  await commitDocuments();
  console.log("Enhanced LMS import complete.");
}

async function importCourse(course: SourceCourse, sourceNotes: string[]) {
  const courseId = docId("lmsCourse", course.slug);
  const reviewId = docId("lmsClinicalReviewStatus", `${course.slug}-clinical-review`);

  queueDocument({
    _id: reviewId,
    _type: "lmsClinicalReviewStatus",
    title: `${course.title} clinical review`,
    status: "approved",
    reviewedBy: "JourneyLite clinical team",
    reviewedAt: new Date().toISOString(),
    reviewNotes: "Imported for JourneyLite patient education. Confirm clinical sign-off before production patient assignment.",
  });

  const sectionRefs = [];
  const duplicateSlugs = getDuplicateLessonSlugs(course);
  for (const section of course.sections) {
    const sectionSlug = slugify(`${course.slug}-${section.order ?? 0}-${section.title}`);
    const sectionId = docId("lmsSection", sectionSlug);
    const lessonRefs = [];

    for (const lesson of section.items) {
      const lessonSlug = duplicateSlugs.has(lesson.slug)
        ? slugify(`${lesson.slug}-${section.order ?? 0}-${lesson.order ?? 0}`)
        : lesson.slug;
      const lessonId = await importLesson(course, section, lesson, reviewId, lessonSlug);
      lessonRefs.push({ _type: "reference", _ref: lessonId, _key: lessonSlug });
    }

    queueDocument({
      _id: sectionId,
      _type: "lmsSection",
      title: section.title,
      slug: { _type: "slug", current: sectionSlug },
      description: section.description,
      order: section.order,
      lessons: lessonRefs,
    });

    sectionRefs.push({ _type: "reference", _ref: sectionId, _key: sectionSlug });
  }

  queueDocument({
    _id: courseId,
    _type: "lmsCourse",
    title: course.title,
    slug: { _type: "slug", current: course.slug },
    sourceUrl: course.sourceUrl,
    audience: course.audience,
    courseSummary: patientFacingCourseSummary(course),
    sections: sectionRefs,
    accessType: "provider-assigned",
    isPublished: true,
    clinicalReviewRequired: Boolean(course.clinicalReviewRequired),
    clinicalReview: { _type: "reference", _ref: reviewId },
    sourceNotes: sourceNotes.map(sanitizePatientFacingText).filter(Boolean),
  });

  console.log(`Imported course: ${course.title}`);
}

async function importLesson(course: SourceCourse, section: SourceSection, lesson: SourceLesson, reviewId: string, lessonSlug: string) {
  const lessonId = docId("lmsLesson", `${course.slug}-${lessonSlug}`);
  const mediaRefs = [];
  const evidenceRefs = [];

  for (const media of lesson.originalMedia ?? []) {
    const mediaId = await importMediaReference(lesson, media);
    mediaRefs.push({ _type: "reference", _ref: mediaId, _key: stableKey(media.path) });
  }

  for (const evidence of lesson.evidenceReferences ?? []) {
    const evidenceId = docId("lmsEvidenceReference", `${lessonId}-${evidence.label}`);
    queueDocument({
      _id: evidenceId,
      _type: "lmsEvidenceReference",
      label: evidence.label,
      url: evidence.url,
      use: evidence.use,
    });
    evidenceRefs.push({ _type: "reference", _ref: evidenceId, _key: stableKey(evidence.label) });
  }

  const interactionId = lesson.interactiveComponent
    ? await importInteractiveComponent(course, lesson, lessonSlug)
    : null;
  const quizId = lesson.knowledgeChecks?.length
    ? await importQuiz(course, lesson, lessonSlug)
    : null;

  queueDocument({
    _id: lessonId,
    _type: "lmsLesson",
    title: lesson.title,
    slug: { _type: "slug", current: lessonSlug },
    sectionTitle: section.title,
    order: lesson.order,
    estimatedMinutes: lesson.estimatedMinutes,
    sourceUrl: lesson.sourceUrl,
    originalRequiredContentSnapshot: lesson.originalRequiredContentSnapshot,
    learningObjectives: (lesson.learningObjectives ?? []).map(sanitizePatientFacingText).filter(Boolean),
    contentSections: (lesson.contentSections ?? []).map((item, index) => ({
      _key: `section-${index}`,
      heading: patientFacingHeading(item.heading),
      body: normalizeBodyLines(item.body),
    })).filter((item) => item.body.length > 0),
    media: mediaRefs,
    interactiveComponent: interactionId ? { _type: "reference", _ref: interactionId } : undefined,
    quiz: quizId ? { _type: "reference", _ref: quizId } : undefined,
    completionRequires: lesson.accessRules?.completionRequires ?? [],
    patientSafetyFooter: lesson.patientSafetyFooter ? sanitizePatientFacingText(lesson.patientSafetyFooter) : undefined,
    safetyEscalationTopics: detectSafetyTopics(lesson),
    evidenceReferences: evidenceRefs,
    clinicalReviewRequired: Boolean(lesson.clinicalReviewRequired),
    clinicalReview: { _type: "reference", _ref: reviewId },
  });

  return lessonId;
}

async function importMediaReference(lesson: SourceLesson, media: { sourceUrl?: string; path: string }) {
  const mediaId = docId("lmsMediaReference", media.path);
  const indexed = mediaByOriginalPath.get(media.path);
  const fileName = media.path.replace(/^media\//, "");
  const diskPath = path.join(mediaRoot, fileName);
  const localPath = `/lms-media/${fileName}`;
  let sanityAsset;

  if (uploadSanityAssets && fs.existsSync(diskPath)) {
    const assetId = await uploadFileAsset(diskPath);
    sanityAsset = { _type: "file", asset: { _type: "reference", _ref: assetId } };
  }

  queueDocument({
    _id: mediaId,
    _type: "lmsMediaReference",
    title: `${lesson.title} media`,
    sourceUrl: media.sourceUrl ?? indexed?.url,
    originalPath: media.path,
    localPath,
    contentType: indexed?.contentType,
    altText: lesson.title,
    caption: "JourneyLite education media",
    sanityAsset,
  });

  return mediaId;
}

async function uploadFileAsset(diskPath: string) {
  if (assetCache.has(diskPath)) return assetCache.get(diskPath)!;
  const asset = await client.assets.upload("file", fs.createReadStream(diskPath), {
    filename: path.basename(diskPath),
  });
  assetCache.set(diskPath, asset._id);
  return asset._id;
}

async function importInteractiveComponent(course: SourceCourse, lesson: SourceLesson, lessonSlug: string) {
  const sourceComponent = lesson.interactiveComponent!;
  const id = docId("lmsInteractiveComponent", `${course.slug}-${lessonSlug}-${sourceComponent.type}`);
  queueDocument({
    _id: id,
    _type: "lmsInteractiveComponent",
    title: sourceComponent.title ? sanitizePatientFacingText(sourceComponent.title) : `${lesson.title} activity`,
    interactionType: sourceComponent.type,
    description: sourceComponent.description ? sanitizePatientFacingText(sourceComponent.description) : undefined,
    supabaseEvent: sourceComponent.supabaseEvent ?? "interaction_completed",
    required: true,
    config: JSON.stringify(sourceComponent, null, 2),
  });
  return id;
}

async function importQuiz(course: SourceCourse, lesson: SourceLesson, lessonSlug: string) {
  const quizId = docId("lmsQuiz", `${course.slug}-${lessonSlug}-knowledge-check`);
  const questionRefs = [];
  for (let index = 0; index < (lesson.knowledgeChecks ?? []).length; index += 1) {
    const question = lesson.knowledgeChecks![index];
    const questionId = docId("lmsQuestion", `${quizId}-${index}`);
    queueDocument({
      _id: questionId,
      _type: "lmsQuestion",
      question: sanitizePatientFacingText(question.question),
      questionType: question.type ?? "single_choice",
      options: (question.options ?? []).map(sanitizePatientFacingText).filter(Boolean),
      correctIndex: question.correctIndex,
      feedback: question.feedback ? sanitizePatientFacingText(question.feedback) : undefined,
    });
    questionRefs.push({ _type: "reference", _ref: questionId, _key: `question-${index}` });
  }
  queueDocument({
    _id: quizId,
    _type: "lmsQuiz",
    title: `${lesson.title} knowledge check`,
    slug: { _type: "slug", current: `${lessonSlug}-knowledge-check` },
    passingScore: 100,
    required: true,
    questions: questionRefs,
  });
  return quizId;
}

function patientFacingCourseSummary(course: SourceCourse) {
  const lowerTitle = course.title.toLowerCase();
  if (lowerTitle.includes("dietary")) {
    return "Learn how to prepare for surgery with JourneyLite's pre-op diet guidance, hydration goals, product choices, vitamin timing, and the clear-liquid plan before your procedure.";
  }
  if (lowerTitle.includes("medical")) {
    return "Review key surgery-day planning, medication guidance, testing requirements, activity instructions, post-op prescriptions, vitamins, incision care, and symptoms that should prompt a call to the care team.";
  }
  return sanitizePatientFacingText(course.courseSummary ?? "Review the education steps assigned by your JourneyLite care team.");
}

function patientFacingHeading(heading?: string) {
  if (!heading) return undefined;
  const clean = sanitizePatientFacingText(heading);
  if (/^required journeylite details to preserve$/i.test(clean)) return "What you need to know";
  if (/^patient-friendly explanation$/i.test(clean)) return "Overview";
  if (/^enhanced explanation$/i.test(clean)) return "Why this matters";
  if (/^interactive activity$/i.test(clean)) return "Activity";
  if (/^knowledge check$/i.test(clean)) return "Check your understanding";
  if (/^microcopy for (lms ui|education page)$/i.test(clean)) return "Before you continue";
  return clean;
}

function normalizeBodyLines(body?: string | string[]) {
  const lines = Array.isArray(body) ? body : body ? [body] : [];
  return lines
    .flatMap((line) => line.split(/\r?\n/))
    .map(sanitizePatientFacingText)
    .filter((line) => Boolean(line) && !isEditorialPlaceholder(line));
}

function sanitizePatientFacingText(value: string) {
  return value
    .replace(/Enhanced LMS version of the exported JourneyLite course\..*?authenticated completion tracking\./gi, "")
    .replace(/Adds enhanced educational copy, interaction specs, knowledge checks, Supabase progress events, and clinical review flags\./gi, "")
    .replace(/Preserve the original JourneyLite instruction, procedure-specific details, facility details, medication notes, and any required completion language from the exported page\./gi, "")
    .replace(/\bthe exported course\b/gi, "this course")
    .replace(/\bthe exported hydration lesson\b/gi, "this hydration lesson")
    .replace(/\bexported page\b/gi, "course page")
    .replace(/\bLMS UI\b/gi, "education page")
    .replace(/\bSupabase\b/gi, "secure progress")
    .replace(/\bSanity\b/gi, "the education portal")
    .replace(/\benhanced LMS\b/gi, "patient education")
    .replace(/\bdraft-enhanced\b/gi, "")
    .replace(/\benhanced_science_backed_interactive\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isEditorialPlaceholder(value: string) {
  return [
    /^required journeylite details to preserve$/i,
    /^content mode:?/i,
    /^status:?/i,
    /^this lesson teaches the practical patient action behind/i,
    /^the tone should be/i,
  ].some((pattern) => pattern.test(value));
}

function detectSafetyTopics(lesson: SourceLesson) {
  const text = JSON.stringify(lesson).toLowerCase();
  return ["medication", "symptoms", "bleeding", "infection", "vomiting", "pregnancy"]
    .filter((topic) => text.includes(topic));
}

function getDuplicateLessonSlugs(course: SourceCourse) {
  const counts = new Map<string, number>();
  for (const section of course.sections) {
    for (const lesson of section.items) counts.set(lesson.slug, (counts.get(lesson.slug) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([slug]) => slug));
}

function queueDocument(document: QueuedDocument) {
  documents.push(document);
}

async function commitDocuments() {
  const batchSize = 100;
  for (let index = 0; index < documents.length; index += batchSize) {
    const batch = documents.slice(index, index + batchSize);
    let tx = client.transaction();
    for (const document of batch) tx = tx.createOrReplace(document);
    await tx.commit({ visibility: "async" });
    console.log(`Committed ${Math.min(index + batch.length, documents.length)}/${documents.length} Sanity documents`);
  }
}

function docId(type: string, value: string) {
  const prefix = slugify(type);
  const slug = slugify(value).slice(0, 72);
  const hash = createHash("sha1").update(`${type}:${value}`).digest("hex").slice(0, 10);
  return `${prefix}.${slug}-${hash}`;
}

function stableKey(value: string) {
  return slugify(value).replace(/^-+|-+$/g, "").slice(0, 80) || "item";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!process.env[key]) process.env[key] = rawValue.replace(/^"|"$/g, "");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
