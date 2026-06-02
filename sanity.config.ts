import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./src/lib/sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

// Patient Education (LMS) has been removed from Sanity Studio.
// Course content is now managed in Open edX (Tutor).
// See lib/openedx/ for the API integration.

export default defineConfig({
  name: "journeylite-blog",
  title: "JourneyLite CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      name: "desk",
      title: "Content",
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("📝 Blog & Resources")
              .child(
                S.list()
                  .title("Blog & Resources")
                  .items([
                    S.documentTypeListItem("blogPost").title("Blog Posts"),
                    S.documentTypeListItem("post").title("Posts"),
                    S.documentTypeListItem("category").title("Categories"),
                    S.documentTypeListItem("author").title("Authors"),
                  ])
              ),
            S.divider(),
            S.listItem()
              .title("🏥 Practice Info")
              .child(
                S.list()
                  .title("Practice Info")
                  .items([
                    S.documentTypeListItem("staffProfile").title("Staff Profiles"),
                    S.documentTypeListItem("location").title("Locations"),
                  ])
              ),
            S.divider(),
            S.listItem()
              .title("⭐ Patient Stories")
              .child(
                S.list()
                  .title("Patient Stories")
                  .items([
                    S.documentTypeListItem("testimonial").title("All Testimonials"),
                    S.listItem()
                      .title("Featured (Homepage)")
                      .child(
                        S.documentList()
                          .title("Featured Testimonials")
                          .filter('_type == "testimonial" && featured == true')
                          .defaultOrdering([{ field: "weightLost", direction: "desc" }])
                      ),
                  ])
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
