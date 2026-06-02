import courseExport from "@/exports/education-course-details.json";

export type CourseMedia = {
  altText?: string;
  caption?: string;
  contentType?: string;
  localPath?: string;
  sourceUrl?: string;
  title?: string;
};

export type CourseQuizQuestion = {
  correctIndex?: number;
  feedback?: string;
  options?: string[];
  question: string;
  questionType?: string;
};

export type CourseQuiz = {
  passingScore?: number;
  questions?: CourseQuizQuestion[];
  required?: boolean;
  title?: string;
};

export type CourseLesson = {
  _id: string;
  completionRequires?: string[];
  contentSections?: { heading?: string; body?: string[] }[];
  estimatedMinutes?: number;
  evidenceReferences?: { label?: string; url?: string; use?: string }[];
  interactiveComponent?: {
    description?: string;
    interactionType?: string;
    required?: boolean;
    title?: string;
  };
  learningObjectives?: string[];
  media?: CourseMedia[];
  order?: number;
  patientSafetyFooter?: string;
  quiz?: CourseQuiz;
  safetyEscalationTopics?: string[];
  sectionTitle?: string;
  slug: string;
  sourceUrl?: string;
  title: string;
};

export type CourseSection = {
  _id: string;
  description?: string;
  lessons: CourseLesson[];
  order?: number;
  slug: string;
  title: string;
};

export type Course = {
  _id: string;
  accessType?: string;
  audience?: string;
  clinicalReview?: {
    reviewNotes?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    status?: string;
  };
  clinicalReviewRequired?: boolean;
  courseSummary?: string;
  isPublished?: boolean;
  sections: CourseSection[];
  slug: string;
  sourceUrl?: string;
  title: string;
};

const courses = courseExport.courses as Course[];

export function getCourses() {
  return courses;
}

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug) ?? null;
}

export function getCourseLesson(courseSlug: string, lessonSlug: string) {
  const course = getCourse(courseSlug);
  if (!course) return null;

  for (const section of course.sections) {
    const lesson = section.lessons.find((item) => item.slug === lessonSlug);
    if (lesson) return { course, section, lesson };
  }

  return null;
}

export function getCourseStats(course: Course) {
  const lessons = course.sections.flatMap((section) => section.lessons);
  return {
    activities: lessons.filter((lesson) => lesson.interactiveComponent).length,
    estimatedMinutes: lessons.reduce((total, lesson) => total + (lesson.estimatedMinutes ?? 0), 0),
    lessons: lessons.length,
    media: lessons.reduce((total, lesson) => total + (lesson.media?.length ?? 0), 0),
    quizzes: lessons.filter((lesson) => lesson.quiz?.questions?.length).length,
    sections: course.sections.length,
  };
}

export function getAdjacentLessons(course: Course, lessonSlug: string) {
  const lessons = course.sections.flatMap((section) => section.lessons);
  const index = lessons.findIndex((lesson) => lesson.slug === lessonSlug);

  return {
    next: index >= 0 ? lessons[index + 1] ?? null : null,
    previous: index > 0 ? lessons[index - 1] ?? null : null,
  };
}

export function getFirstLesson(course: Course) {
  return course.sections[0]?.lessons[0] ?? null;
}

export function getCoursePreviewMedia(course: Course) {
  return course.sections.flatMap((section) => section.lessons).find((lesson) => lesson.media?.[0])?.media?.[0] ?? null;
}
