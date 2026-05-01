'use client'
import { useState } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'

const navItems = [
  {
    label: 'Surgical Options',
    href: '/surgical-options',
    children: [
      { label: 'Gastric Sleeve (VSG)', href: '/gastric-sleeve' },
      { label: 'Gastric Bypass', href: '/gastric-bypass' },
      { label: 'SADI Surgery', href: '/sadi-surgery' },
      { label: 'Lap Band', href: '/lap-band' },
      { label: 'Sleeve Revision', href: '/sleeve-revision' },
      { label: 'Band Revision', href: '/band-revision' },
    ]
  },
  {
    label: 'Non-Surgical',
    href: '/non-surgical',
    children: [
      { label: 'Gastric Balloon', href: '/gastric-balloon' },
      { label: 'Allurion Balloon', href: '/allurion-balloon' },
    ]
  },
  {
    label: 'Medications',
    href: '/medications',
    children: [
      { label: 'WeGovy / Semaglutide', href: '/medications#wegovy' },
      { label: 'Zepbound / Tirzepatide', href: '/medications#zepbound' },
      { label: 'Adipex / Phentermine', href: '/medications#adipex' },
    ]
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Locations', href: '/locations' },
  { label: 'About', href: '/about' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(null)

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <span>📍 5 locations in Ohio, Indiana & Kentucky</span>
          <a href="tel:8558657144" className={styles.phone}>📞 (855) 865-7144</a>
        </div>
      </div>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoJ}>Journey</span>
            <span className={styles.logoL}>Lite</span>
            <span className={styles.logoTag}>FOR LIFE™</span>
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={styles.navItem}
                onMouseEnter={() => item.children && setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                  {item.children && <span className={styles.chevron}>▾</span>}
                </Link>
                {item.children && dropdown === item.label && (
                  <div className={styles.dropdown}>
                    {item.children.map(child => (
                      <Link key={child.label} href={child.href} className={styles.dropdownItem}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className={styles.ctas}>
            <a href="tel:8558657144" className={`btn btn-outline ${styles.callBtn}`}>Call Us</a>
            <Link href="/appointment" className="btn btn-primary">Book Free Consult</Link>
          </div>

          <button className={styles.hamburger} onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>

        {open && (
          <div className={styles.mobileMenu}>
            {navItems.map(item => (
              <div key={item.label}>
                <Link href={item.href} className={styles.mobileLink} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
                {item.children && item.children.map(child => (
                  <Link key={child.label} href={child.href} className={styles.mobileSub} onClick={() => setOpen(false)}>
                    → {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className={styles.mobileCtas}>
              <a href="tel:8558657144" className="btn btn-outline" style={{width:'100%',justifyContent:'center'}}>📞 (855) 865-7144</a>
              <Link href="/appointment" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Book Free Consult</Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
