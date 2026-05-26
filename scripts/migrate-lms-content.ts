#!/usr/bin/env tsx
/**
 * migrate-lms-content.ts
 *
 * Full replace of all LMS content in Sanity:
 *   1. Delete every existing lms* document from the dataset.
 *   2. Import the new content from exports/education-course-details.json.
 *
 * Usage:
 *   npx tsx scripts/migrate-lms-content.ts          # dry-run
 *   LMS_DRY_RUN=0 npx tsx scripts/migrate-lms-content.ts   # live run
 */

import fs from "fs-extra";
import path from "path";
import { createHash } from "crypto";
import { createClient } from "@sanity/client";

// ─── Types ───────────────────────────────────────────────────────────────────

type ExportCourse = {
  _id?: string;
  title: string;
  slug: string | { current: string };
  sourceUrl?: string;
  clinicalReviewRequired?: boolean;
  audience?: string;
  courseSummary?: string;
  accessType?: string;
  isPublished?: boolean;
  certificate?: Record<string, unknown>;
  versionNumber?: string;
  courseCategory?: string;
  estimatedTotalMinutes?: number;
  sourceNotes?: string[];
  sections: ExportSection[];
};

type ExportSection = {
  _id?: string;
  title: string;
  slug?: string | { current: string };
  description?: string;
  order?: number;
  lessons?: ExportLesson[];
  items?: ExportLesson[];
};

type ExportLesson = {
  _id?: string;
  title: string;
  slug: string | { current: string };
  sourceUrl?: string;
  sectionTitle?: string;
  order?: number;
  estimatedMinutes?: number;
  learningObjectives?: string[];
  contentSections?: { heading?: string; body?: string | string[] }[];
  interactiveComponent?: {
    type?: string;
    interactionType?: string;
    title?: string;
    description?: string;
    supabaseEvent?: string;
    required?: boolean;
    config?: unknown;
  };
  quiz?: {
    title?: string;
    required?: boolean;
    passingScore?: number;
    questions?: ExportQuestion[];
  };
  completionRequires?: string[];
  patientSafetyFooter?: string;
  safetyEscalationTopics?: string[];
  evidenceReferences?: { label: string; url?: string; use?: string }[];
  media?: {
    title?: string;
    sourceUrl?: string;
    originalPath?: string;
    localPath?: string;
    contentType?: string;
    altText?: string;
    caption?: string;
  }[];
};

type ExportQuestion = {
  question: string;
  questionType?: string;
  options?: string[];
  correctIndex?: number;
  feedback?: string;
};

type QueuedDocument = Record<string, unknown> & { _id: string; _type: string };

// ─── Config ──────────────────────────────────────────────────────────────────

const repoRoot = process.cwd();
loadEnv(path.join(repoRoot, ".env.local"));

const dryRun = process.env.LMS_DRY_RUN !== "0";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "44pkofuy";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-05-05";
const token = process.env.SANITY_API_WRITE_TOKEN;

const sourcePath = path.join(repoRoot, "exports", "education-course-details.json");

if (!token && !dryRun) throw new Error("SANITY_API_WRITE_TOKEN is required");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: token ?? "dry-run-token",
  useCdn: false,
});

const LMS_TYPES = [
  "lmsCourse",
  "lmsSection",
  "lmsLesson",
  "lmsInteractiveComponent",
  "lmsQuiz",
  "lmsQuestion",
  "lmsMediaReference",
  "lmsEvidenceReference",
  "lmsClinicalReviewStatus",
];

const documents: QueuedDocument[] = [];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔄  LMS content migration — ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`   Project: ${projectId} / ${dataset}\n`);

  if (!dryRun) {
    await deleteExistingLmsDocuments();
  } else {
    console.log("⏭   [dry-run] Skipping delete of existing documents.\n");
  }

  const raw = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as {
    notes?: string[];
    courses: ExportCourse[];
  };

  console.log(`📥  Building documents from ${raw.courses.length} courses in ${path.basename(sourcePath)} …\n`);

  for (const course of raw.courses) {
    await importCourse(course, raw.notes ?? []);
  }

  await commitDocuments();
  console.log("\n✅  Migration complete.");
}

// ─── Delete ──────────────────────────────────────────────────────────────────

async function deleteExistingLmsDocuments() {
  console.log("🗑   Deleting existing LMS documents …");
  let totalDeleted = 0;

  for (const type of LMS_TYPES) {
    let cursor = "";
    while (true) {
      const docs: { _id: string }[] = await client.fetch(
        `*[_type == $type && _id > $cursor][0...500]{_id}`,
        { type, cursor }
      );
      if (docs.length === 0) break;

      const batchSize = 100;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        let tx = client.transaction();
        for (const doc of batch) tx = tx.delete(doc._id);
        await tx.commit({ visibility: "async" });
        totalDeleted += batch.length;
      }

      if (docs.length < 500) break;
      cursor = docs[docs.length - 1]._id;
    }
    console.log(`   deleted all ${type} documents`);
  }

  console.log(`   → Deleted ${totalDeleted} documents total.\n`);
}

// ─── Import ──────────────────────────────────────────────────────────────────

async function importCourse(course: ExportCourse, sourceNotes: string[]) {
  const courseSlug = getSlug(course.slug);
  const courseId = docId("lmsCourse", courseSlug);
  const reviewId = docId("lmsClinicalReviewStatus", `${courseSlug}-clinical-review`);

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

  for (const section of course.sections) {
    const sectionSlug =
      getSlug(section.slug) ||
      slugify(`${courseSlug}-${section.order ?? 0}-${section.title}`);
    const sectionId = docId("lmsSection", sectionSlug);
    const lessonRefs = [];

    const lessons = section.lessons ?? section.items ?? [];
    for (const lesson of lessons) {
      const lessonSlug = getSlug(lesson.slug);
      const lessonId = await importLesson(course, section, lesson, reviewId, lessonSlug, courseSlug);
      lessonRefs.push({ _type: "reference", _ref: lessonId, _key: stableKey(lessonSlug) });
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

    sectionRefs.push({ _type: "reference", _ref: sectionId, _key: stableKey(sectionSlug) });
  }

  queueDocument({
    _id: courseId,
    _type: "lmsCourse",
    title: course.title,
    slug: { _type: "slug", current: courseSlug },
    sourceUrl: course.sourceUrl,
    audience: course.audience,
    courseSummary: course.courseSummary,
    estimatedTotalMinutes: course.estimatedTotalMinutes,
    courseCategory: course.courseCategory,
    versionNumber: course.versionNumber ?? "2.0",
    sections: sectionRefs,
    accessType: course.accessType ?? "provider-assigned",
    isPublished: course.isPublished ?? true,
    clinicalReviewRequired: false,
    clinicalReview: { _type: "reference", _ref: reviewId },
    certificate: buildCertificate(course.certificate),
    sourceNotes: (sourceNotes ?? []).filter(Boolean),
  });

  console.log(`   ✓ Queued course: ${course.title}`);
}

async function importLesson(
  course: ExportCourse,
  section: ExportSection,
  lesson: ExportLesson,
  reviewId: string,
  lessonSlug: string,
  courseSlug: string,
) {
  const lessonId = docId("lmsLesson", `${courseSlug}-${lessonSlug}`);
  const mediaRefs = [];
  const evidenceRefs = [];

  // Media
  for (const media of lesson.media ?? []) {
    const mediaKey = media.originalPath ?? media.localPath ?? media.title ?? lessonSlug;
    const mediaId = docId("lmsMediaReference", mediaKey);
    queueDocument({
      _id: mediaId,
      _type: "lmsMediaReference",
      title: media.title ?? `${lesson.title} media`,
      sourceUrl: media.sourceUrl,
      originalPath: media.originalPath,
      localPath: media.localPath,
      contentType: media.contentType,
      altText: media.altText ?? lesson.title,
      caption: media.caption ?? "JourneyLite education media",
    });
    mediaRefs.push({ _type: "reference", _ref: mediaId, _key: stableKey(mediaKey) });
  }

  // Evidence
  for (const evidence of lesson.evidenceReferences ?? []) {
    const evidenceId = docId("lmsEvidenceReference", `${lessonId}-${evidence.label}`);
    queueDocument({
      _id: evidenceId,
      _type: "lmsEvidenceReference",
      label: evidence.label,
      url: isPublicUrl(evidence.url) ? evidence.url : undefined,
      use: evidence.use,
    });
    evidenceRefs.push({ _type: "reference", _ref: evidenceId, _key: stableKey(evidence.label) });
  }

  // Interactive component
  const ic = lesson.interactiveComponent;
  let interactionId: string | null = null;
  if (ic) {
    const interactionType = ic.interactionType ?? ic.type ?? "knowledge_card";
    interactionId = docId("lmsInteractiveComponent", `${courseSlug}-${lessonSlug}-${interactionType}`);
    queueDocument({
      _id: interactionId,
      _type: "lmsInteractiveComponent",
      title: ic.title ?? `${lesson.title} activity`,
      interactionType,
      description: ic.description,
      supabaseEvent: ic.supabaseEvent ?? "interaction_completed",
      required: ic.required ?? true,
      config: JSON.stringify(ic, null, 2),
    });
  }

  // Quiz
  let quizId: string | null = null;
  const questions = lesson.quiz?.questions ?? [];
  if (questions.length > 0) {
    quizId = docId("lmsQuiz", `${courseSlug}-${lessonSlug}-knowledge-check`);
    const questionRefs = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionId = docId("lmsQuestion", `${quizId}-${i}`);
      queueDocument({
        _id: questionId,
        _type: "lmsQuestion",
        question: q.question,
        questionType: q.questionType ?? "single_choice",
        options: (q.options ?? []).filter(Boolean),
        correctIndex: q.correctIndex,
        feedback: q.feedback,
      });
      questionRefs.push({ _type: "reference", _ref: questionId, _key: `question-${i}` });
    }
    queueDocument({
      _id: quizId,
      _type: "lmsQuiz",
      title: lesson.quiz?.title ?? `${lesson.title} knowledge check`,
      slug: { _type: "slug", current: `${lessonSlug}-knowledge-check` },
      passingScore: lesson.quiz?.passingScore ?? 100,
      required: lesson.quiz?.required ?? true,
      questions: questionRefs,
    });
  }

  const completionRequires =
    lesson.completionRequires ??
    inferCompletionRequirements(ic, questions.length > 0);

  queueDocument({
    _id: lessonId,
    _type: "lmsLesson",
    title: lesson.title,
    slug: { _type: "slug", current: lessonSlug },
    sectionTitle: section.title,
    order: lesson.order,
    estimatedMinutes: lesson.estimatedMinutes ?? 5,
    sourceUrl: lesson.sourceUrl,
    learningObjectives: lesson.learningObjectives ?? [],
    contentSections: (lesson.contentSections ?? []).map((cs, i) => ({
      _key: `section-${i}`,
      heading: cs.heading,
      body: Array.isArray(cs.body) ? cs.body : cs.body ? [cs.body] : [],
    })),
    media: mediaRefs,
    interactiveComponent: interactionId
      ? { _type: "reference", _ref: interactionId }
      : undefined,
    quiz: quizId ? { _type: "reference", _ref: quizId } : undefined,
    completionRequires,
    patientSafetyFooter: lesson.patientSafetyFooter,
    safetyEscalationTopics: lesson.safetyEscalationTopics ?? [],
    evidenceReferences: evidenceRefs,
    clinicalReviewRequired: false,
    clinicalReview: { _type: "reference", _ref: reviewId },
    lessonStatus: "published",
  });

  return lessonId;
}

// ─── Commit ──────────────────────────────────────────────────────────────────

async function commitDocuments() {
  // Deduplicate — same _id may be queued by multiple lessons (shared media, etc.)
  const seen = new Map<string, QueuedDocument>();
  for (const doc of documents) seen.set(doc._id, doc);
  const unique = [...seen.values()];

  if (dryRun) {
    const counts = unique.reduce<Record<string, number>>((acc, doc) => {
      acc[doc._type] = (acc[doc._type] ?? 0) + 1;
      return acc;
    }, {});
    console.log(`\n⏭   [dry-run] Would write ${unique.length} unique documents (${documents.length} queued):`);
    for (const [type, count] of Object.entries(counts)) {
      console.log(`   ${type}: ${count}`);
    }
    return;
  }

  console.log(`\n📤  Writing ${unique.length} unique documents …`);
  const batchSize = 100;
  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);
    let tx = client.transaction();
    for (const doc of batch) tx = tx.createOrReplace(doc);
    await tx.commit({ visibility: "async" });
    console.log(`   committed ${Math.min(i + batch.length, unique.length)}/${unique.length} documents`);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function queueDocument(doc: QueuedDocument) {
  documents.push(doc);
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

function getSlug(slug?: string | { current?: string }) {
  return typeof slug === "string" ? slug : slug?.current ?? "";
}

function isPublicUrl(url?: string) {
  return Boolean(url && /^(https?:\/\/|\/|mailto:|tel:)/i.test(url));
}

function inferCompletionRequirements(ic: ExportLesson["interactiveComponent"], hasQuiz: boolean) {
  const reqs = ["view_content"];
  if (ic?.required !== false) reqs.push("complete_interaction");
  if (hasQuiz) reqs.push("pass_knowledge_check");
  return reqs;
}

function buildCertificate(cert?: Record<string, unknown>) {
  return {
    enabled: cert?.enabled ?? true,
    title: cert?.title ?? "Certificate of Completion",
    subtitle: cert?.subtitle,
    bodyText: cert?.bodyText ?? "has completed the assigned JourneyLite patient education course:",
    signatureName: cert?.signatureName ?? "JourneyLite",
    signatureTitle: cert?.signatureTitle,
    showJourneyLiteLogo: cert?.showJourneyLiteLogo ?? true,
    showCompletionDate: cert?.showCompletionDate ?? true,
    showPatientName: cert?.showPatientName ?? true,
    showCourseName: cert?.showCourseName ?? true,
    showCertificateId: cert?.showCertificateId ?? true,
    qrVerificationEnabled: cert?.qrVerificationEnabled ?? false,
    printEnabled: cert?.printEnabled ?? true,
    downloadPdfEnabled: cert?.downloadPdfEnabled ?? true,
    emailEnabled: cert?.emailEnabled ?? false,
  };
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
