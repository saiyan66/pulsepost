import { useState, useEffect, useRef } from 'react'
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
  const notifWrapperRef = useRef(null)

  useEffect(() => {
    if (!showNotifs) return
    const handler = (event) => {
      if (!notifWrapperRef.current?.contains(event.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifs])

  return (
    <header className="pulse-header">
      {/* Logo */}
      <div
        onClick={() => navigate('feed')}
        className="logo"
      >
        PulsePost
      </div>

    
      <nav className="main-nav">
        {[
          { label: 'Feed', page: 'feed' },
          { label: 'Explore', page: 'explore' },
          { label: 'Search', page: 'search' },
        ].map(({ label, page }) => (
          <button
            key={page}
            onClick={() => navigate(page)}
            className={`nav-btn ${currentPage === page ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right side: user actions */}
      <div className="user-area">
        {user && (
          <>
            {/* Notifications */}
            <div className="notification-wrapper" ref={notifWrapperRef}>
              <button
                className="icon-btn bell-btn"
                onClick={() => {
                  setShowNotifs(prev => !prev)
                  if (!showNotifs) onNotificationsOpen?.()
                }}
                title="Notifications"
              >
                <img src={bellIcon} alt="notifications" />
                {unreadCount > 0 && (
                  <span className="notif-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications yet.</div>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <div key={n.id} className="notif-item">
                        <span className="notif-icon">
                          {n.type === 'new_post' && '◈'}
                          {n.type === 'new_follower' && '◇'}
                          {n.type === 'new_comment' && '○'}
                          {n.type === 'new_like' && '♥'}
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
              className="icon-btn write-btn"
              title="Write a new post"
            >
              ✎
            </button>

           
            <span
              onClick={() => navigate('profile')}
              className="username"
            >
              @{user.username}
            </span>

         
            <button onClick={logout} className="signout-btn">
              sign out
            </button>
          </>
        )}

        {!user && (
          <button onClick={() => navigate('auth')} className="signin-btn">
            Sign in
          </button>
        )}
      </div>

      <style>{`
        /* Base header styles (desktop first) */
        .pulse-header {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: var(--paper);
          border-bottom: 1px solid var(--border);
          gap: 24px;
          flex-wrap: wrap;
        }

        .logo {
          font-family: var(--serif);
          font-size: 24px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          letter-spacing: -0.02em;
          user-select: none;
          white-space: nowrap;
        }

        .main-nav {
          display: flex;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          flex: 0 0 auto;
        }

        .nav-btn {
          padding: 0 24px;
          height: 36px;
          background: transparent;
          color: var(--text2);
          border: none;
          border-right: 1px solid var(--border);
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.1s;
          white-space: nowrap;
        }

        .nav-btn.active {
          background: var(--text);
          color: var(--paper);
        }

        .nav-btn:last-child {
          border-right: none;
        }

        .user-area {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        /* Icon buttons */
        .icon-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 50%;
          color: var(--text2);
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.1s;
        }

        .icon-btn:hover {
          background: var(--bg3);
          border-color: var(--border2);
        }

        .bell-btn {
          position: relative;
        }

        .bell-btn img {
          width: 15px;
          height: 15px;
        }

        .notif-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          min-width: 16px;
          height: 16px;
          padding: 0 3px;
          background: var(--accent);
          color: var(--paper);
          border-radius: 8px;
          font-family: var(--mono);
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .username {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text3);
          cursor: pointer;
          letter-spacing: 0.04em;
          user-select: none;
          white-space: nowrap;
        }

        .username:hover {
          color: var(--accent);
        }

        .signout-btn {
          padding: 4px 8px;
          background: transparent;
          color: var(--text3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.1s;
        }

        .signout-btn:hover {
          border-color: var(--border2);
        }

        .signin-btn {
          padding: 6px 18px;
          background: var(--text);
          color: var(--paper);
          border: none;
          border-radius: var(--radius);
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
        }

        /* Notifications dropdown */
        .notification-wrapper {
          position: relative;
        }

        .notif-dropdown {
          position: absolute;
          top: 42px;
          right: 0;
          width: 280px;
          background: var(--paper);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          z-index: 300;
          overflow: hidden;
        }

        .notif-header {
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text3);
        }

        .notif-empty {
          padding: 20px 14px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text3);
        }

        .notif-item {
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text2);
          line-height: 1.5;
        }

        .notif-icon {
          color: var(--accent);
          margin-right: 6px;
        }

        /* Responsive: tablet and mobile */
        @media (max-width: 900px) {
          .pulse-header {
            padding: 0 20px;
            gap: 16px;
          }
          .nav-btn {
            padding: 0 16px;
            font-size: 10px;
          }
        }

        @media (max-width: 680px) {
          .pulse-header {
            flex-direction: column;
            height: auto;
            padding: 12px 16px;
            gap: 12px;
            align-items: stretch;
          }
          .logo {
            text-align: center;
          }
          .main-nav {
            justify-content: center;
            flex: 1;
          }
          .nav-btn {
            flex: 1;
            text-align: center;
            padding: 0 8px;
            font-size: 10px;
          }
          .user-area {
            justify-content: center;
            gap: 8px;
          }
          .username {
            display: none; 
          }
          .icon-btn {
            width: 32px;
            height: 32px;
          }
          .bell-btn img {
            width: 14px;
            height: 14px;
          }
          .signout-btn {
            font-size: 9px;
            padding: 3px 6px;
          }

          .notif-dropdown {
            right: 50%;
            transform: translateX(50%);
            width: min(320px, calc(100vw - 32px));
          }
        }
      `}</style>
    </header>
  )
}