/**
 * Dashboard View Component
 * Premium AI Video Intelligence & Investigation Workstation.
 * Unifies Command Centre, Video Investigation, Entity Explorer,
 * Event Investigation, Behaviour Analytics, Evidence Provenance,
 * AI Assistant, Reports, and System Settings.
 */
import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import EventTimeline from './EventTimeline';
import IntelligencePanel from './intelligence/IntelligencePanel';
import InvestigationPanel from './InvestigationPanel';
import EvidencePanel from './EvidencePanel';
import SystemStatus from './SystemStatus';
import { getVideoUrl } from '../services/api';
import { SelectionProvider, useSelection } from '../context/SelectionContext';

// Workspaces
import CommandCentreWorkspace from './workspaces/CommandCentreWorkspace';
import EntityExplorerWorkspace from './workspaces/EntityExplorerWorkspace';
import EventInvestigationWorkspace from './workspaces/EventInvestigationWorkspace';
import BehaviourAnalyticsWorkspace from './workspaces/BehaviourAnalyticsWorkspace';
import AIAssistantWorkspace from './workspaces/AIAssistantWorkspace';
import EvidenceChainWorkspace from './workspaces/EvidenceChainWorkspace';
import ReportsWorkspace from './workspaces/ReportsWorkspace';
import SystemStatusWorkspace from './workspaces/SystemStatusWorkspace';
import ComparisonWorkspace from './workspaces/ComparisonWorkspace';

const DashboardContent = ({ jobId, results, onBack }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToTime, setSeekToTime] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const { 
    selectedItem, 
    selectedType, 
    clearSelection,
    activeWorkspace,
    setActiveWorkspace,
    searchQuery,
    setSearchQuery,
    theme,
    setTheme,
  } = useSelection();

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleSeek = useCallback((timestamp) => {
    setSeekToTime(timestamp);
    setTimeout(() => setSeekToTime(null), 100);
  }, []);

  // Auto-seek when selection changes
  useEffect(() => {
    if (!selectedItem) return;

    let timestamp = null;
    if (selectedType === 'event' && selectedItem.start_timestamp !== undefined) {
      timestamp = selectedItem.start_timestamp;
    } else if (selectedType === 'anomaly' && selectedItem.timestamp !== undefined) {
      timestamp = selectedItem.timestamp;
    } else if (selectedType === 'scene' && selectedItem.start_timestamp !== undefined) {
      timestamp = selectedItem.start_timestamp;
    } else if (selectedType === 'track' && selectedItem.first_seen !== undefined) {
      timestamp = selectedItem.first_seen;
    } else if (selectedType === 'relationship' && selectedItem.start_timestamp !== undefined) {
      timestamp = selectedItem.start_timestamp;
    }

    if (timestamp !== null) {
      handleSeek(timestamp);
    }
  }, [selectedItem, selectedType, handleSeek]);

  // Global Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        clearSelection();
        setShowShortcutsModal(false);
      } else if (e.key === '?') {
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === '1') {
        setActiveWorkspace('command');
      } else if (e.key === '2') {
        setActiveWorkspace('video');
      } else if (e.key === '3') {
        setActiveWorkspace('entities');
      } else if (e.key === '4') {
        setActiveWorkspace('events');
      } else if (e.key === '5') {
        setActiveWorkspace('behaviour');
      } else if (e.key === '6') {
        setActiveWorkspace('assistant');
      } else if (e.key === '7') {
        setActiveWorkspace('evidence');
      } else if (e.key === '8') {
        setActiveWorkspace('reports');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, setActiveWorkspace]);

  const videoUrl = getVideoUrl(jobId);

  const workspaces = [
    { id: 'command', label: 'Command Centre', icon: '🎯' },
    { id: 'video', label: 'Video Investigation', icon: '📹' },
    { id: 'entities', label: 'Entity Explorer', icon: '👤', count: results?.m2_unique_tracks },
    { id: 'events', label: 'Event Investigation', icon: '⚡', count: (results?.m5_correlated_events || 0) + (results?.m4_total_anomalies || 0) },
    { id: 'behaviour', label: 'Behaviour Analytics', icon: '📈' },
    { id: 'assistant', label: 'AI Assistant', icon: '🤖' },
    { id: 'evidence', label: 'Evidence Chain', icon: '🔍' },
    { id: 'reports', label: 'Reports & Exports', icon: '📋' },
    { id: 'compare', label: 'Compare Cases', icon: '⚖️' },
    { id: 'settings', label: 'System Status', icon: '⚙️' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0a0e17' : '#f8fafc',
      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Top Professional Mission Control Header */}
      <header style={{
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        borderBottom: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Brand & Investigation Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '15px',
                color: '#fff',
                boxShadow: '0 0 12px rgba(2, 132, 199, 0.5)',
              }}>
                107
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
                  FLAGSHIP 107
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                  Video Intelligence Workstation
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
              border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: '#38bdf8', fontWeight: '700' }}>SCENARIO:</span>
              <span style={{ color: theme === 'dark' ? '#cbd5e1' : '#334155' }}>
                {results?.scenario_info?.title || (jobId ? jobId.slice(0, 12) : 'BENCHMARK-001')}
              </span>
            </div>
          </div>

          {/* Quick Search Input */}
          <div style={{ flex: '1', maxWidth: '320px', minWidth: '180px' }}>
            <input
              type="text"
              placeholder="Search investigation (press /)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px',
                backgroundColor: theme === 'dark' ? '#020617' : '#f1f5f9',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                borderRadius: '6px',
                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Top Actions: Shortcuts, Theme, Back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowShortcutsModal(true)}
              style={{
                padding: '6px 10px',
                backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                color: theme === 'dark' ? '#94a3b8' : '#475569',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
              }}
              title="Keyboard shortcuts (?)"
            >
              ⌨ Keys
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                padding: '6px 10px',
                backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                color: theme === 'dark' ? '#38bdf8' : '#0284c7',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
              }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>

            <button
              onClick={onBack}
              style={{
                padding: '6px 12px',
                backgroundColor: theme === 'dark' ? '#0284c7' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>←</span> Scenarios Gallery
            </button>
          </div>
        </div>

        {/* Global Workspace Tab Navigation Bar */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {workspaces.map((ws) => {
            const isActive = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                style={{
                  padding: '7px 14px',
                  backgroundColor: isActive ? (theme === 'dark' ? '#1e293b' : '#e0f2fe') : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? '#38bdf8' : 'transparent'}`,
                  color: isActive ? (theme === 'dark' ? '#38bdf8' : '#0284c7') : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.15s',
                }}
              >
                <span>{ws.icon}</span>
                <span>{ws.label}</span>
                {ws.count !== undefined && ws.count > 0 && (
                  <span style={{
                    padding: '1px 6px',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : (theme === 'dark' ? '#020617' : '#cbd5e1'),
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '700',
                  }}>
                    {ws.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace Workspace Container */}
      <main style={{ padding: '24px 28px' }}>
        {/* Workspace A: Command Centre */}
        {activeWorkspace === 'command' && (
          <CommandCentreWorkspace results={results} jobId={jobId} onSeek={handleSeek} />
        )}

        {/* Workspace B: Video Investigation Workspace */}
        {activeWorkspace === 'video' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '24px',
              marginBottom: '24px',
            }}>
              {/* Left Column: Video + Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <VideoPlayer
                  videoUrl={videoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  currentTime={seekToTime}
                  selectedItem={selectedItem}
                  selectedType={selectedType}
                  videoMetadata={results}
                  allTracks={results?.all_tracks || []}
                />
                
                <EventTimeline
                  anomalies={results?.all_anomalies || []}
                  events={results?.all_events || []}
                  videoDuration={results?.video_duration || 10.01}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  selectedItem={selectedItem}
                />
              </div>

              {/* Right Column: Dynamic Investigation & Intelligence Panel */}
              <div>
                {selectedItem ? (
                  <InvestigationPanel
                    results={results}
                    onSeek={handleSeek}
                    jobId={jobId}
                  />
                ) : (
                  <IntelligencePanel
                    results={results}
                    onSeek={handleSeek}
                    jobId={jobId}
                  />
                )}
              </div>
            </div>

            {/* Bottom Evidence Panel when entity/anomaly is selected */}
            {selectedItem && (
              <div style={{ marginBottom: '24px' }}>
                <EvidencePanel
                  item={selectedItem}
                  type={selectedType}
                  onClose={clearSelection}
                  onSeek={handleSeek}
                />
              </div>
            )}
          </div>
        )}

        {/* Workspace C: Entity Explorer */}
        {activeWorkspace === 'entities' && (
          <EntityExplorerWorkspace results={results} onSeek={handleSeek} />
        )}

        {/* Workspace D: Event Investigation */}
        {activeWorkspace === 'events' && (
          <EventInvestigationWorkspace results={results} onSeek={handleSeek} />
        )}

        {/* Workspace E: Behaviour Analytics */}
        {activeWorkspace === 'behaviour' && (
          <BehaviourAnalyticsWorkspace results={results} />
        )}

        {/* Workspace F: AI Assistant */}
        {activeWorkspace === 'assistant' && (
          <AIAssistantWorkspace jobId={jobId} results={results} onSeek={handleSeek} />
        )}

        {/* Workspace G: Evidence Chain */}
        {activeWorkspace === 'evidence' && (
          <EvidenceChainWorkspace results={results} onSeek={handleSeek} />
        )}

        {/* Workspace H: Reports & Exports */}
        {activeWorkspace === 'reports' && (
          <ReportsWorkspace results={results} jobId={jobId} />
        )}

        {/* Workspace Compare Cases */}
        {activeWorkspace === 'compare' && (
          <ComparisonWorkspace primaryJobId={jobId} primaryResults={results} />
        )}

        {/* Workspace I: System Status & Settings */}
        {activeWorkspace === 'settings' && (
          <SystemStatusWorkspace />
        )}
      </main>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => setShowShortcutsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>
                Workstation Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>Play / Pause Video</span>
                <kbd style={{ padding: '2px 8px', backgroundColor: '#1e293b', borderRadius: '4px', color: '#38bdf8' }}>Space</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>Focus Search</span>
                <kbd style={{ padding: '2px 8px', backgroundColor: '#1e293b', borderRadius: '4px', color: '#38bdf8' }}>/</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>Clear Selection / Close</span>
                <kbd style={{ padding: '2px 8px', backgroundColor: '#1e293b', borderRadius: '4px', color: '#38bdf8' }}>Esc</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8' }}>Switch Workspace Tabs</span>
                <kbd style={{ padding: '2px 8px', backgroundColor: '#1e293b', borderRadius: '4px', color: '#38bdf8' }}>1 - 8</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper with SelectionProvider
const DashboardView = (props) => (
  <SelectionProvider>
    <DashboardContent {...props} />
  </SelectionProvider>
);

export default DashboardView;
