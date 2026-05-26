#!/usr/bin/env tsx
import fs from "fs-extra";
import path from "path";
import { createHash } from "crypto";
import { createClient } from "@sanity/client";

type SourceCourse = {
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
  notes?: string[];
  sections: SourceSection[];
};

type SourceSection = {
  title: string;
  slug?: string | { current: string };
  description?: string;
  order?: number;
  items?: SourceLesson[];
  lessons?: SourceLesson[];
  estimatedModuleMinutes?: number;
  moduleIntro?: string;
  moduleSummary?: string;
  moduleQuizEnabled?: boolean;
};

type SourceLesson = {
  title: string;
  slug: string | { current: string };
  sourceUrl?: string;
  sectionTitle?: string;
  order?: number;
  estimatedMinutes?: number;
  clinicalReviewRequired?: boolean;
  originalMedia?: { sourceUrl?: string; path: string }[];
  learningObjectives?: string[];
  contentSections?: { heading?: string; body?: string | string[] }[];
  contentBlocks?: SourceContentBlock[];
  interactiveComponent?: Record<string, unknown> & { type?: string; interactionType?: string; title?: string; description?: string; supabaseEvent?: string; required?: boolean };
  knowledgeChecks?: SourceQuestion[];
  quiz?: { title?: string; required?: boolean; passingScore?: number; questions?: SourceQuestion[] };
  accessRules?: { completionRequires?: string[] };
  completionRequires?: string[];
  patientSafetyFooter?: string;
  evidenceReferences?: { label: string; url?: string; use?: string }[];
  originalRequiredContentSnapshot?: string;
  safety?: { level?: string; html?: string };
  clinicalReview?: { status?: string; reviewReason?: string };
};

type SourceQuestion = {
  question: string;
  questionType?: string;
  type?: string;
  options?: (string | { html?: string })[];
  correctIndex?: number;
  feedback?: string;
};

type SourceContentBlock = Record<string, unknown> & {
  type?: string;
  html?: string;
  title?: string;
  items?: { html?: string }[];
  columns?: string[];
  rows?: string[][];
  url?: string;
  description?: string;
  tone?: string;
  imageSlot?: string;
  placement?: string;
  aspectRatio?: string;
  altText?: string;
  caption?: string;
  newPhotoPrompt?: string;
  assetStatus?: string;
  imageUrl?: string;
  interactionType?: string;
  supabaseEvent?: string;
  required?: boolean;
  config?: unknown;
  passingScore?: number;
  questions?: SourceQuestion[];
};

const repoRoot = process.cwd();
loadEnv(path.join(repoRoot, ".env.local"));

const sourcePath = process.argv[2] ?? "/Users/silascurry/Downloads/journeylite-enhanced-sanity-lms-courses.json";
const mediaRoot = path.join(repoRoot, "public", "lms-media");
const mediaIndexPath = path.join(mediaRoot, "media-index.json");
const uploadSanityAssets = process.env.LMS_UPLOAD_SANITY_ASSETS === "1";
const dryRun = process.env.LMS_DRY_RUN === "1";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "44pkofuy";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token && !dryRun) throw new Error("SANITY_API_WRITE_TOKEN is required in .env.local");

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-05-05",
  token: token ?? "dry-run-token",
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
  console.log(`${dryRun ? "Validating" : "Importing"} ${source.courses.length} enhanced LMS courses ${dryRun ? "for" : "into"} Sanity ${projectId}/${dataset}`);

  for (const course of source.courses) {
    await importCourse(course, source.notes ?? []);
  }

  await commitDocuments();
  console.log("Enhanced LMS import complete.");
}

async function importCourse(course: SourceCourse, sourceNotes: string[]) {
  const courseSlug = getSlug(course.slug);
  const courseId = docId("lmsCourse", courseSlug);
  const reviewId = docId("lmsClinicalReviewStatus", `${courseSlug}-clinical-review`);
  const courseRequiresReview = Boolean(course.clinicalReviewRequired);

  queueDocument({
    _id: reviewId,
    _type: "lmsClinicalReviewStatus",
    title: `${course.title} clinical review`,
    status: courseRequiresReview ? "pending_review" : "approved",
    reviewedBy: courseRequiresReview ? undefined : "JourneyLite clinical team",
    reviewedAt: courseRequiresReview ? undefined : new Date().toISOString(),
    reviewNotes: courseRequiresReview
      ? "Imported from the rich content rebuild. Requires JourneyLite clinical sign-off before publishing or assigning to patients."
      : "Imported for JourneyLite patient education.",
  });

  const sectionRefs = [];
  const duplicateSlugs = getDuplicateLessonSlugs(course);
  for (const section of course.sections) {
    const sectionSlug = getSlug(section.slug) || slugify(`${courseSlug}-${section.order ?? 0}-${section.title}`);
    const sectionId = docId("lmsSection", sectionSlug);
    const lessonRefs = [];

    for (const lesson of getSectionLessons(section)) {
      const rawLessonSlug = getSlug(lesson.slug);
      const lessonSlug = duplicateSlugs.has(rawLessonSlug)
        ? slugify(`${rawLessonSlug}-${section.order ?? 0}-${lesson.order ?? 0}`)
        : rawLessonSlug;
      const lessonId = await importLesson(course, section, lesson, reviewId, lessonSlug, courseSlug);
      lessonRefs.push({ _type: "reference", _ref: lessonId, _key: lessonSlug });
    }

    queueDocument({
      _id: sectionId,
      _type: "lmsSection",
      title: section.title,
      slug: { _type: "slug", current: sectionSlug },
      description: section.description,
      order: section.order,
      estimatedModuleMinutes: section.estimatedModuleMinutes,
      moduleIntro: section.moduleIntro,
      moduleSummary: section.moduleSummary,
      moduleQuizEnabled: section.moduleQuizEnabled,
      lessons: lessonRefs,
    });

    sectionRefs.push({ _type: "reference", _ref: sectionId, _key: sectionSlug });
  }

  queueDocument({
    _id: courseId,
    _type: "lmsCourse",
    title: course.title,
    slug: { _type: "slug", current: courseSlug },
    sourceUrl: course.sourceUrl,
    audience: course.audience,
    courseSummary: patientFacingCourseSummary(course),
    estimatedTotalMinutes: course.estimatedTotalMinutes,
    courseCategory: course.courseCategory,
    versionNumber: course.versionNumber ?? "1.0",
    sections: sectionRefs,
    accessType: course.accessType ?? "provider-assigned",
    isPublished: courseRequiresReview ? false : course.isPublished ?? true,
    clinicalReviewRequired: courseRequiresReview,
    clinicalReview: { _type: "reference", _ref: reviewId },
    certificate: normalizeCertificate(course.certificate),
    sourceNotes: sourceNotes.map(sanitizePatientFacingText).filter(Boolean),
  });

  console.log(`Imported course: ${course.title}`);
}

async function importLesson(course: SourceCourse, section: SourceSection, lesson: SourceLesson, reviewId: string, lessonSlug: string, courseSlug: string) {
  const lessonId = docId("lmsLesson", `${courseSlug}-${lessonSlug}`);
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
      url: isPublicUrl(evidence.url) ? evidence.url : undefined,
      use: evidence.use,
    });
    evidenceRefs.push({ _type: "reference", _ref: evidenceId, _key: stableKey(evidence.label) });
  }

  const interactionBlock = getInteractionBlock(lesson);
  const quizBlock = getKnowledgeCheckBlock(lesson);
  const interactionId = interactionBlock
    ? await importInteractiveComponent(course, lesson, lessonSlug, interactionBlock)
    : null;
  const quizId = getQuizQuestions(lesson).length
    ? await importQuiz(course, lesson, lessonSlug, courseSlug)
    : null;

  queueDocument({
    _id: lessonId,
    _type: "lmsLesson",
    title: lesson.title,
    slug: { _type: "slug", current: lessonSlug },
    sectionTitle: section.title,
    order: lesson.order,
    estimatedMinutes: lesson.estimatedMinutes,
    lessonStatus: lesson.clinicalReview?.status === "required" || requiresClinicalReview(lesson) ? "ready_for_review" : "draft",
    sourceUrl: lesson.sourceUrl,
    originalRequiredContentSnapshot: lesson.originalRequiredContentSnapshot,
    learningObjectives: (lesson.learningObjectives ?? []).map(sanitizePatientFacingText).filter(Boolean),
    contentSections: (lesson.contentSections ?? []).map((item, index) => ({
      _key: `section-${index}`,
      heading: patientFacingHeading(item.heading),
      body: normalizeBodyLines(item.body),
    })).filter((item) => item.body.length > 0),
    contentBlocks: normalizeContentBlocks(lesson.contentBlocks),
    media: mediaRefs,
    interactiveComponent: interactionId ? { _type: "reference", _ref: interactionId } : undefined,
    quiz: quizId ? { _type: "reference", _ref: quizId } : undefined,
    completionRequires: lesson.completionRequires ?? lesson.accessRules?.completionRequires ?? inferCompletionRequirements(interactionBlock, quizBlock),
    patientSafetyFooter: normalizeHtmlToText(lesson.safety?.html ?? lesson.patientSafetyFooter),
    safetyEscalationTopics: detectSafetyTopics(lesson),
    evidenceReferences: evidenceRefs,
    clinicalReviewRequired: Boolean(lesson.clinicalReviewRequired || lesson.clinicalReview?.status === "required" || requiresClinicalReview(lesson)),
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

async function importInteractiveComponent(course: SourceCourse, lesson: SourceLesson, lessonSlug: string, block?: SourceContentBlock) {
  const sourceComponent = block ?? lesson.interactiveComponent!;
  const courseSlug = getSlug(course.slug);
  const interactionType = sourceComponent.interactionType ?? sourceComponent.type ?? "knowledge_card";
  const id = docId("lmsInteractiveComponent", `${courseSlug}-${lessonSlug}-${interactionType}`);
  queueDocument({
    _id: id,
    _type: "lmsInteractiveComponent",
    title: sourceComponent.title ? sanitizePatientFacingText(sourceComponent.title) : `${lesson.title} activity`,
    interactionType,
    description: sourceComponent.description ? sanitizePatientFacingText(sourceComponent.description) : undefined,
    supabaseEvent: sourceComponent.supabaseEvent ?? "interaction_completed",
    required: sourceComponent.required ?? true,
    config: JSON.stringify(sourceComponent, null, 2),
  });
  return id;
}

async function importQuiz(course: SourceCourse, lesson: SourceLesson, lessonSlug: string, courseSlug: string) {
  const quizId = docId("lmsQuiz", `${courseSlug}-${lessonSlug}-knowledge-check`);
  const questionRefs = [];
  const questions = getQuizQuestions(lesson);
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const questionId = docId("lmsQuestion", `${quizId}-${index}`);
    queueDocument({
      _id: questionId,
      _type: "lmsQuestion",
      question: sanitizePatientFacingText(question.question),
      questionType: question.questionType ?? question.type ?? "single_choice",
      options: (question.options ?? []).map(normalizeOption).filter(Boolean),
      correctIndex: question.correctIndex,
      feedback: question.feedback ? sanitizePatientFacingText(question.feedback) : undefined,
    });
    questionRefs.push({ _type: "reference", _ref: questionId, _key: `question-${index}` });
  }
  queueDocument({
    _id: quizId,
    _type: "lmsQuiz",
    title: lesson.quiz?.title ?? getKnowledgeCheckBlock(lesson)?.title ?? `${lesson.title} knowledge check`,
    slug: { _type: "slug", current: `${lessonSlug}-knowledge-check` },
    passingScore: lesson.quiz?.passingScore ?? getKnowledgeCheckBlock(lesson)?.passingScore ?? 100,
    required: lesson.quiz?.required ?? true,
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
  return ["medication", "symptoms", "bleeding", "infection", "vomiting", "pregnancy", "diet", "testing", "surgery", "vitamin", "urgent"]
    .filter((topic) => text.includes(topic));
}

function requiresClinicalReview(lesson: SourceLesson) {
  const text = JSON.stringify(lesson).toLowerCase();
  return ["medication", "symptom", "diet", "testing", "surgery-day", "surgery day", "clear-liquid", "clear liquid", "vitamin", "urgent care", "urgent-care"]
    .some((term) => text.includes(term));
}

function normalizeContentBlocks(blocks?: SourceContentBlock[]) {
  return (blocks ?? []).map((block, index) => {
    const type = block.type ?? "paragraph";
    const base = {
      _key: `block-${index}`,
      type,
      title: block.title ? sanitizePatientFacingText(block.title) : undefined,
      html: block.html ? sanitizePatientFacingHtml(block.html) : undefined,
      tone: block.tone,
      url: isPublicUrl(block.url) ? block.url : undefined,
      description: block.description ? sanitizePatientFacingText(block.description) : undefined,
      imageSlot: block.imageSlot,
      imageUrl: isPublicUrl(block.imageUrl as string | undefined) ? block.imageUrl : undefined,
      placement: block.placement,
      aspectRatio: block.aspectRatio,
      altText: block.altText ? sanitizePatientFacingText(block.altText) : undefined,
      caption: block.caption ? sanitizePatientFacingText(block.caption) : undefined,
      newPhotoPrompt: block.newPhotoPrompt ? sanitizePatientFacingText(block.newPhotoPrompt) : undefined,
      assetStatus: block.assetStatus,
      interactionType: block.interactionType,
      required: block.required,
      config: block.config ? JSON.stringify(block.config, null, 2) : undefined,
      passingScore: block.passingScore,
      questionsJson: block.questions ? JSON.stringify(block.questions, null, 2) : undefined,
    };

    if (type === "bulletList" || type === "numberedList") {
      return {
        ...base,
        items: (block.items ?? []).map((item, itemIndex) => ({
          _key: `item-${itemIndex}`,
          html: sanitizePatientFacingHtml(item.html ?? ""),
        })).filter((item) => item.html),
      };
    }

    if (type === "comparisonTable") {
      return {
        ...base,
        columns: (block.columns ?? []).map(sanitizePatientFacingText).filter(Boolean),
        rows: (block.rows ?? []).map((row, rowIndex) => ({
          _key: `row-${rowIndex}`,
          cells: row.map(sanitizePatientFacingText).filter(Boolean),
        })),
      };
    }

    return base;
  });
}

function sanitizePatientFacingHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+="[^"]*"/gi, "")
    .replace(/\son[a-z]+='[^']*'/gi, "")
    .replace(/href=["'](?!https?:\/\/|\/|mailto:|tel:)[^"']*["']/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHtmlToText(value?: string) {
  if (!value) return undefined;
  return sanitizePatientFacingText(value.replace(/<[^>]+>/g, ""));
}

function normalizeOption(option: string | { html?: string }) {
  const value = typeof option === "string" ? option : option.html ?? "";
  return normalizeHtmlToText(value) ?? "";
}

function isPublicUrl(url?: string) {
  return Boolean(url && /^(https?:\/\/|\/|mailto:|tel:)/i.test(url));
}

function getInteractionBlock(lesson: SourceLesson) {
  return lesson.contentBlocks?.find((block) => block.type === "interactiveActivity") ?? lesson.interactiveComponent;
}

function getKnowledgeCheckBlock(lesson: SourceLesson) {
  return lesson.contentBlocks?.find((block) => block.type === "knowledgeCheck");
}

function inferCompletionRequirements(interactionBlock?: SourceContentBlock | (Record<string, unknown> & { required?: boolean }) | null, quizBlock?: SourceContentBlock) {
  const requirements = ["view_content"];
  if (interactionBlock?.required !== false) requirements.push("complete_interaction");
  if (quizBlock) requirements.push("pass_knowledge_check");
  return requirements;
}

function getDuplicateLessonSlugs(course: SourceCourse) {
  const counts = new Map<string, number>();
  for (const section of course.sections) {
    for (const lesson of getSectionLessons(section)) {
      const slug = getSlug(lesson.slug);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([slug]) => slug));
}

function getSlug(slug?: string | { current?: string }) {
  return typeof slug === "string" ? slug : slug?.current ?? "";
}

function getSectionLessons(section: SourceSection) {
  return section.lessons ?? section.items ?? [];
}

function getQuizQuestions(lesson: SourceLesson) {
  return lesson.quiz?.questions ?? getKnowledgeCheckBlock(lesson)?.questions ?? lesson.knowledgeChecks ?? [];
}

function normalizeCertificate(certificate?: Record<string, unknown>) {
  return {
    enabled: certificate?.enabled ?? true,
    title: certificate?.title ?? "Certificate of Completion",
    subtitle: certificate?.subtitle,
    bodyText: certificate?.bodyText ?? "has completed the assigned JourneyLite patient education course:",
    signatureName: certificate?.signatureName ?? "JourneyLite",
    signatureTitle: certificate?.signatureTitle,
    showJourneyLiteLogo: certificate?.showJourneyLiteLogo ?? true,
    showCompletionDate: certificate?.showCompletionDate ?? true,
    showPatientName: certificate?.showPatientName ?? true,
    showCourseName: certificate?.showCourseName ?? true,
    showCertificateId: certificate?.showCertificateId ?? true,
    qrVerificationEnabled: certificate?.qrVerificationEnabled ?? false,
    printEnabled: certificate?.printEnabled ?? true,
    downloadPdfEnabled: certificate?.downloadPdfEnabled ?? true,
    emailEnabled: certificate?.emailEnabled ?? false,
  };
}

function queueDocument(document: QueuedDocument) {
  documents.push(document);
}

async function commitDocuments() {
  if (dryRun) {
    const counts = documents.reduce<Record<string, number>>((acc, document) => {
      acc[document._type] = (acc[document._type] ?? 0) + 1;
      return acc;
    }, {});
    console.log(`Dry run complete. Built ${documents.length} Sanity documents without writing.`);
    console.log(counts);
    return;
  }

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
