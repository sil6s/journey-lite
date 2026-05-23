import { author } from "./author";
import { blogPost } from "./blogPost";
import { category } from "./category";
import { location } from "./location";
import { post } from "./post";
import { staffProfile } from "./staffProfile";
// LMS schemas
import { course } from "./lms/course";
import { courseModule } from "./lms/module";
import { lesson } from "./lms/lesson";
import { courseResource } from "./lms/courseResource";
import { recipe } from "./lms/recipe";
import {
  lmsClinicalReviewStatus,
  lmsCourse,
  lmsEvidenceReference,
  lmsInteractiveComponent,
  lmsLesson,
  lmsMediaReference,
  lmsQuestion,
  lmsQuiz,
  lmsSection,
} from "./lms/enhanced";

export const schemaTypes = [
  // Existing blog/resources
  blogPost,
  post,
  category,
  author,
  staffProfile,
  location,
  // LMS / Patient Education
  course,
  courseModule,
  lesson,
  courseResource,
  recipe,
  lmsCourse,
  lmsSection,
  lmsLesson,
  lmsQuiz,
  lmsQuestion,
  lmsInteractiveComponent,
  lmsEvidenceReference,
  lmsMediaReference,
  lmsClinicalReviewStatus,
];
