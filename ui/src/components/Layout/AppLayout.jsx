export default function AppLayout({ header, sidebar, children, rightPanel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

  
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(14,14,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: 56,
      }}>
        {header}
      </div>

   
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 280px',
        flex: 1,
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
      }}>

    
        <div style={{
          borderRight: '1px solid var(--border)',
          position: 'sticky',
          top: 56,
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }}>
          {sidebar}
        </div>

        {/* main content*/}
        <main style={{
          borderRight: '1px solid var(--border)',
          minHeight: 'calc(100vh - 56px)',
        }}>
          {children}
        </main>

        {/* Right panel */}
        <div style={{
          padding: '24px 20px',
          position: 'sticky',
          top: 56,
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }}>
          {rightPanel}
        </div>

      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}