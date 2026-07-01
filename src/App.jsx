import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Skyline from './components/Skyline.jsx'
import PropertyCard from './components/PropertyCard.jsx'
import ChatWidget from './components/ChatWidget.jsx'
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

  useEffect(() => {
    apiFetch('/api/properties/')
      .then((r) => r.json())
      .then((data) => setProperties(data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Nav />
      <Hero />
      <Listings properties={properties} loading={loading} />
      <HowItWorks />
      <Footer />
      <ChatWidget />
    </div>
  )
}

function Nav() {
  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>DAR</span>
      <div style={styles.navLinks}>
        <a href="#listings">Stays</a>
        <a href="#how">How it works</a>
        <a href="/admin/login" style={styles.navCta}>Admin Login</a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <header style={styles.hero}>
      <Skyline style={styles.heroSkyline} />
      <div style={styles.heroContent}>
        <p style={styles.heroEyebrow}>Daily · Monthly · Yearly stays across the UAE</p>
        <h1 style={styles.heroTitle}>
          Your Dubai address,<br />booked in minutes.
        </h1>
        <p style={styles.heroSub}>
          From a single night in Marina to a full year in Downtown — search, message, and book
          without the back-and-forth.
        </p>
        <div style={styles.searchBar}>
          <input placeholder="Where in the UAE?" style={styles.searchInput} />
          <button style={styles.searchButton}>Search stays</button>
        </div>
      </div>
    </header>
  )
}

function Listings({ properties, loading }) {
  return (
    <section id="listings" style={styles.listings}>
      <div style={styles.sectionHead}>
        <p style={styles.sectionEyebrow}>Available now</p>
        <h2 style={styles.sectionTitle}>Featured stays</h2>
      </div>

      {loading && <p style={styles.dim}>Loading properties…</p>}
      {!loading && properties.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.dim}>
            No properties yet — once your backend is running and an owner adds a listing
            from the admin portal, it'll appear here automatically.
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
    { label: 'Message', text: 'Chat with our AI assistant to find what you need — dates, area, budget.' },
    { label: 'Match', text: 'It finds available properties and holds your dates instantly.' },
    { label: 'Confirm', text: 'Get a booking confirmation seamlessly.' },
  ]
  return (
    <section id="how" style={styles.how}>
      <div style={styles.sectionHead}>
        <p style={styles.sectionEyebrow}>The process</p>
        <h2 style={{ ...styles.sectionTitle, color: '#F5EDE0' }}>Booked over chat, not forms</h2>
      </div>
      <div style={styles.howGrid}>
        {steps.map((s) => (
          <div key={s.label} style={styles.howStep}>
            <p style={styles.howLabel}>{s.label}</p>
            <p style={styles.howText}>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <span>DAR — UAE Stays</span>
      <span style={styles.dim}>Maintenance issue? Message us anytime in the chat.</span>
    </footer>
  )
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '22px 48px', position: 'relative', zIndex: 2,
  },
  logo: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '0.08em', color: '#F5EDE0' },
  navLinks: { display: 'flex', gap: 32, alignItems: 'center', fontSize: 14, color: '#F5EDE0' },
  navCta: {
    background: '#E8622C', color: '#F5EDE0', padding: '9px 18px', borderRadius: 3,
    fontWeight: 600, textDecoration: 'none'
  },
  hero: {
    position: 'relative', background: '#0B1120', color: '#F5EDE0',
    paddingBottom: 90, overflow: 'hidden', marginTop: -78,
  },
  heroSkyline: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: 320, opacity: 0.9 },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 720, padding: '170px 48px 40px' },
  heroEyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#C9A876', marginBottom: 20,
  },
  heroTitle: { fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, lineHeight: 1.08, marginBottom: 20 },
  heroSub: { fontSize: 17, lineHeight: 1.6, color: 'rgba(245,237,224,0.8)', maxWidth: 520, marginBottom: 36 },
  searchBar: { display: 'flex', gap: 10, maxWidth: 480 },
  searchInput: {
    flex: 1, padding: '14px 16px', borderRadius: 3, border: 'none',
    fontSize: 14, fontFamily: 'var(--font-body)',
  },
  searchButton: {
    background: '#C9A876', color: '#0B1120', padding: '14px 22px',
    borderRadius: 3, fontWeight: 700, fontSize: 14,
  },
  listings: { padding: '80px 48px', maxWidth: 1280, margin: '0 auto' },
  sectionHead: { marginBottom: 40 },
  sectionEyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#E8622C', marginBottom: 10,
  },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  emptyState: { padding: '40px 0' },
  dim: { opacity: 0.6, fontSize: 14 },
  how: { background: '#0B1120', color: '#F5EDE0', padding: '80px 48px' },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, maxWidth: 1280, margin: '0 auto' },
  howStep: { borderTop: '2px solid #C9A876', paddingTop: 18 },
  howLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 10 },
  howText: { fontSize: 14, lineHeight: 1.6, color: 'rgba(245,237,224,0.75)' },
  footer: {
    display: 'flex', justifyContent: 'space-between', padding: '28px 48px',
    background: '#F5EDE0', fontSize: 13, borderTop: '1px solid rgba(11,17,32,0.08)',
  },
}
