import { groq } from "next-sanity";

const lessonRefFields = groq`
  _id,
  title,
  "slug": slug.current,
  sectionTitle,
  order,
  estimatedMinutes,
  "estimatedTime": select(defined(estimatedMinutes) => string(estimatedMinutes) + " min", null),
  "lessonType": "mixed",
  "isPreview": false,
  patientSafetyFooter,
  completionRequires,
  "interactiveType": interactiveComponent->interactionType,
  "quizRequired": defined(quiz)
`;

const reviewApproved = groq`clinicalReview->status == "approved"`;

export const allCoursesQuery = groq`
  *[_type == "lmsCourse" && isPublished == true && ${reviewApproved}] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    "excerpt": courseSummary,
    "description": courseSummary,
    "featuredImage": null,
    "bariatricStage": "pre-op",
    "difficultyLevel": "beginner",
    "estimatedDuration": string(count(sections[]->lessons[]->)) + " lessons",
    "accessType": select(accessType == "free" => "free", "provider-assigned"),
    "isFeatured": true,
    "moduleCount": count(sections),
    "lessonCount": count(sections[]->lessons[])
  }
`;

export const featuredCoursesQuery = allCoursesQuery;

export const courseBySlugQuery = groq`
  *[_type == "lmsCourse" && slug.current == $slug && isPublished == true && ${reviewApproved}][0] {
    _id,
    title,
    "slug": slug.current,
    "description": courseSummary,
    "excerpt": courseSummary,
    "featuredImage": null,
    "bariatricStage": "pre-op",
    "difficultyLevel": "beginner",
    "estimatedDuration": string(count(sections[]->lessons[]->)) + " lessons",
    "accessType": select(accessType == "free" => "free", "provider-assigned"),
    "isFeatured": true,
    "seoTitle": title,
    "seoDescription": courseSummary,
    versionNumber,
    certificate,
    "moduleCount": count(sections),
    "lessonCount": count(sections[]->lessons[]),
    "modules": sections[]-> | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      "lessons": lessons[]-> | order(order asc) {
        ${lessonRefFields}
      }
    },
    "relatedResources": []
  }
`;

export const lessonBySlugQuery = groq`
  *[_type == "lmsLesson" && slug.current == $slug][0] {
    ${lessonRefFields},
    description,
    sourceUrl,
    originalRequiredContentSnapshot,
    learningObjectives,
    contentSections[] {
      _key,
      heading,
      body
    },
    contentBlocks,
    "media": media[]-> {
      _id,
      title,
      sourceUrl,
      originalPath,
      localPath,
      contentType,
      altText,
      caption,
      "assetUrl": sanityAsset.asset->url
    },
    "interactiveComponent": interactiveComponent-> {
      _id,
      title,
      interactionType,
      description,
      supabaseEvent,
      required,
      config
    },
    "quiz": quiz-> {
      _id,
      title,
      passingScore,
      required,
      "questions": questions[]-> {
        _id,
        question,
        questionType,
        options,
        correctIndex,
        feedback
      }
    },
    "evidenceReferences": evidenceReferences[]-> {
      _id,
      label,
      url,
      use
    },
    "calloutBoxes": [],
    "keyTakeaways": learningObjectives,
    "downloads": [],
    "relatedLessons": [],
    "relatedResources": [],
    "nextStepCta": null
  }
`;

export const courseSlugsQuery = groq`
  *[_type == "lmsCourse" && isPublished == true && ${reviewApproved}] { "slug": slug.current }
`;

export const coursesForSlugsQuery = groq`
  *[_type == "lmsCourse" && isPublished == true && ${reviewApproved} && slug.current in $slugs] {
    _id,
    title,
    "slug": slug.current,
    "excerpt": courseSummary,
    "description": courseSummary,
    "featuredImage": null,
    "bariatricStage": "pre-op",
    "difficultyLevel": "beginner",
    "estimatedDuration": string(count(sections[]->lessons[]->)) + " lessons",
    "accessType": select(accessType == "free" => "free", "provider-assigned"),
    "isFeatured": true,
    versionNumber,
    certificate,
    "moduleCount": count(sections),
    "lessonCount": count(sections[]->lessons[]),
    "modules": sections[]-> | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      "lessons": lessons[]-> | order(order asc) {
        ${lessonRefFields}
      }
    },
    "relatedResources": []
  }
`;

export const allRecipesQuery = groq`
  *[_type == "recipe"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    bariatricStage,
    image,
    tags,
    proteinGrams,
    calories
  }
`;
