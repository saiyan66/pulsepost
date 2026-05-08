import { useState, useEffect } from 'react'
import { postsApi, usersApi } from '../api/client.js'
import { useAuth } from '../utils/Auth.jsx'
import { useToast } from '../components/UI/Toast.jsx'
import PostCard from '../components/Post/PostCard.jsx'
import PostDetail from '../components/Post/PostDetail.jsx'
import UserListModal from '../components/UI/UserListModal.jsx'

function initials(username) {
  return (username || '?').slice(0, 2).toUpperCase()
}

export default function Profile({ navigate }) {
  const { user } = useAuth()
  const toast = useToast()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelected] = useState(null)
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [userListModal, setUserListModal] = useState(null)


  async function loadProfile() {
  setLoading(true)
    try {
          const [allPosts, followingData, followersData] = await Promise.all([
            postsApi.list(50),
            usersApi.following(user.id),
            usersApi.followers(user.id),
          ])
         
          const myPosts = allPosts.items.filter(p => p.author_id === user.id)
          setPosts(myPosts)
          setFollowing(followingData)
          setFollowers(followersData)
        } catch(err) {
          toast(err.message, 'error')
        } finally {
          setLoading(false)
     }
   }

  useEffect(() => {
    if (user) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [user])


  async function handleDelete(postId) {
    if (!confirm('Delete this post?')) return
    try {
      await postsApi.delete(postId)
      toast('Post deleted')
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch(err) {
      toast(err.message, 'error')
    }
  }


  if (!user) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 14,
          color: 'var(--text3)',
          fontStyle: '',
          marginBottom: 16,
        }}>
          Sign in to view your profile.
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

  return (
    <>
        {/* Profile header */}
        <div style={{
          padding: '28px 32px',
          borderBottom: '1px solid var(--border)',
        }}>
        
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
          }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: '50%',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--mono)',
              fontSize: 16,
              color: 'var(--accent)',
              fontWeight: 500,
              flexShrink: 0,
            }}>
              {initials(user.username)}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--serif)',
                fontSize: 22,
                color: 'var(--ink)',
                marginBottom: 2,
              }}>
                {user.username}
              </div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text3)',
              }}>
                {user.email}
              </div>
            </div>
        </div>

        {/* Stats row */}
          <div style={{
            display: 'flex',
            gap: 0,
            borderTop: '1px solid var(--border)',
            paddingTop: 16,
          }}>
            {[
              { label: 'Posts',     value: posts.length,     list: null             },
              { label: 'Following', value: following.length, list: following        },
              { label: 'Followers', value: followers.length, list: followers        },
            ].map(({ label, value, list }, i) => (
              <div
                key={label}
                onClick={() => {
                  if (list && list.length > 0) {
                    setUserListModal({ title: label, users: list })
                  }
                }}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  cursor: list && list.length > 0 ? 'pointer' : 'default',
                  padding: '8px 0',
                  borderRadius: 'var(--radius)',
                  transition: 'background 0.1s',
                }}
                onMouseOver={e => {
                  if (list && list.length > 0)
                    e.currentTarget.style.background = 'var(--bg2)'
                }}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 24,
                  color: 'var(--ink)',
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {loading ? '—' : value}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  color: list && list.length > 0 ? 'var(--accent)' : 'var(--text3)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}>
                  {label}
                  {list && list.length > 0 && ' →'}
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Section label */}
      <div style={{
        padding: '14px 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Your Posts
        </span>
        <button
          onClick={() => navigate('write')}
          style={{
            padding: '4px 12px',
            background: 'transparent',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          + New Post
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
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
            loading...
          </div>
        </div>
      )}

    
      {!loading && posts.length === 0 && (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 15,
            color: 'var(--text3)',
            fontStyle: '',
            marginBottom: 12,
          }}>
            You haven't written anything yet.
          </div>
          <button
            onClick={() => navigate('write')}
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
            Write your first post
          </button>
        </div>
      )}

      {/* Posts list */}
      {!loading && posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          index={i}
          onClick={() => setSelected(post)}
          onDelete={handleDelete}
        />
      ))}

      {/* Following list */}
      {!loading && following.length > 0 && (
        <div style={{
          padding: '20px 32px',
          borderTop: '2px solid var(--border)',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Following
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {following.map(u => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '5px 10px',
                  background: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{
                  width: 22, height: 22,
                  borderRadius: '50%',
                  background: 'var(--bg3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)',
                  fontSize: 8,
                  color: 'var(--accent)',
                }}>
                  {initials(u.username)}
                </div>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--text2)',
                }}>
                  @{u.username}
                </span>
              </div>
            ))}
          </div>
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
     
      {userListModal && (
        <UserListModal
          title={userListModal.title}
          users={userListModal.users}
          onClose={() => setUserListModal(null)}
          />
        )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}