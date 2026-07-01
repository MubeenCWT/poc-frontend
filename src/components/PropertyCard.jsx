export default function PropertyCard({ property }) {
  const { title, area, emirate, bedrooms, price_daily, price_monthly, images } = property

  return (
    <div style={styles.card}>
      <div style={styles.imageWrap}>
        {images?.[0] ? (
          <img src={images[0]} alt={title} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder} />
        )}
      </div>
      <div style={styles.body}>
        <p style={styles.eyebrow}>{area ? `${area}, ${emirate}` : emirate}</p>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.meta}>{bedrooms ? `${bedrooms} bed` : ''}</p>
        <div style={styles.priceRow}>
          <span style={styles.price}>AED {price_daily?.toLocaleString()}</span>
          <span style={styles.priceUnit}>/ day</span>
          {price_monthly && (
            <span style={styles.priceAlt}>AED {price_monthly.toLocaleString()} / mo</span>
          )}
        </div>
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
  imageWrap: { aspectRatio: '4 / 3', background: '#2D3B4E' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #2D3B4E, #0B1120)' },
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
  meta: { fontSize: 13, color: '#2D3B4E', opacity: 0.75, marginBottom: 14 },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  price: { fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 500 },
  priceUnit: { fontSize: 12, opacity: 0.6 },
  priceAlt: { fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.5, marginLeft: 'auto' },
}
