import { defineField, defineType } from "sanity";

const reviewStatuses = [
  { title: "Draft", value: "draft" },
  { title: "Pending clinical review", value: "pending_review" },
  { title: "Approved", value: "approved" },
  { title: "Changes requested", value: "changes_requested" },
  { title: "Archived", value: "archived" },
];

const interactionTypes = [
  "calculator",
  "tracker",
  "drag_drop",
  "guided_form",
  "scenario_picker",
  "medication_checklist",
  "timeline",
  "triage_cards",
  "calendar_builder",
  "upload_or_confirm",
  "completion_attestation",
  "knowledge_card",
].map((value) => ({ title: value.replaceAll("_", " "), value }));

const contentStatuses = [
  { title: "Draft", value: "draft" },
  { title: "Ready for Review", value: "ready_for_review" },
  { title: "Needs Changes", value: "needs_changes" },
  { title: "Clinically Approved", value: "clinically_approved" },
  { title: "Published", value: "published" },
  { title: "Archived", value: "archived" },
];

const completionRequirementOptions = ["view_content", "complete_interaction", "pass_knowledge_check"].map((value) => ({
  title: value.replaceAll("_", " "),
  value,
}));

const contentBlockTypes = [
  "paragraph",
  "richText",
  "bulletList",
  "numberedList",
  "callout",
  "image",
  "linkCard",
  "comparisonTable",
  "interactiveActivity",
  "knowledgeCheck",
].map((value) => ({ title: value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()), value }));

export const lmsClinicalReviewStatus = defineType({
  name: "lmsClinicalReviewStatus",
  title: "Clinical Review Status",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: reviewStatuses },
      initialValue: "pending_review",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "reviewedBy", title: "Reviewed By", type: "string" }),
    defineField({ name: "reviewerRole", title: "Reviewer Role", type: "string" }),
    defineField({ name: "reviewedAt", title: "Reviewed At", type: "datetime" }),
    defineField({ name: "versionReviewed", title: "Version Reviewed", type: "string" }),
    defineField({ name: "nextReviewAt", title: "Next Review Date", type: "date" }),
    defineField({ name: "reviewNotes", title: "Review Notes", type: "text", rows: 4 }),
  ],
});

export const lmsMediaReference = defineType({
  name: "lmsMediaReference",
  title: "Media Reference",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "sourceUrl", title: "Original Source URL", type: "url" }),
    defineField({
      name: "originalPath",
      title: "Original Media Path",
      description: "Preserved exactly from originalMedia.path. Do not rewrite this value.",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({ name: "localPath", title: "Local Public Path", type: "string" }),
    defineField({ name: "contentType", title: "Content Type", type: "string" }),
    defineField({ name: "altText", title: "Alt Text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({ name: "sanityAsset", title: "Sanity Asset", type: "file" }),
  ],
});

export const lmsEvidenceReference = defineType({
  name: "lmsEvidenceReference",
  title: "Evidence Reference",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({ name: "use", title: "Use / Rationale", type: "text", rows: 3 }),
  ],
});

export const lmsQuestion = defineType({
  name: "lmsQuestion",
  title: "Question",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "text", rows: 3, validation: (Rule) => Rule.required() }),
    defineField({ name: "questionType", title: "Question Type", type: "string", initialValue: "single_choice" }),
    defineField({ name: "options", title: "Options", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "correctIndex", title: "Correct Option Index", type: "number" }),
    defineField({ name: "feedback", title: "Feedback", type: "text", rows: 3 }),
  ],
});

export const lmsQuiz = defineType({
  name: "lmsQuiz",
  title: "Quiz",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "passingScore", title: "Passing Score", type: "number", initialValue: 100 }),
    defineField({ name: "required", title: "Required for Completion", type: "boolean", initialValue: true }),
    defineField({ name: "questions", title: "Questions", type: "array", of: [{ type: "reference", to: [{ type: "lmsQuestion" }] }] }),
  ],
});

export const lmsInteractiveComponent = defineType({
  name: "lmsInteractiveComponent",
  title: "Interactive Component",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "interactionType",
      title: "Type",
      type: "string",
      options: { list: interactionTypes },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "supabaseEvent", title: "Supabase Event", type: "string" }),
    defineField({ name: "required", title: "Required for Completion", type: "boolean", initialValue: true }),
    defineField({ name: "config", title: "Configuration JSON", type: "text", rows: 8 }),
  ],
});

export const lmsLesson = defineType({
  name: "lmsLesson",
  title: "Lesson",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "requirements", title: "Requirements" },
    { name: "review", title: "Clinical Review" },
    { name: "source", title: "Source" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", group: "content", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "sectionTitle", title: "Section Title", type: "string", group: "content" }),
    defineField({ name: "order", title: "Order", type: "number", group: "content" }),
    defineField({ name: "estimatedMinutes", title: "Estimated Minutes", type: "number", group: "content" }),
    defineField({ name: "lessonStatus", title: "Lesson Status", type: "string", group: "review", options: { list: contentStatuses }, initialValue: "draft" }),
    defineField({ name: "reviewer", title: "Reviewer", type: "string", group: "review" }),
    defineField({ name: "reviewedAt", title: "Reviewed Date", type: "datetime", group: "review" }),
    defineField({ name: "versionNotes", title: "Version Notes", type: "text", rows: 3, group: "review" }),
    defineField({ name: "certificateRelevant", title: "Counts Toward Certificate", type: "boolean", group: "requirements", initialValue: true }),
    defineField({ name: "sourceUrl", title: "Source URL", type: "url", group: "source" }),
    defineField({ name: "originalRequiredContentSnapshot", title: "Original Required Content Snapshot", type: "text", rows: 8, group: "source" }),
    defineField({ name: "learningObjectives", title: "Learning Objectives", type: "array", group: "content", of: [{ type: "string" }] }),
    defineField({
      name: "contentSections",
      title: "Content Sections",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            { name: "heading", title: "Heading", type: "string" },
            { name: "body", title: "Body", type: "array", of: [{ type: "text" }] },
          ],
        },
      ],
    }),
    defineField({
      name: "contentBlocks",
      title: "Rich Content Blocks",
      description: "Flexible lesson blocks for patient-facing education. Use these instead of dash-prefixed markdown when building new lessons.",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            { name: "type", title: "Block Type", type: "string", options: { list: contentBlockTypes }, validation: (Rule) => Rule.required() },
            { name: "title", title: "Title", type: "string" },
            { name: "html", title: "Rich Text HTML", type: "text", rows: 4, description: "Supports paragraph text plus strong, em, underline, and descriptive links." },
            { name: "tone", title: "Callout Tone", type: "string", options: { list: ["info", "tip", "warning", "success"].map((value) => ({ title: value, value })) } },
            {
              name: "items",
              title: "List Items",
              type: "array",
              of: [{ type: "object", fields: [{ name: "html", title: "Item Text", type: "text", rows: 2 }] }],
            },
            { name: "url", title: "Link URL", type: "url" },
            { name: "description", title: "Description", type: "text", rows: 3 },
            { name: "columns", title: "Table Columns", type: "array", of: [{ type: "string" }] },
            { name: "rows", title: "Table Rows", type: "array", of: [{ type: "object", fields: [{ name: "cells", title: "Cells", type: "array", of: [{ type: "string" }] }] }] },
            { name: "imageSlot", title: "Image Slot", type: "string" },
            { name: "imageUrl", title: "Image URL", type: "url" },
            { name: "placement", title: "Image Placement", type: "string" },
            { name: "aspectRatio", title: "Image Aspect Ratio", type: "string" },
            { name: "altText", title: "Image Alt Text", type: "string" },
            { name: "caption", title: "Image Caption", type: "string" },
            { name: "newPhotoPrompt", title: "New Photo Prompt", type: "text", rows: 3 },
            { name: "assetStatus", title: "Asset Status", type: "string" },
            { name: "interactionType", title: "Interaction Type", type: "string", options: { list: interactionTypes } },
            { name: "required", title: "Required", type: "boolean" },
            { name: "config", title: "Configuration JSON", type: "text", rows: 5 },
            { name: "passingScore", title: "Passing Score", type: "number" },
            { name: "questionsJson", title: "Questions JSON", type: "text", rows: 6 },
          ],
          preview: {
            select: { title: "title", type: "type", subtitle: "html" },
            prepare({ title, type, subtitle }) {
              return { title: title || type || "Content block", subtitle };
            },
          },
        },
      ],
    }),
    defineField({ name: "media", title: "Media", type: "array", group: "content", of: [{ type: "reference", to: [{ type: "lmsMediaReference" }] }] }),
    defineField({ name: "interactiveComponent", title: "Interactive Component", type: "reference", group: "requirements", to: [{ type: "lmsInteractiveComponent" }] }),
    defineField({ name: "quiz", title: "Knowledge Check", type: "reference", group: "requirements", to: [{ type: "lmsQuiz" }] }),
    defineField({ name: "completionRequires", title: "Completion Requires", type: "array", group: "requirements", of: [{ type: "string", options: { list: completionRequirementOptions } }] }),
    defineField({ name: "patientSafetyFooter", title: "Patient Safety Footer", type: "text", rows: 3, group: "requirements" }),
    defineField({ name: "safetyEscalationTopics", title: "Safety Escalation Topics", type: "array", group: "requirements", of: [{ type: "string" }] }),
    defineField({ name: "evidenceReferences", title: "Evidence References", type: "array", group: "review", of: [{ type: "reference", to: [{ type: "lmsEvidenceReference" }] }] }),
    defineField({ name: "clinicalReviewRequired", title: "Clinical Review Required", type: "boolean", group: "review", initialValue: true }),
    defineField({ name: "clinicalReview", title: "Clinical Review", type: "reference", group: "review", to: [{ type: "lmsClinicalReviewStatus" }], validation: (Rule) => Rule.required() }),
  ],
});

export const lmsSection = defineType({
  name: "lmsSection",
  title: "Section",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "estimatedModuleMinutes", title: "Estimated Module Time", type: "number" }),
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "requiresClinicalReview", title: "Requires Clinical Review", type: "boolean", initialValue: true }),
    defineField({ name: "completionRequirement", title: "Module Completion Requirement", type: "string", options: { list: ["complete_all_lessons", "pass_module_quiz", "final_attestation"].map((value) => ({ title: value.replaceAll("_", " "), value })) } }),
    defineField({ name: "moduleIntro", title: "Module Intro Card", type: "text", rows: 3 }),
    defineField({ name: "moduleSummary", title: "Module Summary Card", type: "text", rows: 3 }),
    defineField({ name: "moduleQuizEnabled", title: "Module-Level Quiz Enabled", type: "boolean", initialValue: false }),
    defineField({ name: "moduleQuiz", title: "Module-Level Quiz", type: "reference", to: [{ type: "lmsQuiz" }] }),
    defineField({ name: "lessons", title: "Lessons", type: "array", of: [{ type: "reference", to: [{ type: "lmsLesson" }] }] }),
  ],
});

export const lmsCourse = defineType({
  name: "lmsCourse",
  title: "Course",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "access", title: "Access" },
    { name: "review", title: "Clinical Review" },
    { name: "source", title: "Source" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", group: "content", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "sourceUrl", title: "Source URL", type: "url", group: "source" }),
    defineField({ name: "audience", title: "Audience", type: "text", rows: 2, group: "content" }),
    defineField({ name: "courseSummary", title: "Course Summary", type: "text", rows: 4, group: "content" }),
    defineField({ name: "estimatedTotalMinutes", title: "Estimated Total Time", type: "number", group: "content" }),
    defineField({ name: "courseCategory", title: "Course Category", type: "string", group: "content", options: { list: ["pre-op", "post-op", "medications", "nutrition", "safety", "maintenance", "general"].map((value) => ({ title: value.replaceAll("-", " "), value })) } }),
    defineField({ name: "versionNumber", title: "Version Number", type: "string", group: "review", initialValue: "1.0" }),
    defineField({ name: "sections", title: "Sections", type: "array", group: "content", of: [{ type: "reference", to: [{ type: "lmsSection" }] }] }),
    defineField({ name: "accessType", title: "Access Type", type: "string", group: "access", initialValue: "assigned", options: { list: ["assigned", "free", "provider-assigned", "paid"].map((value) => ({ title: value, value })) } }),
    defineField({ name: "isPublished", title: "Published to Patients", type: "boolean", group: "review", initialValue: false }),
    defineField({ name: "clinicalReviewRequired", title: "Clinical Review Required", type: "boolean", group: "review", initialValue: true }),
    defineField({
      name: "clinicalReview",
      title: "Clinical Review",
      type: "reference",
      group: "review",
      to: [{ type: "lmsClinicalReviewStatus" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "sourceNotes", title: "Source Notes", type: "array", group: "source", of: [{ type: "string" }] }),
    defineField({
      name: "certificate",
      title: "Certificate Settings",
      type: "object",
      group: "access",
      fields: [
        { name: "enabled", title: "Certificate Enabled", type: "boolean", initialValue: true },
        { name: "title", title: "Certificate Title", type: "string", initialValue: "Certificate of Completion" },
        { name: "subtitle", title: "Certificate Subtitle", type: "string" },
        { name: "bodyText", title: "Certificate Body Text", type: "text", rows: 3 },
        { name: "signatureName", title: "Signature Name", type: "string", initialValue: "JourneyLite" },
        { name: "signatureTitle", title: "Signature Title", type: "string" },
        { name: "showJourneyLiteLogo", title: "Show JourneyLite Logo", type: "boolean", initialValue: true },
        { name: "showCompletionDate", title: "Show Completion Date", type: "boolean", initialValue: true },
        { name: "showPatientName", title: "Show Patient Name", type: "boolean", initialValue: true },
        { name: "showCourseName", title: "Show Course Name", type: "boolean", initialValue: true },
        { name: "showCertificateId", title: "Show Certificate ID", type: "boolean", initialValue: true },
        { name: "qrVerificationEnabled", title: "QR Verification Enabled", type: "boolean", initialValue: false },
        { name: "printEnabled", title: "Print Button Enabled", type: "boolean", initialValue: true },
        { name: "downloadPdfEnabled", title: "Download PDF Enabled", type: "boolean", initialValue: true },
        { name: "emailEnabled", title: "Email Certificate Enabled", type: "boolean", initialValue: false },
      ],
    }),
  ],
  preview: {
    select: { title: "title", isPublished: "isPublished" },
    prepare({ title, isPublished }) {
      return { title: `${isPublished ? "" : "DRAFT - "}${title}` };
    },
  },
});
