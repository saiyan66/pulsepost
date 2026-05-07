import { useState, useRef } from 'react'
import { postsApi, usersApi } from '../api/client.js'
import { useAuth } from '../utils/Auth.jsx'
import { useToast } from '../components/UI/Toast.jsx'
import PostCard from '../components/Post/PostCard.jsx'
import PostDetail from '../components/Post/PostDetail.jsx'
import UserProfileModal from '../components/UI/UserProfileModal.jsx'

export default function Search({ navigate }) {
  const { user } = useAuth()
  const toast = useToast()

  const [query, setQuery]           = useState('')
  const [posts, setPosts]           = useState([])
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [searched, setSearched]     = useState(false)
  const [selectedPost, setSelected] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const debounceRef = useRef(null)

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)

    // Debounce — wait 400ms after user stops typing before searching
    clearTimeout(debounceRef.current)
    if (!val.trim() || val.trim().length < 2) {
      setPosts([])
      setUsers([])
      setSearched(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      runSearch(val.trim())
    }, 400)
  }

  async function runSearch(q) {
    setLoading(true)
    setSearched(true)
    try {
      // Run both searches in parallel
      const [postResults, userResults] = await Promise.all([
        postsApi.search(q),
        usersApi.search(q),
      ])
      setPosts(postResults.posts || [])
      setUsers(userResults || [])
    } catch(err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (query.trim().length >= 2) {
      clearTimeout(debounceRef.current)
      runSearch(query.trim())
    }
  }

  const hasResults = posts.length > 0 || users.length > 0
  const noResults  = searched && !loading && !hasResults

  return (
    <>
      {/* Header */}
      <div style={{
        padding: '20px 32px 0',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 24,
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: 16,
        }}>
          Search
        </h1>

        {/* Search input */}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            borderBottom: '2px solid var(--text)',
            paddingBottom: 8,
            marginBottom: 0,
          }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 14,
              color: 'var(--text3)',
              marginRight: 10,
            }}>
              /
            </span>
            <input
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Search posts and people..."
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--body)',
                fontSize: 14,
                color: 'var(--ink)',
                padding: '4px 0',
              }}
            />
            {loading && (
              <div style={{
                width: 14, height: 14,
                border: '1px solid var(--border2)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
              }}/>
            )}
          </div>
        </form>

        {/* Result count tabs */}
        {searched && !loading && (
          <div style={{
            display: 'flex',
            gap: 20,
            paddingTop: 12,
          }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--text3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </span>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--text3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

    
      {!searched && (
        <div style={{
          padding: '60px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--text3)',
          }}>
            Search posts by title or content, or find people by username.
          </div>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div style={{
          padding: '60px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 18,
            color: 'var(--text3)',
            fontStyle: 'italic',
          }}>
            Nothing found for "{query}"
          </div>
        </div>
      )}

      {/* Users section */}
      {users.length > 0 && (
        <div>
          <div style={{
            padding: '16px 32px 10px',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--text3)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>
              People
            </span>
          </div>
          {users.map(u => (
            <UserRow
              key={u.id}
              user={u}
              currentUser={user}
              onClick={() => setSelectedUser(u)}
            />
          ))}
        </div>
      )}

      {/* Posts section */}
      {posts.length > 0 && (
        <div>
          {users.length > 0 && (
            <div style={{
              padding: '16px 32px 10px',
              borderBottom: '1px solid var(--border)',
              borderTop: '2px solid var(--border)',
            }}>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: 'var(--text3)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}>
                Posts
              </span>
            </div>
          )}
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              onClick={() => setSelected(post)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelected(null)}
        />
      )}

      {selectedUser && (
        <UserProfileModal
          userId={selectedUser.id}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

function UserRow({ user, currentUser, onClick }) {
  function initials(username) {
    return (username || '?').slice(0, 2).toUpperCase()
  }

  const isMe = currentUser && currentUser.id === user.id

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseOver={e => e.currentTarget.style.background = 'var(--bg2)'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 38, height: 38,
        borderRadius: '50%',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--accent)',
        fontWeight: 500,
        flexShrink: 0,
      }}>
        {initials(user.username)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: 16,
          color: 'var(--ink)',
          marginBottom: 2,
        }}>
          {user.username}
          {isMe && (
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--text3)',
              marginLeft: 8,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              you
            </span>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text3)',
        }}>
          {user.email}
        </div>
      </div>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        color: 'var(--accent)',
      }}>
        View →
      </span>
    </div>
  )
}