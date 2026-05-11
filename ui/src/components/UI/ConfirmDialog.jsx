import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel?.() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,22,18,0.6)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
        animation: 'fadeUp 0.18s ease both',
      }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {title}
          </div>
          <button
            onClick={() => onCancel?.()}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              cursor: loading ? 'default' : 'pointer',
              fontSize: 16,
              fontFamily: 'var(--mono)',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '18px' }}>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 18,
            color: 'var(--ink)',
            marginBottom: 8,
            lineHeight: 1.25,
          }}>
            {message}
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--text3)',
            lineHeight: 1.6,
          }}>
            This action can’t be undone.
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 16,
          }}>
            <button
              onClick={() => onCancel?.()}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: 'var(--text2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => onConfirm?.()}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: danger ? 'transparent' : 'var(--text)',
                color: danger ? 'var(--danger)' : 'var(--paper)',
                border: danger ? '1px solid var(--danger)' : '1px solid var(--text)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? '...' : confirmText}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}

