import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import Skyline from './components/Skyline.jsx'
import PropertyCard from './components/PropertyCard.jsx'
import WhatsAppButton, { whatsappLink, WHATSAPP_ENABLED } from './components/WhatsAppButton.jsx'
import { apiFetch } from './lib/api.js'

// Admin Components
import AdminLogin from './components/AdminLogin.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import Dashboard from './components/Dashboard.jsx'
import AdminProperties from './components/AdminProperties.jsx'
import AdminVendors from './components/AdminVendors.jsx'
import AdminBookings from './components/AdminBookings.jsx'
import AdminMaintenance from './components/AdminMaintenance.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="maintenance" element={<AdminMaintenance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function LandingPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    apiFetch('/api/properties/')
      .then((r) => r.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return properties
    return properties.filter((p) =>
      [p.title, p.area, p.emirate, p.property_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [properties, query])

  const runSearch = () => {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <Nav />
      <Hero query={query} setQuery={setQuery} onSearch={runSearch} />
      <StatsStrip />
      <Listings properties={filtered} total={properties.length} loading={loading} query={query} />
      <HowItWorks />
      <WhatsAppCTA />
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={styles.nav} className="site-nav">
      <span style={styles.logo} className="site-logo">UAE Stays</span>
      <button
        type="button"
        className="nav-toggle"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>
      <div className={`nav-links${menuOpen ? ' nav-links--open' : ''}`} style={styles.navLinks}>
        <a href="#listings" className="link-underline" onClick={() => setMenuOpen(false)}>Stays</a>
        <a href="#how" className="link-underline" onClick={() => setMenuOpen(false)}>How it works</a>
        {WHATSAPP_ENABLED && (
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="link-underline" onClick={() => setMenuOpen(false)}>
            Chat on WhatsApp
          </a>
        )}
        <a href="/admin/login" style={styles.navCta} onClick={() => setMenuOpen(false)}>Admin</a>
      </div>
    </nav>
  )
}

function Hero({ query, setQuery, onSearch }) {
  return (
    <header style={styles.hero} className="hero">
      <Skyline style={styles.heroSkyline} />
      <div style={styles.heroOverlay} />
      <div style={styles.heroContent} className="hero-content">
        <p style={styles.heroEyebrow} className="fade-up fade-up-1">
          Daily · Monthly · Yearly stays across the UAE
        </p>
        <h1 style={styles.heroTitle} className="fade-up fade-up-2 hero-title">
          Your Dubai address,<br />booked over a chat.
        </h1>
        <p style={styles.heroSub} className="fade-up fade-up-2">
          From a single night in Marina to a full year in Downtown — find your place, then
          message us on WhatsApp to lock it in. No forms, no back-and-forth.
        </p>

        <div style={styles.searchBar} className="fade-up fade-up-3 search-bar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search by area, emirate, or name…"
            style={styles.searchInput}
          />
          <button style={styles.searchButton} onClick={onSearch}>Search stays</button>
        </div>

        {WHATSAPP_ENABLED && (
          <div style={styles.heroCtaRow} className="fade-up fade-up-3">
            <a
              href={whatsappLink('Hi! I want to book a stay.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa"
            >
              <FaWhatsapp size={20} /> Chat on WhatsApp
            </a>
            <span style={styles.heroCtaNote}>Replies in minutes · Available 24/7</span>
          </div>
        )}
      </div>
    </header>
  )
}

function StatsStrip() {
  const stats = [
    { value: '7', label: 'Emirates covered' },
    { value: '24/7', label: 'WhatsApp support' },
    { value: '3', label: 'Ways to stay — day, month, year' },
    { value: '0', label: 'Booking forms to fill' },
  ]
  return (
    <section style={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} style={styles.statItem}>
          <span style={styles.statValue}>{s.value}</span>
          <span style={styles.statLabel}>{s.label}</span>
        </div>
      ))}
    </section>
  )
}

function Listings({ properties, total, loading, query }) {
  return (
    <section id="listings" style={styles.listings} className="section-pad">
      <div style={styles.sectionHead}>
        <p style={styles.sectionEyebrow}>Available now</p>
        <h2 style={styles.sectionTitle} className="section-title">
          {query ? `Results for "${query}"` : 'Featured stays'}
        </h2>
        {!loading && (
          <p style={styles.resultCount}>
            {properties.length} of {total} {total === 1 ? 'stay' : 'stays'}
          </p>
        )}
      </div>

      {loading && <p style={styles.dim}>Loading properties…</p>}

      {!loading && properties.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.dim}>
            {query
              ? 'No stays match your search. Try a different area or name.'
              : "No properties yet — once an owner adds a listing from the admin portal, it'll appear here automatically."}
          </p>
        </div>
      )}

      <div style={styles.grid}>
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', label: 'Browse', text: 'Explore stays across the UAE and find one that fits your dates and budget.' },
    { n: '02', label: 'Message', text: 'Tap “Chat on WhatsApp” — our assistant handles dates, availability, and your quote.' },
    { n: '03', label: 'Confirm', text: 'Once payment is received, we confirm your booking right in the chat.' },
  ]
  return (
    <section id="how" style={styles.how} className="section-pad how-section">
      <div style={styles.sectionHead}>
        <p style={{ ...styles.sectionEyebrow, color: 'var(--gold)' }}>The process</p>
        <h2 style={{ ...styles.sectionTitle, color: 'var(--sand)' }}>Booked over chat, not forms</h2>
      </div>
      <div style={styles.howGrid}>
        {steps.map((s) => (
          <div key={s.label} style={styles.howStep}>
            <span style={styles.howNum}>{s.n}</span>
            <p style={styles.howLabel}>{s.label}</p>
            <p style={styles.howText}>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function WhatsAppCTA() {
  if (!WHATSAPP_ENABLED) return null
  return (
    <section style={styles.waCta} className="section-pad wa-cta-section">
      <div style={styles.waCtaInner} className="wa-cta-inner">
        <div>
          <h2 style={styles.waCtaTitle}>Ready when you are.</h2>
          <p style={styles.waCtaSub}>
            Booking a stay or reporting a maintenance issue — it all happens in one WhatsApp chat.
          </p>
        </div>
        <a
          href={whatsappLink('Hi! I would like to get started.')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa"
          style={{ fontSize: 16, padding: '16px 28px' }}
        >
          <FaWhatsapp size={22} /> Start on WhatsApp
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={styles.footer} className="site-footer">
      <span style={styles.footerLogo}>UAE Stays</span>
      {WHATSAPP_ENABLED ? (
        <a
          href={whatsappLink('Hi! I have a question.')}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline"
          style={styles.dim}
        >
          Questions? Chat with us on WhatsApp →
        </a>
      ) : (
        <span style={styles.dim}>Reach us anytime.</span>
      )}
    </footer>
  )
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '22px 48px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3,
  },
  logo: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '0.04em', color: '#F5EDE0' },
  navLinks: { display: 'flex', gap: 30, alignItems: 'center', fontSize: 14, color: '#F5EDE0' },
  navCta: {
    background: '#E8622C', color: '#F5EDE0', padding: '9px 18px', borderRadius: 4,
    fontWeight: 600, textDecoration: 'none',
  },

  hero: {
    position: 'relative', background: 'radial-gradient(120% 120% at 70% 20%, #16213a 0%, #0B1120 60%)',
    color: '#F5EDE0', paddingBottom: 100, overflow: 'hidden', minHeight: 640,
  },
  heroSkyline: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: 360, opacity: 0.9 },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(11,17,32,0.2) 0%, rgba(11,17,32,0) 40%, rgba(11,17,32,0.5) 100%)',
  },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 780, padding: '190px 48px 40px' },
  heroEyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 22,
  },
  heroTitle: { fontFamily: 'var(--font-display)', fontSize: 58, fontWeight: 800, lineHeight: 1.05, marginBottom: 22, letterSpacing: '-0.02em' },
  heroSub: { fontSize: 18, lineHeight: 1.65, color: 'rgba(245,237,224,0.82)', maxWidth: 560, marginBottom: 34 },
  searchBar: { display: 'flex', gap: 10, maxWidth: 560, background: 'rgba(255,255,255,0.06)', padding: 8, borderRadius: 10, border: '1px solid rgba(245,237,224,0.14)', backdropFilter: 'blur(6px)' },
  searchInput: {
    flex: 1, padding: '14px 16px', borderRadius: 6, border: 'none',
    fontSize: 15, fontFamily: 'var(--font-body)', background: '#F5EDE0', color: '#0B1120',
  },
  searchButton: {
    background: 'var(--gold)', color: '#0B1120', padding: '14px 24px',
    borderRadius: 6, fontWeight: 700, fontSize: 14,
  },
  heroCtaRow: { display: 'flex', alignItems: 'center', gap: 18, marginTop: 24, flexWrap: 'wrap' },
  heroCtaNote: { fontSize: 13, color: 'rgba(245,237,224,0.6)', fontFamily: 'var(--font-mono)' },

  stats: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1,
    background: 'rgba(11,17,32,0.08)', maxWidth: 1280, margin: '-40px auto 0', position: 'relative', zIndex: 2,
    borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 50px rgba(11,17,32,0.14)',
  },
  statItem: { background: '#fff', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--terracotta)' },
  statLabel: { fontSize: 13, color: 'var(--dusk)', opacity: 0.8, lineHeight: 1.4 },

  listings: { padding: '80px 48px', maxWidth: 1280, margin: '0 auto' },
  sectionHead: { marginBottom: 40 },
  sectionEyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 10,
  },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: '-0.01em' },
  resultCount: { fontSize: 13, color: 'var(--dusk)', opacity: 0.6, marginTop: 10, fontFamily: 'var(--font-mono)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 26 },
  emptyState: { padding: '40px 0' },
  dim: { opacity: 0.65, fontSize: 14 },

  how: { background: 'linear-gradient(180deg, #0B1120 0%, #16213a 100%)', color: '#F5EDE0', padding: '90px 48px' },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, maxWidth: 1280, margin: '0 auto' },
  howStep: { borderTop: '2px solid var(--gold)', paddingTop: 20 },
  howNum: { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)', opacity: 0.8 },
  howLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, margin: '10px 0 10px' },
  howText: { fontSize: 14.5, lineHeight: 1.65, color: 'rgba(245,237,224,0.78)' },

  waCta: { padding: '0 48px', maxWidth: 1280, margin: '80px auto' },
  waCtaInner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 30, flexWrap: 'wrap',
    background: 'linear-gradient(120deg, #128C7E 0%, #25D366 100%)', color: '#fff',
    padding: '44px 48px', borderRadius: 16, boxShadow: '0 20px 50px rgba(18,140,126,0.35)',
  },
  waCtaTitle: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, marginBottom: 8 },
  waCtaSub: { fontSize: 15.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', maxWidth: 520 },

  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 48px',
    background: 'var(--sand)', fontSize: 13, borderTop: '1px solid rgba(11,17,32,0.1)', flexWrap: 'wrap', gap: 12,
  },
  footerLogo: { fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em' },
}
