# JourneyLite Education Content Format

Generated: 2026-05-26T00:25:28.858Z

## Current Data Model

The patient education system reads enhanced Sanity LMS documents:

- `lmsCourse`: top-level course shown in `/courses`.
- `lmsSection`: ordered course module/section.
- `lmsLesson`: lesson content, media, safety footer, completion requirements, activity, quiz, and evidence.
- `lmsInteractiveComponent`: optional required activity inside a lesson.
- `lmsQuiz` and `lmsQuestion`: optional knowledge check.
- `lmsMediaReference`: imported/local media attached to lessons.
- `lmsEvidenceReference`: optional sources shown under “Sources & references”.
- `lmsClinicalReviewStatus`: controls whether a course is patient visible.

## Visibility Rules

Courses show to patients only when:

- `lmsCourse.isPublished == true`
- `lmsCourse.clinicalReview->status == "approved"`

The public course list queries published and clinically approved courses only.

## Course Shape

```json
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
```

## Section / Module Shape

```json
{
  "_type": "lmsSection",
  "title": "Module title",
  "slug": { "current": "module-slug" },
  "description": "Optional short intro",
  "order": 1,
  "lessons": [{ "_ref": "lmsLesson id" }]
}
```

## Lesson Shape

```json
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
```

## Lesson Body Rendering

`contentSections[].body` is an array of strings. The renderer supports:

- Plain paragraphs
- Headings beginning with `#`, `##`, or `###`
- Bullets beginning with `-` or `*`
- Ordered list lines like `1. Item`
- Inline `**bold**`, `*italic*`, \`code\`, and `[label](url)`

## Supported Activity Types

The interactive component renderer recognizes these `interactionType` values:

- `calculator`
- `tracker`
- `drag_drop`
- `guided_form`
- `scenario_picker`
- `medication_checklist`
- `timeline`
- `triage_cards`
- `calendar_builder`
- `upload_or_confirm`
- `completion_attestation`
- `knowledge_card`

Activities currently render as confirmation-style patient tasks. When completed, they record `interaction_completed` and, when configured, the component's `supabaseEvent`.

## Completion and Gating

Course lessons unlock sequentially:

- The first incomplete lesson is unlocked.
- Earlier completed lessons remain unlocked.
- Later lessons are locked until prior lessons are completed.

Lesson completion can require:

- `view_content`: patient viewed the lesson.
- `complete_interaction`: patient completed the activity; requires a recorded `interaction_completed` event.
- `pass_knowledge_check`: patient passed the quiz; requires a recorded `knowledge_check_passed` event.

Progress is stored in Supabase:

- `user_course_progress`: lesson status, completed timestamp, last viewed timestamp.
- `user_lesson_events`: lesson views, interactions, quiz pass events, completion/reopen events.
- `user_quiz_attempts`: submitted answers, score, pass/fail.
- `course_assignments` and `enrollments`: patient access/assignment.

## Recommended Patient-Facing Editorial Rules

- Do not mention “Sanity”, “Enhanced LMS”, import tooling, or backend tracking in patient-facing copy.
- Use headings that make sense to patients, such as “Why this matters”, “What to do next”, and “When to call JourneyLite”.
- Keep links in standard markdown format: `[clear label](https://example.com)`.
- Use bullets only for short scan-friendly lists.
- Put safety escalation details in `patientSafetyFooter` and `safetyEscalationTopics`.
- Add a short quiz and/or activity for lessons that must be actively completed before the patient advances.
