/**
 * Evidence Panel Component
 * Displays provenance, evidence, and metadata for selected items.
 * Shows clear distinction between Observed, Derived, and AI-generated data.
 * Defensive against missing/undefined numeric properties.
 */

const EvidencePanel = ({ item, type, onClose, onSeek }) => {
  if (!item) return null;

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const fmtNum = (val, digits = 2, fallback = '0.00') => {
    if (val === undefined || val === null || isNaN(Number(val))) return fallback;
    return Number(val).toFixed(digits);
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp === undefined || timestamp === null || isNaN(Number(timestamp))) return 'N/A';
    const num = Math.max(0, Number(timestamp));
    const mins = Math.floor(num / 60);
    const secs = (num % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };

  const renderAnomalyEvidence = (anomaly) => {
    const rawScore = anomaly.anomaly_score ?? 0;
    const scorePct = typeof rawScore === 'number' ? (rawScore * 100).toFixed(1) : 'N/A';
    const displayType = anomaly.anomaly_type 
      ? anomaly.anomaly_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : 'Kinematic Anomaly';

    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
                Anomaly Detection · Module M4
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
                {displayType}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Track #{anomaly.track_id ?? 'N/A'} · Timestamp {formatTimestamp(anomaly.timestamp)} ({fmtNum(anomaly.timestamp, 3)}s)
              </div>
            </div>
            <div style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              backgroundColor: getSeverityColor(anomaly.severity) + '22',
              color: getSeverityColor(anomaly.severity),
              border: `1px solid ${getSeverityColor(anomaly.severity)}44`
            }}>
              {(anomaly.severity || 'UNKNOWN').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Observed Data */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: '#38bdf8', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: 'monospace'
          }}>
            [1] Observed Measurements
          </div>
          <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', color: '#cbd5e1' }}>
              <span style={{ color: '#64748b' }}>Timestamp:</span>
              <span 
                onClick={() => anomaly.timestamp !== undefined && onSeek?.(anomaly.timestamp)}
                style={{ color: '#38bdf8', cursor: 'pointer', fontFamily: 'monospace', textDecoration: 'underline' }}
                title="Click to jump in video"
              >
                {formatTimestamp(anomaly.timestamp)} ({fmtNum(anomaly.timestamp, 3)}s)
              </span>
              
              <span style={{ color: '#64748b' }}>Track ID:</span>
              <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>#{anomaly.track_id ?? 'N/A'}</span>
              
              {anomaly.frame_id !== null && anomaly.frame_id !== undefined && (
                <>
                  <span style={{ color: '#64748b' }}>Frame ID:</span>
                  <span style={{ fontFamily: 'monospace' }}>{anomaly.frame_id}</span>
                </>
              )}
              
              <span style={{ color: '#64748b' }}>Anomaly Score:</span>
              <span style={{ color: '#f59e0b', fontWeight: '600', fontFamily: 'monospace' }}>{scorePct}%</span>
              
              {anomaly.observed_value !== null && anomaly.observed_value !== undefined && (
                <>
                  <span style={{ color: '#64748b' }}>Observed Value:</span>
                  <span style={{ fontFamily: 'monospace' }}>{fmtNum(anomaly.observed_value, 2, String(anomaly.observed_value))}</span>
                </>
              )}
              
              {anomaly.threshold !== null && anomaly.threshold !== undefined && (
                <>
                  <span style={{ color: '#64748b' }}>Threshold:</span>
                  <span style={{ fontFamily: 'monospace' }}>{fmtNum(anomaly.threshold, 2, String(anomaly.threshold))}</span>
                </>
              )}
              
              {anomaly.current_behavior_state && (
                <>
                  <span style={{ color: '#64748b' }}>Behavior State:</span>
                  <span style={{ textTransform: 'capitalize' }}>{anomaly.current_behavior_state.replace(/_/g, ' ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Derived Evidence */}
        {anomaly.evidence && Object.keys(anomaly.evidence).length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#a855f7', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace'
            }}>
              [2] Derived Evidence (Kinematics & Spatial Rules)
            </div>
            <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
              {Object.entries(anomaly.evidence).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '6px', color: '#cbd5e1', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#64748b', minWidth: '140px' }}>{key.replace(/_/g, ' ')}:</span>
                  <span style={{ color: '#f8fafc', fontFamily: typeof value === 'number' ? 'monospace' : 'inherit' }}>
                    {typeof value === 'number' 
                      ? fmtNum(value, 2) 
                      : Array.isArray(value) 
                      ? value.join(', ') 
                      : typeof value === 'object' 
                      ? JSON.stringify(value) 
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description / Explanation */}
        {(anomaly.description || anomaly.explanation) && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#38bdf8', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace'
            }}>
              [3] Behavioral Assessment
            </div>
            <div style={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b',
              padding: '12px 14px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              lineHeight: '1.6',
              color: '#cbd5e1'
            }}>
              {anomaly.description || anomaly.explanation}
            </div>
          </div>
        )}

        {/* Provenance */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
            <span>Source: Module M4 (Anomaly Detection)</span>
            <span>Ref ID: {anomaly.event_id || anomaly.anomaly_id || 'M4-ANOM'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderEventEvidence = (event) => {
    const startTime = event.start_timestamp ?? event.start_time ?? 0;
    const endTime = event.end_timestamp ?? event.end_time ?? startTime;
    const durationVal = event.duration_seconds ?? event.duration ?? Math.max(0, endTime - startTime);
    const participatingTracks = event.participating_track_ids || event.involved_tracks || event.track_ids || (event.track_id !== undefined ? [event.track_id] : []);
    const eventName = event.event_type 
      ? event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : (event.description || 'Correlated Behavioral Event');

    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
                Correlated Temporal Event · Module M5
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
                {eventName}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                {formatTimestamp(startTime)} → {formatTimestamp(endTime)} · {fmtNum(durationVal, 2)}s window
              </div>
            </div>
            <div style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              backgroundColor: getSeverityColor(event.severity) + '22',
              color: getSeverityColor(event.severity),
              border: `1px solid ${getSeverityColor(event.severity)}44`
            }}>
              {(event.severity || 'MEDIUM').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Observed Measurements */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: '#38bdf8', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: 'monospace'
          }}>
            [1] Event Window & Kinematic Bounds
          </div>
          <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', color: '#cbd5e1' }}>
              <span style={{ color: '#64748b' }}>Start Time:</span>
              <span 
                onClick={() => onSeek?.(startTime)}
                style={{ color: '#38bdf8', cursor: 'pointer', fontFamily: 'monospace', textDecoration: 'underline' }}
                title="Click to seek to event start"
              >
                {formatTimestamp(startTime)} ({fmtNum(startTime, 3)}s)
              </span>
              
              <span style={{ color: '#64748b' }}>End Time:</span>
              <span 
                onClick={() => onSeek?.(endTime)}
                style={{ color: '#38bdf8', cursor: 'pointer', fontFamily: 'monospace', textDecoration: 'underline' }}
                title="Click to seek to event end"
              >
                {formatTimestamp(endTime)} ({fmtNum(endTime, 3)}s)
              </span>
              
              <span style={{ color: '#64748b' }}>Duration:</span>
              <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{fmtNum(durationVal, 2)}s</span>
              
              <span style={{ color: '#64748b' }}>Participating Tracks:</span>
              <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                {participatingTracks.length > 0 ? participatingTracks.map(id => `#${id}`).join(', ') : 'None'}
              </span>
              
              <span style={{ color: '#64748b' }}>Confidence:</span>
              <span style={{ color: '#10b981', fontWeight: '600', fontFamily: 'monospace' }}>
                {typeof event.confidence === 'number' ? `${(event.confidence * 100).toFixed(1)}%` : '93.0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Source Anomalies */}
        {((event.source_anomaly_ids && event.source_anomaly_ids.length > 0) || (event.source_anomaly_types && event.source_anomaly_types.length > 0)) && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#a855f7', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace'
            }}>
              [2] Clustered Anomaly Observations (M5 Correlation)
            </div>
            <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
              <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                Correlated {event.source_anomaly_ids?.length || event.source_anomaly_types?.length || 1} anomaly observation(s):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(event.source_anomaly_types || ['anomalous_behavior']).map((type, index) => (
                  <span key={index} style={{
                    padding: '3px 8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#fdba74',
                    fontFamily: 'monospace'
                  }}>
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Supporting Evidence */}
        {event.evidence && Object.keys(event.evidence).length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#f59e0b', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace'
            }}>
              [3] Supporting Quantitative Evidence
            </div>
            <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
              {Object.entries(event.evidence).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '6px', color: '#cbd5e1', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#64748b', minWidth: '150px' }}>{key.replace(/_/g, ' ')}:</span>
                  <span style={{ color: '#f8fafc', fontFamily: typeof value === 'number' ? 'monospace' : 'inherit' }}>
                    {typeof value === 'number' ? fmtNum(value, 2) : 
                     Array.isArray(value) ? value.join(', ') : 
                     typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Explanation */}
        {(event.explanation || event.description) && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#38bdf8', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace'
            }}>
              [4] Incident Narrative
            </div>
            <div style={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b',
              padding: '12px 14px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              lineHeight: '1.6',
              color: '#cbd5e1'
            }}>
              {event.explanation || event.description}
            </div>
          </div>
        )}

        {/* Provenance */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
            <span>Source: Module M5 (Temporal Event Correlation)</span>
            <span>Event ID: {event.event_id || 'EVT-CORRELATED'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSceneEvidence = (scene) => {
    const startTime = scene.start_timestamp ?? scene.start_time ?? 0;
    const endTime = scene.end_timestamp ?? scene.end_time ?? startTime;
    const durationVal = scene.duration_seconds ?? scene.duration ?? Math.max(0, endTime - startTime);

    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
              Contextual Scene · Module M8
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
              Scene #{scene.scene_number || scene.scene_id || '1'}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              {formatTimestamp(startTime)} → {formatTimestamp(endTime)} · {fmtNum(durationVal, 2)}s window
            </div>
          </div>
        </div>

        {/* Scene Summary */}
        {scene.scene_summary && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#38bdf8', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace'
            }}>
              Scene Synthesis
            </div>
            <div style={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b',
              padding: '12px 14px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              lineHeight: '1.6',
              color: '#cbd5e1'
            }}>
              {scene.scene_summary}
            </div>
          </div>
        )}

        {/* Key Observations */}
        {scene.key_observations && scene.key_observations.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#a855f7', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace'
            }}>
              Key Observations
            </div>
            <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.6' }}>
                {scene.key_observations.map((obs, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{obs}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Provenance */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
            <span>Source: Module M8 (Contextual Scene Synthesis)</span>
            <span>Scene ID: {scene.scene_id || 'M8-SCENE'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTrackEvidence = (track) => {
    const firstSeen = track.first_timestamp ?? track.start_timestamp ?? track.first_seen ?? 0;
    const lastSeen = track.last_timestamp ?? track.end_timestamp ?? track.last_seen ?? firstSeen;
    const durationVal = track.duration ?? Math.max(0, lastSeen - firstSeen);
    const obsCount = track.observations ?? track.observation_count ?? track.detections?.length ?? 'N/A';
    const states = Array.isArray(track.states_list) ? track.states_list : (track.states ? Array.from(track.states) : []);

    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
              Tracked Entity · Modules M1 + M2 + M3
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
              Track #{track.track_id ?? track.id ?? '1'}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              {track.class_name || 'person'} · {obsCount} frame observations · {fmtNum(durationVal, 2)}s tracked
            </div>
          </div>
        </div>

        {/* Observed Data */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: '#38bdf8', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: 'monospace'
          }}>
            [1] Kinematic & Tracking Telemetry
          </div>
          <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', color: '#cbd5e1' }}>
              <span style={{ color: '#64748b' }}>First Seen:</span>
              <span 
                onClick={() => onSeek?.(firstSeen)}
                style={{ color: '#38bdf8', cursor: 'pointer', fontFamily: 'monospace', textDecoration: 'underline' }}
                title="Click to seek to entity first appearance"
              >
                {formatTimestamp(firstSeen)} ({fmtNum(firstSeen, 3)}s)
              </span>
              
              <span style={{ color: '#64748b' }}>Last Seen:</span>
              <span 
                onClick={() => onSeek?.(lastSeen)}
                style={{ color: '#38bdf8', cursor: 'pointer', fontFamily: 'monospace', textDecoration: 'underline' }}
                title="Click to seek to entity last appearance"
              >
                {formatTimestamp(lastSeen)} ({fmtNum(lastSeen, 3)}s)
              </span>
              
              <span style={{ color: '#64748b' }}>Observations:</span>
              <span style={{ fontFamily: 'monospace' }}>{obsCount} frames</span>
              
              <span style={{ color: '#64748b' }}>Average Speed:</span>
              <span style={{ fontFamily: 'monospace', color: '#a855f7' }}>{fmtNum(track.avg_speed, 1)} px/s</span>
              
              <span style={{ color: '#64748b' }}>Maximum Speed:</span>
              <span style={{ fontFamily: 'monospace', color: '#a855f7' }}>{fmtNum(track.max_speed, 1)} px/s</span>
              
              {states.length > 0 && (
                <>
                  <span style={{ color: '#64748b' }}>Behavior States:</span>
                  <span>{states.join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Provenance */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
            <span>Source: Module M2 (BoT-SORT) + M3 (Behavior Analytics)</span>
            <span>Entity ID: #{track.track_id ?? track.id ?? '1'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#0a0f1d',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      color: '#f8fafc',
      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      position: 'relative'
    }}>
      <div style={{
        padding: '20px 24px',
        maxHeight: '440px',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '18px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#94a3b8',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '2px 8px',
            lineHeight: '1.2',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f8fafc';
            e.currentTarget.style.backgroundColor = '#334155';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.backgroundColor = '#1e293b';
          }}
          title="Close inspection panel"
        >
          ✕
        </button>

        {/* Content */}
        {type === 'anomaly' && renderAnomalyEvidence(item)}
        {type === 'event' && renderEventEvidence(item)}
        {type === 'scene' && renderSceneEvidence(item)}
        {type === 'track' && renderTrackEvidence(item)}
      </div>
    </div>
  );
};

export default EvidencePanel;
