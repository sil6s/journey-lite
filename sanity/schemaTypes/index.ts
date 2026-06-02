import { author } from "./author";
import { blogPost } from "./blogPost";
import { category } from "./category";
import { formDefinition } from "./formDefinition";
import { location } from "./location";
import { post } from "./post";
import { sitePage } from "./sitePage";
import { staffProfile } from "./staffProfile";
import { testimonial } from "./testimonial";

// Patient Education (LMS) schemas have been removed.
// Course content is now managed in Open edX (Tutor).
// See lib/openedx/ for the new API integration.

export const schemaTypes = [
  // Blog & Resources
  blogPost,
  post,
  sitePage,
  formDefinition,
  category,
  author,
  staffProfile,
  location,
  testimonial,
];
