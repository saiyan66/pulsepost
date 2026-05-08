// src/components/UI/UserListModal.jsx
import { useState } from 'react'
import UserProfileModal from './UserProfileModal.jsx'

function initials(username) {
  return (username || '?').slice(0, 2).toUpperCase()
}

export default function UserListModal({ title, users, onClose }) {
  const [selectedUser, setSelectedUser] = useState(null)

  return (
    <>
      <div
        onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,22,18,0.6)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: 2,
          width: '100%',
          maxWidth: 400,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeUp 0.2s ease both',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: 18,
              color: 'var(--ink)',
            }}>
              {title}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text3)',
                cursor: 'pointer',
                fontSize: 16,
                fontFamily: 'var(--mono)',
              }}
            >
              ✕
            </button>
          </div>

          {/* User list — scrollable */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {users.length === 0 ? (
              <div style={{
                padding: '32px 20px',
                textAlign: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--text3)',
              }}>
                Nobody here yet.
              </div>
            ) : (
              users.map(u => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 36, height: 36,
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
                    {initials(u.username)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 15,
                      color: 'var(--ink)',
                      marginBottom: 2,
                    }}>
                      {u.username}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: 'var(--text3)',
                    }}>
                      {u.email}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--accent)',
                  }}>
                    View →
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserProfileModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <style>{`@keyframes fadeUp {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }`}</style>
    </>
  )
}