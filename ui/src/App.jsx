import { useState } from 'react'
import { useAuth } from './utils/Auth.jsx'
import AppLayout from './components/Layout/AppLayout.jsx'
import Header from './components/Layout/Header.jsx'
import Sidebar from './components/Layout/Sidebar.jsx'
import RightPanel from './components/Layout/RightPanel.jsx'
import Feed from './pages/Feed.jsx'
import Explore from './pages/Explore.jsx'
import Write from './pages/Write.jsx'
import Profile from './pages/Profile.jsx'
import Auth from './pages/Auth.jsx'

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
        borderTopColor: 'var(--accent2)',
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
  const [page, setPage] = useState('feed')

  if (loading) return <LoadingScreen />

  const pages = {
    feed: <Feed navigate={setPage} />,
    explore: <Explore navigate={setPage} />,
    write: <Write navigate={setPage} />,
    profile: <Profile navigate={setPage} />,
    auth: <Auth navigate={setPage} />,
  }

  return (
    <AppLayout
      header={
        <Header currentPage={page} navigate={setPage} />
      }
      sidebar={
        <Sidebar currentPage={page} navigate={setPage} />
      }
      rightPanel={
        <RightPanel navigate={setPage} />
      }
    >
      {pages[page] || pages.feed}
    </AppLayout>
  )
}