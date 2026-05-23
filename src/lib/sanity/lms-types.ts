import type { SanityImageAsset } from "./types";

export type BariatricStage =
  | "pre-op"
  | "immediate-post-op"
  | "soft-food"
  | "long-term-maintenance"
  | "vitamins"
  | "general-education";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type AccessType = "free" | "enrolled" | "paid" | "provider-assigned";
export type LessonType = "article" | "video" | "download" | "checklist" | "recipe" | "mixed";
export type CalloutType = "note" | "tip" | "warning" | "appointment-reminder";

export interface CalloutBox {
  _key: string;
  type: CalloutType;
  title: string;
  body: string;
}

export interface SanityDownload {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  resourceType: string | null;
  fileUrl: string | null;
}

export interface SanityMediaReference {
  _id: string;
  title: string;
  sourceUrl: string | null;
  originalPath: string;
  localPath: string | null;
  contentType: string | null;
  altText: string | null;
  caption: string | null;
  assetUrl: string | null;
}

export interface SanityInteractiveComponent {
  _id: string;
  title: string;
  interactionType:
    | "calculator"
    | "tracker"
    | "drag_drop"
    | "guided_form"
    | "scenario_picker"
    | "medication_checklist"
    | "timeline"
    | "triage_cards"
    | "calendar_builder"
    | "upload_or_confirm"
    | "completion_attestation"
    | "knowledge_card";
  description: string | null;
  supabaseEvent: string | null;
  required: boolean;
  config: string | null;
}

export interface SanityQuizQuestion {
  _id: string;
  question: string;
  questionType: string;
  options: string[];
  correctIndex: number | null;
  feedback: string | null;
}

export interface SanityQuiz {
  _id: string;
  title: string;
  passingScore: number;
  required: boolean;
  questions: SanityQuizQuestion[];
}

export interface EvidenceReference {
  _id: string;
  label: string;
  url: string | null;
  use: string | null;
}

export interface SanityLessonRef {
  _id: string;
  title: string;
  slug: string;
  sectionTitle: string | null;
  description: string | null;
  lessonType: LessonType;
  estimatedTime: string | null;
  estimatedMinutes: number | null;
  order: number | null;
  isPreview: boolean;
  patientSafetyFooter: string | null;
  completionRequires: string[] | null;
  interactiveType: string | null;
  quizRequired: boolean;
}

export interface SanityLesson extends SanityLessonRef {
  videoUrl?: string | null;
  body?: unknown[] | null;
  sourceUrl: string | null;
  originalRequiredContentSnapshot: string | null;
  learningObjectives: string[] | null;
  contentSections: { _key: string; heading: string | null; body: string[] | null }[] | null;
  media: SanityMediaReference[];
  interactiveComponent: SanityInteractiveComponent | null;
  quiz: SanityQuiz | null;
  evidenceReferences: EvidenceReference[];
  keyTakeaways: string[] | null;
  downloads: SanityDownload[];
  calloutBoxes: CalloutBox[];
  nextStepCta: { label: string; href: string } | null;
  relatedLessons: SanityLessonRef[];
  relatedResources: SanityBlogRef[];
}

export interface SanityModule {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number | null;
  lessons: SanityLessonRef[];
}

export interface SanityBlogRef {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
}

export interface SanityCourseCard {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: SanityImageAsset | null;
  bariatricStage: BariatricStage | null;
  difficultyLevel: DifficultyLevel | null;
  estimatedDuration: string | null;
  accessType: AccessType;
  isFeatured: boolean;
  moduleCount: number;
  lessonCount: number;
}

export interface SanityCourse extends SanityCourseCard {
  description: string | null;
  modules: SanityModule[];
  relatedResources: SanityBlogRef[];
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface SanityRecipe {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  bariatricStage: BariatricStage | null;
  image: SanityImageAsset | null;
  tags: string[] | null;
  ingredients: string[];
  instructions: unknown[] | null;
  notes: string | null;
  proteinGrams: number | null;
  calories: number | null;
}

export interface LessonProgressRecord {
  lesson_slug: string;
  status: "not_started" | "in_progress" | "completed";
  completed: boolean;
  completed_at: string | null;
  last_viewed_at: string;
  percent_watched: number;
}

export interface CourseProgressSummary {
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  lastViewedLessonSlug: string | null;
  isCompleted: boolean;
}
