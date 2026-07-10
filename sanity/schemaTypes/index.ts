import { author } from "./author";
import { blogPost } from "./blogPost";
import { category } from "./category";
import { formDefinition } from "./formDefinition";
import { location } from "./location";
import { post } from "./post";
import { reactPageOverride } from "./reactPageOverride";
import { siteSettings } from "./siteSettings";
import { sitePage } from "./sitePage";
import { staffProfile } from "./staffProfile";
import { testimonial } from "./testimonial";

export const schemaTypes = [
  // Blog & Resources
  blogPost,
  post,
  sitePage,
  reactPageOverride,
  siteSettings,
  formDefinition,
  category,
  author,
  staffProfile,
  location,
  testimonial,
];
