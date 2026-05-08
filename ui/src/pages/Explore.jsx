import { useState, useEffect } from 'react'
import { postsApi } from '../api/client.js'
import { useToast } from '../components/UI/Toast.jsx'
import PostCard from '../components/Post/PostCard.jsx'
import PostDetail from '../components/Post/PostDetail.jsx'
import UserProfileModal from '../components/UI/UserProfileModal.jsx'

export default function Explore() {
  const toast = useToast()
  const [posts, setPosts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedPost, setSelected] = useState(null)
  const [hasMore, setHasMore]       = useState(false)
  const [cursor, setCursor]         = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const data = await postsApi.list()
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
      const data = await postsApi.list(10, cursor)
      setPosts(prev => [...prev, ...data.items])
      setHasMore(data.has_more)
      setCursor(data.next_cursor)
    } catch(e) {
      toast(e.message, 'error')
    } finally {
      setLoadingMore(false)
    }
  }

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
          Explore
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
            letterSpacing: '0.08em',
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
          }}>
            No posts yet.
          </div>
        </div>
      )}

      {!loading && posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          index={i}
          onClick={() => setSelected(post)}
          onAuthorClick={(userId) => setSelectedUser(userId)}
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