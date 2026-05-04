import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'Gastric Sleeve Surgery (VSG) | Only $10,000 | JourneyLite',
  description: 'Gastric sleeve (VSG) surgery starting at $10,000 self-pay at JourneyLite. Board-certified surgeons in Cincinnati, Columbus, Dayton, Indianapolis & Northern Kentucky. 6,000+ procedures performed.',
  keywords: ['gastric sleeve surgery', 'VSG surgery', 'gastric sleeve Cincinnati', 'gastric sleeve cost', 'gastric sleeve $10000'],
  alternates: { canonical: 'https://journeylite.com/gastric-sleeve' },
  openGraph: {
    title: 'Gastric Sleeve Surgery (VSG) | Only $10,000',
    description: 'Safe, effective gastric sleeve surgery from board-certified surgeons. Only $10,000 self-pay. Free consultation.',
  }
}

export default function GastricSleeve() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <div>
                <span className="badge badge-green">Most Popular Procedure</span>
                <h1 className={styles.h1}>Gastric Sleeve Surgery (VSG)</h1>
                <p className={styles.heroSub}>
                  The most commonly performed bariatric surgery in the U.S. — safe, effective, and permanent. JourneyLite has performed over 6,000 gastric sleeve procedures with exceptional outcomes.
                </p>
                <div className={styles.heroCtas}>
                  <Link href="/appointment" className="btn btn-primary">Book Free Consultation</Link>
                  <a href="tel:8558657144" className="btn btn-outline">(855) 865-7144</a>
                </div>
              </div>
              <div className={styles.heroPriceBox}>
                <div className={styles.priceBoxBadge}>🔥 Limited Time Self-Pay</div>
                <div className={styles.price}>$10,000</div>
                <p className={styles.priceNote}>*Price subject to change without notice. Insurance also accepted.</p>
                <Link href="/pricing" className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:16}}>
                  Check Insurance Coverage →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What is VSG */}
        <section className={styles.content}>
          <div className="container">
            <div className={styles.contentGrid}>
              <div className={styles.contentMain}>
                <h2 className={styles.h2}>What is Gastric Sleeve Surgery?</h2>
                <p>During a gastric sleeve (also called vertical sleeve gastrectomy or VSG), our surgeons remove approximately 75–80% of the stomach, creating a smaller, banana-shaped "sleeve." This dramatically reduces the amount of food you can eat and, importantly, removes the portion of the stomach that produces ghrelin — the primary hunger hormone.</p>
                <p>Unlike gastric bypass, the gastric sleeve does <strong>not</strong> reroute the intestines. This makes it a simpler procedure with fewer long-term nutritional concerns, while still delivering excellent weight loss results.</p>

                <h2 className={styles.h2}>How Much Weight Will I Lose?</h2>
                <p>Most patients lose <strong>60–70% of their excess body weight</strong> within 12–18 months after gastric sleeve surgery. Results vary based on your starting weight, commitment to dietary changes, and physical activity.</p>

                <h2 className={styles.h2}>Benefits of Gastric Sleeve</h2>
                <ul className={styles.benefitList}>
                  {[
                    'Significant, sustained weight loss (60-70% excess weight)',
                    'Reduced hunger due to lower ghrelin production',
                    'No intestinal rerouting — simpler recovery',
                    'Improvement or resolution of Type 2 diabetes, sleep apnea, high blood pressure',
                    'Outpatient procedure — most patients go home the same day',
                    'Lower complication risk vs. gastric bypass',
                    'Can be converted to gastric bypass if needed',
                  ].map(b => (
                    <li key={b}><span className={styles.checkmark}>✓</span>{b}</li>
                  ))}
                </ul>

                <h2 className={styles.h2}>Am I a Candidate?</h2>
                <p>You may be a good candidate if you have a BMI of 35 or higher, or a BMI of 30–35 with obesity-related health conditions. During your free consultation, Dr. Curry or Dr. Augusta will evaluate your medical history and goals to determine if VSG is right for you.</p>

                <h2 className={styles.h2}>What to Expect: Your VSG Journey</h2>
                <div className={styles.steps}>
                  {[
                    { step: '1', title: 'Free Consultation', desc: 'Meet with our surgeons to review your history, goals, and determine the best approach.' },
                    { step: '2', title: 'Pre-Op Preparation', desc: 'Complete any required evaluations, attend our pre-op class, and follow your pre-op diet.' },
                    { step: '3', title: 'Surgery Day', desc: 'Laparoscopic procedure takes 60–90 minutes. Most patients go home the same day.' },
                    { step: '4', title: 'Recovery', desc: 'Return to desk work in 1–2 weeks. Follow post-op diet phases. Ongoing support from our team.' },
                    { step: '5', title: 'Long-Term Success', desc: 'Lifetime follow-up, dietary guidance, and community support — JourneyLite is with you for life.' },
                  ].map(s => (
                    <div key={s.step} className={styles.step}>
                      <div className={styles.stepNum}>{s.step}</div>
                      <div>
                        <h4 className={styles.stepTitle}>{s.title}</h4>
                        <p className={styles.stepDesc}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.sideCard}>
                  <h3>Quick Facts</h3>
                  {[
                    ['Procedure Time', '60–90 minutes'],
                    ['Hospital Stay', 'Outpatient (same day)'],
                    ['Return to Work', '1–2 weeks'],
                    ['Weight Loss', '60–70% excess weight'],
                    ['Self-Pay Price', '$10,000'],
                    ['Insurance', 'Most plans accepted'],
                  ].map(([k, v]) => (
                    <div key={k} className={styles.factRow}>
                      <span className={styles.factKey}>{k}</span>
                      <span className={styles.factVal}>{v}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.sideCard} style={{background:'var(--green)',color:'#fff',border:'none'}}>
                  <h3 style={{color:'#fff'}}>Ready to Start?</h3>
                  <p style={{color:'rgba(255,255,255,0.85)',fontSize:14,marginBottom:20}}>Book your free consultation and take the first step toward your new life.</p>
                  <Link href="/appointment" className="btn btn-white" style={{width:'100%',justifyContent:'center'}}>
                    Book Free Consult →
                  </Link>
                  <a href="tel:8558657144" className={styles.sidePhone}>(855) 865-7144</a>
                </div>

                <div className={styles.sideCard}>
                  <h3>Compare Procedures</h3>
                  <p style={{fontSize:14,color:'var(--text-muted)',marginBottom:16}}>Not sure if VSG is right for you? Explore your options.</p>
                  <Link href="/gastric-bypass" className={styles.compareLink}>Gastric Bypass →</Link>
                  <Link href="/sadi-surgery" className={styles.compareLink}>SADI Surgery →</Link>
                  <Link href="/lap-band" className={styles.compareLink}>Lap Band →</Link>
                  <Link href="/medications" className={styles.compareLink}>GLP-1 Medications →</Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{background:'var(--green-pale)',padding:'64px 0'}}>
          <div className="container" style={{textAlign:'center'}}>
            <h2 style={{marginBottom:12,fontSize:'2rem'}}>Ready for Your Gastric Sleeve Consultation?</h2>
            <p style={{color:'var(--text-muted)',marginBottom:32,maxWidth:480,margin:'0 auto 32px'}}>Free consultation. No pressure. Our team will answer every question and help you make the best decision for your health.</p>
            <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/appointment" className="btn btn-primary">Book Free Consultation →</Link>
              <Link href="/pricing" className="btn btn-outline">Insurance & Pricing Info</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
