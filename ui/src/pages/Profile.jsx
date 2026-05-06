export default function Profile({ navigate }) {
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
          Profile
        </h1>
      </div>
      <div style={{
        padding: '60px 28px',
        textAlign: 'center',
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--text3)',
      }}>
        Sign in to view your profile.
      </div>
    </div>
  )
}