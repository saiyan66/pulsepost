export default function AppLayout({ header, sidebar, children, rightPanel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Sticky header */}
      <div
        className="app-sticky-header"
        style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(14,14,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: 56,
      }}
      >
        {header}
      </div>

      {/* Main grid layout */}
      <div
        className="app-layout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 280px',
          flex: 1,
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Sidebar */}
        <div
          className="layout-sidebar"
          style={{
            borderRight: '1px solid var(--border)',
            position: 'sticky',
            top: 56,
            height: 'calc(100vh - 56px)',
            overflowY: 'auto',
          }}
        >
          {sidebar}
        </div>

        {/* Main content */}
        <main
          className="layout-main"
          style={{
            borderRight: '1px solid var(--border)',
            minHeight: 'calc(100vh - 56px)',
          }}
        >
          {children}
        </main>

        {/* Right panel */}
        <div
          className="layout-right"
          style={{
            padding: '24px 20px',
            position: 'sticky',
            top: 56,
            height: 'calc(100vh - 56px)',
            overflowY: 'auto',
          }}
        >
          {rightPanel}
        </div>
      </div>

      {/* Global & responsive styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Default grid (desktop) */
        .app-layout-grid {
          display: grid;
          grid-template-columns: 220px 1fr 280px;
        }

        /* Tablet: reduce column widths */
        @media (max-width: 900px) {
          .app-layout-grid {
            grid-template-columns: 200px 1fr 240px;
          }
          .layout-sidebar,
          .layout-right {
            padding: 16px;
          }
        }

        /* Mobile: hide sidebars, main takes full width */
        @media (max-width: 640px) {
          .app-sticky-header {
            height: auto !important;
            min-height: 56px;
          }
          .app-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .layout-sidebar,
          .layout-right {
            display: none !important;
          }
          .layout-main {
            border-right: none !important;
          }
        }

        /* Avoid horizontal overflow issues */
        .app-layout-grid {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}