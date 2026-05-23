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
    defineField({ name: "reviewedAt", title: "Reviewed At", type: "datetime" }),
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
    defineField({ name: "media", title: "Media", type: "array", group: "content", of: [{ type: "reference", to: [{ type: "lmsMediaReference" }] }] }),
    defineField({ name: "interactiveComponent", title: "Interactive Component", type: "reference", group: "requirements", to: [{ type: "lmsInteractiveComponent" }] }),
    defineField({ name: "quiz", title: "Knowledge Check", type: "reference", group: "requirements", to: [{ type: "lmsQuiz" }] }),
    defineField({ name: "completionRequires", title: "Completion Requires", type: "array", group: "requirements", of: [{ type: "string" }] }),
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
    defineField({ name: "order", title: "Order", type: "number" }),
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
  ],
  preview: {
    select: { title: "title", isPublished: "isPublished" },
    prepare({ title, isPublished }) {
      return { title: `${isPublished ? "" : "DRAFT - "}${title}` };
    },
  },
});

