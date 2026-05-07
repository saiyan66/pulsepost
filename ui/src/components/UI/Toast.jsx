import { useState, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}

    
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: '10px 16px',
              background: 'var(--paper)',
              border: `1px solid ${t.type === 'error' ? 'var(--danger)' : 'var(--border2)'}`,
              borderLeft: `3px solid ${t.type === 'error' ? 'var(--danger)' : 'var(--accent)'}`,
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: t.type === 'error' ? 'var(--danger)' : 'var(--text)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              animation: 'fadeUp 0.2s ease both',
              maxWidth: 320,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}


export function useToast() {
  return useContext(ToastContext)
}