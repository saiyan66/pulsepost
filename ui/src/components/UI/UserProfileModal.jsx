import { useState, useEffect } from 'react'
import { usersApi, postsApi } from '../../api/client.js'
import { useAuth } from '../../utils/Auth.jsx'
import { useToast } from './Toast.jsx'
import PostDetail from '../Post/PostDetail.jsx'

function initials(username) {
  return (username || '?').slice(0, 2).toUpperCase()
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function UserProfileModal({ userId, onClose }) {
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const [profile, setProfile]       = useState(null)
  const [posts, setPosts]           = useState([])
  const [followers, setFollowers]   = useState([])
  const [following, setFollowing]   = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [selectedPost, setSelected] = useState(null)

  const isMe = currentUser && currentUser.id === userId

  useEffect(() => {
    loadProfile()
  }, [userId])

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function loadProfile() {
    setLoading(true)
    try {
      const [profileData, allPosts, followersData, followingData] = await Promise.all([
        usersApi.get(userId),
        postsApi.list(50),
        usersApi.followers(userId),
        usersApi.following(userId),
      ])

      setProfile(profileData)
      // Filter posts to this user's only
      setPosts(allPosts.items.filter(p => p.author_id === userId))
      setFollowers(followersData)
      setFollowing(followingData)

      // Check if current user follows this profile
      if (currentUser) {
        const alreadyFollowing = followersData.some(f => f.id === currentUser.id)
        setIsFollowing(alreadyFollowing)
      }
    } catch(err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function toggleFollow() {
    if (!currentUser) {
      toast('Sign in to follow people', 'error')
      return
    }
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await usersApi.unfollow(userId)
        setIsFollowing(false)
        setFollowers(prev => prev.filter(f => f.id !== currentUser.id))
        toast(`Unfollowed @${profile.username}`)
      } else {
        await usersApi.follow(userId)
        setIsFollowing(true)
        setFollowers(prev => [...prev, currentUser])
        toast(`Following @${profile.username}`)
      }
    } catch(err) {
      toast(err.message, 'error')
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
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
        maxWidth: 580,
        animation: 'fadeUp 0.2s ease both',
      }}>

        {/* Modal header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Author
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

        {/* Loading */}
        {loading && (
          <div style={{
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 16, height: 16,
              border: '1px solid var(--border2)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              margin: '0 auto 12px',
            }}/>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--text3)',
            }}>
              loading profile...
            </div>
          </div>
        )}

        {/* Profile content */}
        {!loading && profile && (
          <>
            {/* Profile header */}
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: '50%',
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)',
                    fontSize: 16,
                    color: 'var(--accent)',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}>
                    {initials(profile.username)}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 22,
                      color: 'var(--ink)',
                      marginBottom: 3,
                    }}>
                      {profile.username}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: 'var(--text3)',
                    }}>
                      Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Follow button — only shown if not viewing your own profile */}
                {!isMe && currentUser && (
                  <button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    style={{
                      padding: '8px 20px',
                      background: isFollowing ? 'transparent' : 'var(--text)',
                      color: isFollowing ? 'var(--text2)' : 'var(--paper)',
                      border: isFollowing
                        ? '1px solid var(--border)'
                        : '1px solid var(--text)',
                      borderRadius: 'var(--radius)',
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: followLoading ? 'default' : 'pointer',
                      transition: 'all 0.1s',
                      flexShrink: 0,
                    }}
                    onMouseOver={e => {
                      if (!followLoading && isFollowing) {
                        e.currentTarget.style.borderColor = 'var(--danger)'
                        e.currentTarget.style.color = 'var(--danger)'
                      }
                    }}
                    onMouseOut={e => {
                      if (isFollowing) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text2)'
                      }
                    }}
                  >
                    {followLoading
                      ? '...'
                      : isFollowing
                        ? 'Following'
                        : '+ Follow'
                    }
                  </button>
                )}

                {/* Sign in prompt for guests */}
                {!isMe && !currentUser && (
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    color: 'var(--text3)',
                    letterSpacing: '0.06em',
                  }}>
                    Sign in to follow
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex',
                gap: 0,
                borderTop: '1px solid var(--border)',
                paddingTop: 16,
              }}>
                {[
                  { label: 'Posts',     value: posts.length     },
                  { label: 'Followers', value: followers.length },
                  { label: 'Following', value: following.length },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 22,
                      color: 'var(--ink)',
                      lineHeight: 1,
                      marginBottom: 4,
                    }}>
                      {value}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 9,
                      color: 'var(--text3)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts list */}
            <div style={{ borderTop: '2px solid var(--border)' }}>
              <div style={{
                padding: '12px 24px',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  color: 'var(--text3)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}>
                  Posts by {profile.username}
                </span>
              </div>

              {posts.length === 0 ? (
                <div style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--text3)',
                  fontStyle: 'italic',
                }}>
                  No posts yet.
                </div>
              ) : (
                posts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => setSelected(post)}
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 16,
                      color: 'var(--ink)',
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}>
                      {post.title}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: 'var(--text3)',
                    }}>
                      {timeAgo(post.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Nested post detail */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}