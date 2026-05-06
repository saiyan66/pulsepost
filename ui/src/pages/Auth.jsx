import { useState } from 'react'
import { useAuth } from '../utils/Auth.jsx'
import { useToast } from '../components/UI/Toast.jsx'

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

export default function Auth({ navigate }) {
  const { login, register } = useAuth()
  const toast = useToast()

  const [tab, setTab]           = useState('login')
  const [loading, setLoading]   = useState(false)

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail]       = useState('')
  const [regPassword, setRegPassword] = useState('')

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
      navigate('feed')
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
      navigate('feed')
    } catch(err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div style={{
        padding: '20px 32px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 24,
          fontWeight: 400,
          color: 'var(--ink)',
          letterSpacing: '-0.01em',
        }}>
          {tab === 'login' ? 'Sign In' : 'Create Account'}
        </h1>
      </div>

      <div style={{ padding: '32px', maxWidth: 420 }}>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: 28,
        }}>
          {[
            { key: 'login',    label: 'Sign In'        },
            { key: 'register', label: 'Create Account' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === key
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                marginBottom: -1,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: tab === key ? 'var(--accent)' : 'var(--text3)',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Login form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
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
            <div style={{ marginBottom: 24 }}>
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
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div style={{
              marginTop: 16,
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
            <div style={{ marginBottom: 16 }}>
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
            <div style={{ marginBottom: 16 }}>
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
            <div style={{ marginBottom: 24 }}>
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
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <div style={{
              marginTop: 16,
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
  )
}