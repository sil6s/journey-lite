import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import styles from './page.module.css'

export const metadata = {
  title: 'Book Free Weight Loss Consultation | JourneyLite',
  description: 'Schedule your free weight loss surgery consultation at JourneyLite. Available in Cincinnati, Columbus, Dayton, Indianapolis & Northern Kentucky. Call (855) 865-7144.',
  alternates: { canonical: 'https://journeylite.com/appointment' }
}

export default function Appointment() {
  return (
    <>
      <Navbar />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <div className={styles.heroContent}>
                <p className="section-label">Your First Step</p>
                <h1 className={styles.h1}>Book Your Free Consultation</h1>
                <p className={styles.heroSub}>No obligation, no pressure — just an honest conversation about your goals and the best options available to you. Our team will review your insurance, explain all procedures, and answer every question.</p>
                <div className={styles.trust}>
                  {['Free consultation', 'Insurance check included', 'MBSAQIP accredited', '6,000+ procedures'].map(t => (
                    <div key={t} className={styles.trustItem}><span>✅</span> {t}</div>
                  ))}
                </div>
                <div className={styles.phones}>
                  <h3 className={styles.phoneTitle}>Prefer to call?</h3>
                  <a href="tel:8558657144" className={styles.phoneNum}>(855) 865-7144</a>
                  <p className={styles.phoneHours}>Mon–Fri 8am–5pm EST</p>
                </div>
              </div>

              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Request Your Appointment</h2>
                <p className={styles.formSub}>Fill out the form below and our team will contact you within 1 business day.</p>
                
                <div className={styles.form}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>First Name *</label>
                      <input type="text" className={styles.input} placeholder="Jane" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Last Name *</label>
                      <input type="text" className={styles.input} placeholder="Smith" />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email Address *</label>
                    <input type="email" className={styles.input} placeholder="jane@email.com" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone Number *</label>
                    <input type="tel" className={styles.input} placeholder="(555) 555-5555" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Preferred Location</label>
                    <select className={styles.input}>
                      <option value="">Select a location...</option>
                      <option>Cincinnati, OH</option>
                      <option>Columbus, OH</option>
                      <option>Dayton, OH</option>
                      <option>Indianapolis, IN</option>
                      <option>Northern Kentucky, KY</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Interested In</label>
                    <select className={styles.input}>
                      <option value="">Select a procedure...</option>
                      <option>Gastric Sleeve (VSG)</option>
                      <option>Gastric Bypass</option>
                      <option>SADI Surgery</option>
                      <option>Lap Band</option>
                      <option>Gastric Balloon</option>
                      <option>GLP-1 Medications (WeGovy/Zepbound)</option>
                      <option>Not Sure — Need Guidance</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Insurance Provider (optional)</label>
                    <input type="text" className={styles.input} placeholder="Anthem, United, Aetna, etc." />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Additional Notes</label>
                    <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Any additional information or questions..." />
                  </div>
                  <button type="button" className={`btn btn-primary ${styles.submit}`}>
                    Request My Free Consultation →
                  </button>
                  <p className={styles.formDisclaimer}>By submitting, you agree to be contacted by JourneyLite. We never sell your information.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
