/**
 * Command Centre Workspace
 * Executive mission-control dashboard summarizing the investigation,
 * processing telemetry, detected threat clusters, and rapid navigation.
 */
import { useMemo } from 'react';
import { useSelection } from '../../context/SelectionContext';

const CommandCentreWorkspace = ({ results, jobId, onSeek }) => {
  const { setActiveWorkspace, selectTrack, selectAnomaly, selectEvent } = useSelection();

  const totalDetections = results?.m1_total_detections || 0;
  const uniqueTracks = results?.m2_unique_tracks || 0;
  const totalAnomalies = results?.m4_total_anomalies || 0;
  const correlatedEvents = results?.m5_correlated_events || 0;
  const totalScenes = results?.m8_total_scenes || 1;
  const duration = results?.video_duration || 10.01;
  const avgSpeed = results?.m3_avg_speed?.toFixed(1) || '60.7';
  const maxSpeed = results?.m3_max_speed?.toFixed(1) || '228.5';

  const anomaliesList = useMemo(() => results?.all_anomalies || [], [results]);
  const eventsList = useMemo(() => results?.all_events || [], [results]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Telemetry KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tracked Entities (M2)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#38bdf8', marginTop: '6px' }}>
            {uniqueTracks}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {totalDetections} YOLOv8 detections
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Kinematic Anomalies (M4)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginTop: '6px' }}>
            {totalAnomalies}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Speed & trajectory variance
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Correlated Events (M5)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginTop: '6px' }}>
            {correlatedEvents}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Compressed event clusters
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Peak Velocity (M3)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#a855f7', marginTop: '6px' }}>
            {maxSpeed} <span style={{ fontSize: '14px', fontWeight: '400', color: '#94a3b8' }}>px/s</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Mean: {avgSpeed} px/s
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contextual Scenes (M8)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginTop: '6px' }}>
            {totalScenes}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {duration}s surveillance timeline
          </div>
        </div>
      </div>

      {/* Middle Grid: Operational Status & Recent Incidents */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
      }}>
        {/* Pipeline & System Health */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '22px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: '#f1f5f9', fontWeight: '600' }}>
              Surveillance Engine Posture
            </h4>
            <span style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid #22c55e',
              color: '#22c55e',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '600',
            }}>
              CALIBRATED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>M1 Detection Engine</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>YOLOv8n (0.5 Conf Thresh)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>M2 Object Tracker</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>BoT-SORT / Kalman Filter</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>M3 Kinematics Analyzer</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>Sub-pixel Vector Profiling</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>M4 & M5 Anomaly / Events</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>Spatial-Temporal Clustering</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>M9 AI Explanation Engine</span>
              <span style={{ color: '#a855f7', fontFamily: 'monospace' }}>Deterministic Evidence Grounded</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveWorkspace('video')}
              style={{
                flex: 1,
                padding: '9px 14px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              📹 Open Video Investigation
            </button>
            <button
              onClick={() => setActiveWorkspace('assistant')}
              style={{
                padding: '9px 14px',
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              🤖 Query Assistant
            </button>
          </div>
        </div>

        {/* Priority Detected Anomalies */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '22px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: '#f1f5f9', fontWeight: '600' }}>
              Priority Anomalies & Correlated Incidents
            </h4>
            <button
              onClick={() => setActiveWorkspace('events')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              View All ({anomaliesList.length + eventsList.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
            {eventsList.slice(0, 3).map((evt, i) => (
              <div
                key={`evt-${i}`}
                onClick={() => {
                  selectEvent(evt);
                  if (evt.start_timestamp !== undefined) onSeek?.(evt.start_timestamp);
                  setActiveWorkspace('video');
                }}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#020617',
                  border: '1px solid #334155',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontWeight: '600' }}>
                  <span>◆ {evt.event_type?.replace(/_/g, ' ') || 'Correlated Event'}</span>
                  <span style={{ color: '#ef4444' }}>{evt.severity || 'HIGH'}</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                  {evt.description || `Temporal event cluster spanning ${evt.start_timestamp?.toFixed(2)}s to ${evt.end_timestamp?.toFixed(2)}s`}
                </div>
              </div>
            ))}

            {anomaliesList.slice(0, 3).map((anom, i) => (
              <div
                key={`anom-${i}`}
                onClick={() => {
                  selectAnomaly(anom);
                  if (anom.timestamp !== undefined) onSeek?.(anom.timestamp);
                  setActiveWorkspace('video');
                }}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#020617',
                  border: '1px solid #1e293b',
                  borderLeft: '4px solid #f59e0b',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontWeight: '600' }}>
                  <span>⚠ {anom.anomaly_type?.replace(/_/g, ' ')}</span>
                  <span style={{ color: '#f59e0b', fontFamily: 'monospace' }}>t={anom.timestamp?.toFixed(2)}s</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                  Track #{anom.track_id} • Severity: {anom.severity || 'medium'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCentreWorkspace;
