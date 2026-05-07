import { useState, useEffect } from 'react'
import { useAuth } from '../../utils/Auth.jsx'
import { usersApi } from '../../api/client.js'

function initials(username) {
  return (username || '?').slice(0, 2).toUpperCase()
}

export default function RightPanel({ navigate }) {
  const { user, logout } = useAuth()
  const [counts, setCounts] = useState({ following: 0, followers: 0 })
  const [followingList, setFollowingList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      usersApi.following(user.id),
      usersApi.followers(user.id),
    ]).then(([following, followers]) => {
      setFollowingList(following)
      setCounts({
        following: following.length,
        followers: followers.length,
      })
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [user?.id])


  const sectionLabel = {
    fontFamily: 'var(--mono)',
    fontSize: 9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--text3)',
    marginBottom: 14,
    display: 'block',
  }

  const section = {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottom: '1px solid var(--border)',
  }


  if (!user) {
    return (
      <div style={{ paddingTop: 8 }}>
        <div style={section}>
          <span style={sectionLabel}>About</span>
          <p style={{
            fontFamily: 'var(--body)',
            fontSize: 13,
            color: 'var(--text2)',
            lineHeight: 1.75,
            margin: 0,
          }}>
            PulsePost is a social blogging platform for writing and
            discovering ideas. Sign in to follow authors and
            build your personal feed.
          </p>
        </div>

        <div style={{ ...section, borderBottom: 'none' }}>
          <span style={sectionLabel}>Get started</span>
          <button
            onClick={() => navigate('auth')}
            style={{
              display: 'block',
              width: '100%',
              padding: '9px 0',
              background: 'var(--text)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('auth')}
            style={{
              display: 'block',
              width: '100%',
              padding: '9px 0',
              background: 'transparent',
              color: 'var(--text2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Create Account
          </button>
        </div>
      </div>
    )
  }


  return (
    <div style={{ paddingTop: 8 }}>


      <div style={section}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--accent)',
            fontWeight: 500,
            flexShrink: 0,
          }}>
            {initials(user.username)}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: 15,
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}>
              {user.username}
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--text3)',
              marginTop: 2,
            }}>
              {user.email}
            </div>
          </div>
        </div>

       
        <div style={{
          display: 'flex',
          gap: 30,
          marginBottom: 14,
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: 20,
              color: 'var(--ink)',
              lineHeight: 1,
            }}>
              {loading ? '—' : counts.following}
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--text3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 3,
            }}>
              Following
            </div>
          </div>
          <div style={{
            width: 1,
            background: 'var(--border)',
            alignSelf: 'stretch',
          }}/>
          <div>
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: 20,
              color: 'var(--ink)',
              lineHeight: 1,
            }}>
              {loading ? '—' : counts.followers}
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--text3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 3,
            }}>
              Followers
            </div>
          </div>
        </div>
      </div>

  
      {followingList.length > 0 && (
        <div style={section}>
          <span style={sectionLabel}>Following</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {followingList.slice(0, 5).map(u => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)',
                  fontSize: 8,
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}>
                  {initials(u.username)}
                </div>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--text2)',
                }}>
                  @{u.username}
                </span>
              </div>
            ))}
            {followingList.length > 5 && (
              <div
                onClick={() => navigate('profile')}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  color: 'var(--text3)',
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text3)'}
              >
                +{followingList.length - 5} more →
              </div>
            )}
          </div>
        </div>
      )}


      {!loading && followingList.length === 0 && (
        <div style={section}>
          <span style={sectionLabel}>Following</span>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--text3)',
            lineHeight: 1.6,
            margin: 0,
          }}>
            You're not following anyone yet.{' '}
            <span
              onClick={() => navigate('search')}
              style={{ color: 'var(--accent)', cursor: 'pointer' }}
            >
              Find people →
            </span>
          </p>
        </div>
      )}

      {/* Top Picks placeholder(feature later) */}
      <div style={{ ...section, borderBottom: 'none', paddingTop: 7}}>
        <span style={sectionLabel}>Top Picks</span>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text3)',
          lineHeight: 1.6,
          margin: 0,
          fontStyle: 'italic',
        }}>
          most liked posts will appear here.
        </p>
      </div>

      <div style={{ paddingTop: 4 }}>
        {/* <span
          onClick={logout}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
            cursor: 'pointer',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          Sign out
        </span> */}
      </div>

    </div>
  )
}