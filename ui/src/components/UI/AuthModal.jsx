import { useState } from 'react'
import { useAuth } from '../../utils/Auth.jsx'
import { useToast } from './Toast.jsx'
import { authApi } from '../../api/client.js'


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
  const [resetEmail, setResetEmail]         = useState('')
  const [resetPassword, setResetPassword]   = useState('')
  const [resetConfirm, setResetConfirm]     = useState('')
  const [resetDone, setResetDone]           = useState(false)

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

  async function handleReset(e) {
  e.preventDefault()
  if (!resetEmail || !resetPassword) {
    toast('Fill in all fields', 'error')
    return
  }
  if (resetPassword !== resetConfirm) {
    toast('Passwords do not match', 'error')
    return
  }
  if (resetPassword.length < 8) {
    toast('Password must be at least 8 characters', 'error')
    return
  }
  setLoading(true)
  try {
    await authApi.resetPassword(resetEmail, resetPassword)
    setResetDone(true)
  } catch(err) {
    toast(err.message, 'error')
  } finally {
    setLoading(false)
  }
}

  return (
    <div
      onMouseDown={e => {
      if (e.target === e.currentTarget) onClose() }}
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
              { key: 'reset',    label: 'Reset Password' },
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
              <div style={{
                textAlign: 'right',
                marginTop: -8,
                marginBottom: 16,
              }}>
                <span
                  onClick={() => setTab('reset')}
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
                  Forgot password?
                </span>
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
          {tab === 'reset' && (
  <div>
    {resetDone ? (
      // Success state
      <div style={{
        padding: '20px 0',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: 18,
          color: 'var(--ink)',
          marginBottom: 10,
        }}>
          Done.
        </div>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text3)',
          lineHeight: 1.7,
          marginBottom: 20,
        }}>
          If that email was registered, your password has been updated.
          Sign in with your new password.
        </p>
        <button
          onClick={() => {
            setTab('login')
            setResetDone(false)
            setResetEmail('')
            setResetPassword('')
            setResetConfirm('')
          }}
          style={{
            padding: '8px 20px',
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
          Sign In →
        </button>
      </div>
    ) : (
      // Reset form
      <form onSubmit={handleReset}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text3)',
          lineHeight: 1.7,
          marginBottom: 20,
          padding: '10px 12px',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          Enter your email and choose a new password.
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--border2)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>New Password</label>
          <input
            type="password"
            value={resetPassword}
            onChange={e => setResetPassword(e.target.value)}
            placeholder="min 8 characters"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--border2)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password"
            value={resetConfirm}
            onChange={e => setResetConfirm(e.target.value)}
            placeholder="repeat new password"
            style={{
              ...inputStyle,
              borderColor: resetConfirm && resetConfirm !== resetPassword
                ? 'var(--danger)'
                : undefined,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border2)'}
            onBlur={e => {
              e.target.style.borderColor = resetConfirm !== resetPassword
                ? 'var(--danger)'
                : 'var(--border)'
            }}
          />
          {resetConfirm && resetConfirm !== resetPassword && (
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--danger)',
              marginTop: 4,
            }}>
              Passwords do not match
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !resetEmail || !resetPassword || resetPassword !== resetConfirm}
          style={{
            width: '100%',
            padding: '10px',
            background: loading || !resetEmail || !resetPassword || resetPassword !== resetConfirm
              ? 'var(--bg3)'
              : 'var(--text)',
            color: loading || !resetEmail || !resetPassword || resetPassword !== resetConfirm
              ? 'var(--text3)'
              : 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.1s',
          }}
        >
          {loading ? 'Updating...' : 'Reset Password →'}
        </button>

        <div style={{
          marginTop: 14,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text3)',
          textAlign: 'center',
        }}>
          Remember it?{' '}
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
)}
        </div>
      </div>
    </div>
  )
}