export default function Feed({ navigate }) {
  return (
    <div>
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 22,
          fontWeight: 400,
          color: 'var(--ink)',
        }}>
          Latest Posts
        </h1>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--text3)',
          letterSpacing: '0.08em',
        }}>
          FEED
        </span>
      </div>
      <div style={{
        padding: '60px 28px',
        textAlign: 'center',
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--text3)',
      }}>
        Loading posts...
      </div>
    </div>
  )
}