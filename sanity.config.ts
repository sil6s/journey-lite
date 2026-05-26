import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./src/lib/sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

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
              .title("🎓 Patient Education")
              .child(
                S.list()
                  .title("Patient Education")
                  .items([
                    S.documentTypeListItem("lmsCourse").title("Courses"),
                    S.documentTypeListItem("lmsSection").title("Sections"),
                    S.documentTypeListItem("lmsLesson").title("Lessons"),
                    S.divider(),
                    S.documentTypeListItem("lmsQuiz").title("Quizzes"),
                    S.documentTypeListItem("lmsQuestion").title("Questions"),
                    S.documentTypeListItem("lmsInteractiveComponent").title("Interactive Components"),
                    S.divider(),
                    S.documentTypeListItem("lmsMediaReference").title("Media References"),
                    S.documentTypeListItem("lmsEvidenceReference").title("Evidence References"),
                    S.documentTypeListItem("lmsClinicalReviewStatus").title("Clinical Review Statuses"),
                  ])
              ),
            S.divider(),
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
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
