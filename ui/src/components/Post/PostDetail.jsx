import { useState, useEffect } from 'react'
import { commentsApi } from '../../api/client.js'
import { useAuth } from '../../utils/Auth.jsx'
import { useToast } from '../UI/Toast.jsx'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}

function initials(username) {
  return (username || '?').slice(0, 2).toUpperCase()
}

export default function PostDetail({ post, onClose }) {
  const { user } = useAuth()
  const toast = useToast()
  const [comments, setComments]   = useState([])
  const [loadingC, setLoadingC]   = useState(true)
  const [comment, setComment]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [post.id])

 
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function loadComments() {
    setLoadingC(true)
    try {
      const data = await commentsApi.list(post.id)
      setComments(data)
    } catch(e) {
      toast(e.message, 'error')
    } finally {
      setLoadingC(false)
    }
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await commentsApi.create(post.id, comment.trim())
      setComment('')
      toast('Comment posted')
      loadComments()
    } catch(e) {
      toast(e.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // Overlay
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,22,18,0.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}
    >
      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        width: '100%',
        maxWidth: 680,
        animation: 'fadeUp 0.2s ease both',
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--accent)',
            }}>
              {initials(post.author?.username)}
            </div>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--text2)',
            }}>
              {post.author?.username}
            </span>
            <span style={{ color: 'var(--border2)', fontSize: 10 }}>·</span>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--text3)',
            }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              padding: '0 4px',
              fontFamily: 'var(--mono)',
            }}
          >
            ✕
          </button>
        </div>

     
        <div style={{ padding: '32px 28px' }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.25,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}>
            {post.title}
          </h1>
          <div style={{
            fontSize: 15,
            color: 'var(--text)',
            lineHeight: 1.85,
            fontFamily: 'var(--body)',
            whiteSpace: 'pre-wrap',
          }}>
            {post.content}
          </div>
        </div>

    
        <div style={{
          borderTop: '2px solid var(--border)',
          padding: '24px 28px',
          background: 'var(--bg)',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text3)',
            marginBottom: 20,
          }}>
            {loadingC ? 'Loading comments...' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
          </div>

       
          {!loadingC && comments.map(c => (
            <div
              key={c.id}
              style={{
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--accent)',
                marginBottom: 5,
                letterSpacing: '0.02em',
              }}>
                @{c.author?.username}
                <span style={{ color: 'var(--text3)', marginLeft: 8 }}>
                  {timeAgo(c.created_at)}
                </span>
              </div>
              <div style={{
                fontSize: 14,
                color: 'var(--text2)',
                lineHeight: 1.7,
              }}>
                {c.content}
              </div>
            </div>
          ))}

          {!loadingC && comments.length === 0 && (
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--text3)',
              marginBottom: 20,
            }}>
              No comments yet. Be the first.
            </div>
          )}

       
          {user ? (
            <form onSubmit={submitComment} style={{ marginTop: 8 }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  fontFamily: 'var(--body)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: 10,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border2)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                style={{
                  padding: '7px 20px',
                  background: comment.trim() ? 'var(--text)' : 'var(--bg3)',
                  color: comment.trim() ? 'var(--paper)' : 'var(--text3)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: comment.trim() ? 'pointer' : 'default',
                  transition: 'all 0.1s',
                }}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--text3)',
              paddingTop: 8,
            }}>
              Sign in to leave a comment.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}