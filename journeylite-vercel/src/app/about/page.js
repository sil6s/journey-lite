import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'About JourneyLite | 20 Years of Bariatric Excellence',
  description: 'Learn about JourneyLite\'s 20-year history of bariatric surgery excellence. Meet Dr. Trace Curry and Dr. James Augusta — Cincinnati\'s top weight loss surgeons with 6,000+ procedures.',
  alternates: { canonical: 'https://journeylite.com/about' }
}

export default function About() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <div>
                <p className="section-label">Our Story</p>
                <h1 className={styles.h1}>20 Years of Changing Lives Through Weight Loss Surgery</h1>
                <p className={styles.heroSub}>Founded by Dr. Trace Curry in Cincinnati, JourneyLite has grown from a single-location practice to one of the Midwest's most trusted weight loss surgery centers — with 5 locations, two exceptional surgeons, and thousands of life-changing success stories.</p>
              </div>
              <div className={styles.heroStats}>
                {[['20+', 'Years in Practice'],['6,000+', 'Procedures Performed'],['5', 'Locations'],['#1', 'MBSAQIP Accredited']].map(([n,l]) => (
                  <div key={n} className={styles.heroStat}>
                    <span className={styles.heroStatNum}>{n}</span>
                    <span className={styles.heroStatLabel}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className={styles.mission}>
          <div className="container">
            <div className={styles.missionInner}>
              <div>
                <p className="section-label">Our Mission</p>
                <h2 className={styles.h2}>Personalized Care for Lasting Results</h2>
                <div className="divider" />
                <p>JourneyLite was built on a simple belief: <strong>there is no singular weight loss program that works for everyone</strong>. That's why we offer surgical, non-surgical, and medical weight loss options — and why we take the time to understand each patient's unique situation before recommending a path forward.</p>
                <p>From your first consultation to years of follow-up care, JourneyLite is with you <em>for life</em>.</p>
              </div>
              <div className={styles.missionAccred}>
                <h3>Nationally Recognized Excellence</h3>
                {[
                  '🏆 MBSAQIP Accredited Bariatric Surgery Outpatient Center of Excellence',
                  '🏅 Anthem Blue Distinction Plus',
                  '🏅 United Health Optum Bariatric Center of Excellence',
                  '🏅 Aetna Institute of Quality',
                  '🏅 Member, American Society for Metabolic & Bariatric Surgery',
                ].map(a => <p key={a} className={styles.accredItem}>{a}</p>)}
              </div>
            </div>
          </div>
        </section>

        {/* Doctors */}
        <section className={styles.doctors} id="doctors">
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Our Surgeons</p>
              <h2 className={styles.h2}>Meet Your Expert Surgical Team</h2>
            </div>

            <div className={styles.doctorGrid}>
              <div id="dr-curry" className={styles.doctorCard}>
                <div className={styles.doctorAvatarLarge} style={{background:'var(--green)'}}>
                  <span>TC</span>
                </div>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>Dr. Trace W. Curry, MD, FASMBS</h3>
                  <p className={styles.doctorTitle}>Medical Director · Board-Certified General Surgeon</p>
                  <p className={styles.doctorBio}>
                    A Cincinnati native and board-certified general surgeon, Dr. Curry is the medical director of bariatric surgery at JourneyLite Surgery Center. With over two decades of experience, he has performed thousands of advanced laparoscopic surgeries and is recognized for introducing innovative non-surgical obesity treatments in Ohio.
                  </p>
                  <p className={styles.doctorBio}>
                    Dr. Curry is a Fellow of the American Society for Metabolic and Bariatric Surgery (FASMBS) and is passionate about creating personalized, compassionate care plans for every patient.
                  </p>
                  <div className={styles.doctorCreds}>
                    <span className="badge badge-green">Board Certified</span>
                    <span className="badge badge-green">FASMBS</span>
                    <span className="badge badge-green">20+ Years Experience</span>
                  </div>
                </div>
              </div>

              <div id="dr-augusta" className={styles.doctorCard}>
                <div className={styles.doctorAvatarLarge} style={{background:'var(--blue)'}}>
                  <span>JA</span>
                </div>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>Dr. James Augusta, MD</h3>
                  <p className={styles.doctorTitle}>Minimally Invasive Weight Loss Surgeon</p>
                  <p className={styles.doctorBio}>
                    Dr. Augusta specializes in gastric sleeve, gastric bypass, and revisional weight loss surgery. As a minimally invasive weight loss surgeon, he brings a wealth of expertise from his comprehensive training and residency in Ohio.
                  </p>
                  <p className={styles.doctorBio}>
                    Known for his technical precision and patient-centered approach, Dr. Augusta works closely with each patient to develop a personalized surgical plan that aligns with their health goals and lifestyle.
                  </p>
                  <div className={styles.doctorCreds}>
                    <span className="badge badge-blue">Minimally Invasive</span>
                    <span className="badge badge-blue">Revisional Expert</span>
                    <span className="badge badge-blue">Ohio Trained</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{background:'linear-gradient(135deg,var(--green-dark),var(--green))',padding:'72px 0',textAlign:'center'}}>
          <div className="container">
            <h2 style={{color:'#fff',marginBottom:12,fontSize:'2rem'}}>Ready to Meet the Team?</h2>
            <p style={{color:'rgba(255,255,255,0.85)',marginBottom:32,maxWidth:420,margin:'0 auto 32px'}}>Book your free consultation and let Dr. Curry or Dr. Augusta create a personalized weight loss plan for you.</p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/appointment" className="btn btn-white">Book Free Consultation →</Link>
              <Link href="/locations" className="btn btn-outline" style={{borderColor:'rgba(255,255,255,0.5)',color:'#fff'}}>Find a Location</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
