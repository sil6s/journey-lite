import { author } from "./author";
import { blogPost } from "./blogPost";
import { category } from "./category";
import { location } from "./location";
import { post } from "./post";
import { staffProfile } from "./staffProfile";

// Patient Education (LMS) schemas have been removed.
// Course content is now managed in Open edX (Tutor).
// See lib/openedx/ for the new API integration.

export const schemaTypes = [
  // Blog & Resources
  blogPost,
  post,
  category,
  author,
  staffProfile,
  location,
];
