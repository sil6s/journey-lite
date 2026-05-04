import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'Weight Loss Surgery Locations | Ohio, Indiana & Kentucky | JourneyLite',
  description: 'JourneyLite weight loss surgery locations in Cincinnati OH, Columbus OH, Dayton OH, Indianapolis IN, and Northern Kentucky. Board-certified surgeons near you.',
  alternates: { canonical: 'https://journeylite.com/locations' }
}

const locations = [
  {
    city: 'Cincinnati', state: 'OH',
    address: '4999 Este Ave, Cincinnati, OH 45232',
    note: 'Main Surgery Center · 12,000 sq ft dedicated facility',
    phone: '(855) 865-7144',
    services: ['Gastric Sleeve', 'Gastric Bypass', 'SADI', 'Lap Band', 'Revisions', 'GLP-1 Medications', 'Gastric Balloon'],
    mapUrl: 'https://maps.google.com/?q=JourneyLite+Cincinnati'
  },
  {
    city: 'Columbus', state: 'OH',
    address: 'Columbus, OH',
    note: 'Consultations & Follow-up Care',
    phone: '(855) 865-7144',
    services: ['Consultations', 'GLP-1 Medications', 'Follow-up Care'],
    mapUrl: 'https://maps.google.com/?q=JourneyLite+Columbus+Ohio'
  },
  {
    city: 'Dayton', state: 'OH',
    address: 'Dayton, OH',
    note: 'Consultations & Follow-up Care',
    phone: '(855) 865-7144',
    services: ['Consultations', 'GLP-1 Medications', 'Follow-up Care'],
    mapUrl: 'https://maps.google.com/?q=JourneyLite+Dayton+Ohio'
  },
  {
    city: 'Indianapolis', state: 'IN',
    address: 'Indianapolis, IN',
    note: 'Full Service Location',
    phone: '(855) 865-7144',
    services: ['Consultations', 'GLP-1 Medications', 'Follow-up Care', 'Some Surgical Options'],
    mapUrl: 'https://maps.google.com/?q=JourneyLite+Indianapolis'
  },
  {
    city: 'Northern Kentucky', state: 'KY',
    address: 'Northern Kentucky (Greater Cincinnati Area)',
    note: 'Greater Cincinnati Area',
    phone: '(855) 865-7144',
    services: ['Consultations', 'GLP-1 Medications', 'Follow-up Care'],
    mapUrl: 'https://maps.google.com/?q=JourneyLite+Northern+Kentucky'
  },
]

export default function Locations() {
  return (
    <>
      <Navbar />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <p className="section-label">Find Us</p>
            <h1 className={styles.h1}>5 Locations Serving OH, IN & KY</h1>
            <p className={styles.heroSub}>Patients travel from across the country for JourneyLite's quality of care. With 5 locations, we're likely close to you.</p>
            <Link href="/appointment" className="btn btn-primary" style={{marginTop:24}}>Book Free Consultation →</Link>
          </div>
        </section>

        <section className={styles.locGrid}>
          <div className="container">
            <div className={styles.grid}>
              {locations.map(l => (
                <div key={l.city} className={styles.locCard}>
                  <div className={styles.locHeader}>
                    <div>
                      <h2 className={styles.locCity}>{l.city}, <span className={styles.locState}>{l.state}</span></h2>
                      <p className={styles.locNote}>{l.note}</p>
                    </div>
                    <span className={styles.locPin}>📍</span>
                  </div>
                  <p className={styles.locAddress}>{l.address}</p>
                  <div className={styles.locServices}>
                    {l.services.map(s => (
                      <span key={s} className={styles.locService}>{s}</span>
                    ))}
                  </div>
                  <div className={styles.locActions}>
                    <a href={l.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{flex:1,justifyContent:'center',fontSize:13}}>
                      Get Directions
                    </a>
                    <a href={`tel:${l.phone.replace(/\D/g,'')}`} className="btn btn-primary" style={{flex:1,justifyContent:'center',fontSize:13}}>
                      Call Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{background:'var(--green-pale)',padding:'64px 0',textAlign:'center'}}>
          <div className="container">
            <h2 style={{marginBottom:12,fontSize:'2rem'}}>Can't Find a Location Near You?</h2>
            <p style={{color:'var(--text-muted)',maxWidth:480,margin:'0 auto 28px',lineHeight:1.7}}>Many patients travel to our Cincinnati Surgery Center from across the country. Call us to learn about travel support options.</p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <a href="tel:8558657144" className="btn btn-primary">(855) 865-7144</a>
              <Link href="/appointment" className="btn btn-outline">Request Appointment Online</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
