import { useState, useEffect } from 'react'
import { commentsApi, postsApi } from '../../api/client.js'
import { useAuth } from '../../utils/Auth.jsx'
import { useToast } from '../UI/Toast.jsx'
import likeOutlined from '../../images/like-outlined.svg'
import likeFilled from '../../images/like-filled.svg'
import eyeIcon from '../../images/eye.svg'


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

export default function PostDetail({ post, onClose, onPostUpdated }) {
  const { user } = useAuth()
  const toast = useToast()

  const [comments, setComments] = useState([])
  const [loadingC, setLoadingC] = useState(true)
  const [comment, setComment]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editContent, setEditContent] = useState(post.content)
  const [saving, setSaving] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [liking, setLiking] = useState(false)


  const isAuthor = user && user.id === post.author_id


  useEffect(() => {   
    if (!user) return
    postsApi.isLiked(post.id)
      .then(data => setLiked(data.liked))
      .catch(() => {})
  }, [post.id, user])


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

  async function toggleLike() {
  if (!user) { toast('Sign in to like posts', 'error'); return }
  setLiking(true)
  try {
    if (liked) {
        await postsApi.unlike(post.id)
        setLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        await postsApi.like(post.id)
        setLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch(e) {
      toast(e.message, 'error')
   } finally {
      setLiking(false)
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

  async function saveEdit() {
    if (!editTitle.trim() || !editContent.trim()) {
      toast('Title and content cannot be empty', 'error')
      return
    }
    setSaving(true)
    try {
      const updated = await postsApi.update(post.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      toast('Post updated')
      setEditing(false)
      if (onPostUpdated) onPostUpdated(updated)
    } catch(e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditing(false)
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

        {/* Modal header */}
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

  
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAuthor && !editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '4px 12px',
                  background: 'transparent',
                  color: 'var(--text3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = 'var(--ink)'
                  e.currentTarget.style.borderColor = 'var(--border2)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = 'var(--text3)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                ✎ Edit
              </button>
            )}

            {isAuthor && editing && (
              <>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding: '4px 12px',
                    background: 'transparent',
                    color: 'var(--text3)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  style={{
                    padding: '4px 12px',
                    background: saving ? 'var(--bg3)' : 'var(--text)',
                    color: saving ? 'var(--text3)' : 'var(--paper)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: saving ? 'default' : 'pointer',
                    transition: 'all 0.1s',
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}

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
        </div>

        {/* Post content — read or edit mode */}
        <div style={{ padding: '32px 28px' }}>

          {editing ? (
        
            <>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                maxLength={300}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border2)',
                  borderRadius: 0,
                  padding: '4px 0 8px',
                  fontFamily: 'var(--serif)',
                  fontSize: 26,
                  fontWeight: 400,
                  color: 'var(--ink)',
                  outline: 'none',
                  marginBottom: 24,
                }}
              />
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={12}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 0,
                  padding: 0,
                  fontFamily: 'var(--body)',
                  fontSize: 15,
                  color: 'var(--text)',
                  lineHeight: 1.85,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: 'var(--text3)',
                marginTop: 8,
                textAlign: 'right',
              }}>
                {editContent.trim().split(/\s+/).filter(Boolean).length} words
              </div>
            </>
          ) : (
       
            <>
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

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginTop: 28,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
              }}>
                <button
                  onClick={toggleLike}
                  disabled={liking}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'transparent',
                    border: liked ? '1px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '5px 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: liked ? 'var(--accent)' : 'var(--text3)',
                    cursor: user ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                    outline: 'none', 
                  }}
                  onMouseOver={e => {
                    if (user && !liking) {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.color = 'var(--accent)'
                    }
                  }}
                  onMouseOut={e => {
                    if (!liked) {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text3)'
                    }
                  }}
                >
                 {liked ? (
                    <img src={likeFilled} alt="liked" style={{ width: 14, height: 14, display: 'block' }} />
                  ) : (
                    <img src={likeOutlined} alt="like" style={{ width: 14, height: 14, display: 'block' }} />
                  )}
                </button>
                
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--text3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <img src={eyeIcon} alt="views" style={{ width: 14, height: 14, display: 'block' }} />
                  {post.views_count || 0} views
                </span>
              </div>
            </>
          )}
        </div>

        {/* Comments (only in read mode)*/}
        {!editing && (
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
              {loadingC
                ? 'Loading comments...'
                : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`
              }
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
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}