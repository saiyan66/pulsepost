// src/components/Layout/RightPanel.jsx
import { useAuth } from '../../utils/Auth.jsx'

export default function RightPanel({ navigate }) {
  const { user } = useAuth()

  const cardStyle = {
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    marginBottom: 16,
  }

  const labelStyle = {
    fontFamily: 'var(--mono)',
    fontSize: 9,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text3)',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid var(--border)',
  }

  if (!user) {
    return (
      <div style={cardStyle}>
        <div style={labelStyle}>Get started</div>
        <p style={{
          fontSize: 13,
          color: 'var(--text2)',
          lineHeight: 1.7,
          marginBottom: 14,
          fontFamily: 'var(--body)',
        }}>
          Sign in to write posts, follow authors, and build your feed.
        </p>
        <button
          onClick={() => navigate('auth')}
          style={{
            width: '100%',
            padding: '8px 16px',
            background: 'var(--text)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Sign in / Register
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={cardStyle}>
        <div style={labelStyle}>Signed in as</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--accent)',
            fontWeight: 500,
            flexShrink: 0,
          }}>
            {user.username.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--serif)',
              color: 'var(--ink)',
            }}>
              {user.username}
            </div>
            <div style={{
              fontSize: 10,
              color: 'var(--text3)',
              fontFamily: 'var(--mono)',
            }}>
              {user.email}
            </div>
          </div>
        </div>
      <div style={{
      borderTop: '1px solid var(--border)',
      paddingTop: 12,
      marginTop: 4,
      display: 'flex',
      gap: 16,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: 18,
          color: 'var(--ink)',
        }}>—</div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 9,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>Following</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: 18,
          color: 'var(--ink)',
        }}>—</div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 9,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>Followers</div>
      </div>
     </div>
    </div>

      {/* <div style={cardStyle}>
        <div style={labelStyle}>System</div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--success)',
          marginBottom: 4,
        }}>
          ● API online
        </div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--text3)',
        }}>
          FastAPI / localhost:8000
        </div>
      </div> */}
    </>
  )
}