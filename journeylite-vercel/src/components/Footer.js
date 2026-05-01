import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div className={styles.logo}>
                <span className={styles.logoJ}>Journey</span><span className={styles.logoL}>Lite</span>
              </div>
              <p className={styles.tagline}>Your trusted partner in lasting weight loss — for life.</p>
              <p className={styles.accred}>🏆 MBSAQIP Accredited Center of Excellence</p>
              <a href="tel:8558657144" className={styles.phone}>(855) 865-7144</a>
            </div>

            <div className={styles.col}>
              <h4>Surgical Options</h4>
              <Link href="/gastric-sleeve">Gastric Sleeve (VSG)</Link>
              <Link href="/gastric-bypass">Gastric Bypass</Link>
              <Link href="/sadi-surgery">SADI Surgery</Link>
              <Link href="/lap-band">Lap Band</Link>
              <Link href="/sleeve-revision">Sleeve Revision</Link>
              <Link href="/band-revision">Band Revision</Link>
            </div>

            <div className={styles.col}>
              <h4>Weight Loss Options</h4>
              <Link href="/gastric-balloon">Gastric Balloon</Link>
              <Link href="/medications">WeGovy / Semaglutide</Link>
              <Link href="/medications">Zepbound / Tirzepatide</Link>
              <Link href="/medications">Adipex / Phentermine</Link>
              <Link href="/pricing">Pricing & Financing</Link>
            </div>

            <div className={styles.col}>
              <h4>Company</h4>
              <Link href="/about">About JourneyLite</Link>
              <Link href="/about#doctors">Our Surgeons</Link>
              <Link href="/locations">Locations</Link>
              <Link href="/appointment">Request Appointment</Link>
              <Link href="/blog">Blog & Resources</Link>
              <Link href="/faq">FAQ</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} JourneyLite Physicians. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
