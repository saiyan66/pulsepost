import { useState, useCallback } from 'react'
import { useAuth } from './utils/Auth.jsx'
import { useWebSocket } from './hooks/useWebSocket.js'
import AppLayout from './components/Layout/AppLayout.jsx'
import Header from './components/Layout/Header.jsx'
import Sidebar from './components/Layout/Sidebar.jsx'
import RightPanel from './components/Layout/RightPanel.jsx'
import AuthModal from './components/UI/AuthModal.jsx'
import Feed from './pages/Feed.jsx'
import Explore from './pages/Explore.jsx'
import Write from './pages/Write.jsx'
import Profile from './pages/Profile.jsx'
import Search from './pages/Search.jsx'

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{
        width: 20, height: 20,
        border: '2px solid var(--border2)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}/>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        color: 'var(--text3)',
        letterSpacing: '0.08em',
      }}>
        loading...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  const { loading, user, token } = useAuth()
  const [page, setPage] = useState('feed')
  const [showAuth, setShowAuth] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)


  function addNotification(notif) {
    setNotifications(prev => [notif, ...prev].slice(0, 20))
    setUnreadCount(prev => prev + 1)
  }

  function clearUnread() {
    setUnreadCount(0)
  }

  function navigate(target) {
    if (target === 'auth') {
      setShowAuth(true)
      return
    }
    setPage(target)
  }


  const handleWsMessage = useCallback((msg) => {
    switch(msg.type) {
      case 'new_post':
        if (msg.author_id !== user?.id) {
          addNotification({
            id: Date.now(),
            type: 'new_post',
            text: `${msg.author} published "${msg.title}"`,
            postId: msg.post_id,
          })
        }
        break
      case 'new_follower':
        addNotification({
          id: Date.now(),
          type: 'new_follower',
          text: `${msg.follower} started following you`,
        })
        break
      case 'new_comment':
        addNotification({
          id: Date.now(),
          type: 'new_comment',
          text: `${msg.commenter} commented on "${msg.post_title}"`,
          postId: msg.post_id,
        })
        break
    }
  }, [user?.id])

  useWebSocket(token, handleWsMessage)


  if (loading) return <LoadingScreen />

  const pages = {
    feed:    <Feed    navigate={navigate} />,
    explore: <Explore navigate={navigate} />,
    write:   <Write   navigate={navigate} />,
    profile: <Profile navigate={navigate} />,
    search:  <Search  navigate={navigate} />,
  }

  return (
    <>
      <AppLayout
        header={
          <Header
            currentPage={page}
            navigate={navigate}
            unreadCount={unreadCount}
            notifications={notifications}
            onNotificationsOpen={clearUnread}
          />
        }
        sidebar={<Sidebar currentPage={page} navigate={navigate} />}
        rightPanel={<RightPanel navigate={navigate} />}
      >
        {pages[page] || pages.feed}
      </AppLayout>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => setPage('feed')}
        />
      )}
    </>
  )
}