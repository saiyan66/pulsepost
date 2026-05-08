import { useState, useEffect } from 'react'
import { useAuth } from '../../utils/Auth.jsx'
import bellIcon from '../../images/bell.svg';

export default function Header({
  currentPage,
  navigate,
  unreadCount = 0,
  notifications = [],
  onNotificationsOpen,
}) {
  const { user, logout } = useAuth()
  const [showNotifs, setShowNotifs] = useState(false)

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    if (!showNotifs) return
    const handler = () => setShowNotifs(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showNotifs])

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
      </div>

  
      <nav style={{
        display: 'flex',
        borderLeft: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
      }}>
        {[
          { label: 'Feed', page: 'feed'    },
          { label: 'Explore', page: 'explore' },
          { label: 'Search', page: 'search'  },
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
          <>
            <div
              style={{ position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowNotifs(prev => !prev)
                  if (!showNotifs) onNotificationsOpen?.()
                }}
                title="Notifications"
                style={{
                  width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  color: 'var(--text2)',
                  cursor: 'pointer',
                  fontSize: 14,
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.1s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'var(--bg3)'
                  e.currentTarget.style.borderColor = 'var(--border2)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <img src={bellIcon} alt="notifications" style={{ width: 15, height: 15 }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -3, right: -3,
                    minWidth: 16, height: 16,
                    padding: '0 3px',
                    background: 'var(--accent)',
                    color: 'var(--paper)',
                    borderRadius: 8,
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifs && (
                <div style={{
                  position: 'absolute',
                  top: 42,
                  right: 0,
                  width: 300,
                  background: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  zIndex: 300,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text3)',
                  }}>
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{
                      padding: '20px 14px',
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: 'var(--text3)',
                    }}>
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid var(--border)',
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          color: 'var(--text2)',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: 'var(--accent)', marginRight: 6 }}>
                          {n.type === 'new_post'     && '◈'}
                          {n.type === 'new_follower' && '◇'}
                          {n.type === 'new_comment'  && '○'}
                        </span>
                        {n.text}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('write')}
              title="Write a new post"
              style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                color: 'var(--text2)',
                cursor: 'pointer',
                fontSize: 15,
                flexShrink: 0,
                transition: 'all 0.1s',
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
                padding: '4px 8px',
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
              sign out
            </button>
          </>
        )}

        {!user && (
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