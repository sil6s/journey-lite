export type ServiceCategory = "Surgical Weight Loss" | "Non-Surgical Weight Loss" | "Prescription Weight Loss Medication" | "Pricing and Comparison";

export type ServiceDiagramType =
  | "stomach-reduction"
  | "bypass-pathway"
  | "sadi-pathway"
  | "band-placement"
  | "revision-pathway"
  | "care-pathway"
  | "balloon-placement"
  | "balloon-timeline"
  | "adjustable-balloon"
  | "swallowable-balloon"
  | "endoscopic-sleeve"
  | "device-education"
  | "medication-pathway"
  | "dose-timeline"
  | "daily-monitoring"
  | "appetite-monitoring"
  | "craving-pathway"
  | "glp1-signaling"
  | "gip-glp1-signaling"
  | "regain-support"
  | "pricing-factors"
  | "option-comparison";

export type SupportingVisual = {
  title: string;
  description: string;
};

export type ServicePageData = {
  title: string;
  slug: string;
  category: ServiceCategory;
  primaryKeyword: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroSummary: string;
  image: string;
  imageAlt: string;
  diagramTitle: string;
  diagramDescription: string;
  diagramType: ServiceDiagramType;
  diagramImage: string;
  diagramAlt: string;
  diagramCaption: string;
  diagramAccessibleSummary: string;
  productImage: string;
  productImageAlt: string;
  productImageCaption: string;
  productImagePlacement: "hero" | "body";
  supportingVisuals: SupportingVisual[];
  visualDisclaimer: string;
  status?: string;
  quickFacts: {
    label: string;
    value: string;
  }[];
  whatIs: string[];
  candidateFit: string[];
  notCandidateFit: string[];
  benefits: string[];
  considerations: string[];
  pricingNotes: string[];
  processSteps: string[];
  comparisonRows: {
    option: string;
    type: string;
    bestFor: string;
    considerations: string;
    href: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  relatedServices: string[];
  physicianFocus: string;
  locationCopy: string;
  citations: {
    label: string;
    href: string;
  }[];
};

const sourceLinks = {
  cdcObesity: {
    label: "CDC adult obesity facts",
    href: "https://www.cdc.gov/obesity/adult-obesity-facts/index.html",
  },
  asmbsSurgery: {
    label: "ASMBS metabolic and bariatric surgery overview",
    href: "https://asmbs.org/resources/metabolic-and-bariatric-surgery/",
  },
  asmbsGuidelines: {
    label: "ASMBS/IFSO 2022 bariatric surgery indications",
    href: "https://asmbs.org/resources/2022-asmbs-and-ifso-indications-for-metabolic-and-bariatric-surgery",
  },
  fdaDevices: {
    label: "FDA weight-loss and weight-management devices",
    href: "https://www.fda.gov/medical-devices/products-and-medical-procedures/weight-loss-and-weight-management-devices",
  },
  fdaWegovy: {
    label: "FDA Wegovy prescribing information",
    href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/215256s015lbl.pdf",
  },
  fdaZepbound: {
    label: "FDA Zepbound approval announcement",
    href: "https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management",
  },
};

const proofStats = [
  { label: "6,000+", value: "gastric sleeves" },
  { label: "10,000+", value: "procedures" },
  { label: "20+", value: "years experience" },
  { label: "5", value: "regional locations" },
];

type Seed = {
  title: string;
  slug: string;
  category: ServiceCategory;
  keyword: string;
  summary: string;
  type: string;
  useCase: string;
  followUp: string;
  recovery: string;
  coverage: string;
  bestFit: string;
  image?: string;
  imageAlt?: string;
  active?: boolean;
  status?: string;
  metaTitle?: string;
  related: string[];
  compare: string[];
  physicianFocus?: string;
};

const surgicalSeeds: Seed[] = [
  {
    title: "Gastric Sleeve",
    slug: "gastric-sleeve",
    category: "Surgical Weight Loss",
    keyword: "gastric sleeve surgery Ohio",
    summary:
      "Gastric sleeve surgery is a bariatric procedure that reduces stomach size to support durable weight loss, smaller portions, and metabolic improvement for eligible patients.",
    type: "Bariatric surgery",
    useCase: "Durable surgical weight loss support for patients who qualify based on BMI, health history, and goals.",
    followUp: "Surgical follow-up, nutrition guidance, protein and hydration planning, and long-term monitoring.",
    recovery: "Recovery varies, but patients should plan for procedure preparation, early diet stages, and follow-up visits.",
    coverage: "Insurance may depend on BMI, documented medical need, plan rules, supervised diet requirements, and authorization.",
    bestFit: "Often considered by patients seeking a proven surgical tool with structured follow-up.",
    image: "/hero-image.jpg",
    imageAlt: "JourneyLite gastric sleeve surgery Ohio consultation",
    related: ["gastric-bypass", "sadi-surgery", "gastric-sleeve-revision", "compare-weight-loss-options"],
    compare: ["Gastric Bypass", "Prescription Weight Loss Medications", "Gastric Balloon"],
  },
  {
    title: "Gastric Bypass",
    slug: "gastric-bypass",
    category: "Surgical Weight Loss",
    keyword: "gastric bypass surgery Ohio",
    summary:
      "Gastric bypass is a long-established bariatric procedure that can support significant weight loss and metabolic health goals for eligible patients.",
    type: "Bariatric surgery",
    useCase: "Patients with higher weight-loss goals, reflux concerns, or specific metabolic needs may discuss bypass.",
    followUp: "Requires detailed vitamin, nutrition, surgical, and long-term follow-up planning.",
    recovery: "Recovery includes surgical preparation, staged diet progression, and ongoing nutrition monitoring.",
    coverage: "Coverage varies by plan and may require documentation, medical criteria, and prior authorization.",
    bestFit: "May fit patients who need a more established metabolic procedure and are ready for long-term follow-up.",
    image: "/hero-image.jpg",
    imageAlt: "JourneyLite gastric bypass surgery Ohio consultation",
    related: ["gastric-sleeve", "sadi-surgery", "gastric-sleeve-revision", "pricing-financing"],
    compare: ["Gastric Sleeve", "SADI Surgery", "Prescription Weight Loss Medications"],
  },
  {
    title: "SADI Surgery",
    slug: "sadi-surgery",
    category: "Surgical Weight Loss",
    keyword: "SADI surgery Ohio",
    summary:
      "SADI surgery is an advanced metabolic bariatric surgery option that may be considered for select patients who need more powerful weight-loss support.",
    type: "Advanced bariatric surgery",
    useCase: "May be discussed for patients with higher BMI ranges or more complex metabolic goals.",
    followUp: "Requires careful nutrition monitoring, vitamin planning, labs, and long-term bariatric follow-up.",
    recovery: "Recovery and adjustment are procedure-specific and reviewed carefully during consultation.",
    coverage: "Insurance coverage and authorization requirements vary by plan and clinical documentation.",
    bestFit: "May fit patients who understand the follow-up commitment of a more complex metabolic procedure.",
    related: ["gastric-sleeve", "gastric-bypass", "pricing-financing", "compare-weight-loss-options"],
    compare: ["Gastric Sleeve", "Gastric Bypass", "Medication-supported care"],
  },
  {
    title: "Lap Band Surgery",
    slug: "lap-band-surgery",
    category: "Surgical Weight Loss",
    keyword: "lap band surgery Ohio",
    summary:
      "Lap band surgery uses an adjustable band around the upper stomach to support portion control for select patients who understand the follow-up needs.",
    type: "Adjustable bariatric surgery",
    useCase: "Select patients interested in an adjustable surgical tool may discuss whether lap band fits current goals.",
    followUp: "Band adjustments, nutrition follow-up, symptom monitoring, and long-term accountability are important.",
    recovery: "Recovery varies and ongoing adjustments may be part of the treatment plan.",
    coverage: "Insurance and self-pay considerations depend on clinical criteria and plan requirements.",
    bestFit: "May fit select patients who prefer an adjustable option and accept long-term band follow-up.",
    related: ["gastric-band-revision", "gastric-sleeve", "gastric-bypass", "compare-weight-loss-options"],
    compare: ["Gastric Sleeve", "Gastric Band Revision", "Gastric Balloon"],
  },
  {
    title: "Gastric Band Revision",
    slug: "gastric-band-revision",
    category: "Surgical Weight Loss",
    keyword: "gastric band revision surgery",
    summary:
      "Gastric band revision evaluates patients with prior lap band surgery who may need removal, conversion, or a new weight-loss plan.",
    type: "Revisional bariatric surgery",
    useCase: "Prior band patients with weight regain, symptoms, intolerance, slippage concerns, or changing goals.",
    followUp: "Requires review of prior records, anatomy, symptoms, nutrition, and possible conversion options.",
    recovery: "Recovery depends on whether care involves removal only or conversion to another procedure.",
    coverage: "Coverage may depend on symptoms, medical necessity, prior operative history, and plan rules.",
    bestFit: "May fit patients whose band is no longer supporting comfort, safety, or weight-loss goals.",
    related: ["lap-band-surgery", "gastric-sleeve-revision", "gastric-sleeve", "pricing-financing"],
    compare: ["Lap Band Surgery", "Gastric Sleeve Revision", "Gastric Sleeve"],
  },
  {
    title: "Gastric Sleeve Revision",
    slug: "gastric-sleeve-revision",
    category: "Surgical Weight Loss",
    keyword: "gastric sleeve revision surgery",
    summary:
      "Gastric sleeve revision helps patients who previously had sleeve surgery evaluate weight regain, reflux, anatomy concerns, or changing medical needs.",
    type: "Revisional bariatric surgery",
    useCase: "Patients with prior sleeve surgery who need renewed structure, anatomy review, or additional treatment planning.",
    followUp: "Requires detailed history, imaging or endoscopy when appropriate, nutrition review, and surgical discussion.",
    recovery: "Recovery depends on the selected revision approach and the patient’s medical history.",
    coverage: "Insurance may require medical necessity, documentation, and prior authorization.",
    bestFit: "May fit patients needing evaluation after prior sleeve surgery rather than a first-time procedure.",
    related: ["gastric-sleeve", "gastric-bypass", "post-op-weight-regain-support", "pricing-financing"],
    compare: ["Gastric Sleeve", "Gastric Bypass", "Post-op Weight Regain Support"],
  },
  {
    title: "General Surgery",
    slug: "general-surgery",
    category: "Surgical Weight Loss",
    keyword: "general surgery Cincinnati Ohio",
    summary:
      "JourneyLite physicians provide select outpatient general surgery services in Cincinnati for patients who need coordinated surgical evaluation.",
    type: "General surgery",
    useCase: "Select outpatient needs such as gallbladder, hernia, upper endoscopy, or related surgical evaluation when appropriate.",
    followUp: "Follow-up depends on the procedure, medical history, and surgical plan.",
    recovery: "Recovery varies by procedure and is reviewed by the surgeon before scheduling.",
    coverage: "Insurance depends on diagnosis, procedure type, facility, authorization, and plan rules.",
    bestFit: "May fit patients who need focused surgical care from a team experienced with abdominal procedures.",
    related: ["pricing-financing", "contact", "gastric-sleeve", "gastric-bypass"],
    compare: ["Gastric Sleeve", "Gastric Bypass", "Pricing & Financing"],
  },
];

const nonSurgicalSeeds: Seed[] = [
  {
    title: "Gastric Balloon",
    slug: "gastric-balloon",
    category: "Non-Surgical Weight Loss",
    keyword: "gastric balloon Ohio",
    summary:
      "Gastric balloon treatment is a non-surgical option designed to help eligible patients feel fuller, reduce portions, and build healthier habits with medical support.",
    type: "Non-surgical endoscopic procedure",
    useCase: "Less invasive weight-loss support for eligible patients who want a temporary device and structured follow-up.",
    followUp: "Placement, nutrition guidance, adjustment support, removal, and a long-term habit plan.",
    recovery: "Adjustment symptoms and timeline vary; your provider reviews preparation and follow-up.",
    coverage: "Coverage and self-pay pricing vary; many balloon programs require detailed pricing review.",
    bestFit: "May fit patients seeking a temporary non-surgical procedure rather than bariatric surgery.",
    image: "/journey-lite-main-office.jpg",
    imageAlt: "JourneyLite gastric balloon Ohio non-surgical weight loss",
    active: true,
    related: ["spatz-adjustable-gastric-balloon", "orbera-gastric-balloon", "gastric-balloon-pricing", "gastric-sleeve"],
    compare: ["Gastric Sleeve", "Orbera Gastric Balloon", "Prescription Weight Loss Medications"],
  },
  {
    title: "Spatz Adjustable Gastric Balloon",
    slug: "spatz-adjustable-gastric-balloon",
    category: "Non-Surgical Weight Loss",
    keyword: "Spatz adjustable gastric balloon",
    summary:
      "The Spatz adjustable gastric balloon is a balloon option designed for portion-control support with adjustability during treatment.",
    type: "Gastric balloon option",
    useCase: "Patients comparing gastric balloon choices may want to understand how adjustability changes the treatment conversation.",
    followUp: "Follow-up depends on the balloon program, provider evaluation, adjustment plan, and removal timeline.",
    recovery: "Adjustment tolerance varies; provider guidance is needed for symptoms, diet stages, and follow-up.",
    coverage: "Pricing and availability should be confirmed with JourneyLite before choosing a program.",
    bestFit: "May fit patients comparing balloon options and wanting medical guidance on availability.",
    status: "Balloon comparison",
    related: ["gastric-balloon", "orbera-gastric-balloon", "gastric-balloon-pricing", "compare-weight-loss-options"],
    compare: ["Gastric Balloon", "Orbera Gastric Balloon", "Allurion Gastric Balloon"],
  },
  {
    title: "Orbera Gastric Balloon",
    slug: "orbera-gastric-balloon",
    category: "Non-Surgical Weight Loss",
    keyword: "Orbera gastric balloon",
    summary:
      "The Orbera gastric balloon is a temporary intragastric balloon used with supervised diet and behavior modification in appropriate patients.",
    type: "Gastric balloon option",
    useCase: "Patients researching balloon systems may compare Orbera with other non-surgical options.",
    followUp: "Requires placement, structured support, removal, and ongoing nutrition behavior planning.",
    recovery: "Early adjustment can vary and should be reviewed with a provider.",
    coverage: "Coverage, self-pay cost, and availability vary by program and patient factors.",
    bestFit: "May fit patients looking for a temporary balloon approach with structured follow-up.",
    status: "Balloon comparison",
    related: ["gastric-balloon", "spatz-adjustable-gastric-balloon", "gastric-balloon-pricing", "compare-weight-loss-options"],
    compare: ["Gastric Balloon", "Spatz Adjustable Gastric Balloon", "Gastric Sleeve"],
  },
  {
    title: "Allurion Gastric Balloon",
    slug: "allurion-gastric-balloon",
    category: "Non-Surgical Weight Loss",
    keyword: "Allurion gastric balloon",
    summary:
      "Allurion gastric balloon information is included for education and comparison when patients are reviewing balloon-style weight-loss options.",
    type: "Educational comparison",
    useCase: "Patients comparing swallowable or temporary balloon approaches can use this page for context.",
    followUp: "Follow-up depends on whether a program is available and clinically appropriate.",
    recovery: "Adjustment and eligibility vary by device and patient history.",
    coverage: "Availability and cost should be confirmed before assuming this option is offered.",
    bestFit: "Educational comparison only unless JourneyLite confirms current availability.",
    status: "Educational comparison",
    related: ["gastric-balloon", "orbera-gastric-balloon", "spatz-adjustable-gastric-balloon", "compare-weight-loss-options"],
    compare: ["Gastric Balloon", "Orbera Gastric Balloon", "Prescription Medications"],
  },
  {
    title: "Endoscopic Sleeve Gastroplasty",
    slug: "endoscopic-sleeve-gastroplasty",
    category: "Non-Surgical Weight Loss",
    keyword: "endoscopic sleeve gastroplasty Ohio",
    summary:
      "Endoscopic sleeve gastroplasty is included as an educational comparison topic for patients researching incisionless weight-loss procedures.",
    type: "Educational comparison",
    useCase: "Patients who want to compare incisionless procedures with gastric balloon, sleeve surgery, and medications.",
    followUp: "Follow-up depends on program availability, nutrition planning, and provider evaluation.",
    recovery: "Adjustment and recovery vary by endoscopic approach and patient factors.",
    coverage: "Coverage and availability vary; do not assume this procedure is currently offered.",
    bestFit: "Educational comparison only unless current program availability is confirmed.",
    status: "Educational comparison",
    related: ["gastric-balloon", "gastric-sleeve", "compare-weight-loss-options", "pricing-financing"],
    compare: ["Gastric Balloon", "Gastric Sleeve", "Prescription Medications"],
  },
  {
    title: "AspireAssist",
    slug: "aspireassist",
    category: "Non-Surgical Weight Loss",
    keyword: "AspireAssist weight loss",
    summary:
      "AspireAssist information is included for education and comparison for patients researching historical non-surgical weight-loss devices.",
    type: "Educational comparison",
    useCase: "Patients comparing device-based weight-loss options can use this page to understand how it differs from active programs.",
    followUp: "Follow-up requirements depend on device availability, provider evaluation, and patient needs.",
    recovery: "Risks, adjustment, and maintenance vary by device and patient history.",
    coverage: "Availability should be confirmed; this page should not be read as an active treatment offer.",
    bestFit: "Educational comparison only unless JourneyLite confirms current program availability.",
    status: "Educational comparison",
    related: ["gastric-balloon", "endoscopic-sleeve-gastroplasty", "compare-weight-loss-options", "pricing-financing"],
    compare: ["Gastric Balloon", "Endoscopic Sleeve Gastroplasty", "Prescription Medications"],
  },
];

const medicationSeeds: Seed[] = [
  {
    title: "Prescription Weight Loss Medications",
    slug: "prescription-weight-loss-medications",
    category: "Prescription Weight Loss Medication",
    keyword: "prescription weight loss medication Ohio",
    summary:
      "Prescription weight loss medications may help eligible patients manage appetite, cravings, and long-term progress with medical supervision.",
    type: "Medication-supported medical weight loss",
    useCase: "Patients interested in oral or injectable medication support with screening and follow-up.",
    followUp: "Medication review, dose planning, side effect monitoring, progress visits, and nutrition support.",
    recovery: "No surgical recovery, but medication adjustment and side-effect tolerance vary.",
    coverage: "Cost varies by medication choice, coverage, prior authorization, dose, supply, and pharmacy access.",
    bestFit: "May fit eligible patients seeking medical appetite or craving support rather than a procedure.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Prescription weight loss medication Ohio program",
    related: ["injectable-weight-loss-medications", "oral-weight-loss-medications", "medication-pricing", "post-op-weight-regain-support"],
    compare: ["Injectable Medications", "Oral Medications", "Gastric Sleeve"],
  },
  {
    title: "Injectable Weight Loss Medications",
    slug: "injectable-weight-loss-medications",
    category: "Prescription Weight Loss Medication",
    keyword: "injectable weight loss medication Ohio",
    summary:
      "Injectable weight loss medications may support appetite regulation and metabolic weight-loss goals for eligible patients with structured follow-up.",
    type: "Weekly injectable medication program",
    useCase: "Patients interested in GLP-1 or GIP/GLP-1 medication options after medical screening.",
    followUp: "Dose titration, side-effect monitoring, coverage review, progress tracking, and long-term planning.",
    recovery: "No procedure recovery, but dose adjustment and medication tolerance need monitoring.",
    coverage: "Coverage, copays, prior authorization, and supply vary substantially.",
    bestFit: "May fit eligible patients who prefer prescription-based care and ongoing monitoring.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Injectable weight loss medication Ohio consultation",
    related: ["wegovy-semaglutide", "zepbound-tirzepatide", "medication-pricing", "oral-weight-loss-medications"],
    compare: ["Wegovy / Semaglutide", "Zepbound / Tirzepatide", "Oral Medications"],
  },
  {
    title: "Oral Weight Loss Medications",
    slug: "oral-weight-loss-medications",
    category: "Prescription Weight Loss Medication",
    keyword: "oral weight loss medication",
    summary:
      "Oral weight loss medications may help appropriate patients manage appetite, cravings, or momentum with provider screening and monitoring.",
    type: "Oral medication program",
    useCase: "Patients who prefer pills and meet screening criteria for oral medication therapy.",
    followUp: "Vitals, side effects, medication interactions, refill planning, and progress reviews.",
    recovery: "No procedure recovery; monitoring focuses on tolerance and safety.",
    coverage: "Cost and coverage depend on medication, plan rules, contraindications, and pharmacy access.",
    bestFit: "May fit selected patients whose medical history supports oral medication use.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Oral weight loss medication consultation",
    related: ["phentermine-adipex", "qsymia", "contrave", "medication-pricing"],
    compare: ["Phentermine / Adipex", "Qsymia", "Contrave"],
  },
  {
    title: "Phentermine / Adipex",
    slug: "phentermine-adipex",
    category: "Prescription Weight Loss Medication",
    keyword: "phentermine weight loss Ohio",
    summary:
      "Phentermine, also known by Adipex, is an oral appetite suppressant that may help jump-start weight loss for appropriate patients.",
    type: "Oral appetite suppressant",
    useCase: "Short-term appetite support for selected patients after blood pressure, heart, anxiety, sleep, and medication review.",
    followUp: "Monitoring includes vitals, side effects, progress, refill appropriateness, and medication interactions.",
    recovery: "No procedure recovery, but tolerance and safety must be monitored.",
    coverage: "Cost and availability vary; not every patient is a candidate.",
    bestFit: "May fit selected patients without contraindications to stimulant-style appetite support.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Phentermine weight loss Ohio medication consultation",
    related: ["oral-weight-loss-medications", "qsymia", "contrave", "medication-pricing"],
    compare: ["Qsymia", "Contrave", "Injectable Medications"],
  },
  {
    title: "Qsymia",
    slug: "qsymia",
    category: "Prescription Weight Loss Medication",
    keyword: "Qsymia weight loss medication",
    summary:
      "Qsymia is an oral prescription medication option that may help eligible patients manage appetite and weight-loss progress.",
    type: "Oral prescription medication",
    useCase: "Patients who pass provider screening for oral medication therapy and monitoring.",
    followUp: "Follow-up includes tolerance, pregnancy precautions when relevant, side effects, vitals, and progress.",
    recovery: "No procedure recovery; medication safety and adherence are the focus.",
    coverage: "Coverage and pricing vary by plan, pharmacy, and patient eligibility.",
    bestFit: "May fit patients whose medical history and current medications allow this treatment path.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Qsymia weight loss medication consultation",
    related: ["oral-weight-loss-medications", "phentermine-adipex", "contrave", "medication-pricing"],
    compare: ["Phentermine / Adipex", "Contrave", "Injectable Medications"],
  },
  {
    title: "Contrave",
    slug: "contrave",
    category: "Prescription Weight Loss Medication",
    keyword: "Contrave weight loss medication",
    summary:
      "Contrave is an oral medication option that may support craving and appetite management for eligible patients.",
    type: "Oral prescription medication",
    useCase: "Patients whose medication history, mental health context, blood pressure, and current prescriptions allow consideration.",
    followUp: "Monitoring includes medication interactions, side effects, progress, and whether the medication remains appropriate.",
    recovery: "No procedure recovery; provider follow-up focuses on tolerance and response.",
    coverage: "Cost and coverage vary by pharmacy, insurance, and treatment plan.",
    bestFit: "May fit eligible patients who want non-injectable prescription support.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Contrave weight loss medication consultation",
    related: ["oral-weight-loss-medications", "qsymia", "phentermine-adipex", "medication-pricing"],
    compare: ["Qsymia", "Phentermine / Adipex", "Injectable Medications"],
  },
  {
    title: "Wegovy / Semaglutide",
    slug: "wegovy-semaglutide",
    category: "Prescription Weight Loss Medication",
    keyword: "Wegovy weight loss Ohio",
    summary:
      "Wegovy, the brand name for semaglutide used for chronic weight management, is a weekly GLP-1 medication for eligible patients.",
    type: "Weekly GLP-1 injectable medication",
    useCase: "Eligible patients seeking appetite support, dose titration, and long-term medical monitoring.",
    followUp: "Follow-up includes dose titration, GI side effects, contraindication screening, coverage, and progress review.",
    recovery: "No procedure recovery, but medication adjustment and adherence matter.",
    coverage: "Coverage, prior authorization, availability, and dose access vary.",
    bestFit: "May fit eligible patients after provider evaluation and medication screening.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Wegovy weight loss Ohio semaglutide consultation",
    related: ["injectable-weight-loss-medications", "zepbound-tirzepatide", "medication-pricing", "prescription-weight-loss-medications"],
    compare: ["Zepbound / Tirzepatide", "Oral Medications", "Gastric Sleeve"],
  },
  {
    title: "Zepbound / Tirzepatide",
    slug: "zepbound-tirzepatide",
    category: "Prescription Weight Loss Medication",
    keyword: "Zepbound weight loss Ohio",
    summary:
      "Zepbound, the brand name for tirzepatide used for chronic weight management, is a weekly GIP/GLP-1 medication for eligible patients.",
    type: "Weekly GIP/GLP-1 injectable medication",
    useCase: "Eligible patients seeking appetite regulation and metabolic weight-loss support with structured follow-up.",
    followUp: "Follow-up includes dose titration, side-effect review, contraindication screening, coverage, and progress checks.",
    recovery: "No procedure recovery, but tolerance, adherence, and monitoring matter.",
    coverage: "Coverage, cost, prior authorization, and pharmacy availability vary by patient.",
    bestFit: "May fit eligible patients after provider evaluation and medication screening.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Zepbound weight loss Ohio tirzepatide consultation",
    related: ["injectable-weight-loss-medications", "wegovy-semaglutide", "medication-pricing", "prescription-weight-loss-medications"],
    compare: ["Wegovy / Semaglutide", "Oral Medications", "Gastric Sleeve"],
  },
  {
    title: "Post-op Weight Regain Support",
    slug: "post-op-weight-regain-support",
    category: "Prescription Weight Loss Medication",
    keyword: "weight regain after bariatric surgery",
    summary:
      "Post-op weight regain support helps patients with prior bariatric surgery evaluate renewed structure, medication support, nutrition, and follow-up.",
    type: "Long-term bariatric support",
    useCase: "Patients with weight regain, plateaus, maintenance concerns, or changing health needs after surgery.",
    followUp: "May include surgical history review, nutrition assessment, labs, medication discussion, and progress monitoring.",
    recovery: "No single recovery timeline; next steps depend on prior procedure and current plan.",
    coverage: "Coverage depends on evaluation, diagnosis, medication choice, and insurance rules.",
    bestFit: "May fit patients who need renewed support after prior weight-loss surgery.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Weight regain after bariatric surgery support",
    related: ["gastric-sleeve-revision", "gastric-band-revision", "prescription-weight-loss-medications", "medication-pricing"],
    compare: ["Medication Support", "Gastric Sleeve Revision", "Gastric Band Revision"],
  },
  {
    title: "Medication Pricing",
    slug: "medication-pricing",
    category: "Pricing and Comparison",
    keyword: "weight loss medication pricing",
    summary:
      "Weight loss medication pricing varies by medication, dose, insurance, prior authorization, pharmacy access, and follow-up plan.",
    type: "Pricing guide",
    useCase: "Patients comparing oral and injectable medication programs before consultation.",
    followUp: "Pricing discussions should include visit cadence, dose changes, refills, coverage, and medication access.",
    recovery: "Not applicable; this page helps plan cost and program expectations.",
    coverage: "Coverage can vary substantially by plan and medication.",
    bestFit: "Useful for patients who want to understand cost factors before starting medication-supported care.",
    image: "/weight-loss-med-featured.jpg",
    imageAlt: "Weight loss medication pricing discussion",
    related: ["prescription-weight-loss-medications", "injectable-weight-loss-medications", "oral-weight-loss-medications", "pricing-financing"],
    compare: ["Oral Medications", "Injectable Medications", "Post-op Support"],
  },
];

const pricingSeeds: Seed[] = [
  {
    title: "Gastric Balloon Pricing",
    slug: "gastric-balloon-pricing",
    category: "Pricing and Comparison",
    keyword: "gastric balloon cost Ohio",
    summary:
      "Gastric balloon cost in Ohio can vary by balloon program, placement, removal, facility factors, follow-up, and patient needs.",
    type: "Pricing guide",
    useCase: "Patients comparing gastric balloon cost, self-pay options, and consultation requirements.",
    followUp: "Program pricing should account for placement, removal, support visits, and next-step planning.",
    recovery: "Not applicable; this page focuses on cost factors and planning.",
    coverage: "Insurance coverage varies and should be confirmed before treatment.",
    bestFit: "Useful for patients comparing balloon treatment with surgery or medications.",
    image: "/journey-lite-main-office.jpg",
    imageAlt: "Gastric balloon cost Ohio pricing consultation",
    related: ["gastric-balloon", "spatz-adjustable-gastric-balloon", "pricing-financing", "compare-weight-loss-options"],
    compare: ["Gastric Balloon", "Prescription Medications", "Gastric Sleeve"],
  },
  {
    title: "Pricing & Financing",
    slug: "pricing-financing",
    category: "Pricing and Comparison",
    keyword: "weight loss surgery financing Ohio",
    summary:
      "Pricing and financing for weight loss care depend on procedure type, insurance rules, self-pay needs, facility factors, and follow-up.",
    type: "Pricing and financing resource",
    useCase: "Patients comparing bariatric surgery, gastric balloon, medication programs, self-pay, financing, and insurance requirements.",
    followUp: "Cost discussions may include consultation, facility, anesthesia, procedure type, medication access, and follow-up.",
    recovery: "Not applicable; this page helps patients prepare for cost and coverage conversations.",
    coverage: "Insurance requirements vary by plan and may include documentation, authorization, BMI criteria, and medical necessity.",
    bestFit: "Useful for any patient comparing cost, financing, insurance, or self-pay pathways.",
    image: "/journey-lite-main-office.jpg",
    imageAlt: "Weight loss surgery financing Ohio JourneyLite consultation",
    related: ["gastric-sleeve", "gastric-balloon-pricing", "medication-pricing", "compare-weight-loss-options"],
    compare: ["Surgical Options", "Non-Surgical Procedures", "Medications"],
  },
  {
    title: "Compare Weight Loss Options",
    slug: "compare-weight-loss-options",
    category: "Pricing and Comparison",
    keyword: "compare weight loss surgery and medications",
    summary:
      "Compare surgical weight loss, non-surgical procedures, and prescription medication programs so your consultation starts with clearer questions.",
    type: "Comparison guide",
    useCase: "Patients deciding between gastric sleeve, gastric bypass, gastric balloon, oral medications, and injectable medications.",
    followUp: "Follow-up depends on the care path selected after provider evaluation.",
    recovery: "Recovery or adjustment varies by surgery, procedure, or medication plan.",
    coverage: "Cost and coverage vary by treatment path, insurance plan, and patient eligibility.",
    bestFit: "Useful for patients who are unsure which weight-loss path to discuss first.",
    image: "/hero-image.jpg",
    imageAlt: "Compare weight loss surgery and medications at JourneyLite",
    related: ["gastric-sleeve", "gastric-balloon", "prescription-weight-loss-medications", "pricing-financing"],
    compare: ["Gastric Sleeve", "Gastric Balloon", "Prescription Medications"],
  },
];

const allSeeds = [...surgicalSeeds, ...nonSurgicalSeeds, ...medicationSeeds, ...pricingSeeds];

const defaultImage = "/hero-image.jpg";
const defaultDiagramImage = "/hero-placeholder.svg";

function visualProfile(seed: Seed) {
  const base = visualBase(seed);
  const diagramTitle = `${seed.title}: how it works`;
  const diagramDescription = diagramDescriptionFor(seed, base.diagramType);
  const diagramAccessibleSummary = diagramSummaryFor(seed, base.diagramType);

  return {
    diagramTitle,
    diagramDescription,
    diagramType: base.diagramType,
    diagramImage: defaultDiagramImage,
    diagramAlt: `Simplified ${seed.title.toLowerCase()} diagram for patient education`,
    diagramCaption: "Simplified educational illustration for consultation preparation.",
    diagramAccessibleSummary,
    productImage: base.productImage,
    productImageAlt: base.productImageAlt,
    productImageCaption: base.productImageCaption,
    productImagePlacement: "hero" as const,
    supportingVisuals: supportingVisualsFor(seed),
    visualDisclaimer: visualDisclaimerFor(seed),
  };
}

function visualBase(seed: Seed): {
  diagramType: ServiceDiagramType;
  productImage: string;
  productImageAlt: string;
  productImageCaption: string;
} {
  const map: Record<string, { diagramType: ServiceDiagramType; image: string; alt: string; caption: string }> = {
    "gastric-sleeve": {
      diagramType: "stomach-reduction",
      image: "/gastric-sleeve.jpg",
      alt: "JourneyLite gastric sleeve patient education visual",
      caption: "A non-graphic visual used to introduce gastric sleeve surgery and consultation planning.",
    },
    "gastric-bypass": {
      diagramType: "bypass-pathway",
      image: "/gastric-bypass.jpg",
      alt: "JourneyLite gastric bypass patient education visual",
      caption: "A non-graphic visual used to explain gastric bypass as a bariatric surgery option.",
    },
    "sadi-surgery": {
      diagramType: "sadi-pathway",
      image: "/SADI.jpg",
      alt: "JourneyLite SADI surgery patient education visual",
      caption: "A non-graphic visual for discussing advanced bariatric surgery pathways.",
    },
    "lap-band-surgery": {
      diagramType: "band-placement",
      image: "/weigt-consult-featured.jpg",
      alt: "JourneyLite lap band surgery consultation visual",
      caption: "A consultation-focused visual for reviewing adjustable bariatric surgery options.",
    },
    "gastric-band-revision": {
      diagramType: "revision-pathway",
      image: "/weigt-consult-featured.jpg",
      alt: "JourneyLite gastric band revision consultation visual",
      caption: "A consultation visual for reviewing prior band symptoms, goals, and revision options.",
    },
    "gastric-sleeve-revision": {
      diagramType: "revision-pathway",
      image: "/weigt-consult-featured.jpg",
      alt: "JourneyLite gastric sleeve revision consultation visual",
      caption: "A consultation visual for reviewing prior sleeve surgery and possible next steps.",
    },
    "general-surgery": {
      diagramType: "care-pathway",
      image: "/journey-lite-main-office.jpg",
      alt: "JourneyLite Cincinnati surgery center exterior for general surgery consultation",
      caption: "JourneyLite's Cincinnati location supports select outpatient surgical evaluation and follow-up.",
    },
    "gastric-balloon": {
      diagramType: "balloon-placement",
      image: "/gastric-balloon.jpg",
      alt: "Gastric balloon visual for JourneyLite non-surgical weight loss education",
      caption: "A non-graphic visual used to explain temporary gastric balloon treatment.",
    },
    "spatz-adjustable-gastric-balloon": {
      diagramType: "adjustable-balloon",
      image: "/spatz-balloon.jpg",
      alt: "Spatz adjustable gastric balloon visual for patient education",
      caption: "A balloon visual for comparing adjustability, treatment period, and follow-up.",
    },
    "orbera-gastric-balloon": {
      diagramType: "balloon-timeline",
      image: "/gastric-balloon.jpg",
      alt: "Orbera gastric balloon visual for educational comparison",
      caption: "A balloon visual for comparing temporary non-surgical procedure options.",
    },
    "allurion-gastric-balloon": {
      diagramType: "swallowable-balloon",
      image: "/gastric-balloon.jpg",
      alt: "Allurion gastric balloon educational comparison visual",
      caption: "A representative balloon visual used for education and comparison only.",
    },
    "endoscopic-sleeve-gastroplasty": {
      diagramType: "endoscopic-sleeve",
      image: "/Endoscopic-Sleeve.png",
      alt: "Endoscopic sleeve gastroplasty educational illustration",
      caption: "A non-graphic visual for comparing incisionless stomach-volume procedures.",
    },
    aspireassist: {
      diagramType: "device-education",
      image: "/aspire-assist.webp",
      alt: "AspireAssist educational comparison device visual",
      caption: "A device visual included for education and comparison, not as a guarantee of availability.",
    },
    "prescription-weight-loss-medications": {
      diagramType: "medication-pathway",
      image: "/weight-loss-med-featured.jpg",
      alt: "Prescription weight loss medication consultation visual",
      caption: "A professional medical weight loss visual representing medication-supported care.",
    },
    "injectable-weight-loss-medications": {
      diagramType: "dose-timeline",
      image: "/Semaglutide.webp",
      alt: "Generic injectable weight loss medication visual",
      caption: "A representative injectable medication visual. Your provider determines medication fit.",
    },
    "oral-weight-loss-medications": {
      diagramType: "daily-monitoring",
      image: "/Phentermine.jpg",
      alt: "Generic oral weight loss medication visual",
      caption: "A representative oral medication visual used for patient education.",
    },
    "phentermine-adipex": {
      diagramType: "appetite-monitoring",
      image: "/Phentermine.jpg",
      alt: "Phentermine oral medication visual for patient education",
      caption: "A representative oral medication visual. Screening and monitoring determine fit.",
    },
    qsymia: {
      diagramType: "daily-monitoring",
      image: "/Qsymia.webp",
      alt: "Qsymia oral medication visual for patient education",
      caption: "A representative oral medication visual used to support a provider-led discussion.",
    },
    contrave: {
      diagramType: "craving-pathway",
      image: "/Contrave.webp",
      alt: "Contrave oral medication visual for patient education",
      caption: "A representative oral medication visual used to discuss craving and appetite support.",
    },
    "wegovy-semaglutide": {
      diagramType: "glp1-signaling",
      image: "/Wegovy.avif",
      alt: "Generic semaglutide injectable medication visual",
      caption: "A representative injectable medication visual. Brand-specific treatment depends on provider evaluation.",
    },
    "zepbound-tirzepatide": {
      diagramType: "gip-glp1-signaling",
      image: "/Zepbound.webp",
      alt: "Generic tirzepatide injectable medication visual",
      caption: "A representative injectable medication visual. Coverage, access, and eligibility vary.",
    },
    "post-op-weight-regain-support": {
      diagramType: "regain-support",
      image: "/weigt-consult-featured.jpg",
      alt: "JourneyLite post-operative weight regain support consultation visual",
      caption: "A follow-up consultation visual for reviewing weight regain, plateaus, and renewed support.",
    },
    "medication-pricing": {
      diagramType: "pricing-factors",
      image: "/weight-loss-med-featured.jpg",
      alt: "Weight loss medication pricing consultation visual",
      caption: "A planning visual for reviewing medication cost, coverage, access, and follow-up.",
    },
    "gastric-balloon-pricing": {
      diagramType: "pricing-factors",
      image: "/gastric-balloon.jpg",
      alt: "Gastric balloon pricing consultation visual",
      caption: "A balloon visual used to discuss placement, removal, follow-up, and pricing factors.",
    },
    "pricing-financing": {
      diagramType: "pricing-factors",
      image: "/weigt-consult-featured.jpg",
      alt: "Weight loss care pricing and financing consultation visual",
      caption: "A planning visual for comparing insurance, self-pay, financing, and program costs.",
    },
    "compare-weight-loss-options": {
      diagramType: "option-comparison",
      image: "/healthy-stock.jpg",
      alt: "Treatment comparison visual for JourneyLite weight loss options",
      caption: "A comparison visual for organizing surgery, non-surgical procedures, and medication questions.",
    },
  };

  const mapped = map[seed.slug];
  if (mapped) {
    return {
      diagramType: mapped.diagramType,
      productImage: mapped.image,
      productImageAlt: mapped.alt,
      productImageCaption: mapped.caption,
    };
  }

  return {
    diagramType:
      seed.category === "Prescription Weight Loss Medication"
        ? "medication-pathway"
        : seed.category === "Pricing and Comparison"
          ? "pricing-factors"
          : seed.category === "Non-Surgical Weight Loss"
            ? "balloon-placement"
            : "care-pathway",
    productImage: seed.image ?? defaultImage,
    productImageAlt: seed.imageAlt ?? `${seed.title} JourneyLite patient education visual`,
    productImageCaption: "A JourneyLite visual used to support patient education and consultation planning.",
  };
}

function diagramDescriptionFor(seed: Seed, diagramType: ServiceDiagramType) {
  const descriptions: Partial<Record<ServiceDiagramType, string>> = {
    "stomach-reduction": "See a simplified before-and-after concept showing how sleeve surgery reduces stomach volume.",
    "bypass-pathway": "See a simplified food pathway concept used to compare bypass with other bariatric procedures.",
    "sadi-pathway": "See a simplified digestive pathway concept for discussing advanced metabolic surgery.",
    "band-placement": "See a simplified concept of an adjustable band supporting portion control.",
    "revision-pathway": "See how prior surgery evaluation can lead to removal, conversion, medication support, or follow-up planning.",
    "balloon-placement": "See how a temporary balloon can occupy space in the stomach to support portion control.",
    "balloon-timeline": "See the general sequence of placement, treatment support, removal, and follow-up.",
    "adjustable-balloon": "See how adjustability may be discussed during the treatment period.",
    "swallowable-balloon": "See a simplified educational concept for swallowable balloon comparison.",
    "endoscopic-sleeve": "See a simplified incisionless stomach-volume reduction concept.",
    "device-education": "See a simplified device pathway included for education and comparison.",
    "medication-pathway": "See how screening, medication choice, monitoring, and follow-up work together.",
    "dose-timeline": "See how weekly medication care may include dose titration and follow-up.",
    "daily-monitoring": "See how oral medication use is paired with monitoring and refill review.",
    "appetite-monitoring": "See how appetite support is paired with blood pressure, side-effect, and progress monitoring.",
    "craving-pathway": "See how craving and appetite support is monitored over time.",
    "glp1-signaling": "See a simplified GLP-1 appetite support and dose-titration concept.",
    "gip-glp1-signaling": "See a simplified GIP/GLP-1 appetite support and dose-titration concept.",
    "regain-support": "See how weight regain evaluation can lead to renewed nutrition, medication, or revision discussions.",
    "pricing-factors": "See how insurance, self-pay, financing, follow-up, and treatment type can affect cost.",
    "option-comparison": "See how surgery, non-surgical procedures, and medications differ by fit and follow-up.",
    "care-pathway": "See how consultation, evaluation, procedure planning, and follow-up connect.",
  };

  return descriptions[diagramType] ?? `See a simplified educational diagram for ${seed.title.toLowerCase()}.`;
}

function diagramSummaryFor(seed: Seed, diagramType: ServiceDiagramType) {
  const prefix = `${seed.title} diagram summary: `;
  const summaries: Partial<Record<ServiceDiagramType, string>> = {
    "stomach-reduction": "the diagram compares a larger stomach shape with a smaller sleeve-shaped stomach to show reduced stomach volume.",
    "bypass-pathway": "the diagram shows food moving from a small stomach pouch into a later part of the small intestine as a simplified pathway.",
    "sadi-pathway": "the diagram shows an advanced metabolic pathway with a sleeve-shaped stomach and rerouted intestinal flow.",
    "band-placement": "the diagram shows a band near the upper stomach creating a smaller upper pouch for portion-control support.",
    "revision-pathway": "the diagram shows evaluation of prior surgery followed by possible removal, conversion, medication support, or follow-up.",
    "balloon-placement": "the diagram shows a temporary balloon inside the stomach and a follow-up path for support and removal.",
    "balloon-timeline": "the diagram shows placement, treatment support, removal, and long-term follow-up as a staged timeline.",
    "adjustable-balloon": "the diagram shows a balloon with an adjustment step during treatment and follow-up after removal.",
    "swallowable-balloon": "the diagram shows an educational swallowable balloon concept followed by monitoring and comparison.",
    "endoscopic-sleeve": "the diagram shows an endoscopic pathway that reduces stomach volume without external incisions.",
    "device-education": "the diagram shows a device-based pathway included only for education and comparison.",
    "medication-pathway": "the diagram shows provider screening, medication selection, monitoring, and long-term follow-up.",
    "dose-timeline": "the diagram shows weekly dosing, gradual titration, monitoring, and follow-up.",
    "daily-monitoring": "the diagram shows daily medication use with vitals, side-effect review, and refill monitoring.",
    "appetite-monitoring": "the diagram shows appetite support paired with blood pressure, sleep, anxiety, and progress monitoring.",
    "craving-pathway": "the diagram shows craving and appetite support paired with provider follow-up and safety review.",
    "glp1-signaling": "the diagram shows simplified appetite signaling, dose titration, and follow-up monitoring.",
    "gip-glp1-signaling": "the diagram shows simplified dual-pathway appetite support, dose titration, and follow-up monitoring.",
    "regain-support": "the diagram shows weight regain evaluation leading to nutrition, labs, medication, procedure, or revision discussions.",
    "pricing-factors": "the diagram shows treatment type, insurance, authorization, pharmacy or facility factors, and follow-up affecting cost.",
    "option-comparison": "the diagram compares surgery, non-surgical procedures, and medications as separate paths that lead to consultation.",
    "care-pathway": "the diagram shows consultation, evaluation, procedure planning, and follow-up as a connected care pathway.",
  };

  return `${prefix}${summaries[diagramType] ?? "the diagram provides a simplified educational overview for patient discussion."}`;
}

function supportingVisualsFor(seed: Seed): SupportingVisual[] {
  return [
    {
      title: "Treatment fit",
      description: seed.bestFit,
    },
    {
      title: "Follow-up",
      description: seed.followUp,
    },
    {
      title: "Cost and coverage",
      description: seed.coverage,
    },
  ];
}

function visualDisclaimerFor(seed: Seed) {
  if (seed.category === "Prescription Weight Loss Medication") {
    return "Medication images are representative only. Your provider will determine whether a specific medication is appropriate.";
  }

  if (seed.status === "Educational comparison") {
    return "Illustrations are simplified for education and comparison and do not mean this option is currently offered.";
  }

  if (seed.category === "Pricing and Comparison") {
    return "Pricing illustrations are simplified for patient education and do not replace a consultation or coverage review.";
  }

  return "Procedure illustrations are simplified for patient education and do not show every anatomical or clinical detail.";
}

function citationSet(category: ServiceCategory, slug: string) {
  if (category === "Surgical Weight Loss") return [sourceLinks.cdcObesity, sourceLinks.asmbsSurgery, sourceLinks.asmbsGuidelines];
  if (category === "Non-Surgical Weight Loss") return [sourceLinks.cdcObesity, sourceLinks.fdaDevices];
  if (slug.includes("wegovy")) return [sourceLinks.cdcObesity, sourceLinks.fdaWegovy];
  if (slug.includes("zepbound")) return [sourceLinks.cdcObesity, sourceLinks.fdaZepbound];
  if (category === "Prescription Weight Loss Medication") return [sourceLinks.cdcObesity, sourceLinks.fdaWegovy, sourceLinks.fdaZepbound];
  return [sourceLinks.cdcObesity, sourceLinks.asmbsSurgery, sourceLinks.fdaDevices];
}

function pageTitle(seed: Seed) {
  if (seed.title === "Pricing & Financing") return "Pricing & Financing for Weight Loss Care";
  if (seed.title === "Compare Weight Loss Options") return "Compare Weight Loss Options";
  return `${seed.title} in Ohio`;
}

function buildService(seed: Seed): ServicePageData {
  const title = pageTitle(seed);
  const ctaPricing = seed.category === "Pricing and Comparison" ? "Review cost, financing, and coverage details during consultation." : seed.coverage;
  const visuals = visualProfile(seed);
  const availability =
    seed.status === "Educational comparison"
      ? "This page is intended for education and comparison. Availability depends on JourneyLite's current programs and provider evaluation."
      : seed.status === "Balloon comparison"
        ? "This balloon page is useful for comparison. JourneyLite currently emphasizes gastric balloon treatment as its active non-surgical procedure among the listed procedures."
        : "A provider evaluation is needed to confirm fit, safety, pricing, and next steps.";

  return {
    title: seed.title,
    slug: seed.slug,
    category: seed.category,
    primaryKeyword: seed.keyword,
    metaTitle: seed.metaTitle ?? `${seed.title} | JourneyLite Ohio`,
    metaDescription: seed.summary.slice(0, 155),
    h1: title,
    heroSummary: `${seed.summary} JourneyLite supports patients across Ohio, Kentucky, and Indiana with responsible expectations and personalized evaluation.`,
    image: seed.image ?? defaultImage,
    imageAlt: seed.imageAlt ?? `${seed.title} JourneyLite service page`,
    ...visuals,
    status: seed.status,
    quickFacts: [
      { label: "Treatment type", value: seed.type },
      { label: "Typical use case", value: seed.useCase },
      { label: "Follow-up needs", value: seed.followUp },
      { label: "Recovery or adjustment", value: seed.recovery },
      { label: "Pricing or insurance note", value: ctaPricing },
      { label: "Best-fit profile", value: seed.bestFit },
      { label: "Eligibility reminder", value: availability },
    ],
    whatIs: [
      `${seed.title} is part of JourneyLite's ${seed.category.toLowerCase()} pathway. ${seed.summary} The goal is not to force every patient into one option, but to help patients compare choices with a clinician who can review health history, goals, comfort level, and long-term support needs.`,
      `During consultation, the JourneyLite team reviews BMI, prior attempts, relevant diagnoses, current medications, surgical history, pregnancy status when relevant, reflux or GI symptoms, and practical issues such as insurance, timing, and follow-up. Outcomes vary, and no page can determine eligibility without provider evaluation.`,
      `${seed.title} may be compared with related options so patients can understand tradeoffs. Some choices are designed for durable surgical support, some are temporary or less invasive, and medication-supported care requires ongoing monitoring and dose or safety review.`,
    ],
    candidateFit: [
      seed.bestFit,
      "You want a medically supervised plan rather than a one-size-fits-all program.",
      "You are willing to discuss BMI, health history, current medications, prior weight-loss attempts, and long-term follow-up.",
      "You want to compare treatment paths before deciding whether surgery, a non-surgical procedure, or medication support is the right next step.",
    ],
    notCandidateFit: [
      "You need emergency or urgent medical care. Call 911 for emergencies and call the office for urgent post-operative concerns.",
      "You are pregnant, planning pregnancy soon, or have a medical condition or medication history that makes this option unsafe without careful review.",
      "You want guaranteed results or a treatment without follow-up, nutrition work, or behavior change.",
      seed.status === "Educational comparison"
        ? "You are assuming this educational comparison treatment is currently offered without confirming availability with JourneyLite."
        : "Your provider determines another option is safer or more appropriate after evaluation.",
    ],
    benefits: [
      "Creates a structured conversation around weight-loss goals and medical fit.",
      "Can be compared with related JourneyLite options before committing to a plan.",
      "May support weight-loss progress when paired with appropriate follow-up and lifestyle work.",
      "Gives patients a clear path for questions about pricing, insurance, and next steps.",
    ],
    considerations: [
      "Outcomes vary by treatment, medical history, adherence, nutrition habits, activity, and follow-up.",
      seed.coverage,
      "Eligibility depends on provider evaluation and may involve BMI, labs, medication history, prior surgery, or insurance documentation.",
      "This page is educational and does not replace medical advice from a JourneyLite clinician.",
    ],
    pricingNotes: [
      "Cost may be affected by consultation needs, procedure or medication type, facility or anesthesia factors when relevant, follow-up visits, and testing.",
      seed.coverage,
      "Financing or self-pay options may be available depending on the treatment pathway.",
      "A consultation helps clarify pricing, coverage, authorization, and what is included in the treatment plan.",
    ],
    processSteps: [
      "Schedule a consultation with JourneyLite.",
      "Review medical history, weight-loss goals, prior attempts, medications, and surgical history.",
      `Discuss whether ${seed.title} or a related option may fit your goals and health profile.`,
      "Confirm eligibility, pricing, insurance requirements, and preparation steps.",
      "Begin treatment or preparation if the provider recommends moving forward.",
      "Continue follow-up, nutrition support, medication monitoring, or surgical care as appropriate.",
    ],
    comparisonRows: seed.compare.map((option) => ({
      option,
      type: option.includes("Medication") || option.includes("Wegovy") || option.includes("Zepbound") || option.includes("Oral") || option.includes("Injectable") ? "Medication-supported" : option.includes("Balloon") ? "Non-surgical" : "Surgical or procedural",
      bestFor: `Patients comparing ${option.toLowerCase()} with ${seed.title.toLowerCase()} during consultation.`,
      considerations: "Fit depends on BMI, medical history, goals, comfort level, coverage, and provider evaluation.",
      href: `/services/${slugFromTitle(option)}`,
    })),
    faqs: buildFaqs(seed),
    relatedServices: seed.related,
    physicianFocus:
      seed.physicianFocus ??
      (seed.category === "Surgical Weight Loss"
        ? "JourneyLite's bariatric physicians help patients understand surgical fit, risks, recovery, revision considerations, and long-term follow-up."
        : seed.category === "Prescription Weight Loss Medication"
          ? "JourneyLite's care team helps patients evaluate medication eligibility, contraindications, side effects, dose planning, and follow-up."
          : "JourneyLite's physicians help patients compare non-surgical procedures with surgery and medications using responsible expectations."),
    locationCopy: `JourneyLite supports patients considering ${seed.title} across Cincinnati, Dayton, Columbus, Northern Kentucky, Indianapolis, and surrounding communities. The Cincinnati main office and JourneyLite Surgery Center anchor the practice, with regional offices supporting consultations and follow-up where appropriate.`,
    citations: citationSet(seed.category, seed.slug),
  };
}

function buildFaqs(seed: Seed) {
  return [
    {
      question: `What is ${seed.title}?`,
      answer: `${seed.title} is a ${seed.type.toLowerCase()} option. ${seed.summary} A consultation is needed to determine whether it fits your medical history and goals.`,
    },
    {
      question: `How much does ${seed.title} cost?`,
      answer: `Cost varies. ${seed.coverage} JourneyLite can review pricing, financing, insurance requirements, and what is included during consultation.`,
    },
    {
      question: `Is ${seed.title} covered by insurance?`,
      answer: "Coverage depends on the treatment, diagnosis, plan rules, documentation, prior authorization, and medical necessity requirements. The team can help you understand next steps.",
    },
    {
      question: `How much weight can I lose with ${seed.title}?`,
      answer: "Outcomes vary by treatment type, starting health, adherence, nutrition habits, follow-up, and other individual factors. JourneyLite avoids guaranteeing a specific result.",
    },
    {
      question: `Who is not a candidate for ${seed.title}?`,
      answer: "Some patients may not be candidates because of pregnancy status, medication interactions, prior surgery, GI symptoms, uncontrolled medical conditions, or provider safety concerns.",
    },
    {
      question: `How does ${seed.title} compare with other options?`,
      answer: `${seed.title} can be compared with related JourneyLite options such as ${seed.compare.join(", ")}. The best choice depends on BMI, goals, health history, and comfort level.`,
    },
    {
      question: `What happens after starting ${seed.title}?`,
      answer: `${seed.followUp} Follow-up is part of the treatment plan because long-term progress depends on monitoring, nutrition, habits, and timely questions.`,
    },
  ];
}

function slugFromTitle(title: string) {
  const map: Record<string, string> = {
    "Gastric Sleeve": "gastric-sleeve",
    "Gastric Bypass": "gastric-bypass",
    "SADI Surgery": "sadi-surgery",
    "Lap Band Surgery": "lap-band-surgery",
    "Gastric Band Revision": "gastric-band-revision",
    "Gastric Sleeve Revision": "gastric-sleeve-revision",
    "General Surgery": "general-surgery",
    "Gastric Balloon": "gastric-balloon",
    "Orbera Gastric Balloon": "orbera-gastric-balloon",
    "Spatz Adjustable Gastric Balloon": "spatz-adjustable-gastric-balloon",
    "Allurion Gastric Balloon": "allurion-gastric-balloon",
    "Endoscopic Sleeve Gastroplasty": "endoscopic-sleeve-gastroplasty",
    "AspireAssist": "aspireassist",
    "Prescription Weight Loss Medications": "prescription-weight-loss-medications",
    "Prescription Medications": "prescription-weight-loss-medications",
    "Injectable Medications": "injectable-weight-loss-medications",
    "Oral Medications": "oral-weight-loss-medications",
    "Wegovy / Semaglutide": "wegovy-semaglutide",
    "Zepbound / Tirzepatide": "zepbound-tirzepatide",
    "Post-op Support": "post-op-weight-regain-support",
    "Post-op Weight Regain Support": "post-op-weight-regain-support",
    "Medication Support": "prescription-weight-loss-medications",
    "Medication-supported care": "prescription-weight-loss-medications",
    "Medication Pricing": "medication-pricing",
    "Gastric Balloon Pricing": "gastric-balloon-pricing",
    "Pricing & Financing": "pricing-financing",
    "Surgical Options": "compare-weight-loss-options",
    "Non-Surgical Procedures": "compare-weight-loss-options",
  };
  return map[title] ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const servicePages: ServicePageData[] = allSeeds.map(buildService);

export const servicePageMap = Object.fromEntries(servicePages.map((page) => [page.slug, page]));

export const serviceSlugs = servicePages.map((page) => page.slug);

export const journeyLiteProofStats = proofStats;
