import { useState } from 'react'
import { useAuth } from './utils/Auth.jsx'
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
  const { loading } = useAuth()
  const [page, setPage]           = useState('feed')
  const [showAuth, setShowAuth]   = useState(false)

  if (loading) return <LoadingScreen />


  function navigate(target) {
    if (target === 'auth') {
      setShowAuth(true)
      return
    }
    setPage(target)
  }

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
        header={<Header currentPage={page} navigate={navigate} />}
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