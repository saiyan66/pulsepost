import { useAuth } from '../../utils/Auth.jsx'

export default function Header({ currentPage, navigate }) {
  const { user, logout } = useAuth()

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: 'var(--paper)',
    }}>

    
      <div
        onClick={() => navigate('feed')}
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 24,
          fontWeight: 600,
          color: 'var(--ink)',
          cursor: 'pointer',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          userSelect: 'none',
        }}
      >
        PulsePost
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 9,
          color: 'var(--text3)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}>
          beta
        </span>
      </div>

      <nav style={{
        display: 'flex',
        borderLeft: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
      }}>
        {[
          { label: 'Feed',    page: 'feed'    },
          { label: 'Explore', page: 'explore' },
          { label: 'Search',  page: 'search'  },
        ].map(({ label, page }) => (
          <button
            key={page}
            onClick={() => navigate(page)}
            style={{
              padding: '0 24px',
              height: 36,
              background: currentPage === page ? 'var(--text)' : 'transparent',
              color: currentPage === page ? 'var(--paper)' : 'var(--text2)',
              border: 'none',
              borderRight: '1px solid var(--border)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.1s',
            }}
          >
            {label}
          </button>
          
        ))}
      </nav>

      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

     
        {user && (
          <button
            onClick={() => navigate('write')}
            title="Write a new post"
            style={{
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              color: 'var(--text2)',
              cursor: 'pointer',
              fontSize: 15,
              transition: 'all 0.1s',
              flexShrink: 0,
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'var(--text)'
              e.currentTarget.style.color = 'var(--paper)'
              e.currentTarget.style.borderColor = 'var(--text)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text2)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            ✎
          </button>
        )}

        {user ? (
          <>
            <span
              onClick={() => navigate('profile')}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--text3)',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                userSelect: 'none',
              }}
            >
              @{user.username}
            </span>
            <button
              onClick={logout}
              style={{
                padding: '4px 14px',
                background: 'transparent',
                color: 'var(--text3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              Out
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('auth')}
            style={{
              padding: '6px 18px',
              background: 'var(--text)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}