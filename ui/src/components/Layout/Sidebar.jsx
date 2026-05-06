import { useAuth } from '../../utils/Auth.jsx'

const navItems = [
  { page: 'feed',    label: 'Home Feed',  symbol: '◈' },
  { page: 'explore', label: 'Explore',    symbol: '○' },
  { page: 'profile', label: 'My Profile', symbol: '◇' },
]

export default function Sidebar({ currentPage, navigate }) {
  const { user } = useAuth()

  return (
    <aside style={{ padding: '24px 16px' }}>

    
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 9,
        color: 'var(--text3)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border)',
      }}>
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      {/* Nav */}
      <div style={{ marginBottom: 24 }}>
        {navItems.map(({ page, label, symbol }) => (
          <button
            key={page}
            onClick={() => navigate(page)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 10px',
              background: currentPage === page ? 'var(--bg3)' : 'transparent',
              color: currentPage === page ? 'var(--ink)' : 'var(--text2)',
              border: currentPage === page
                ? '1px solid var(--border2)'
                : '1px solid transparent',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              textAlign: 'left',
              marginBottom: 2,
              transition: 'all 0.1s',
            }}
          >
            <span style={{ fontSize: 12, width: 16 }}>{symbol}</span>
            {label}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 9,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          About
        </div>
        <p style={{
          fontSize: 12,
          color: 'var(--text3)',
          lineHeight: 1.7,
          fontFamily: 'var(--mono)',
        }}>
          PulsePost — a social blogging platform.
        </p>
      </div>
    </aside>
  )
}