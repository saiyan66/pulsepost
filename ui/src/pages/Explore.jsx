export default function Explore({ navigate }) {
  return (
    <div>
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 22,
          fontWeight: 400,
          color: 'var(--ink)',
        }}>
          Explore
        </h1>
      </div>
      <div style={{
        padding: '60px 28px',
        textAlign: 'center',
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--text3)',
      }}>
        All posts will appear here.
      </div>
    </div>
  )
}