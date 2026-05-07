import { useState } from 'react'
import { postsApi } from '../api/client.js'
import { useAuth } from '../utils/Auth.jsx'
import { useToast } from '../components/UI/Toast.jsx'

export default function Write({ navigate }) {
  const { user } = useAuth()
  const toast = useToast()

  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [submitting, setSubmitting] = useState(false)


  if (!user) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: 20,
          color: 'var(--text3)',
          fontStyle: 'italic',
          marginBottom: 16,
        }}>
          Sign in to write.
        </div>
        <button
          onClick={() => navigate('auth')}
          style={{
            padding: '8px 20px',
            background: 'var(--text)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast('Title and content are required', 'error')
      return
    }
    setSubmitting(true)
    try {
      await postsApi.create(title.trim(), content.trim())
      toast('Post published')
      navigate('feed')
    } catch(err) {
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '20px 32px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 24,
          fontWeight: 400,
          color: 'var(--ink)',
        }}>
          New Post
        </h1>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--text3)',
          letterSpacing: '0.08em',
        }}>
          {wordCount > 0 ? `${wordCount} words` : 'draft'}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '32px' }}>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give your post a title..."
            maxLength={300}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              borderRadius: 0,
              padding: '8px 0',
              fontFamily: 'var(--serif)',
              fontSize: 16,
              fontWeight: 400,
              color: 'var(--ink)',
              outline: 'none',
              transition: 'border-color 0.1s',
            }}
            onFocus={e => e.target.style.borderBottomColor = 'var(--border2)'}
            onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
          />
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
            marginTop: 5,
            textAlign: 'right',
          }}>
            {title.length}/300
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          color: 'var(--text3)',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            content
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
        </div>

        <div style={{ marginBottom: 32 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write something worth reading..."
            rows={16}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              padding: '0',
              fontFamily: 'var(--body)',
              fontSize: 13,
              color: 'var(--text)',
              lineHeight: 1.85,
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingTop: 20,
          borderTop: '1px solid var(--border)',
        }}>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            style={{
              padding: '9px 24px',
              background: title.trim() && content.trim()
                ? 'var(--text)'
                : 'var(--bg3)',
              color: title.trim() && content.trim()
                ? 'var(--paper)'
                : 'var(--text3)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: title.trim() && content.trim() ? 'pointer' : 'default',
              transition: 'all 0.1s',
            }}
          >
            {submitting ? 'Publishing...' : 'Publish →'}
          </button>
          <button
            type="button"
            onClick={() => navigate('feed')}
            style={{
              padding: '9px 20px',
              background: 'transparent',
              color: 'var(--text3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
            marginLeft: 'auto',
          }}>
            by @{user.username}
          </span>
        </div>
      </form>
    </div>
  )
}