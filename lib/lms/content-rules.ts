export const lessonTemplateSections = [
  "Why this matters",
  "What this means for you",
  "Example",
  "Common mistakes to avoid",
  "When to call JourneyLite",
  "Key takeaways",
];

export const patientFacingBannedTerms = [
  "LMS",
  "Sanity",
  "Supabase",
  "backend tracking",
  "learner",
  "the system should reinforce",
  "complete the checkpoint",
  "Enhanced LMS",
];

export const defaultSafetyFooter =
  "This education supports your JourneyLite care plan but does not replace individualized medical advice. Follow your surgical team’s instructions. Contact JourneyLite if your instructions are unclear or if you develop new or worsening symptoms.";

export const urgentSafetyFooter =
  "This education does not replace urgent medical care. Seek emergency care right away for chest pain, trouble breathing, fainting, severe weakness, signs of stroke, or symptoms that feel life-threatening.";

export const medicationSafetyLanguage =
  "Do not stop, start, or change a medication unless your JourneyLite team or prescribing clinician has instructed you to do so. If your medication instructions are unclear, contact JourneyLite before making changes.";

export const dietSafetyLanguage =
  "Follow the diet stage and start date assigned by your JourneyLite team. If your instructions do not match what you see here, follow your individualized instructions and contact JourneyLite with questions.";

export const completionRulePresets = [
  {
    label: "Low-risk informational lesson",
    value: ["view_content"],
    guidance: "Use when the lesson only explains background information and does not require a decision.",
  },
  {
    label: "Planning lesson",
    value: ["view_content", "complete_interaction"],
    guidance: "Use when the patient should make a plan, confirm readiness, or practice a task.",
  },
  {
    label: "Safety-critical lesson",
    value: ["view_content", "complete_interaction", "pass_knowledge_check"],
    guidance: "Use for medications, symptoms, diet stage changes, testing, surgery-day instructions, or escalation guidance.",
  },
  {
    label: "End-of-module check",
    value: ["view_content", "pass_knowledge_check"],
    guidance: "Use for module review instead of forcing a quiz on every lesson.",
  },
  {
    label: "Final course completion",
    value: ["view_content", "complete_interaction"],
    guidance: "Use for final attestation and certificate readiness.",
  },
];

export const interactionGuidance = [
  ["calculator", "BMI-based diet length, product quantity, fluid goals, or timeline calculations."],
  ["tracker", "Hydration, protein, walking, vitamins, pain medicine timing, and post-op intake."],
  ["drag_drop", "Allowed vs not allowed foods, clear vs not clear liquids, packing lists, or building a compliant meal day."],
  ["guided_form", "Product ordering practice, surgery-day planning, pre-op readiness, or document preparation."],
  ["scenario_picker", "Facility selection, arrival timing, out-of-town planning, and what-should-I-do-next decisions."],
  ["medication_checklist", "Blood thinners, diabetes medications, GLP-1s, blood pressure meds, supplements, birth control, and NSAIDs."],
  ["timeline", "Pre-op countdown, final 24 hours, post-op diet progression, and follow-up schedule."],
  ["triage_cards", "Vomiting, dehydration, bleeding, infection, pain, constipation, chest pain, shortness of breath, and urgent symptoms."],
  ["calendar_builder", "Follow-up appointments, reminders, vitamin schedule, and medication hold reminders."],
  ["upload_or_confirm", "Forms, scans, photos, test results, FMLA paperwork, or required documents."],
  ["completion_attestation", "Use only at the end of a module or course."],
  ["knowledge_card", "Use sparingly for key takeaways. Do not make this the default activity everywhere."],
] as const;

export const certificateDisclaimer =
  "This certificate confirms completion of the assigned JourneyLite education course. It does not replace medical clearance, individualized instructions, or approval from the surgical team.";
