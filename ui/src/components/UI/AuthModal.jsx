import { useState } from 'react'
import { useAuth } from '../../utils/Auth.jsx'
import { useToast } from './Toast.jsx'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--paper)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontFamily: 'var(--body)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.1s',
  marginTop: 5,
}

const labelStyle = {
  fontFamily: 'var(--mono)',
  fontSize: 10,
  color: 'var(--text3)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  display: 'block',
}

export default function AuthModal({ onClose, onSuccess }) {
  const { login, register } = useAuth()
  const toast = useToast()

  const [tab, setTab]         = useState('login')
  const [loading, setLoading] = useState(false)

  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regUsername, setRegUsername]     = useState('')
  const [regEmail, setRegEmail]           = useState('')
  const [regPassword, setRegPassword]     = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast('Fill in all fields', 'error')
      return
    }
    setLoading(true)
    try {
      const user = await login(loginEmail, loginPassword)
      toast(`Welcome back, ${user.username}`)
      onClose()
      if (onSuccess) onSuccess()
    } catch(err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!regUsername || !regEmail || !regPassword) {
      toast('Fill in all fields', 'error')
      return
    }
    setLoading(true)
    try {
      const user = await register(regUsername, regEmail, regPassword)
      toast(`Welcome, ${user.username}`)
      onClose()
      if (onSuccess) onSuccess()
    } catch(err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,22,18,0.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: 2,
          width: '100%',
          maxWidth: 400,
          animation: 'fadeUp 0.2s ease both',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 20,
            color: 'var(--ink)',
          }}>
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              cursor: 'pointer',
              fontSize: 16,
              fontFamily: 'var(--mono)',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            marginBottom: 24,
          }}>
            {[
              { key: 'login',    label: 'Sign In'        },
              { key: 'register', label: 'Register'       },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: '6px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: tab === key
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  marginBottom: -1,
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: tab === key ? 'var(--accent)' : 'var(--text3)',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border2)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border2)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: loading ? 'var(--bg3)' : 'var(--text)',
                  color: loading ? 'var(--text3)' : 'var(--paper)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
              <div style={{
                marginTop: 14,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text3)',
                textAlign: 'center',
              }}>
                No account?{' '}
                <span
                  onClick={() => setTab('register')}
                  style={{ color: 'var(--accent)', cursor: 'pointer' }}
                >
                  Register
                </span>
              </div>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="yourhandle"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border2)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border2)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="min 8 characters"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border2)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: loading ? 'var(--bg3)' : 'var(--text)',
                  color: loading ? 'var(--text3)' : 'var(--paper)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Creating...' : 'Create Account →'}
              </button>
              <div style={{
                marginTop: 14,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text3)',
                textAlign: 'center',
              }}>
                Have an account?{' '}
                <span
                  onClick={() => setTab('login')}
                  style={{ color: 'var(--accent)', cursor: 'pointer' }}
                >
                  Sign in
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}