import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'Weight Loss Medications | WeGovy, Zepbound, Adipex | JourneyLite',
  description: 'Medical weight loss with WeGovy (semaglutide), Zepbound (tirzepatide), and Adipex (phentermine) at JourneyLite. Special self-pay pricing. Physician-supervised in OH, IN & KY.',
  keywords: ['WeGovy Cincinnati', 'Zepbound Ohio', 'semaglutide weight loss', 'GLP-1 medications', 'Adipex phentermine Ohio'],
  alternates: { canonical: 'https://journeylite.com/medications' }
}

const meds = [
  {
    name: 'WeGovy® (Semaglutide)',
    type: 'GLP-1 Receptor Agonist',
    admin: 'Weekly injection',
    weightLoss: '~15% body weight on average',
    fda: 'FDA-approved for chronic weight management',
    desc: 'WeGovy contains semaglutide, the same active ingredient in Ozempic®, but at a higher dose specifically approved for weight management. It works by mimicking a gut hormone that reduces appetite and slows digestion.',
    id: 'wegovy',
    color: 'green',
  },
  {
    name: 'Zepbound® (Tirzepatide)',
    type: 'GLP-1 / GIP Dual Agonist',
    admin: 'Weekly injection',
    weightLoss: '~20% body weight on average',
    fda: 'FDA-approved for chronic weight management',
    desc: 'Zepbound (tirzepatide) is the same medication as Mounjaro® at FDA-approved weight loss doses. As a dual GLP-1/GIP agonist, it offers slightly greater average weight loss than semaglutide-based medications.',
    id: 'zepbound',
    color: 'blue',
  },
  {
    name: 'Adipex® (Phentermine)',
    type: 'Appetite Suppressant',
    admin: 'Daily oral tablet',
    weightLoss: 'Short-term aid; varies',
    fda: 'FDA-approved for short-term weight management',
    desc: 'Phentermine is one of the most widely prescribed weight loss medications, suppressing appetite through the central nervous system. It\'s typically used short-term alongside lifestyle modifications.',
    id: 'adipex',
    color: 'green',
  },
]

export default function Medications() {
  return (
    <>
      <Navbar />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <p className="section-label">Medical Weight Loss</p>
            <h1 className={styles.h1}>GLP-1 Medications & Medical Weight Loss</h1>
            <p className={styles.heroSub}>
              JourneyLite has one of the most experienced medical weight loss teams in the Midwest. We offer physician-supervised GLP-1 programs with special self-pay pricing for patients without insurance coverage.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:28}}>
              <Link href="/appointment" className="btn btn-primary">Book Medical Weight Loss Consult</Link>
              <a href="tel:8558657144" className="btn btn-outline">(855) 865-7144</a>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.medGrid}>
              {meds.map(m => (
                <div key={m.name} id={m.id} className={styles.medCard}>
                  <div className={styles.medHeader}>
                    <div>
                      <span className={`badge ${m.color === 'green' ? 'badge-green' : 'badge-blue'}`}>{m.type}</span>
                      <h2 className={styles.medName}>{m.name}</h2>
                    </div>
                  </div>
                  <p className={styles.medDesc}>{m.desc}</p>
                  <div className={styles.medFacts}>
                    {[
                      ['Administration', m.admin],
                      ['Avg. Weight Loss', m.weightLoss],
                      ['Status', m.fda],
                    ].map(([k, v]) => (
                      <div key={k} className={styles.medFact}>
                        <span className={styles.medFactKey}>{k}</span>
                        <span className={styles.medFactVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/appointment" className={`btn ${m.color === 'green' ? 'btn-primary' : 'btn-blue'}`} style={{marginTop:20}}>
                    Ask About {m.name.split('®')[0]} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Surgery vs Meds comparison */}
        <section className={styles.compare}>
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Informed Decision</p>
              <h2 className={styles.h2}>Surgery vs. GLP-1 Medications: Which is Right for You?</h2>
              <p className={styles.sectionSub}>Both options can be effective. The best choice depends on your BMI, health conditions, goals, and preferences.</p>
            </div>
            <div className={styles.compareTable}>
              <div className={styles.compareHeader}>
                <div />
                <div className={styles.compareColHead}>GLP-1 Medications</div>
                <div className={styles.compareColHead} style={{background:'var(--green)',color:'#fff'}}>Bariatric Surgery</div>
              </div>
              {[
                ['Average Weight Loss', '10–20% body weight', '60–80% excess weight'],
                ['Durability', 'Requires ongoing medication', 'Permanent structural change'],
                ['Insurance Coverage', 'Often limited/excluded', 'More widely covered'],
                ['Recovery Time', 'None', '1–4 weeks'],
                ['Cost (no insurance)', '$900–$1,500/month ongoing', '$10,000 one-time (VSG)'],
                ['Risk of Complications', 'GI side effects common', 'Low with experienced surgeon'],
                ['Diabetes Resolution', 'Improvement', 'Often complete resolution'],
              ].map(([feat, med, surg]) => (
                <div key={feat} className={styles.compareRow}>
                  <div className={styles.compareFeat}>{feat}</div>
                  <div className={styles.compareCell}>{med}</div>
                  <div className={`${styles.compareCell} ${styles.compareCellGreen}`}>{surg}</div>
                </div>
              ))}
            </div>
            <p style={{textAlign:'center',fontSize:13,color:'var(--text-muted)',marginTop:16}}>Individual results vary. Consult with a JourneyLite physician to determine the best approach for your situation.</p>
          </div>
        </section>

        <section style={{background:'linear-gradient(135deg,var(--green-dark),var(--green))',padding:'64px 0',textAlign:'center'}}>
          <div className="container">
            <h2 style={{color:'#fff',marginBottom:12,fontSize:'2rem'}}>Unsure Which Option is Right for You?</h2>
            <p style={{color:'rgba(255,255,255,0.85)',maxWidth:480,margin:'0 auto 32px',lineHeight:1.7}}>Book a free consultation with Dr. Curry or Dr. Augusta. They'll review your medical history and help you make the best decision.</p>
            <Link href="/appointment" className="btn btn-white" style={{fontSize:'16px'}}>Book Free Consultation →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
