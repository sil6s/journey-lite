import { author } from "./author";
import { blogPost } from "./blogPost";
import { category } from "./category";
import { location } from "./location";
import { post } from "./post";
import { staffProfile } from "./staffProfile";
// Patient Education (LMS)
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
  // Blog & Resources
  blogPost,
  post,
  category,
  author,
  staffProfile,
  location,
  // Patient Education
  lmsCourse,
  lmsSection,
  lmsLesson,
  lmsQuiz,
  lmsQuestion,
  lmsInteractiveComponent,
  lmsMediaReference,
  lmsEvidenceReference,
  lmsClinicalReviewStatus,
];
