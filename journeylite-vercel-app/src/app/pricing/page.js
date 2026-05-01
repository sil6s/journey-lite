import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'Weight Loss Surgery Pricing & Financing | JourneyLite',
  description: 'Transparent pricing for gastric sleeve ($10,000), gastric bypass, SADI, and GLP-1 medications. Insurance accepted. Financing available. Free insurance check.',
  alternates: { canonical: 'https://journeylite.com/pricing' }
}

const selfPayPrices = [
  { name: 'Gastric Sleeve (VSG)', price: '$10,000', note: 'Limited time offer', hot: true },
  { name: 'Allurion Gastric Balloon', price: '$4,000', note: 'Non-surgical option', hot: true },
  { name: 'Gastric Bypass', price: 'Call for pricing', note: 'Price varies by case' },
  { name: 'SADI Surgery', price: 'Call for pricing', note: 'Price varies by case' },
  { name: 'Lap Band', price: 'Call for pricing', note: 'Price varies by case' },
  { name: 'Sleeve Revision', price: 'Call for pricing', note: 'Price varies by case' },
  { name: 'Band Revision', price: 'Call for pricing', note: 'Price varies by case' },
  { name: 'WeGovy (Semaglutide)', price: 'Discounted self-pay', note: 'Without insurance' },
  { name: 'Zepbound (Tirzepatide)', price: 'Discounted self-pay', note: 'Without insurance' },
  { name: 'Adipex (Phentermine)', price: 'Call for pricing', note: 'Oral medication' },
]

const insurers = [
  'Anthem Blue Cross Blue Shield', 'United Healthcare', 'Aetna', 'Cigna', 'Humana',
  'Medicare', 'Medicaid (some plans)', 'Medical Mutual', 'SummaCare', 'Molina Healthcare'
]

export default function Pricing() {
  return (
    <>
      <Navbar />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <p className="section-label">Pricing & Financing</p>
            <h1 className={styles.h1}>Transparent Pricing. No Surprises.</h1>
            <p className={styles.heroSub}>
              JourneyLite believes you deserve to know the cost upfront. We offer competitive self-pay pricing, accept most major insurance plans, and provide financing options to fit every budget.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:28}}>
              <Link href="/appointment" className="btn btn-primary">Book Free Insurance Check</Link>
              <a href="tel:8558657144" className="btn btn-outline">(855) 865-7144</a>
            </div>
          </div>
        </section>

        {/* Self-Pay */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Self-Pay Options</p>
              <h2 className={styles.h2}>Competitive Self-Pay Pricing</h2>
              <p className={styles.sectionSub}>Our self-pay prices are among the most competitive in the Midwest — with no compromise on quality of care.</p>
            </div>
            <div className={styles.priceTable}>
              {selfPayPrices.map(p => (
                <div key={p.name} className={`${styles.priceRow} ${p.hot ? styles.priceRowHot : ''}`}>
                  <div>
                    <span className={styles.priceName}>{p.name}</span>
                    {p.hot && <span className="badge badge-green" style={{marginLeft:10,fontSize:11}}>Special Price</span>}
                    <span className={styles.priceNote}>{p.note}</span>
                  </div>
                  <span className={styles.priceAmt}>{p.price}</span>
                </div>
              ))}
            </div>
            <p className={styles.disclaimer}>*Prices subject to change without notice. Call for current pricing and availability.</p>
          </div>
        </section>

        {/* Insurance */}
        <section className={styles.section} style={{background:'var(--stone)'}}>
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Insurance Coverage</p>
              <h2 className={styles.h2}>We Accept Most Major Insurance Plans</h2>
              <p className={styles.sectionSub}>Many insurance plans cover bariatric surgery. Our team will conduct a free insurance check and guide you through the authorization process.</p>
            </div>
            <div className={styles.insurerGrid}>
              {insurers.map(i => (
                <div key={i} className={styles.insurerItem}>
                  <span className={styles.insurerCheck}>✓</span>
                  <span>{i}</span>
                </div>
              ))}
            </div>
            <div className={styles.insuranceCta}>
              <div className={styles.insuranceBox}>
                <h3>Free Insurance Check</h3>
                <p>Our team will verify your benefits and let you know exactly what's covered — at no cost to you.</p>
                <Link href="/appointment" className="btn btn-primary">Start Free Insurance Check →</Link>
              </div>
              <div className={styles.insuranceBox} style={{background:'var(--blue)',color:'#fff',border:'none'}}>
                <h3 style={{color:'#fff'}}>Questions About Coverage?</h3>
                <p style={{color:'rgba(255,255,255,0.85)'}}>Our insurance specialists are here to help Monday–Friday. Call us today.</p>
                <a href="tel:8558657144" className="btn btn-white">(855) 865-7144</a>
              </div>
            </div>
          </div>
        </section>

        {/* Financing */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Financing</p>
              <h2 className={styles.h2}>Flexible Financing Options</h2>
              <p className={styles.sectionSub}>Don't let financing stop you from changing your life. JourneyLite works with multiple financing partners to find a plan that works for you.</p>
            </div>
            <div className="grid-3">
              {[
                { icon: '💳', title: 'CareCredit', desc: 'Low-interest and no-interest payment plans available for qualified applicants. Apply online in minutes.' },
                { icon: '🏦', title: 'Alphaeon Credit', desc: 'Healthcare financing designed specifically for medical procedures with flexible repayment terms.' },
                { icon: '📋', title: 'In-House Plans', desc: 'Ask our team about JourneyLite\'s own financing options for qualifying patients.' },
              ].map(f => (
                <div key={f.title} className={styles.financeCard}>
                  <div className={styles.financeIcon}>{f.icon}</div>
                  <h3 className={styles.financeTitle}>{f.title}</h3>
                  <p className={styles.financeDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{background:'linear-gradient(135deg,var(--green-dark),var(--green))',padding:'64px 0'}}>
          <div className="container" style={{textAlign:'center'}}>
            <h2 style={{color:'#fff',marginBottom:12,fontSize:'2rem'}}>Ready to Take the Next Step?</h2>
            <p style={{color:'rgba(255,255,255,0.85)',marginBottom:32,maxWidth:480,margin:'0 auto 32px'}}>Schedule your free consultation and insurance check today. Our team will create a payment plan tailored to your situation.</p>
            <Link href="/appointment" className="btn btn-white" style={{fontSize:'16px'}}>Book Free Consultation →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
