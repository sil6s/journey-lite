import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CTAButton, SiteFooter, SiteHeader } from "../components/marketing";
import { phoneHref, phoneNumber, physicianCards, reviewBadge, reviewCards } from "../components/data";
import {
  MedicationFaqAccordion,
  MedicationOptionExplorer,
  MedicationQuiz,
  type MedicationFaq,
  type MedicationOptionTab,
} from "./MedicationDecisionTools";

export const metadata: Metadata = {
  title: "Medication Weight Loss in Ohio | Wegovy, Zepbound, Oral Medications | JourneyLite",
  description:
    "Compare medication weight loss options in Ohio with JourneyLite. Learn about Wegovy, Zepbound, phentermine, Qsymia, Contrave, oral medications, pricing, and physician-supervised care.",
  alternates: {
    canonical: "/medications",
  },
};

const stats = [
  ["40.3%", "U.S. adult obesity prevalence", "CDC/NCHS public health context"],
  ["5", "regional locations", "Ohio, Kentucky, and Indiana access"],
  ["Oral + injectable", "medication options", "Medication paths reviewed during consultation"],
  ["Physician-led", "follow-up", "Screening, monitoring, and plan adjustment"],
];

const jumpCards = [
  ["How medication weight loss works", "#how-it-works"],
  ["Injectable options", "#injectable-medications"],
  ["Oral options", "#oral-medications"],
  ["Clinical trial results", "#clinical-results"],
  ["Help after weight regain", "#post-op-support"],
  ["Cost and coverage", "#pricing"],
  ["Compare with procedures", "#compare-options"],
];

const quickFacts = [
  [
    "What it is",
    "Medication-supported care uses prescription medications, nutrition guidance, and follow-up to support eligible patients with appetite, cravings, metabolic goals, or long-term maintenance.",
  ],
  ["Main paths", "Patients may discuss oral medications, injectable medications, or medication support after bariatric surgery."],
  [
    "What determines fit",
    "Medication fit may depend on BMI, medical history, current medications, prior weight-loss attempts, prior surgery, contraindications, pregnancy status when relevant, side effects, coverage, and goals.",
  ],
  [
    "Why follow-up matters",
    "Medication care may include dose planning, side-effect monitoring, vitals, refill planning, progress checks, nutrition support, and long-term maintenance planning.",
  ],
  [
    "Cost and access",
    "Medication cost can vary by medication choice, insurance coverage, prior authorization, pharmacy access, dose, supply, and follow-up needs.",
  ],
  [
    "Best next step",
    "A consultation helps confirm whether medication, surgery, a non-surgical procedure, or renewed post-op support may be appropriate.",
  ],
];

const processSteps = [
  [
    "Medical history and goal review",
    "Your care team reviews your current weight, BMI, weight history, prior attempts, current medications, medical conditions, pregnancy status when relevant, reflux or GI symptoms, prior bariatric surgery, appetite patterns, cravings, plateaus, and goals.",
  ],
  [
    "Safety screening",
    "Not every medication fits every patient. Your provider reviews contraindications, medication interactions, side effects, blood pressure or vitals when relevant, and whether medication is appropriate compared with other options.",
  ],
  [
    "Medication path discussion",
    "You may discuss oral medications, injectable medications, medication support after bariatric surgery, or another JourneyLite option such as gastric sleeve, gastric bypass, gastric balloon, endoscopic sleeve gastroplasty, or revision surgery.",
  ],
  [
    "Cost, insurance, and access review",
    "Coverage, prior authorization, pharmacy access, medication supply, dose, copays, and self-pay options can affect the plan. This is why pricing and coverage should be reviewed before assuming a specific medication path.",
  ],
  [
    "Starting treatment, if appropriate",
    "If medication is clinically appropriate, your provider reviews instructions, expectations, side effects to watch for, and when to follow up.",
  ],
  [
    "Monitoring and adjustment",
    "Progress is monitored over time. Side effects, tolerance, refills, dose changes, nutrition habits, and next steps are reviewed during follow-up.",
  ],
  [
    "Long-term planning",
    "Medication care should include a maintenance conversation. Some patients continue medication, some change paths, and some compare medication with procedural or revision options.",
  ],
];

const optionTabs: MedicationOptionTab[] = [
  {
    id: "injectable-tab",
    label: "Injectable medications",
    title: "Injectable weight loss medications",
    image: "/Semaglutide.webp",
    alt: "Injectable weight loss medication options discussed during physician-led consultation",
    summary:
      "Injectable medications such as Wegovy and Zepbound may be discussed for eligible patients who want prescription-based appetite and metabolic support with ongoing monitoring.",
    how:
      "Some options act on hormone pathways involved in appetite, fullness, digestion speed, and blood sugar regulation.",
    ask:
      "Patients asking about semaglutide-based or tirzepatide-based options, appetite support, or medication as an alternative to a procedure.",
    followUp: ["Dose planning", "Side-effect review", "Progress tracking", "Coverage updates"],
    cost:
      "Coverage, copays, prior authorization, pharmacy access, dose, and supply can vary substantially.",
    cta: "Ask About Injectable Options",
    href: "/contact",
  },
  {
    id: "oral-tab",
    label: "Oral medications",
    title: "Oral weight loss medications",
    image: "/Phentermine.jpg",
    alt: "Oral weight loss medication options with medical monitoring and follow-up",
    summary:
      "Oral medications such as phentermine, Qsymia, Contrave, and orlistat may help selected patients manage appetite, cravings, fat absorption, or momentum with provider screening and monitoring.",
    how:
      "Different oral medications work in different ways. Some may affect appetite, cravings, reward pathways, or fullness signals.",
    ask:
      "Patients who prefer a pill-based option, want structured support without a procedure, or want to compare oral and injectable medication paths.",
    followUp: ["Vitals when relevant", "Interaction review", "Refill planning", "Progress checks"],
    cost:
      "Some oral options may have different cost patterns than injectables, but prescription and visit costs still vary.",
    cta: "Ask About Oral Options",
    href: "/contact",
  },
  {
    id: "post-op-tab",
    label: "Post-op support",
    title: "Medication support after bariatric surgery",
    image: "/weigt-consult-featured.jpg",
    alt: "Post-op weight regain support after bariatric surgery",
    summary:
      "Medication support may be one part of a renewed plan for regain, plateaus, or maintenance struggles after bariatric surgery.",
    how:
      "Evaluation may include nutrition, labs, symptoms, anatomy, prior procedure type, and whether revision should be discussed.",
    ask:
      "Patients with regain after sleeve, bypass, band, or another procedure who want renewed support before choosing next steps.",
    followUp: ["Surgery history review", "Nutrition review", "Lab discussion", "Revision triage"],
    cost:
      "Cost depends on medication choice, evaluation needs, diagnostic workup, coverage, and whether revision care is part of the plan.",
    cta: "Get Help With Weight Regain",
    href: "/contact",
  },
  {
    id: "compare-tab",
    label: "Compare procedures",
    title: "Medication vs procedures",
    image: "/weight-loss-med-featured.jpg",
    alt: "Medication weight loss consultation with JourneyLite provider in Ohio",
    summary:
      "Medication-supported care is one path. Some patients compare it with gastric sleeve, bypass, balloon, ESG, or revision surgery.",
    how:
      "A consultation can help compare anatomy, BMI, goals, risk tolerance, recovery, cost, coverage, and follow-up expectations.",
    ask:
      "Patients who are not sure whether medication, surgery, a non-surgical procedure, or post-op support is the right conversation.",
    followUp: ["Option comparison", "Eligibility review", "Pricing questions", "Next-step planning"],
    cost:
      "Each path has different insurance, self-pay, facility, medication, and follow-up considerations.",
    cta: "Compare All Weight Loss Options",
    href: "/services/compare-weight-loss-options",
  },
];

const medicationSpotlights = [
  {
    name: "Phentermine",
    type: "Oral short-term appetite-support medication",
    image: "/Phentermine.jpg",
    alt: "Phentermine oral weight loss medication visual for patient education",
    summary:
      "Phentermine may be discussed as a lower-cost, short-term oral option for selected patients. It requires careful review of blood pressure, cardiovascular history, medication interactions, tolerance, and follow-up needs.",
    result: "Short-term adjunct; modern long-term percentage data is more limited than newer options.",
    questions: ["Is short-term use appropriate for me?", "What vitals or side effects should be monitored?", "What happens if appetite returns or tolerance develops?"],
    href: "#oral-medications",
  },
  {
    name: "Qsymia",
    type: "Oral phentermine/topiramate ER combination",
    image: "/Qysmia.jpeg",
    alt: "Qsymia oral medication visual for patient education",
    summary:
      "Qsymia may be discussed for eligible patients when a provider determines that combination oral therapy is reasonable. Screening should include contraindications, pregnancy considerations, side effects, and response over time.",
    result: "FDA/DailyMed labeling reports about -7.8% to -10.9% average 1-year weight loss depending on study and dose.",
    questions: ["What dose path would be reviewed?", "What contraindications matter?", "How will response be evaluated?"],
    href: "#oral-medications",
  },
  {
    name: "Contrave",
    type: "Oral naltrexone/bupropion ER combination",
    image: "/Contrave.jpg",
    alt: "Contrave oral medication visual for weight loss consultation",
    summary:
      "Contrave may be discussed when appetite, cravings, or reward pathways are part of the conversation. It is not appropriate for every patient and needs review of medical history, medications, and side-effect risks.",
    result: "FDA labeling reports about -3.7% to -8.1% average 56-week weight loss depending on trial and behavioral support.",
    questions: ["Could this fit my health history?", "What medications or conditions matter?", "How does behavioral support affect expectations?"],
    href: "#oral-medications",
  },
  {
    name: "Orlistat",
    type: "Oral lipase inhibitor",
    image: "/Orlistat.webp",
    alt: "Orlistat oral medication education tile",
    summary:
      "Orlistat works differently than appetite-focused medications by reducing fat absorption. Patients should ask about diet instructions, gastrointestinal side effects, vitamin considerations, and realistic expectations.",
    result: "DailyMed Xenical labeling reports 13.4 lb mean 1-year loss versus 5.8 lb with placebo in pooled data.",
    questions: ["How does fat absorption change?", "What diet rules matter?", "How are vitamins handled?"],
    href: "#oral-medications",
  },
  {
    name: "Wegovy",
    type: "Semaglutide GLP-1 medication",
    image: "/Wegovy.webp",
    alt: "Wegovy semaglutide medication visual for physician-supervised discussion",
    summary:
      "Wegovy may be discussed as an injectable GLP-1 option for eligible patients. Coverage, dose planning, side effects, medical history, and long-term follow-up all need provider review.",
    result: "FDA labeling reports -14.9% mean body-weight change at 68 weeks in one adult study versus -2.4% with placebo.",
    questions: ["What does dose escalation involve?", "What side effects should I watch for?", "Will my insurance cover it?"],
    href: "#injectable-medications",
  },
  {
    name: "Zepbound",
    type: "Tirzepatide GIP/GLP-1 medication",
    image: "/zepbound.jpg",
    alt: "Zepbound tirzepatide medication visual for physician-supervised discussion",
    summary:
      "Zepbound may be discussed as an injectable GIP/GLP-1 option for eligible adults. A provider should review side effects, contraindications, coverage, supply, and follow-up expectations.",
    result: "FDA reported average 18% body-weight loss at the highest approved dose in adults without diabetes and 12% in adults with type 2 diabetes.",
    questions: ["How does this compare with Wegovy?", "What coverage or supply issues matter?", "What medical history could change the decision?"],
    href: "#injectable-medications",
  },
];

const resultRows = [
  {
    medication: "Wegovy",
    route: "Weekly injection",
    summary:
      "FDA labeling reports -14.9% mean body-weight change at 68 weeks in one adult study versus -2.4% with placebo.",
    wording: "Substantial average trial weight loss for eligible patients; individual results vary.",
    source: "FDA Wegovy label",
    href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215256s033lbl.pdf",
  },
  {
    medication: "Zepbound",
    route: "Weekly injection",
    summary:
      "FDA reported average 18% body-weight loss at the highest approved dose in adults without diabetes and 12% in adults with type 2 diabetes.",
    wording: "Strong FDA-reviewed trial results; coverage and side effects need review.",
    source: "FDA Zepbound approval",
    href: "https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management",
  },
  {
    medication: "Qsymia",
    route: "Oral daily medication",
    summary:
      "DailyMed labeling reports about -7.8% to -10.9% average 1-year weight loss depending on study and dose.",
    wording: "Oral option with stronger average trial results than some older oral medications.",
    source: "DailyMed Qsymia label",
    href: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=40dd5602-53da-45ac-bb4b-15789aba40f9",
  },
  {
    medication: "Contrave",
    route: "Oral daily medication",
    summary:
      "FDA labeling reports about -3.7% to -8.1% average 56-week weight loss depending on trial and behavioral support.",
    wording: "May help some patients, especially with structured lifestyle support.",
    source: "FDA Contrave label",
    href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/200063s013lbl.pdf",
  },
  {
    medication: "Orlistat",
    route: "Oral medication with meals",
    summary:
      "DailyMed labeling reports 13.4 lb mean 1-year loss with Xenical versus 5.8 lb with placebo in pooled data.",
    wording: "Modest results; works by reducing fat absorption, not appetite.",
    source: "DailyMed Xenical label",
    href: "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=6240792b-9224-2d10-e053-2a91aa0a2c3e",
  },
  {
    medication: "Phentermine",
    route: "Oral short-term medication",
    summary:
      "DailyMed labeling describes phentermine as a short-term adjunct used with exercise, behavior change, and caloric restriction.",
    wording: "Short-term appetite-support option that requires careful provider review.",
    source: "DailyMed phentermine label",
    href: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=28fda2ce-d445-47ce-8764-bf113b5db5b3",
  },
];

const injectableFollowUp = [
  "Dose planning or titration",
  "Side-effect review",
  "Progress tracking",
  "Nutrition support",
  "Coverage or prior authorization updates",
  "Refill and supply planning",
  "Maintenance planning",
];

const injectableConsiderations = [
  "Coverage and copays can vary",
  "Prior authorization may be required",
  "Supply or pharmacy access may change",
  "Side effects and tolerance need monitoring",
  "Some patients are not candidates",
  "Trial results do not guarantee individual outcomes",
];

const oralFollowUp = [
  "Blood pressure or vitals when relevant",
  "Medication interaction review",
  "Side-effect monitoring",
  "Refill planning",
  "Progress checks",
  "Nutrition and behavior support",
  "Review of whether the medication is helping",
];

const oralConsiderations = [
  "Not every patient is a candidate",
  "Some medications require vitals monitoring",
  "Some conditions or medications may make certain options inappropriate",
  "Pregnancy plans may affect medication decisions",
  "Follow-up is required",
  "Results vary",
];

const postOpSeekSupport = [
  "Weight regain after gastric sleeve, bypass, or band",
  "Plateau after initial weight loss",
  "Increased appetite or cravings",
  "Difficulty maintaining habits",
  "New medications or health changes",
  "Concern that the original procedure is no longer helping",
  "Interest in medication before considering revision surgery",
];

const postOpReview = [
  "Type of prior bariatric procedure",
  "Surgery date and weight history",
  "Highest weight, lowest weight, and current weight",
  "Nutrition habits and protein intake",
  "Labs or deficiency concerns",
  "Reflux, vomiting, swallowing issues, or GI symptoms",
  "Current medications",
  "Whether imaging, endoscopy, or revision evaluation may be needed",
  "Whether medication support is reasonable",
];

const postOpLinks = [
  ["Gastric Sleeve Revision", "/services/gastric-sleeve-revision"],
  ["Gastric Band Revision", "/services/gastric-band-revision"],
  ["Gastric Bypass", "/services/gastric-bypass"],
  ["Pricing & Financing", "/services/pricing-financing"],
  ["Book Consultation", "/contact"],
];

const candidateItems = [
  "You want medical support rather than a one-size-fits-all program",
  "You are interested in oral or injectable medication options",
  "You want help with appetite, cravings, plateaus, or regain",
  "You are willing to attend follow-up visits",
  "You understand medication may require monitoring and adjustment",
  "You have regained weight after bariatric surgery",
  "You want to compare medication with procedures before deciding",
];

const notCandidateItems = [
  "You need emergency or urgent care",
  "You are pregnant, planning pregnancy soon, or have a condition that makes medication unsafe",
  "You have medication interactions or contraindications",
  "You are not able to participate in follow-up",
  "You expect guaranteed results",
  "A provider determines another option is safer or more appropriate",
];

const benefits = [
  "May help eligible patients manage appetite or cravings",
  "May support progress without surgical recovery",
  "Can be part of a structured medical plan",
  "Can be paired with nutrition and follow-up support",
  "May help some patients after bariatric surgery",
  "Gives patients a way to compare medication with other options",
];

const responsibilities = [
  "Follow-up is important",
  "Side effects should be reported",
  "Refills and dose changes need coordination",
  "Nutrition and habits still matter",
  "Cost and access may change",
  "Results vary",
  "Medication may not be a permanent standalone solution",
];

const pricingCards = [
  [
    "Consultation and follow-up",
    "Initial and follow-up visit costs should be confirmed during consultation. Keeping pricing centralized helps patients avoid conflicting information.",
  ],
  [
    "Medication cost",
    "Medication cost may vary by oral vs injectable path, dose, coverage, pharmacy, and supply. The page does not promise coverage or availability.",
  ],
  [
    "Insurance and prior authorization",
    "Some plans may require documentation, prior authorization, or specific coverage criteria. Coverage can vary substantially.",
  ],
  [
    "HSA, FSA, and financing",
    "HSA/FSA or financing options may be available depending on the treatment pathway and current policies. Ask about current Kemba, CareCredit, and Prosper availability.",
  ],
];

const comparisonRows = [
  ["Oral medications", "Medication-supported care", "Patients who prefer a pill-based option and meet screening criteria.", "Medical history, vitals, interactions, side effects, refills, and follow-up.", "#oral-medications", "Ask About Oral Options"],
  ["Injectable medications", "Medication-supported care", "Patients asking about GLP-1 or GIP/GLP-1 medication paths.", "Coverage, supply, dose planning, tolerance, side effects, and follow-up can affect the plan.", "#injectable-medications", "Ask About Injectables"],
  ["Medication support after surgery", "Post-op support", "Patients with regain, plateaus, or maintenance concerns after bariatric surgery.", "Nutrition, labs, symptoms, anatomy, prior procedure, and revision questions may need review.", "#post-op-support", "Review Post-op Support"],
  ["Gastric balloon", "Non-surgical procedure", "Patients comparing temporary, incisionless procedural support.", "Placement, removal, tolerance, aftercare, and self-pay details should be confirmed.", "/services/gastric-balloon", "View Balloon"],
  ["Endoscopic sleeve gastroplasty", "Endoscopic procedure", "Patients researching incisionless or less invasive procedure concepts.", "Availability, anatomy, follow-up, and long-term expectations should be discussed.", "/services/endoscopic-sleeve-gastroplasty", "Compare ESG"],
  ["Gastric sleeve", "Bariatric surgery", "Patients considering a durable surgical option.", "Surgical evaluation, preparation, recovery planning, and long-term follow-up are required.", "/services/gastric-sleeve", "View Sleeve"],
  ["Gastric bypass", "Bariatric surgery", "Patients comparing established metabolic surgery options.", "Anatomy, reflux, metabolic needs, coverage, and follow-up all matter.", "/services/gastric-bypass", "View Bypass"],
  ["Revision surgery", "Revision evaluation", "Patients with prior surgery, anatomy concerns, reflux, regain, or device issues.", "Complexity varies by prior procedure, imaging, scar tissue, symptoms, and surgical plan.", "/services/gastric-band-revision", "Review Revision"],
];

const sourceCards = [
  ["CDC/NCHS", "Adult obesity prevalence", "CDC/NCHS reports that U.S. adult obesity prevalence was 40.3% during August 2021-August 2023.", "CDC adult obesity prevalence data", "https://www.cdc.gov/nchs/products/databriefs/db508.htm"],
  ["CDC", "Obesity as chronic disease", "CDC describes obesity as a common, serious, and costly chronic disease.", "CDC adult obesity facts", "https://www.cdc.gov/obesity/adult-obesity-facts/index.html"],
  ["CDC", "Obesity-related health risks", "CDC notes obesity is associated with higher risk for several health conditions.", "CDC obesity health risks", "https://www.cdc.gov/obesity/php/about/consequences.html"],
  ["NIDDK", "Prescription medication overview", "NIDDK provides patient-facing information about prescription medications used to treat overweight and obesity.", "NIDDK prescription weight-loss medications", "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity"],
  ["FDA", "Zepbound approval context", "FDA medication information can help patients understand approved uses and clinical trial context.", "FDA Zepbound approval announcement", "https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management"],
  ["FDA", "Zepbound label", "FDA labeling provides prescribing, warning, adverse reaction, and patient counseling context for tirzepatide.", "FDA Zepbound prescribing information", "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/217806s002lbl.pdf"],
  ["Wegovy", "Prescribing information context", "Prescribing information helps patients understand medication use, warnings, and why provider review is required.", "Wegovy prescribing information", "https://www.wegovy.com/prescribing-information.html"],
  ["FDA", "Wegovy label", "FDA labeling provides clinical study, dose, warning, adverse reaction, and patient counseling context for semaglutide.", "FDA Wegovy prescribing information", "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215256s033lbl.pdf"],
  ["Mayo Clinic", "Prescription weight-loss drugs", "Mayo Clinic summarizes prescription weight-loss medication considerations and why medical supervision matters.", "Mayo Clinic prescription weight-loss drugs", "https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/weight-loss-drugs/art-20044832"],
  ["Cleveland Clinic", "Medication types overview", "Cleveland Clinic explains common weight-loss medication types and patient questions in plain language.", "Cleveland Clinic weight loss medications", "https://my.clevelandclinic.org/health/treatments/weight-loss-medications"],
  ["JourneyLite", "Pricing and financing", "JourneyLite's pricing page explains medication visit pricing, insurance questions, HSA/FSA considerations, and financing references.", "JourneyLite pricing and financing", "/services/pricing-financing"],
];

const locations = [
  ["Cincinnati", "Main office and surgery center access", "/#locations"],
  ["Dayton", "Regional consultation support", "/#locations"],
  ["Columbus", "Central Ohio office access", "/#locations"],
  ["Northern Kentucky", "Kentucky patient access", "/#locations"],
  ["Indianapolis", "Indiana regional support", "/#locations"],
];

const faqs: MedicationFaq[] = [
  {
    question: "What prescription weight loss medications does JourneyLite discuss?",
    answer:
      "JourneyLite may discuss oral medications such as phentermine, Qsymia, Contrave, and orlistat, as well as injectable options such as Wegovy and Zepbound. Specific medication fit depends on provider evaluation, medical history, contraindications, coverage, and access.",
  },
  {
    question: "What is the difference between Wegovy and Zepbound?",
    answer:
      "Wegovy is a semaglutide GLP-1 medication, while Zepbound is a tirzepatide GIP/GLP-1 medication. Both may be discussed as injectable options for eligible patients, but side effects, contraindications, coverage, supply, and individual response can differ.",
  },
  {
    question: "Are oral weight loss medications like phentermine or Qsymia still used?",
    answer:
      "Oral medications may still be discussed for selected patients. Phentermine is generally labeled for short-term use, while Qsymia is a phentermine/topiramate ER combination. A provider should review vitals, contraindications, medication interactions, pregnancy considerations, and follow-up needs.",
  },
  {
    question: "Is Contrave or orlistat an option for weight loss?",
    answer:
      "Contrave and orlistat may be discussion topics for some patients, but they work differently and are not appropriate for everyone. Contrave requires review of medication and health-history risks, while orlistat requires counseling around fat absorption, diet, gastrointestinal side effects, and vitamin considerations.",
  },
  {
    question: "Are weight loss injections better than pills?",
    answer:
      "Not automatically. Some injectable medications have shown larger average results in FDA-reviewed trials, but the best discussion depends on health history, side effects, cost, coverage, access, comfort with injections, and follow-up.",
  },
  {
    question: "How much do Wegovy and Zepbound cost?",
    answer:
      "Costs can vary substantially based on insurance coverage, prior authorization, dose, pharmacy access, savings programs when applicable, and supply. Without coverage, injectable medications can be expensive, so pricing should be reviewed before assuming a path.",
  },
  {
    question: "Does insurance cover weight loss medication?",
    answer:
      "Coverage varies by plan, medication, diagnosis, documentation, and prior authorization requirements. Some plans exclude weight-loss medications, some require step therapy, and some medications may have limited supply.",
  },
  {
    question: "What if my insurance does not cover Wegovy or Zepbound?",
    answer:
      "A consultation can help compare self-pay realities, oral medication discussions, nutrition and follow-up support, gastric balloon, bariatric surgery, or a different medication path if clinically appropriate.",
  },
  {
    question: "Are oral medications cheaper than injections?",
    answer:
      "Oral medications may be lower-cost than injections in some cases, but total cost depends on the medication, visit fees, monitoring, pharmacy pricing, coverage, and whether the medication is appropriate for the patient.",
  },
  {
    question: "How do I know whether medication, gastric balloon, or surgery is right for me?",
    answer:
      "A provider can help compare BMI, health history, prior weight-loss attempts, reflux or GI symptoms, surgery history, goals, cost, coverage, and comfort level. Medication is one tool, while gastric balloon and bariatric surgery may fit different needs.",
  },
  {
    question: "Can I switch from medication to surgery later?",
    answer:
      "Some patients start with medication and later compare surgery or non-surgical procedures. Others may be better served by discussing surgery sooner. A consultation can help compare timing and next steps responsibly.",
  },
  {
    question: "Do I need follow-up visits for medication weight loss?",
    answer:
      "Follow-up may include progress review, side-effect monitoring, dose planning, refill coordination, vitals when relevant, and nutrition or behavior support.",
  },
  {
    question: "What side effects should I ask about?",
    answer:
      "Side effects vary by medication. Patients should ask about common side effects, serious warning signs, medication interactions, and when to contact the office.",
  },
  {
    question: "Can medication help after bariatric surgery?",
    answer:
      "Medication may be one option for some patients with weight regain, plateaus, or maintenance concerns after bariatric surgery. Evaluation may also include nutrition, labs, symptoms, anatomy, and revision options.",
  },
  {
    question: "What if I regained weight after gastric sleeve, bypass, or lap band?",
    answer:
      "JourneyLite can help review your procedure history, weight trend, symptoms, nutrition, labs, and whether medication support, renewed follow-up, or revision evaluation should be discussed.",
  },
  {
    question: "Can I compare medication with gastric sleeve or gastric balloon?",
    answer:
      "Yes. A consultation can help compare medication, gastric sleeve, gastric bypass, gastric balloon, endoscopic options, and revision procedures based on your history and goals.",
  },
  {
    question: "Are results guaranteed?",
    answer:
      "No. Results vary by patient, medication, dose, adherence, side effects, follow-up, nutrition habits, health history, and long-term plan.",
  },
  {
    question: "Can I use HSA, FSA, or financing?",
    answer:
      "HSA/FSA or financing may be available depending on the treatment pathway and current policies. Patients should verify details during consultation.",
  },
  {
    question: "What happens if medication is not a fit for me?",
    answer:
      "JourneyLite can help you discuss other options, which may include nutrition support, non-surgical procedures, bariatric surgery, or revision evaluation depending on your situation.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const medicalWebPageSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "Medication Weight Loss in Ohio",
  description: metadata.description,
  url: "https://journeylite.com/medications",
  about: "Medical weight loss medications",
  medicalAudience: "Patient",
  reviewedBy: {
    "@type": "MedicalOrganization",
    name: "JourneyLite Physicians",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Medication Weight Loss in Ohio",
  serviceType: "Physician-led medication-supported weight loss",
  areaServed: ["Ohio", "Kentucky", "Indiana"],
  provider: {
    "@type": "MedicalOrganization",
    name: "JourneyLite Physicians",
    telephone: phoneNumber,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://journeylite.com/" },
    { "@type": "ListItem", position: 2, name: "Medication Weight Loss", item: "https://journeylite.com/medications" },
  ],
};

export default function MedicationsPage() {
  return (
    <>
      <SiteHeader />
      <main id="overview" className="bg-white pb-20 lg:pb-0">
        {/* Content migration note: consolidates prescription, injectable, oral, post-op support, medication-cost, insurance, review, and regional old content into one custom medication experience. */}
        <Hero />
        <StatsStrip />
        <section className="border-b border-[#edf1ee] bg-white py-6" id="jump">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64736b]">Start where you need</p>
                <h2 className="mt-1 text-xl font-semibold text-[#1f2c25]">Medication page guide</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-[#64736b]">
                Jump to the section that matches your question.
              </p>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {jumpCards.map(([title, href], index) => (
              <Link
                className="group flex min-h-14 items-center gap-3 rounded-lg border border-[#dce4df] bg-[#f8faf8] px-3.5 py-3 transition hover:border-[#145c42] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                href={href}
                key={title}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#145c42] ring-1 ring-[#dce4df]">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold leading-5 text-[#1f2c25]">{title}</span>
                <span className="ml-auto text-lg leading-none text-[#145c42]" aria-hidden="true">&rarr;</span>
              </Link>
            ))}
            </div>
          </div>
        </section>

        <PageSection eyebrow="Quick answer" title="Medication weight loss: the quick answer" tone="soft">
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickFacts.map(([title, copy]) => (
              <InfoCard key={title} title={title}>{copy}</InfoCard>
            ))}
          </div>
          <div className="mt-8">
            <CTAButton href="/contact">Schedule a Medication Consultation</CTAButton>
          </div>
        </PageSection>

        <PageSection
          id="how-it-works"
          eyebrow="Physician-led process"
          title="How medication-supported weight loss works at JourneyLite"
          intro="Medication treatment is not just writing a prescription. A safe program starts with screening, continues with monitoring, and changes based on your response, side effects, goals, coverage, and long-term plan."
          tone="white"
        >
          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            {processSteps.map(([title, copy], index) => (
              <article className="grid gap-4 rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm md:grid-cols-[56px_1fr]" key={title}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf4ef] font-serif text-2xl text-[#145c42]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#53635b]">{copy}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <CTAButton href="/contact">Start With a Consultation</CTAButton>
          </div>
        </PageSection>

        <PageSection
          id="medication-options"
          eyebrow="Medication paths"
          title="Compare medication weight-loss options"
          intro="Use this interactive section to compare the main medication conversations: injectable medications like Wegovy and Zepbound, oral medications like phentermine, Qsymia, Contrave, and orlistat, post-op support, and how medication compares with procedures."
          tone="soft"
        >
          <MedicationOptionExplorer tabs={optionTabs} />
        </PageSection>

        <MedicationSpotlights />
        <ClinicalResultsSection />

        <DetailedOptionSections />

        <PageSection
          id="quiz"
          eyebrow="Interactive guide"
          title="Which medication path should I ask about?"
          intro="Answer a few quick questions to organize what you may want to discuss during consultation."
          tone="soft"
        >
          <MedicationQuiz />
          <p className="mt-4 max-w-3xl text-xs leading-5 text-[#64736b]">
            This quiz is educational only. It does not determine eligibility, diagnose a condition, or replace medical advice.
          </p>
        </PageSection>

        <CandidateAndBenefits />
        <PricingSection />
        <CompareOptionsSection />
        <ResearchSection />
        <RegionalSection />
        <PhysicianSection />
        <TrustSection />

        <PageSection id="faq" eyebrow="FAQs" title="Medication weight loss FAQs" tone="white">
          <MedicationFaqAccordion items={faqs} />
        </PageSection>

        <FinalCta />
        <MobileStickyCta />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden bg-[#f8faf8]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:px-8 lg:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#607067]">Medication-supported care</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.04] text-[#1e2b24] md:text-5xl xl:text-6xl">
            Medication Weight Loss in Ohio
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#41524a]">
            Medication-supported weight loss may help eligible patients manage appetite, cravings, weight regain, or
            long-term progress with physician-led screening and follow-up.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#53635b]">
            JourneyLite helps eligible patients compare oral prescription weight loss medications, injectable medications
            such as Wegovy and Zepbound, and alternatives such as gastric balloon or bariatric surgery across Ohio,
            Kentucky, and Indiana.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTAButton href="/contact">Book Medication Consultation</CTAButton>
            <CTAButton href="#medication-options" variant="secondary">Compare Medication Options</CTAButton>
            <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="#pricing">
              View Medication Pricing
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-5 text-[#64736b]">
            Medication fit depends on provider evaluation, medical history, coverage, access, and follow-up needs.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-xl shadow-[#20372b]/10">
            <Image
              alt="Medication weight loss consultation with JourneyLite provider in Ohio"
              className="h-[360px] w-full object-cover"
              height={820}
              priority
              src="/weight-loss-meds-stock.jpg"
              width={980}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="border-y border-[#dce4df] bg-white">
      <div className="mx-auto grid max-w-7xl gap-0 px-5 lg:grid-cols-4 lg:px-8">
        {stats.map(([value, label, microcopy]) => (
          <article className="border-b border-[#edf1ee] py-5 lg:border-b-0 lg:border-r lg:px-5 last:lg:border-r-0" key={value}>
            <p className="font-serif text-3xl text-[#145c42]">{value}</p>
            <h2 className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#1f2c25]">{label}</h2>
            <p className="mt-2 text-sm leading-5 text-[#64736b]">{microcopy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MedicationSpotlights() {
  return (
    <PageSection
      id="medication-spotlights"
      eyebrow="Medication names"
      title="Medication options patients often ask about"
      intro="These spotlights make common medication names easier to compare before consultation. They are educational only and do not mean a specific medication is right for every patient."
      tone="white"
    >
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {medicationSpotlights.map((med) => (
          <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm" key={med.name}>
            {med.image ? (
              <Image alt={med.alt} className="h-44 w-full object-cover" height={360} src={med.image} width={520} />
            ) : (
              <div className="flex h-44 items-center justify-center bg-[#edf4ef]">
                <span className="rounded-full border border-[#cbd7d0] bg-white px-5 py-4 font-serif text-3xl text-[#145c42]">
                  {med.name.slice(0, 2)}
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64736b]">{med.type}</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#1f2c25]">{med.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#53635b]">{med.summary}</p>
              <div className="mt-4 rounded-lg border border-[#cbd9d1] bg-[#edf4ef] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">Clinical results context</p>
                <p className="mt-2 text-sm leading-6 text-[#355346]">{med.result}</p>
              </div>
              <h4 className="mt-5 text-sm font-semibold text-[#1f2c25]">Questions to ask your provider</h4>
              <ul className="mt-3 grid gap-2">
                {med.questions.map((question) => (
                  <li className="flex gap-2 text-sm leading-5 text-[#53635b]" key={question}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#145c42]" aria-hidden="true" />
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
              <Link className="mt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={med.href}>
                Learn where {med.name} fits
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageSection>
  );
}

function ClinicalResultsSection() {
  return (
    <PageSection
      id="clinical-results"
      eyebrow="Clinical trial context"
      title="What results have been shown in clinical trials?"
      intro="Weight loss medication results vary widely. Some newer injectable medications have shown larger average weight-loss outcomes in FDA-reviewed trials, while some oral medications show more modest results or are intended for short-term use."
      tone="soft"
    >
      <div className="mt-6 rounded-2xl border border-[#d7e3dc] bg-white p-5 shadow-sm">
        <p className="max-w-5xl text-sm leading-6 text-[#53635b]">
          Clinical trial results are averages from specific study populations and do not guarantee individual outcomes.
          Results can vary based on medication, dose, adherence, nutrition, activity, side effects, medical history,
          insurance access, and follow-up care.
        </p>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-[#dce4df] text-left text-sm">
            <thead className="bg-[#f7f8f6] text-xs uppercase tracking-[0.1em] text-[#64736b]">
              <tr>
                <th className="px-5 py-4 font-semibold">Medication</th>
                <th className="px-5 py-4 font-semibold">Route</th>
                <th className="px-5 py-4 font-semibold">Trial result summary</th>
                <th className="px-5 py-4 font-semibold">Best wording</th>
                <th className="px-5 py-4 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ee]">
              {resultRows.map((row) => (
                <tr key={row.medication}>
                  <td className="px-5 py-4 font-semibold text-[#1f2c25]">{row.medication}</td>
                  <td className="px-5 py-4 text-[#53635b]">{row.route}</td>
                  <td className="px-5 py-4 text-[#53635b]">{row.summary}</td>
                  <td className="px-5 py-4 text-[#53635b]">{row.wording}</td>
                  <td className="px-5 py-4">
                    <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={row.href} rel="noreferrer" target="_blank">
                      {row.source}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid lg:hidden">
          {resultRows.map((row) => (
            <article className="border-b border-[#edf1ee] p-5 last:border-b-0" key={row.medication}>
              <h3 className="text-xl font-semibold text-[#1f2c25]">{row.medication}</h3>
              <p className="mt-1 text-sm font-semibold text-[#145c42]">{row.route}</p>
              <p className="mt-3 text-sm leading-6 text-[#53635b]">{row.summary}</p>
              <p className="mt-2 text-sm leading-6 text-[#53635b]">{row.wording}</p>
              <a className="mt-4 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={row.href} rel="noreferrer" target="_blank">
                {row.source}
              </a>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <CTAButton href="#medication-options">Compare Medication Options</CTAButton>
        <CTAButton href="/contact" variant="secondary">Book Medication Consultation</CTAButton>
        <CTAButton href="#pricing" variant="secondary">View Medication Pricing</CTAButton>
      </div>
    </PageSection>
  );
}

function DetailedOptionSections() {
  return (
    <>
      <PageSection
        id="injectable-medications"
        eyebrow="Injectable options"
        title="Injectable weight loss medications"
        intro="Injectable weight-loss medications may support appetite regulation and metabolic weight-loss goals for eligible patients with structured follow-up. Some options are taken weekly, depending on the medication prescribed."
        tone="white"
      >
        <SplitVisual image="/Semaglutide.webp" alt="Injectable weight loss medication options discussed during physician-led consultation">
          <p>
            Patients may ask about semaglutide-based or tirzepatide-based options, including Wegovy and Zepbound. A
            JourneyLite provider determines whether a specific medication is appropriate.
          </p>
          <p>
            Some injectable medications act on hormone pathways involved in appetite, fullness, digestion speed, and
            blood sugar regulation. For some eligible patients, this may help reduce appetite, improve fullness cues, or
            support lower calorie intake when paired with medical guidance and lifestyle work.
          </p>
          <p className="text-sm text-[#64736b]">
            Do not assume a specific medication is available, covered, or appropriate until a provider reviews your situation.
          </p>
        </SplitVisual>
        <GridSet title="What follow-up may include" items={injectableFollowUp} />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Checklist title="Injectable medications may be worth discussing if..." items={[
            "You prefer medication-supported care over a procedure",
            "You want help with appetite or cravings",
            "You want a structured plan with monitoring",
            "You are comparing medication with surgery or non-surgical options",
            "You understand coverage, access, and supply may vary",
          ]} />
          <GridSet compact title="Important considerations" items={injectableConsiderations} />
        </div>
        <div className="mt-8">
          <CTAButton href="/contact">Ask About Injectable Options</CTAButton>
        </div>
      </PageSection>

      <PageSection
        id="oral-medications"
        eyebrow="Oral options"
        title="Oral weight loss medications"
        intro="Oral weight-loss medications may help selected patients manage appetite, cravings, or momentum with provider screening and monitoring."
        tone="soft"
      >
        <SplitVisual image="/Phentermine.jpg" alt="Oral weight loss medication options with medical monitoring and follow-up" reverse>
          <p>
            Patients may ask about Phentermine / Adipex, Qsymia, Contrave, and orlistat. These are oral
            medication-supported options, not surgical or procedural options.
          </p>
          <p>
            Different oral medications work in different ways. Some may affect appetite, cravings, reward pathways, or
            fullness signals. Because oral medications can interact with medical conditions or other prescriptions,
            screening and follow-up are especially important.
          </p>
        </SplitVisual>
        <GridSet title="What follow-up may include" items={oralFollowUp} />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Checklist title="Oral medications may be worth discussing if..." items={[
            "You prefer a pill-based option",
            "Your medical history may support oral medication use",
            "You want structured support without a procedure",
            "You are comparing oral and injectable medication options",
            "You want to understand cost and coverage differences",
          ]} />
          <GridSet compact title="Important considerations" items={oralConsiderations} />
        </div>
        <div className="mt-8">
          <CTAButton href="/contact">Ask About Oral Options</CTAButton>
        </div>
      </PageSection>

      <PageSection
        id="post-op-support"
        eyebrow="After bariatric surgery"
        title="Medication support after bariatric surgery"
        intro="Weight regain, plateaus, or maintenance struggles can happen after bariatric surgery. Medication support may be one part of a renewed care plan, but evaluation should also consider nutrition, labs, habits, anatomy, prior procedure type, symptoms, and whether revision options should be discussed."
        tone="white"
      >
        <SplitVisual image="/weigt-consult-featured.jpg" alt="Post-op weight regain support after bariatric surgery">
          <p>
            This is a different conversation than starting medication for the first time. Post-op patients often need a
            careful review of surgery history, symptoms, labs, nutrition, lowest weight, current trend, and whether
            anatomy should be evaluated.
          </p>
          <p>
            Medication may help some post-op patients, but it is not always the only option. Some patients may need
            renewed nutrition support, medication adjustment, anatomic evaluation, or a revision consultation.
          </p>
        </SplitVisual>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <GridSet title="When post-op patients may seek support" items={postOpSeekSupport} />
          <GridSet title="What JourneyLite may review" items={postOpReview} />
        </div>
        <div className="mt-8 rounded-2xl border border-[#dce4df] bg-[#f8faf8] p-5">
          <h3 className="text-2xl font-semibold text-[#1f2c25]">Medication support vs revision evaluation</h3>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[#53635b]">
            JourneyLite can help patients compare medication support, renewed follow-up, nutrition review, diagnostic
            workup, and revision surgery options responsibly.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {postOpLinks.map(([label, href]) => (
              <Link className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#145c42] hover:border-[#145c42]" href={href} key={label}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <CTAButton href="/contact">Get Help With Weight Regain</CTAButton>
        </div>
      </PageSection>
    </>
  );
}

function CandidateAndBenefits() {
  return (
    <>
      <PageSection id="candidate-fit" eyebrow="Candidate fit" title="Who may be a candidate for medication-supported weight loss?" tone="white">
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Checklist title="Medication may be worth discussing if..." items={candidateItems} />
          <Checklist title="Medication may not be appropriate if..." items={notCandidateItems} />
        </div>
        <p className="mt-5 rounded-lg border border-[#dce4df] bg-[#f8faf8] p-4 text-sm leading-6 text-[#53635b]">
          Only a provider can determine whether medication-supported care is appropriate.
        </p>
        <div className="mt-6">
          <CTAButton href="/contact">Schedule a Medication Evaluation</CTAButton>
        </div>
      </PageSection>

      <PageSection eyebrow="Balanced expectations" title="Benefits and responsibilities of medication-supported care" tone="soft">
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <GridSet title="Potential benefits" items={benefits} />
          <GridSet title="Important responsibilities" items={responsibilities} />
        </div>
        <div className="mt-8">
          <CTAButton href="/contact">Talk Through Benefits and Risks</CTAButton>
        </div>
      </PageSection>
    </>
  );
}

function PricingSection() {
  return (
    <PageSection
      id="pricing"
      eyebrow="Pricing and coverage"
      title="Medication pricing, insurance, and financing"
      intro="Medication pricing can vary based on medication choice, dose, insurance coverage, prior authorization, pharmacy access, medication supply, and follow-up needs. JourneyLite can help patients understand what questions to ask and what options may be available."
      tone="white"
    >
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pricingCards.map(([title, copy]) => (
          <InfoCard key={title} title={title}>{copy}</InfoCard>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <CTAButton href="/services/pricing-financing">Check Insurance & Financing</CTAButton>
        <CTAButton href="/services/pricing-financing" variant="secondary">View Pricing</CTAButton>
        <CTAButton href="/contact" variant="secondary">Book Consultation</CTAButton>
      </div>
    </PageSection>
  );
}

function CompareOptionsSection() {
  return (
    <PageSection
      id="compare-options"
      eyebrow="Compare options"
      title="How medication compares with other weight-loss options"
      intro="Medication-supported care is one path. A consultation can help compare medication, non-surgical procedures, bariatric surgery, and revision support based on health history, goals, cost, coverage, and follow-up expectations."
      tone="soft"
    >
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {comparisonRows.map(([option, type, mayFit, considerations, href, cta]) => (
          <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={option}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#1f2c25]">{option}</h3>
                <p className="mt-1 text-sm font-semibold text-[#145c42]">{type}</p>
              </div>
              <Link className="text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
                {cta}
              </Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#53635b]"><span className="font-semibold text-[#1f2c25]">May be discussed by patients who: </span>{mayFit}</p>
            <p className="mt-2 text-sm leading-6 text-[#53635b]"><span className="font-semibold text-[#1f2c25]">Key considerations: </span>{considerations}</p>
          </article>
        ))}
      </div>
    </PageSection>
  );
}

function ResearchSection() {
  return (
    <PageSection
      id="research"
      eyebrow="Sources"
      title="Research-backed context for medication weight loss"
      intro="Medical weight-loss decisions should be based on reliable information and individualized clinical review. These resources provide context for discussion, but they do not determine whether a specific medication is right for you."
      tone="white"
    >
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sourceCards.map(([source, title, copy, label, href]) => (
          <article className="flex h-full flex-col rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm" key={href}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64736b]">{source}</p>
            <h3 className="mt-2 text-lg font-semibold text-[#1f2c25]">{title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-[#53635b]">{copy}</p>
            {href.startsWith("http") ? (
              <a className="mt-4 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href} rel="noreferrer" target="_blank">
                {label}
              </a>
            ) : (
              <Link className="mt-4 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
                {label}
              </Link>
            )}
          </article>
        ))}
      </div>
      <p className="mt-5 max-w-3xl text-xs leading-5 text-[#64736b]">
        Clinical trial results provide context and are not a promise of individual results.
      </p>
    </PageSection>
  );
}

function RegionalSection() {
  return (
    <PageSection
      eyebrow="Regional support"
      title="Medication weight-loss support across Ohio, Kentucky, and Indiana"
      intro="JourneyLite supports patients considering medication weight loss across Cincinnati, Dayton, Columbus, Northern Kentucky, Indianapolis, and surrounding communities. The Cincinnati main office and JourneyLite Surgery Center anchor the practice, with regional offices supporting consultations and follow-up where appropriate."
      tone="soft"
    >
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {locations.map(([city, copy, href]) => (
          <Link className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm hover:border-[#145c42]" href={href} key={city}>
            <h3 className="text-lg font-semibold text-[#1f2c25]">{city}</h3>
            <p className="mt-2 text-sm leading-6 text-[#53635b]">{copy}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <CTAButton href="/#locations">Find a Location</CTAButton>
      </div>
    </PageSection>
  );
}

function PhysicianSection() {
  return (
    <PageSection
      id="physicians"
      eyebrow="Physician-led care"
      title="Physician-led screening and follow-up"
      intro="JourneyLite's care team helps patients evaluate medication eligibility, contraindications, side effects, dose planning, progress, coverage questions, and long-term support. Medication decisions should be made with a clinician who understands bariatric care, medical weight loss, and post-op patient needs."
      tone="white"
    >
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {physicianCards.slice(0, 2).map((physician) => (
          <article className="grid gap-5 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-sm sm:grid-cols-[140px_1fr]" key={physician.name}>
            <Image
              alt={physician.avatarAlt}
              className="h-[170px] w-full rounded-xl object-cover sm:h-full"
              height={420}
              src={physician.imageSrc}
              width={360}
            />
            <div>
              <h3 className="text-2xl font-semibold text-[#1f2c25]">{physician.name}</h3>
              <p className="mt-1 text-sm font-semibold text-[#145c42]">{physician.primaryTitle}</p>
              <p className="mt-3 text-sm leading-6 text-[#53635b]">{physician.credibility}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#64736b]">Areas of focus</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {physician.clinicalFocus.slice(0, 4).map((focus) => (
                  <span className="rounded-full bg-[#edf4ef] px-3 py-1 text-xs font-semibold text-[#355346]" key={focus}>
                    {focus}
                  </span>
                ))}
              </div>
              <Link className="mt-4 inline-flex text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/our-team">
                {physician.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <CTAButton href="/our-team" variant="secondary">Meet the Physicians</CTAButton>
        <CTAButton href="/contact">Book Consultation</CTAButton>
      </div>
    </PageSection>
  );
}

function TrustSection() {
  return (
    <PageSection
      eyebrow="Patient trust"
      title="A care experience built around follow-up"
      intro="Patient feedback can help show the communication, follow-up, and care experience patients describe. Reviews do not guarantee outcomes, but they can help patients understand what the care process may feel like."
      tone="soft"
    >
      <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <a className="rounded-2xl border border-[#dce4df] bg-white p-6 shadow-sm hover:border-[#145c42]" href={reviewBadge.href} rel="noreferrer" target="_blank">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#64736b]">{reviewBadge.category}</p>
          <p className="mt-4 font-serif text-6xl text-[#145c42]">{reviewBadge.rating}</p>
          <p className="mt-2 text-xl font-semibold text-[#1f2c25]">{reviewBadge.title}</p>
          <p className="mt-1 text-sm text-[#53635b]">{reviewBadge.reviews}</p>
        </a>
        <div className="grid gap-4 md:grid-cols-3">
          {reviewCards.slice(0, 3).map((review) => (
            <blockquote className="rounded-xl border border-[#dce4df] bg-white p-5 text-sm leading-6 text-[#53635b] shadow-sm" key={review.name}>
              <span aria-hidden="true">&quot;</span>{review.excerpt}<span aria-hidden="true">&quot;</span>
              <footer className="mt-4 font-semibold text-[#1f2c25]">- {review.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </PageSection>
  );
}

function FinalCta() {
  return (
    <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b9d2c5]">Next step</p>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
          Not sure which medication path fits?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
          Medication-supported care can look different from patient to patient. JourneyLite can help you compare oral
          medications, injectable medications, post-op support, and other weight-loss options based on your health
          history, goals, coverage, and long-term plan.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#b9d2c5]">
          This page is for educational purposes only and does not determine eligibility, diagnose a condition, or replace
          medical advice. A JourneyLite provider can review your health history and help determine whether
          medication-supported care or another option may be appropriate.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <CTAButton href="/contact" variant="light">Book Consultation</CTAButton>
          <CTAButton href="/services/compare-weight-loss-options" variant="outline">Compare Treatment Options</CTAButton>
          <CTAButton href={phoneHref} variant="outline">Call {phoneNumber}</CTAButton>
        </div>
      </div>
    </section>
  );
}

function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dce4df] bg-white/95 px-4 py-3 shadow-lg backdrop-blur lg:hidden">
      <div className="grid grid-cols-2 gap-2">
        <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-3 py-2 text-sm font-semibold text-white" href="/contact">
          Book Consultation
        </Link>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd7d0] bg-white px-3 py-2 text-sm font-semibold text-[#17362a]" href={phoneHref}>
          Call
        </Link>
      </div>
    </div>
  );
}

function PageSection({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "white",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  tone?: "white" | "soft";
}) {
  return (
    <section className={`${tone === "soft" ? "bg-[#f7f8f6]" : "bg-white"} scroll-mt-24 py-12 lg:py-16`} id={id}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64736b]">{eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#1f2c25] md:text-4xl">{title}</h2>
          {intro ? <p className="mt-4 text-base leading-7 text-[#53635b]">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#1f2c25]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#53635b]">{children}</p>
    </article>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1f2c25]">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li className="flex gap-3 text-sm leading-6 text-[#53635b]" key={item}>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#145c42]" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function GridSet({ title, items, compact = false }: { title: string; items: string[]; compact?: boolean }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-[#1f2c25]">{title}</h3>
      <div className={`mt-4 grid gap-3 ${compact ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {items.map((item) => (
          <article className="rounded-xl border border-[#dce4df] bg-white p-4 text-sm font-semibold leading-6 text-[#355346] shadow-sm" key={item}>
            {item}
          </article>
        ))}
      </div>
    </div>
  );
}

function SplitVisual({
  image,
  alt,
  children,
  reverse = false,
}: {
  image: string;
  alt: string;
  children: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="mt-8 grid gap-7 lg:grid-cols-2 lg:items-center">
      <div className={`space-y-4 text-base leading-8 text-[#53635b] ${reverse ? "lg:order-2" : ""}`}>{children}</div>
      <div className={`overflow-hidden rounded-2xl border border-[#dce4df] bg-[#f8faf8] shadow-sm ${reverse ? "lg:order-1" : ""}`}>
        <Image alt={alt} className="h-[320px] w-full object-cover" height={720} src={image} width={900} />
      </div>
    </div>
  );
}
