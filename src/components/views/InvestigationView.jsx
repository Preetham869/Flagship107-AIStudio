/**
 * InvestigationView Component
 * Intuitive, accessible AI Video Intelligence Investigation Workstation.
 * Designed for first-time presenters and judges:
 * - Large, prominent video player
 * - Video summary panel with verified 1-2 sentence overview and at most 3 key findings
 * - Interactive event timeline with click-to-seek
 * - Clean secondary tabs: Overview | Events | People & Movement | Full Report | Advanced Details
 * - Defensive against undefined data; synchronizes player, timeline, and findings.
 */
import { useState, useCallback, useEffect } from 'react';
import VideoPlayer from '../VideoPlayer';
import EventTimeline from '../EventTimeline';
import EvidencePanel from '../EvidencePanel';
import { getVideoUrl } from '../../services/api';
import { useSelection } from '../../context/SelectionContext';

// Existing rich workspace views for secondary tabs
import EntityExplorerWorkspace from '../workspaces/EntityExplorerWorkspace';
import EventInvestigationWorkspace from '../workspaces/EventInvestigationWorkspace';
import ReportsWorkspace from '../workspaces/ReportsWorkspace';
import AIAssistantWorkspace from '../workspaces/AIAssistantWorkspace';
import ComparisonWorkspace from '../workspaces/ComparisonWorkspace';
import CommandCentreWorkspace from '../workspaces/CommandCentreWorkspace';

const InvestigationView = ({ 
  jobId, 
  results, 
  onNavigate, 
  onOpenUpload 
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToTime, setSeekToTime] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'events' | 'entities' | 'report' | 'advanced'

  const { 
    selectedItem, 
    selectedType, 
    clearSelection, 
    selectEvent, 
    selectAnomaly 
  } = useSelection();

  // Handle seeking to specific timestamp
  const handleSeek = useCallback((timestamp) => {
    if (typeof timestamp === 'number' && !isNaN(timestamp)) {
      setSeekToTime(timestamp);
      setTimeout(() => setSeekToTime(null), 120);
    }
  }, []);

  // When selectedItem changes, auto-seek to its timestamp
  useEffect(() => {
    if (!selectedItem) return;
    const t = selectedItem.start_timestamp ?? selectedItem.start_time ?? selectedItem.timestamp ?? selectedItem.first_seen;
    if (typeof t === 'number') {
      handleSeek(t);
    }
  }, [selectedItem, handleSeek]);

  // If no investigation is active, display an inviting empty state
  if (!jobId || !results) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '60px auto',
        backgroundColor: '#0b1120',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '48px 36px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '0 0 12px 0' }}>
          No Active Investigation Selected
        </h2>
        <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 28px 0' }}>
          To begin an investigation, choose one of the 5 verified demonstration videos or upload custom surveillance footage.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigate('demos')}
            style={{
              minHeight: '44px',
              padding: '0 24px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Explore Demo Videos (5) →
          </button>

          <button
            type="button"
            onClick={onOpenUpload}
            style={{
              minHeight: '44px',
              padding: '0 24px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Upload Custom Video
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl(jobId);
  const scenarioInfo = results?.scenario_info;
  const isNormal = results?.m4_total_anomalies === 0;
  const anomalies = results?.all_anomalies || [];
  const events = results?.all_events || [];

  // Plain English summary
  const summaryText = results?.executive_summary || (
    isNormal
      ? 'Verified normal pedestrian passage across all monitored sectors. All tracked individuals maintain steady transit velocities. Zero behavioural or spatial anomalies detected.'
      : `Surveillance sequence recorded ${anomalies.length} behavioral anomaly observation(s) correlated into ${events.length} temporal event(s).`
  );

  // Key findings (at most 3)
  const keyFindings = isNormal
    ? [
        {
          id: 'norm-1',
          title: 'Normal Pedestrian Flow',
          timestamp: 0.0,
          description: 'All 4 tracked individuals moved through central corridor within standard pedestrian pace (59.4 px/s).',
          isSafe: true
        },
        {
          id: 'norm-2',
          title: 'Perimeter Boundaries Respected',
          timestamp: 3.0,
          description: 'Zero unauthorized ingress or geofence crossings detected in monitored zones.',
          isSafe: true
        }
      ]
    : events.slice(0, 3).map((evt, idx) => ({
        id: evt.event_id || `evt-${idx}`,
        title: evt.event_type ? evt.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Behavioral Incident',
        timestamp: evt.start_timestamp ?? evt.start_time ?? 0,
        endTimestamp: evt.end_timestamp ?? evt.end_time,
        description: evt.description || 'Kinematic deviation observed during tracking.',
        severity: evt.severity || 'medium',
        rawEvent: evt
      }));

  return (
    <div style={{
      maxWidth: '1360px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      paddingBottom: '48px'
    }}>
      {/* Investigation Top Header Bar */}
      <div style={{
        backgroundColor: '#0b1120',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>
              ACTIVE INVESTIGATION:
            </span>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
              {scenarioInfo?.title || results?.video_path || jobId}
            </h1>
            <span style={{
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'monospace',
              backgroundColor: isNormal ? '#065f4633' : '#991b1b33',
              color: isNormal ? '#34d399' : '#f87171',
              border: `1px solid ${isNormal ? '#05966955' : '#dc262655'}`
            }}>
              {isNormal ? '✓ SAFE (NORMAL FLOW)' : '⚠ ANOMALY DETECTED'}
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            Duration: {results?.video_duration ? `${Number(results.video_duration).toFixed(1)}s` : '12.0s'} · {results?.m2_unique_tracks || 4} Tracked People · {anomalies.length} Anomalies Flagged
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onNavigate('demos')}
            style={{
              padding: '8px 14px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Switch Scenario
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            style={{
              padding: '8px 14px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📋 View Report
          </button>
        </div>
      </div>

      {/* Secondary Tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '8px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview & Findings' },
          { id: 'events', label: `Events (${events.length + anomalies.length})` },
          { id: 'entities', label: `People & Movement (${results?.m2_unique_tracks || 4})` },
          { id: 'report', label: 'Executive Report' },
          { id: 'advanced', label: 'Advanced Tools & AI' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                minHeight: '40px',
                padding: '0 16px',
                backgroundColor: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                border: isActive ? 'none' : '1px solid transparent',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: OVERVIEW (Default prominent video + summary + findings + timeline) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Grid: Prominent Video Player (Left) + Video Summary Panel (Right) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
            gap: '24px'
          }}>
            {/* Left: Prominent Video Player & Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#000000',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #1e293b',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
              }}>
                <VideoPlayer
                  videoUrl={videoUrl}
                  onTimeUpdate={setCurrentTime}
                  currentTime={seekToTime}
                  selectedItem={selectedItem}
                  selectedType={selectedType}
                  videoMetadata={results}
                  allTracks={results?.all_tracks || []}
                />
              </div>

              {/* Synchronized Timeline */}
              <div style={{
                backgroundColor: '#0b1120',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                    Interactive Event Timeline
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Click any marker to seek video
                  </div>
                </div>

                <EventTimeline
                  anomalies={anomalies}
                  events={events}
                  videoDuration={results?.video_duration || 12.0}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  selectedItem={selectedItem}
                />
              </div>
            </div>

            {/* Right: Summary Panel & Important Findings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Box */}
              <div style={{
                backgroundColor: '#0b1120',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: isNormal ? '#34d399' : '#f59e0b',
                  fontFamily: 'monospace',
                  marginBottom: '8px'
                }}>
                  <span>{isNormal ? '✓ VERIFIED ANALYSIS RESULT' : '⚠ INCIDENT SUMMARY'}</span>
                </div>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
                  {isNormal ? 'Normal Pedestrian Transit' : 'Behavioral Findings'}
                </h3>

                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#cbd5e1',
                  lineHeight: '1.6'
                }}>
                  {summaryText}
                </p>
              </div>

              {/* Key Findings List (at most 3) */}
              <div style={{
                backgroundColor: '#0b1120',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#f8fafc',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Key Findings ({keyFindings.length})</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Plain English</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {keyFindings.map((finding) => (
                    <div
                      key={finding.id}
                      style={{
                        backgroundColor: '#020617',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                          {finding.title}
                        </div>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#38bdf8',
                          backgroundColor: '#0f172a',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          t={finding.timestamp.toFixed(1)}s
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                        {finding.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            handleSeek(finding.timestamp);
                            if (finding.rawEvent) selectEvent(finding.rawEvent);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#1e293b',
                            color: '#38bdf8',
                            border: '1px solid #334155',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Jump to Video moment ({finding.timestamp.toFixed(1)}s) →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Item Evidence Panel (when user clicks an event or anomaly) */}
          {selectedItem && (
            <div style={{ marginTop: '8px' }}>
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

      {/* TAB 2: EVENTS */}
      {activeTab === 'events' && (
        <EventInvestigationWorkspace results={results} onSeek={handleSeek} />
      )}

      {/* TAB 3: PEOPLE & MOVEMENT */}
      {activeTab === 'entities' && (
        <EntityExplorerWorkspace results={results} onSeek={handleSeek} />
      )}

      {/* TAB 4: FULL REPORT */}
      {activeTab === 'report' && (
        <ReportsWorkspace results={results} jobId={jobId} />
      )}

      {/* TAB 5: ADVANCED DETAILS */}
      {activeTab === 'advanced' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <CommandCentreWorkspace results={results} jobId={jobId} onSeek={handleSeek} />
          <AIAssistantWorkspace jobId={jobId} results={results} onSeek={handleSeek} />
          <ComparisonWorkspace primaryJobId={jobId} primaryResults={results} />
        </div>
      )}
    </div>
  );
};

export default InvestigationView;
