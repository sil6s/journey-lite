export const phoneNumber = "877-442-2263";
export const phoneHref = "tel:+18774422263";

export const navGroups = [
  {
    label: "Surgical Options",
    items: [
      {
        label: "Gastric Sleeve",
        href: "/services/gastric-sleeve",
        description: "JourneyLite's most performed bariatric procedure.",
      },
      {
        label: "Lap Band",
        href: "/services/lap-band-surgery",
        description: "An adjustable surgical weight loss tool for select patients.",
      },
      {
        label: "Gastric Bypass",
        href: "/services/gastric-bypass",
        description: "A long-established option for metabolic health goals.",
      },
      {
        label: "SADI Surgery",
        href: "/services/sadi-surgery",
        description: "An advanced metabolic bariatric surgery option.",
      },
      {
        label: "Gastric Band Revision",
        href: "/services/gastric-band-revision",
        description: "Revision support when prior band surgery is no longer working.",
      },
      {
        label: "Gastric Sleeve Revision",
        href: "/services/gastric-sleeve-revision",
        description: "Evaluation for patients needing a new plan after sleeve surgery.",
      },
      {
        label: "General Surgery",
        href: "/services/general-surgery",
        description: "Related surgical care from JourneyLite physicians.",
      },
      {
        label: "Appointment Request",
        href: "/contact",
        description: "Start with a personalized consultation request.",
      },
    ],
  },
  {
    label: "Non-Surgical Procedures",
    items: [
      {
        label: "Gastric Balloon",
        href: "/services/gastric-balloon",
        description: "A temporary, incisionless weight loss procedure.",
      },
      {
        label: "Spatz Adjustable Gastric Balloon",
        href: "/services/spatz-adjustable-gastric-balloon",
        description: "An adjustable balloon option for comparison.",
      },
      {
        label: "Gastric Balloon Instructions",
        href: "/services/gastric-balloon",
        description: "Learn what to expect with balloon treatment.",
      },
      {
        label: "Appointment Request",
        href: "/contact",
        description: "Request a consultation for fit and availability.",
      },
    ],
  },
  {
    label: "Medications",
    items: [
      {
        label: "Medication Weight Loss",
        href: "/medications",
        description: "Complete guide to physician-led medication-supported care.",
      },
      {
        label: "Injectable Options",
        href: "/medications#injectable-medications",
        description: "Weekly medication paths reviewed during consultation.",
      },
      {
        label: "Oral Options",
        href: "/medications#oral-medications",
        description: "Pill-based medication options with monitoring.",
      },
      {
        label: "Post-Op Weight Regain Support",
        href: "/medications#post-op-support",
        description: "Medication and follow-up support after prior surgery.",
      },
      {
        label: "Pricing & Financing",
        href: "/medications#pricing",
        description: "Medication cost, coverage, and prior authorization questions.",
      },
      {
        label: "Appointment Request",
        href: "/contact",
        description: "Start a medication-supported weight loss conversation.",
      },
    ],
  },
  {
    label: "About",
    items: [
      {
        label: "About JourneyLite",
        href: "/about",
        description: "Learn about the care team, surgery center, history, and quality recognitions.",
      },
      {
        label: "Our Team",
        href: "/about/our-team",
        description: "Meet physicians, dietitians, medical providers, and support staff.",
      },
      {
        label: "Physicians",
        href: "/about/physicians",
        description: "Meet the JourneyLite bariatric physicians and clinical leadership.",
      },
      {
        label: "Registered Dietitians",
        href: "/about/dietitians",
        description: "Meet the RD/LD team supporting bariatric and medical weight loss nutrition.",
      },
      {
        label: "Surgery Center",
        href: "/about/surgery-center",
        description: "Learn about the Cincinnati outpatient bariatric surgery center.",
      },
      {
        label: "History",
        href: "/about/history",
        description: "Review JourneyLite's bariatric excellence and innovation timeline.",
      },
      {
        label: "Locations",
        href: "/about/locations",
        description: "Find Cincinnati and regional office details.",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Pricing & Financing",
        href: "/services/pricing-financing",
        description: "Review program and cost considerations.",
      },
      {
        label: "Compare Options",
        href: "/services/compare-weight-loss-options",
        description: "Use the detailed comparison table as a reference.",
      },
      {
        label: "Bariatric Metrics",
        href: "/bariatric-metrics",
        description: "Understand BMI, %TWL, goal progress, and regain metrics.",
      },
      {
        label: "Education Portal",
        href: "/courses",
        description: "Browse bariatric learning courses and patient education lessons.",
      },
      {
        label: "JourneyLite Shop",
        href: "/shop",
        description: "Vitamins, pre-op diet kits, and bariatric products from your care team.",
      },
      {
        label: "Testimonials",
        href: "/#reviews",
        description: "Read Google review excerpts and trust signals.",
      },
      {
        label: "Blog",
        href: "/blog",
        description: "Read educational articles and JourneyLite updates.",
      },
    ],
  },
];

export const sortedNavGroups = [...navGroups]
  .sort((a, b) => a.label.localeCompare(b.label))
  .map((group) => ({
    ...group,
    items: [...group.items].sort((a, b) => a.label.localeCompare(b.label)),
  }));

export const siteSearchItems = [
  { label: "Home", href: "/", description: "JourneyLite weight loss surgery and medical weight loss overview." },
  { label: "Contact", href: "/contact", description: "Request an appointment or contact JourneyLite." },
  ...sortedNavGroups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      group: group.label,
    })),
  ),
];

export const statItems = [
  { value: "20+", label: "Years of Bariatric Experience" },
  { value: "8,000+", label: "Bariatric Procedures" },
  { value: "5", label: "Regional Locations" },
  { value: "MBSAQIP", label: "Accredited Bariatric Program" },
  { value: "AAAHC", label: "Accredited Surgery Center" },
  { value: "For Life", label: "Long-Term Support" },
];

export const surgicalOptions = [
  {
    id: "gastric-bypass",
    title: "Gastric Bypass",
    description:
      "A well-established bariatric procedure that can support significant weight loss and metabolic health goals.",
    bestFor: "May be a fit for patients with higher weight-loss goals, reflux concerns, or certain metabolic needs.",
    href: "/services/gastric-bypass",
    cta: "Learn about Gastric Bypass",
  },
  {
    id: "sadi-surgery",
    title: "SADI Surgery",
    description:
      "An advanced bariatric option that may be recommended for eligible patients who need more powerful metabolic support.",
    bestFor: "May be a fit for patients with higher BMI ranges or complex metabolic goals.",
    href: "/services/sadi-surgery",
    cta: "Explore SADI Surgery",
  },
  {
    id: "lap-band-surgery",
    title: "Lap Band Surgery",
    description:
      "An adjustable surgical option that places a band around the upper stomach to support portion control.",
    bestFor: "May be a fit for select patients who want an adjustable surgical tool and ongoing follow-up.",
    href: "/services/lap-band-surgery",
    cta: "Learn about Lap Band",
  },
  {
    id: "gastric-band-revision",
    title: "Gastric Band Revision",
    description:
      "Revision care for patients who had a prior lap band and need a new plan for comfort, safety, or weight loss.",
    bestFor: "May be a fit when a prior band is no longer meeting clinical or lifestyle goals.",
    href: "/services/gastric-band-revision",
    cta: "Review Band Revision",
  },
  {
    id: "gastric-sleeve-revision",
    title: "Gastric Sleeve Revision",
    description:
      "Evaluation and planning for patients who previously had gastric sleeve surgery and need renewed support.",
    bestFor: "May be a fit for weight regain, anatomy concerns, or changing medical needs after sleeve surgery.",
    href: "/services/gastric-sleeve-revision",
    cta: "Explore Sleeve Revision",
  },
  {
    id: "general-surgery",
    title: "General Surgery",
    description:
      "Related surgical care delivered by physicians with focused experience in abdominal and bariatric procedures.",
    bestFor: "May be a fit for patients who need coordinated surgical evaluation alongside weight loss care.",
    href: "/services/general-surgery",
    cta: "View General Surgery",
  },
];

export const nonSurgicalOptions = [
  {
    id: "gastric-balloon",
    title: "Gastric Balloon",
    description:
      "A non-surgical, temporary device placed in the stomach to help patients feel fuller, reduce portion sizes, and develop healthier eating habits with medical support.",
    bestFor: "May fit patients looking for a less invasive option with structured follow-up.",
    href: "/services/gastric-balloon",
    cta: "Explore Gastric Balloon",
    status: "Available",
  },
  {
    id: "spatz-adjustable-gastric-balloon",
    title: "Spatz Adjustable Gastric Balloon",
    description:
      "An adjustable gastric balloon option designed to support portion control and weight-loss progress during treatment.",
    bestFor: "May fit patients who want a balloon option that can be adjusted during the treatment period.",
    href: "/services/spatz-adjustable-gastric-balloon",
    cta: "Learn About Spatz",
    status: "Balloon comparison",
  },
  {
    id: "orbera-gastric-balloon",
    title: "Orbera Gastric Balloon",
    description:
      "A temporary gastric balloon designed to occupy space in the stomach and support reduced food intake.",
    bestFor: "Useful for comparison when reviewing gastric balloon options.",
    href: "/services/orbera-gastric-balloon",
    cta: "Compare Balloon Options",
    status: "Balloon comparison",
  },
  {
    id: "allurion-gastric-balloon",
    title: "Allurion Gastric Balloon",
    description: "A swallowable gastric balloon option used in some non-surgical weight-loss programs.",
    bestFor: "Included for educational comparison only unless this is currently offered.",
    href: "/services/allurion-gastric-balloon",
    cta: "Compare Options",
    status: "Educational comparison",
  },
];

export const oralMedicationOptions = [
  {
    id: "phentermine-adipex",
    title: "Phentermine / Adipex",
    description: "An oral appetite suppressant that may help jump-start weight loss for appropriate patients.",
    bestFor:
      "Not appropriate for everyone, especially certain blood pressure, heart, anxiety, or insomnia concerns.",
    href: "/services/phentermine-adipex",
    cta: "Learn About Oral Medications",
  },
  {
    id: "qsymia",
    title: "Qsymia",
    description:
      "An oral prescription medication option that may help eligible patients manage appetite and weight-loss progress.",
    bestFor: "May be considered when provider screening supports oral medication therapy and monitoring.",
    href: "/services/qsymia",
    cta: "Compare Oral Options",
  },
  {
    id: "contrave",
    title: "Contrave",
    description:
      "An oral medication option that may support craving and appetite management for eligible patients.",
    bestFor: "May fit patients whose medical history and current medications allow this treatment path.",
    href: "/services/contrave",
    cta: "Learn About Contrave",
  },
];

export const injectableMedicationOptions = [
  {
    id: "wegovy-semaglutide",
    title: "Wegovy / Semaglutide",
    description:
      "A weekly GLP-1 medication that may support appetite control, metabolic health, and steady weight-loss progress for eligible patients.",
    bestFor: "Requires medical screening, dose titration, and follow-up.",
    href: "/services/wegovy-semaglutide",
    cta: "Learn About Injectable Medications",
  },
  {
    id: "zepbound-tirzepatide",
    title: "Zepbound / Tirzepatide",
    description:
      "A weekly GIP/GLP-1 medication option that may support appetite regulation and metabolic weight-loss goals for eligible patients.",
    bestFor: "Coverage, cost, side effects, and eligibility vary.",
    href: "/services/zepbound-tirzepatide",
    cta: "Explore Zepbound Options",
  },
];

export const medicationSupportOptions = [
  {
    id: "post-op-weight-regain",
    title: "Post-op weight regain support",
    description:
      "Medication-supported care may help some patients address weight regain, plateaus, or long-term maintenance after prior weight-loss surgery.",
    bestFor: "May fit patients who need renewed structure after prior weight-loss surgery.",
    href: "/medications#post-op-support",
    cta: "Discuss Weight Regain Support",
  },
  {
    id: "pricing-financing",
    title: "Pricing and financing details",
    description:
      "Program cost, insurance coverage, medication access, and follow-up needs vary by patient and treatment plan.",
    bestFor: "Useful for patients comparing oral and injectable medication programs before consultation.",
    href: "/services/pricing-financing",
    cta: "Review Pricing & Financing",
  },
];

export const medicationComparisonRows = [
  {
    type: "Oral appetite support",
    dosing: "Usually daily, depending on medication and provider plan",
    bestFor: "Patients who prefer pills and pass screening for stimulant or non-stimulant options.",
    considerations: "Blood pressure, heart history, anxiety, insomnia, interactions, and pregnancy status matter.",
  },
  {
    type: "Weekly injectable medication",
    dosing: "Usually weekly with dose titration when appropriate",
    bestFor: "Eligible patients seeking appetite, craving, and metabolic weight-loss support.",
    considerations: "Coverage, cost, side effects, supply, contraindications, and follow-up needs vary.",
  },
  {
    type: "Post-op support",
    dosing: "Depends on medication choice and surgical history",
    bestFor: "Patients managing weight regain, plateaus, or long-term maintenance after surgery.",
    considerations: "Requires review of prior procedure, nutrition patterns, labs, and medication history.",
  },
];

export const comparisonRows = [
  {
    option: "Gastric Sleeve",
    type: "Surgical",
    useCase: "Durable weight loss for eligible patients seeking a long-term bariatric tool.",
    followUp: "Nutrition guidance, surgical follow-up, and long-term habit support.",
    bestFor: "Patients ready for a proven surgical path with ongoing accountability.",
    href: "/services/gastric-sleeve",
  },
  {
    option: "Gastric Bypass",
    type: "Surgical",
    useCase: "Significant weight loss goals or specific metabolic health considerations.",
    followUp: "More detailed vitamin, nutrition, and clinical follow-up.",
    bestFor: "Patients whose history or goals may call for a more established metabolic procedure.",
    href: "/services/gastric-bypass",
  },
  {
    option: "Gastric Balloon",
    type: "Non-surgical",
    useCase: "Temporary support to reduce portions and build healthier eating patterns.",
    followUp: "Placement, removal, nutrition coaching, and habit support.",
    bestFor: "Patients seeking a less invasive option and medical structure.",
    href: "/services/gastric-balloon",
  },
  {
    option: "Weight Loss Medications",
    type: "Medication-supported",
    useCase: "Appetite and craving support for eligible patients under supervision.",
    followUp: "Medication monitoring, progress reviews, and lifestyle support.",
    bestFor: "Patients interested in prescription-based non-surgical care.",
    href: "/medications",
  },
];

export const cincinnatiLocation = {
  title: "Cincinnati Main Office & JourneyLite Surgery Center",
  shortTitle: "Cincinnati Main Office & Surgery Center",
  city: "Cincinnati",
  state: "OH",
  address1: "10475 Reading Road",
  address2: "Cincinnati, OH 45241",
  description:
    "Our Cincinnati location serves as JourneyLite's main office and outpatient surgery center, supporting patients through consultations, surgical care, non-surgical weight loss options, and follow-up visits in one connected location.",
  overview:
    "This flagship Cincinnati location houses both the main office and JourneyLite Surgery Center, supporting consultations, bariatric surgery care, non-surgical weight loss, medical weight loss, and surgical center services where appropriate.",
  map: "https://www.google.com/maps?q=10475+Reading+Road+Cincinnati+OH+45241&output=embed",
  directions: "https://www.google.com/maps?q=10475+Reading+Road+Cincinnati+OH+45241",
  panels: [
    {
      title: "Cincinnati Office",
      voice: "(513) 559-1222",
      voiceHref: "tel:+15135591222",
      fax: "(513) 559-1235",
      hours: "Monday-Thursday 8:00am-4:30pm; Friday 8:00am-3:30pm",
    },
    {
      title: "JourneyLite Surgery Center",
      voice: "(513) 259-2488",
      voiceHref: "tel:+15132592488",
      fax: "(513) 259-2487",
      hours: "Monday-Friday 8:00am-4:30pm",
    },
  ],
};

export const locationGroups = [
  {
    state: "Ohio",
    locations: [
      {
        city: "Columbus",
        state: "OH",
        address1: "2041 Stringtown Rd",
        address2: "Grove City, OH 43123",
        phone: "(614) 526-4463",
        map: "https://www.google.com/maps?q=2041+Stringtown+Rd+Grove+City+OH+43123&output=embed",
        directions: "https://www.google.com/maps?q=2041+Stringtown+Rd+Grove+City+OH+43123",
      },
      {
        city: "Dayton",
        state: "OH",
        address1: "2621 Dryden Rd Suite 301",
        address2: "Moraine, OH 45439",
        phone: "(937) 280-5673",
        map: "https://www.google.com/maps?q=2621+Dryden+Rd+Suite+301+Moraine+OH+45439&output=embed",
        directions: "https://www.google.com/maps?q=2621+Dryden+Rd+Suite+301+Moraine+OH+45439",
      },
    ],
  },
  {
    state: "Indiana",
    locations: [
      {
        city: "Indianapolis",
        state: "IN",
        address1: "33 E. County Line Road, Suite E",
        address2: "Greenwood, IN",
        phone: "(463) 237-5999",
        map: "https://www.google.com/maps?q=33+E+County+Line+Road+Suite+E+Greenwood+IN&output=embed",
        directions: "https://www.google.com/maps?q=33+E+County+Line+Road+Suite+E+Greenwood+IN",
      },
    ],
  },
  {
    state: "Kentucky",
    locations: [
      {
        city: "Northern Kentucky",
        state: "KY",
        address1: "320 Thomas More Parkway",
        address2: "Crestview Hills, KY",
        phone: "(859) 331-1035",
        map: "https://www.google.com/maps?q=320+Thomas+More+Parkway+Crestview+Hills+KY&output=embed",
        directions: "https://www.google.com/maps?q=320+Thomas+More+Parkway+Crestview+Hills+KY",
      },
    ],
  },
];

export const physicianCards = [
  {
    displayName: "Dr. Trace Curry",
    name: "Trace W. Curry, MD, FASMBS",
    slug: "dr-trace-curry",
    initials: "TC",
    imageSrc: "/trace-curry.jpg",
    avatarAlt: "Dr. Trace Curry, Medical Director and Bariatric Surgeon at JourneyLite",
    primaryTitle: "Medical Director / Bariatric Surgeon",
    email: "dr.c@curryweightloss.com",
    bio:
      "Dr. Trace Curry is a board-certified general surgeon who specializes in minimally invasive weight loss surgery, non-surgical weight loss procedures, and medical weight loss. He is a Cincinnati native and trained at Good Samaritan Hospital. He is the founder of JourneyLite Physicians and JourneyLite Surgery Center and has performed thousands of advanced laparoscopic weight loss surgeries over his 20-year career.",
    credibility:
      "Dr. Curry was the first surgeon in Ohio to perform both Orbera and ReShape gastric balloons, Realize Band, and AP Lap Band, and he continues to be a national leader in new, non-surgical treatments of obesity.",
    roles: [
      "Medical Director, Bariatric Surgery",
      "Founder of JourneyLite Physicians",
      "Founder of JourneyLite Surgery Center",
    ],
    education: [
      "Vanderbilt University School of Medicine, Medical School",
      "TriHealth / Good Samaritan Hospital, Surgery Residency, 1993-1998",
    ],
    certificationLicensure: ["Board-certified general surgeon"],
    clinicalFocus: [
      "Gastric Sleeve",
      "Gastric Bypass",
      "Gastric Balloon",
      "Revisional Surgery",
      "Non-Surgical Weight Loss",
      "Medical Weight Loss",
    ],
    cta: "Meet Dr. Curry",
  },
  {
    displayName: "Dr. James Augusta",
    name: "James Augusta, DO, FACOS",
    slug: "dr-james-augusta",
    initials: "JA",
    imageSrc: "/james-augusta.jpg",
    avatarAlt: "Dr. James Augusta, Bariatric and Minimally Invasive Surgeon at JourneyLite",
    primaryTitle: "Bariatric / Minimally Invasive Surgeon",
    email: "dr.augusta@curryweightloss.com",
    bio:
      "Dr. James Augusta is a board-certified general surgeon focused on gastric sleeve, gastric bypass, revisional weight loss surgery, and general surgery. He grew up in Utah and moved to the Midwest to attend the Kentucky College of Osteopathic Medicine. He completed general surgery residency at Grandview Hospital in Dayton, where he served as Chief Surgical Resident.",
    credibility:
      "During residency, Dr. Augusta completed a six-week mini-fellowship with Dr. Curry and later joined Kettering Bariatrics as an attending surgeon for three years before continuing his focus on bariatric care at JourneyLite.",
    insuranceNote:
      "Dr. Augusta is in-network with many insurance plans and also accepts Medicare, Medicaid, and CareSource where applicable.",
    roles: ["Bariatric surgery", "General surgery", "Minimally invasive bariatric care"],
    education: [
      "University of Pikeville Kentucky College of Osteopathic Medicine, Medical School, 2012",
      "Grandview Hospital and Medical Center, General Surgery Residency, 2017",
      "Former Chief Surgical Resident",
    ],
    certificationLicensure: ["American Osteopathic Board of Surgery, Surgery / General Surgery"],
    memberships: [
      "American Society of Metabolic and Bariatric Surgery",
      "American College of Surgeons",
      "American College of Osteopathic Surgeons",
      "American Osteopathic Association",
    ],
    clinicalFocus: [
      "Gastric Sleeve",
      "Gastric Bypass",
      "Revisional Bariatric Surgery",
      "General Surgery",
      "Minimally Invasive Surgery",
    ],
    cta: "Meet Dr. Augusta",
  },
];

export const reviewBadge = {
  title: "JourneyLite Physicians",
  rating: "5.0",
  reviews: "481 Google reviews",
  category: "Weight loss service",
  href: "https://maps.app.goo.gl/EqdLJBUr5VPQsJ8P9",
};

export const reviewCards = [
  {
    name: "Ted",
    excerpt:
      "Every step was explained clearly, every question was answered with patience, and the preparation process gave me confidence going into surgery.",
  },
  {
    name: "Chad",
    excerpt:
      "One of the best decisions I've ever made. The guidance through the process made both pre-op and post-op easier.",
  },
  {
    name: "Tina",
    excerpt:
      "From the first phone call to my post-operative period, the staff were quick to respond and Dr. Augusta was easy to talk to.",
  },
  {
    name: "Alexa",
    excerpt:
      "Dr. Augusta and the whole team at JourneyLite were amazing. This was my first surgery, and it was a great experience.",
  },
  {
    name: "Danese",
    excerpt:
      "I never felt judged or looked down upon. I was treated with encouragement and positivity, and the follow-up care was top notch.",
  },
];

export const faqItems = [
  {
    question: "Is gastric balloon surgery?",
    answer:
      "No. A gastric balloon is a non-surgical weight loss option. It is placed endoscopically and later removed, with medical follow-up to support eating habits and progress.",
  },
  {
    question: "How do I know whether balloon, sleeve, bypass, or medications fit me?",
    answer:
      "A consultation is needed to review BMI, health history, prior weight loss attempts, goals, and comfort level with each care path.",
  },
  {
    question: "Do outcomes vary?",
    answer:
      "Yes. Weight loss outcomes vary by procedure, medical history, follow-up adherence, nutrition habits, activity, and other individual factors.",
  },
  {
    question: "Does JourneyLite serve patients outside Ohio?",
    answer:
      "Yes. JourneyLite serves patients across Ohio, Kentucky, and Indiana through multiple regional locations.",
  },
];
