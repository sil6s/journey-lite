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
            // ── Pages ───────────────────────────────────────────────
            S.listItem()
              .title("📄 Pages")
              .child(
                S.list()
                  .title("Pages")
                  .items([
                    S.documentTypeListItem("sitePage").title("All Pages"),
                    S.listItem()
                      .title("Published")
                      .child(
                        S.documentList()
                          .title("Published Pages")
                          .filter('_type == "sitePage" && status == "published"')
                          .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
                      ),
                    S.listItem()
                      .title("Drafts")
                      .child(
                        S.documentList()
                          .title("Draft Pages")
                          .filter('_type == "sitePage" && status == "draft"')
                          .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
                      ),
                  ])
              ),
            S.divider(),
            // ── Blog & Resources ────────────────────────────────────
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
            // ── Practice Info ───────────────────────────────────────
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
            // ── Patient Stories ─────────────────────────────────────
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
            S.divider(),
            // ── Forms ───────────────────────────────────────────────
            S.listItem()
              .title("📋 Forms")
              .child(
                S.list()
                  .title("Forms")
                  .items([
                    S.documentTypeListItem("formDefinition").title("All Forms"),
                    S.listItem()
                      .title("Active")
                      .child(
                        S.documentList()
                          .title("Active Forms")
                          .filter('_type == "formDefinition" && status == "active"')
                          .defaultOrdering([{ field: "name", direction: "asc" }])
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
