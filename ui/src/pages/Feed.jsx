// src/pages/Feed.jsx
import { useState, useEffect } from 'react'
import { postsApi } from '../api/client.js'
import { useAuth } from '../utils/Auth.jsx'
import { useToast } from '../components/UI/Toast.jsx'
import PostCard from '../components/Post/PostCard.jsx'
import PostDetail from '../components/Post/PostDetail.jsx'
import UserProfileModal from '../components/UI/UserProfileModal.jsx'

export default function Feed({ navigate }) {
  const { user } = useAuth()
  const toast = useToast()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelected] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (user) loadPosts()
    else setLoading(false)
  }, [user])

  async function loadPosts() {
    setLoading(true)
    setPosts([])
    setCursor(null)
    try {
      let data = await postsApi.feed()

      if (!data.items.length) data = await postsApi.list()
      setPosts(data.items)
      setHasMore(data.has_more)
      setCursor(data.next_cursor)
    } catch(e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await postsApi.feed(10, cursor)
      setPosts(prev => [...prev, ...data.items])
      setHasMore(data.has_more)
      setCursor(data.next_cursor)
    } catch(e) {
      toast(e.message, 'error')
    } finally {
      setLoadingMore(false)
    }
  }

  // (if not signed in)
  if (!user) {
    return (
      <div>
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
            Your Feed
          </h1>
        </div>
        <div style={{
          padding: '80px 32px',
          textAlign: 'center',
          maxWidth: 400,
          margin: '0 auto',
        }}>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 22,
            color: 'var(--ink)',
            marginBottom: 12,
            fontStyle: 'italic',
          }}>
            Welcome to PulsePost.
          </div>
          <p style={{
            fontFamily: 'var(--body)',
            fontSize: 14,
            color: 'var(--text2)',
            lineHeight: 1.8,
            marginBottom: 28,
          }}>
            Sign in to read posts from authors you follow,
            write your own, and join the conversation.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('auth')}
              style={{
                padding: '9px 24px',
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
              Sign In
            </button>
            <button
              onClick={() => navigate('explore')}
              style={{
                padding: '9px 24px',
                background: 'transparent',
                color: 'var(--text2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Browse Posts →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // (Signed in normal feed)
  return (
    <>
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
          Your Feed
        </h1>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {loading ? '...' : `${posts.length} posts`}
        </span>
      </div>

      {loading && (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{
            width: 18, height: 18,
            border: '1px solid var(--border2)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            margin: '0 auto 14px',
          }}/>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--text3)',
          }}>
            loading...
          </div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ padding: '80px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 20,
            color: 'var(--text3)',
            fontStyle: 'italic',
            marginBottom: 16,
          }}>
            Nothing here yet.
          </div>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--text3)',
            marginBottom: 20,
          }}>
            Follow some authors or write the first post.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('search')}
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
              Find People
            </button>
            <button
              onClick={() => navigate('write')}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                color: 'var(--text2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Write a Post
            </button>
          </div>
        </div>
      )}

      {!loading && posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          index={i}
          onClick={() => setSelected(post)}
          onAuthorClick={userId => setSelectedUser(userId)}
        />
      ))}

      {hasMore && !loading && (
        <div style={{ padding: '24px 32px', textAlign: 'center' }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: '8px 24px',
              background: 'transparent',
              color: 'var(--text2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {loadingMore ? 'Loading...' : 'Load more →'}
          </button>
        </div>
      )}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelected(null)}
          onPostUpdated={(updated) => {
            setPosts(prev =>
              prev.map(p => p.id === updated.id ? { ...p, ...updated } : p)
            )
            setSelected(prev => ({ ...prev, ...updated }))
          }}
        />
      )}

      {selectedUser && (
        <UserProfileModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}

        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}