import { FaWhatsapp } from 'react-icons/fa'
import { whatsappLink, WHATSAPP_ENABLED } from './WhatsAppButton.jsx'

function fmtBlockDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function PropertyCard({ property }) {
  const {
    title, area, emirate, bedrooms, price_daily, price_monthly, images,
    block_active, block_start, block_end, listing_label,
  } = property

  const isBlocked = listing_label === 'blocked' || block_active
  const blockedSoon = listing_label === 'blocked_soon' && !block_active
  const inquireText = `Hi! I want to inquire about ${title}${area ? ` in ${area}` : ''}. Please share the details.`

  return (
    <div style={{ ...styles.card, ...(isBlocked ? styles.cardBlocked : {}) }} className="card-hover">
      <div style={styles.imageWrap}>
        {images?.[0] ? (
          <img src={images[0]} alt={title} style={styles.image} className="card-img" />
        ) : (
          <div style={styles.imagePlaceholder} className="card-img" />
        )}
        {isBlocked && (
          <span style={styles.badgeBlocked}>Temporarily blocked</span>
        )}
        {blockedSoon && block_start && block_end && (
          <span style={styles.badgeSoon}>
            Blocked {fmtBlockDate(block_start)} – {fmtBlockDate(block_end)}
          </span>
        )}
      </div>
      <div style={styles.body}>
        <p style={styles.eyebrow}>{area ? `${area}, ${emirate}` : emirate}</p>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.meta}>{bedrooms ? `${bedrooms} bed` : ''}</p>
        {isBlocked && block_end && (
          <p style={styles.blockNote}>
            Not bookable until {fmtBlockDate(block_end)}
          </p>
        )}
        <div style={styles.priceRow}>
          <span style={styles.price}>AED {price_daily?.toLocaleString()}</span>
          <span style={styles.priceUnit}>/ day</span>
          {price_monthly && (
            <span style={styles.priceAlt}>AED {price_monthly.toLocaleString()} / mo</span>
          )}
        </div>
        {WHATSAPP_ENABLED && (
          <a
            href={whatsappLink(inquireText)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...styles.inquireBtn,
              ...(isBlocked ? { opacity: 0.55, pointerEvents: 'none' } : {}),
            }}
            aria-disabled={isBlocked}
          >
            <FaWhatsapp size={16} /> {isBlocked ? 'Unavailable' : 'Inquire'}
          </a>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid rgba(11,17,32,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardBlocked: {
    borderColor: 'rgba(197, 34, 31, 0.25)',
  },
  imageWrap: { aspectRatio: '4 / 3', background: '#2D3B4E', position: 'relative' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #2D3B4E, #0B1120)' },
  badgeBlocked: {
    position: 'absolute', top: 12, left: 12,
    background: '#c5221f', color: '#fff',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
    textTransform: 'uppercase', padding: '6px 10px', borderRadius: 4,
  },
  badgeSoon: {
    position: 'absolute', top: 12, left: 12,
    background: '#fef7e0', color: '#b06000',
    fontSize: 10, fontWeight: 700, padding: '6px 10px', borderRadius: 4,
    maxWidth: '90%',
  },
  body: { padding: '20px 22px 24px' },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#C9A876',
    marginBottom: 8,
  },
  title: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 },
  meta: { fontSize: 13, color: '#2D3B4E', opacity: 0.75, marginBottom: 8 },
  blockNote: { fontSize: 12, color: '#c5221f', marginBottom: 10, fontWeight: 500 },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginBottom: 16 },
  price: { fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 500 },
  priceUnit: { fontSize: 12, opacity: 0.6 },
  priceAlt: { fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.5, marginLeft: 'auto' },
  inquireBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#25D366',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
  },
}
