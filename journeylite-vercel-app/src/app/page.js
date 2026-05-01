import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'JourneyLite | #1 Weight Loss Surgery Center in Ohio, Indiana & Kentucky',
  description: 'Board-certified bariatric surgeons with 6,000+ procedures. Gastric Sleeve from $10,000. Gastric Bypass, SADI, Lap Band, and GLP-1 medications. 5 locations. Free insurance check.',
  alternates: { canonical: 'https://journeylite.com' }
}

const procedures = [
  {
    icon: '🔹',
    name: 'Gastric Sleeve (VSG)',
    price: 'From $10,000',
    desc: 'Removes a portion of the stomach to create a smaller, sleeve-shaped organ — reducing hunger and food intake without rerouting intestines.',
    href: '/gastric-sleeve',
    badge: 'Most Popular',
    badgeColor: 'green',
  },
  {
    icon: '🔸',
    name: 'Gastric Bypass',
    price: 'Self-pay pricing',
    desc: 'The gold-standard Roux-en-Y procedure decreases stomach size and modifies the digestive tract for maximum weight loss and metabolic improvement.',
    href: '/gastric-bypass',
    badge: 'Gold Standard',
    badgeColor: 'blue',
  },
  {
    icon: '🔷',
    name: 'SADI Surgery',
    price: 'Self-pay pricing',
    desc: 'A streamlined duodenal switch with a single intestinal connection — significant weight loss with fewer complications than traditional DS.',
    href: '/sadi-surgery',
    badge: 'Advanced',
    badgeColor: 'green',
  },
  {
    icon: '🟦',
    name: 'Lap Band',
    price: 'Self-pay pricing',
    desc: 'Minimally invasive adjustable gastric banding — a silicone band around the upper stomach creates a smaller pouch for earlier satiety.',
    href: '/lap-band',
    badge: 'Adjustable',
    badgeColor: 'blue',
  },
  {
    icon: '🔄',
    name: 'Sleeve Revision',
    price: 'Self-pay pricing',
    desc: 'Adjust or convert your initial gastric sleeve if you\'re experiencing issues or seeking improved outcomes. Low complication rate.',
    href: '/sleeve-revision',
    badge: 'Revision',
    badgeColor: 'green',
  },
  {
    icon: '💊',
    name: 'GLP-1 Medications',
    price: 'Special self-pay rates',
    desc: 'WeGovy, Zepbound, and Adipex — medical weight loss for those who prefer non-surgical solutions with physician oversight.',
    href: '/medications',
    badge: 'Non-Surgical',
    badgeColor: 'blue',
  },
]

const stats = [
  { num: '6,000+', label: 'Gastric Sleeves Performed', icon: '✅' },
  { num: '20+', label: 'Years of Experience', icon: '🏅' },
  { num: '5', label: 'Locations in 3 States', icon: '📍' },
  { num: '12,000', label: 'sq ft Dedicated Facility', icon: '🏥' },
]

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Cincinnati, OH',
    quote: 'JourneyLite changed my life. I lost 110 lbs after my gastric sleeve and have kept it off for 3 years. Dr. Curry and his team were with me every step of the way.',
    lost: '110 lbs',
    procedure: 'Gastric Sleeve'
  },
  {
    name: 'James T.',
    location: 'Indianapolis, IN',
    quote: 'I\'d struggled with weight my whole life. After gastric bypass with Dr. Augusta, I\'m off diabetes medication and feel 20 years younger. Worth every penny.',
    lost: '145 lbs',
    procedure: 'Gastric Bypass'
  },
  {
    name: 'Linda K.',
    location: 'Columbus, OH',
    quote: 'I was nervous about surgery, so I started with WeGovy through JourneyLite. They helped me lose 45 lbs medically, and I feel amazing. The team is so supportive.',
    lost: '45 lbs',
    procedure: 'Medical (WeGovy)'
  },
]

const faqs = [
  {
    q: 'Do I qualify for bariatric surgery?',
    a: 'The American Society for Metabolic and Bariatric Surgery recommends bariatric surgery for anyone with a BMI of 35 or greater, and for some patients with a BMI of 30–35 who have obesity-related health conditions like diabetes or sleep apnea.'
  },
  {
    q: 'What does weight loss surgery cost?',
    a: 'JourneyLite\'s gastric sleeve starts at just $10,000 for self-pay patients — one of the most competitive prices in the region. We also accept most major insurance plans and offer financing options.'
  },
  {
    q: 'How long is recovery after gastric sleeve or bypass?',
    a: 'Most patients return to desk work within 1–2 weeks and full activity within 4–6 weeks. JourneyLite\'s outpatient surgery center allows most patients to go home the same day.'
  },
  {
    q: 'Does JourneyLite offer GLP-1 medications like WeGovy or Zepbound?',
    a: 'Yes! JourneyLite has one of the most experienced medical weight loss teams in the Midwest. We offer WeGovy, Zepbound, Adipex, and other medications with special self-pay pricing for those without insurance coverage.'
  },
]

const locations = [
  { city: 'Cincinnati', state: 'OH', note: 'Main Surgery Center' },
  { city: 'Columbus', state: 'OH', note: 'Consultations & Follow-up' },
  { city: 'Dayton', state: 'OH', note: 'Consultations & Follow-up' },
  { city: 'Indianapolis', state: 'IN', note: 'Full Service Location' },
  { city: 'Northern Kentucky', state: 'KY', note: 'Greater Cincinnati Area' },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true">
            <div className={styles.heroBlob1} />
            <div className={styles.heroBlob2} />
            <div className={styles.heroGrid} />
          </div>
          <div className="container">
            <div className={styles.heroInner}>
              <div className={styles.heroContent}>
                <div className={`badge badge-green fade-up ${styles.heroBadge}`}>
                  <span>🏆</span> MBSAQIP Accredited Center of Excellence
                </div>
                <h1 className={`fade-up-1 ${styles.heroH1}`}>
                  Your Journey to <em className={styles.heroEm}>Lasting</em> Weight Loss Starts Here
                </h1>
                <p className={`fade-up-2 ${styles.heroSub}`}>
                  Board-certified surgeons with <strong>6,000+ procedures</strong>. Gastric Sleeve, Bypass, SADI, GLP-1 medications, and more — at 5 locations across Ohio, Indiana & Kentucky.
                </p>
                <div className={`fade-up-3 ${styles.heroCtas}`}>
                  <Link href="/appointment" className="btn btn-primary" style={{fontSize:'16px',padding:'16px 32px'}}>
                    Book Free Consultation →
                  </Link>
                  <Link href="/pricing" className="btn btn-outline">
                    See Pricing & Insurance
                  </Link>
                </div>
                <div className={`fade-up-4 ${styles.heroTrust}`}>
                  <span>✅ Insurance accepted</span>
                  <span>✅ Self-pay from $10,000</span>
                  <span>✅ Financing available</span>
                </div>
              </div>
              <div className={`fade-up-2 ${styles.heroCard}`}>
                <div className={styles.heroCardInner}>
                  <div className={styles.heroCardBadge}>🔥 Limited Time</div>
                  <h2 className={styles.heroCardTitle}>Gastric Sleeve</h2>
                  <div className={styles.heroCardPrice}>
                    <span className={styles.heroCardPriceNum}>$10,000</span>
                    <span className={styles.heroCardPriceSub}>self-pay</span>
                  </div>
                  <p className={styles.heroCardDesc}>One of the lowest prices in the Midwest — no hidden fees, transparent care.</p>
                  <Link href="/gastric-sleeve" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>
                    Learn More →
                  </Link>
                  <div className={styles.heroCardAlso}>
                    <span>Also:</span>
                    <Link href="/allurion-balloon">Allurion Balloon from $4,000</Link>
                  </div>
                  <div className={styles.heroCardAccred}>
                    <span>🏅 Anthem Blue Distinction+</span>
                    <span>🏅 United Optum COE</span>
                    <span>🏅 Aetna Institute of Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className={styles.statsBar}>
          <div className="container">
            <div className={styles.statsGrid}>
              {stats.map(s => (
                <div key={s.num} className={styles.stat}>
                  <span className={styles.statIcon}>{s.icon}</span>
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCEDURES */}
        <section className={styles.procedures} id="procedures">
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className="section-label">Weight Loss Solutions</p>
              <h2 className={styles.sectionTitle}>Surgical & Non-Surgical Options Tailored to You</h2>
              <p className={styles.sectionSub}>
                JourneyLite knows there is no one-size-fits-all approach. We offer surgical, non-surgical, and medical weight loss — designed around your health goals and lifestyle.
              </p>
            </div>
            <div className={styles.procedureGrid}>
              {procedures.map(p => (
                <Link key={p.name} href={p.href} className={styles.procedureCard}>
                  <div className={styles.procedureTop}>
                    <span className={styles.procedureIcon}>{p.icon}</span>
                    <span className={`badge ${p.badgeColor === 'green' ? 'badge-green' : 'badge-blue'}`}>
                      {p.badge}
                    </span>
                  </div>
                  <h3 className={styles.procedureName}>{p.name}</h3>
                  <p className={styles.procedurePrice}>{p.price}</p>
                  <p className={styles.procedureDesc}>{p.desc}</p>
                  <span className={styles.procedureLink}>Learn more →</span>
                </Link>
              ))}
            </div>
            <div className={styles.procedureCta}>
              <Link href="/appointment" className="btn btn-primary">Get Your Free Consultation</Link>
              <Link href="/pricing" className="btn btn-outline">View All Pricing</Link>
            </div>
          </div>
        </section>

        {/* DOCTORS */}
        <section className={styles.doctors}>
          <div className="container">
            <div className={styles.doctorsInner}>
              <div className={styles.doctorsContent}>
                <p className="section-label">Your Expert Surgeons</p>
                <h2 className={styles.sectionTitle}>Meet Cincinnati's Leading Bariatric Surgeons</h2>
                <div className="divider" />
                <div className={styles.doctorCards}>
                  <div className={styles.doctorCard}>
                    <div className={styles.doctorAvatar}>TC</div>
                    <div>
                      <h3 className={styles.doctorName}>Dr. Trace W. Curry, MD</h3>
                      <p className={styles.doctorTitle}>Medical Director, Board-Certified Surgeon</p>
                      <p className={styles.doctorBio}>
                        Cincinnati native with <strong>20+ years</strong> of experience and thousands of advanced laparoscopic surgeries. Pioneered innovative non-surgical obesity treatments in Ohio.
                      </p>
                      <Link href="/about#dr-curry" className={styles.doctorLink}>View Profile →</Link>
                    </div>
                  </div>
                  <div className={styles.doctorCard}>
                    <div className={styles.doctorAvatar} style={{background:'var(--blue)'}}>JA</div>
                    <div>
                      <h3 className={styles.doctorName}>Dr. James Augusta, MD</h3>
                      <p className={styles.doctorTitle}>Minimally Invasive Weight Loss Surgeon</p>
                      <p className={styles.doctorBio}>
                        Specializes in gastric sleeve, gastric bypass, and revisional surgery. Comprehensive training and residency in Ohio with a focus on minimally invasive techniques.
                      </p>
                      <Link href="/about#dr-augusta" className={styles.doctorLink}>View Profile →</Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.doctorsAccred}>
                <h3 className={styles.accredTitle}>Nationally Recognized</h3>
                <div className={styles.accredList}>
                  {[
                    'MBSAQIP Accredited Bariatric Surgery Outpatient Center of Excellence',
                    'Anthem Blue Distinction Plus',
                    'United Health Optum Bariatric Center of Excellence',
                    'Aetna Institute of Quality',
                    'American Society for Metabolic & Bariatric Surgery Member',
                  ].map(a => (
                    <div key={a} className={styles.accredItem}>
                      <span className={styles.accredCheck}>✓</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.accredStat}>
                  <span className={styles.accredStatNum}>6,000+</span>
                  <span className={styles.accredStatLabel}>Gastric Sleeve Procedures Performed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className={styles.testimonials}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className="section-label">Patient Stories</p>
              <h2 className={styles.sectionTitle}>Real People, Real Results</h2>
            </div>
            <div className={styles.testimonialsGrid}>
              {testimonials.map(t => (
                <div key={t.name} className={styles.testimonialCard}>
                  <div className={styles.testimonialLost}>
                    <span className={styles.testimonialLostNum}>{t.lost}</span>
                    <span className={styles.testimonialLostLabel}>lost</span>
                  </div>
                  <p className={styles.testimonialQuote}>"{t.quote}"</p>
                  <div className={styles.testimonialMeta}>
                    <span className={styles.testimonialName}>{t.name}</span>
                    <span className={styles.testimonialLoc}>{t.location} · {t.procedure}</span>
                  </div>
                  <div className={styles.testimonialStars}>★★★★★</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCATIONS */}
        <section className={styles.locationsSection}>
          <div className="container">
            <div className={styles.locationsInner}>
              <div>
                <p className="section-label">Find Us Near You</p>
                <h2 className={styles.sectionTitle}>5 Locations Across 3 States</h2>
                <div className="divider" />
                <p style={{color:'var(--text-muted)', marginBottom:32, maxWidth:420}}>
                  Patients travel from across the country for JourneyLite's quality of care, experience, and affordability.
                </p>
                <div className={styles.locationsList}>
                  {locations.map(l => (
                    <Link key={l.city} href="/locations" className={styles.locationItem}>
                      <span className={styles.locationPin}>📍</span>
                      <div>
                        <span className={styles.locationCity}>{l.city}, {l.state}</span>
                        <span className={styles.locationNote}>{l.note}</span>
                      </div>
                      <span className={styles.locationArrow}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className={styles.locationsCta}>
                <div className={styles.locationsCTABox}>
                  <div className={styles.locationsCTAIcon}>📞</div>
                  <h3>Ready to Get Started?</h3>
                  <p>Call us or book your free consultation online. Our team will help you find the right plan.</p>
                  <a href="tel:8558657144" className="btn btn-white" style={{marginBottom:12,justifyContent:'center',width:'100%'}}>
                    (855) 865-7144
                  </a>
                  <Link href="/appointment" className="btn btn-outline" style={{borderColor:'#fff',color:'#fff',justifyContent:'center',width:'100%'}}>
                    Request Appointment →
                  </Link>
                  <Link href="/pricing" className={styles.insuranceCheck}>
                    Free Insurance Check →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faq}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className="section-label">FAQ</p>
              <h2 className={styles.sectionTitle}>Common Questions About Weight Loss Surgery</h2>
            </div>
            <div className={styles.faqGrid}>
              {faqs.map(f => (
                <div key={f.q} className={styles.faqItem}>
                  <h3 className={styles.faqQ}>{f.q}</h3>
                  <p className={styles.faqA}>{f.a}</p>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:40}}>
              <Link href="/faq" className="btn btn-outline">View All FAQs →</Link>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className={styles.ctaBanner}>
          <div className="container">
            <div className={styles.ctaBannerInner}>
              <div>
                <h2 className={styles.ctaBannerTitle}>Start Your Journey Today</h2>
                <p className={styles.ctaBannerSub}>Free consultation · Insurance check · Transparent pricing · No pressure</p>
              </div>
              <div className={styles.ctaBannerActions}>
                <Link href="/appointment" className="btn btn-white" style={{fontSize:'16px'}}>Book Free Consult →</Link>
                <a href="tel:8558657144" className="btn btn-outline" style={{borderColor:'rgba(255,255,255,0.5)',color:'#fff'}}>
                  (855) 865-7144
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
