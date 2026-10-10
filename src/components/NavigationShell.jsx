/**
 * NavigationShell Component
 * Accessibility-First Primary Navigation Bar & Layout Shell.
 * Provides the 5 clear destinations:
 * 1. Home
 * 2. Investigations
 * 3. Demo Videos
 * 4. Reports
 * 5. Settings
 * High contrast, large touch targets (44px min), plain-English labels.
 */

const NAV_DESTINATIONS = [
  {
    id: 'home',
    label: 'Home',
    subtitle: 'Command Centre & Recent Cases',
    icon: '🏠'
  },
  {
    id: 'investigations',
    label: 'Investigations',
    subtitle: 'Video Player & Timeline',
    icon: '📹'
  },
  {
    id: 'demos',
    label: 'Demo Videos',
    subtitle: '5 Verified CCTV Scenarios',
    icon: '▶'
  },
  {
    id: 'reports',
    label: 'Reports',
    subtitle: 'Plain-English Incident Dossier',
    icon: '📋'
  },
  {
    id: 'settings',
    label: 'Settings',
    subtitle: 'Telemetry & Accessibility',
    icon: '⚙'
  }
];

const NavigationShell = ({ 
  currentDestination, 
  onNavigate, 
  activeJobId,
  activeScenarioTitle,
  onOpenUpload,
  children 
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070a12',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Professional Mission Control Header */}
      <header style={{
        backgroundColor: '#0b1120',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        {/* Brand & Active Case Bar */}
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Brand */}
          <div 
            onClick={() => onNavigate('home')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer' 
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '16px',
              boxShadow: '0 0 16px rgba(2, 132, 199, 0.4)'
            }}>
              107
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                letterSpacing: '-0.4px',
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>FLAGSHIP 107</span>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '600' }}>
                  AI VIDEO INTELLIGENCE
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Autonomous Behavioral Anomaly Detection & Investigation
              </div>
            </div>
          </div>

          {/* Active Investigation Context & Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {activeJobId && (
              <div 
                onClick={() => onNavigate('investigations')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#020617',
                  border: '1px solid #1e293b',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                title="Click to view current investigation"
              >
                <span style={{ color: '#38bdf8', fontWeight: '700', fontSize: '11px', fontFamily: 'monospace' }}>
                  ACTIVE CASE:
                </span>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                  {activeScenarioTitle || activeJobId.slice(0, 16)}
                </span>
              </div>
            )}

            {/* Quick Upload Button */}
            <button
              type="button"
              onClick={onOpenUpload}
              style={{
                minHeight: '40px',
                padding: '0 16px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
            >
              <span>⬆</span>
              <span>Analyse Video</span>
            </button>
          </div>
        </div>

        {/* 5 Primary Navigation Destinations Bar */}
        <nav style={{
          backgroundColor: '#070c18',
          borderTop: '1px solid #1e293b',
          overflowX: 'auto'
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '4px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {NAV_DESTINATIONS.map((dest) => {
              const isActive = currentDestination === dest.id;

              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => onNavigate(dest.id)}
                  style={{
                    minHeight: '48px',
                    padding: '8px 18px',
                    backgroundColor: isActive ? '#0b1120' : 'transparent',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '15px',
                    fontWeight: isActive ? '700' : '500',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#f8fafc';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{dest.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div>{dest.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Page Content Body */}
      <main style={{
        flex: 1,
        padding: '32px 24px',
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>

      {/* Accessible Footer */}
      <footer style={{
        backgroundColor: '#0b1120',
        borderTop: '1px solid #1e293b',
        padding: '20px 24px',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong>Flagship 107</strong> · AI-Powered Video Intelligence & Anomaly Detection Workstation (HackNEX 2026)
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#38bdf8' }}>✓ Anti-Fabrication Safeguard Active</span>
            <span>·</span>
            <span>WCAG Accessible Navigation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NavigationShell;
