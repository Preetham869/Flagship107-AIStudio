/**
 * Entity Explorer Workspace
 * Comprehensive catalog of tracked entities with duration, kinematics,
 * associated anomalies, and direct navigation to video timestamps.
 */
import { useState, useMemo } from 'react';
import { useSelection } from '../../context/SelectionContext';

const EntityExplorerWorkspace = ({ results, onSeek }) => {
  const { selectTrack, selectAnomaly, setActiveWorkspace, searchQuery, setSearchQuery } = useSelection();
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // Extract tracks from all_behaviors or all_tracks
  const tracks = useMemo(() => {
    const trackSummaries = {};

    if (results?.all_behaviors) {
      results.all_behaviors.forEach((frameBehaviors) => {
        frameBehaviors.forEach((behavior) => {
          const trackId = behavior.track_id;
          if (!trackSummaries[trackId]) {
            trackSummaries[trackId] = {
              track_id: trackId,
              class_name: behavior.class_name || 'person',
              observations: 0,
              first_timestamp: behavior.timestamp || 0,
              last_timestamp: behavior.timestamp || 0,
              speeds: [],
              states: new Set(),
              anomalies: [],
            };
          }

          const s = trackSummaries[trackId];
          s.observations++;
          s.last_timestamp = Math.max(s.last_timestamp, behavior.timestamp || 0);
          if (behavior.speed) s.speeds.push(behavior.speed);
          if (behavior.state) s.states.add(behavior.state);
        });
      });
    }

    // Attach any anomalies associated with this track ID
    if (results?.all_anomalies) {
      results.all_anomalies.forEach((a) => {
        if (a.track_id !== undefined && trackSummaries[a.track_id]) {
          trackSummaries[a.track_id].anomalies.push(a);
        }
      });
    }

    // Fallback if no all_behaviors
    if (Object.keys(trackSummaries).length === 0 && results?.m2_unique_tracks) {
      for (let i = 1; i <= results.m2_unique_tracks; i++) {
        trackSummaries[i] = {
          track_id: i,
          class_name: 'person',
          observations: Math.round(results.m1_total_detections / results.m2_unique_tracks),
          first_timestamp: 0.0,
          last_timestamp: results.video_duration || 10.01,
          speeds: [results.m3_avg_speed || 60],
          states: new Set(['moving']),
          anomalies: (results?.all_anomalies || []).filter((a) => a.track_id === i),
        };
      }
    }

    return Object.values(trackSummaries).map((t) => ({
      ...t,
      duration: Math.max(0.1, t.last_timestamp - t.first_timestamp),
      avg_speed: t.speeds.length > 0 ? t.speeds.reduce((a, b) => a + b, 0) / t.speeds.length : 0,
      max_speed: t.speeds.length > 0 ? Math.max(...t.speeds) : 0,
      states_list: Array.from(t.states),
    })).sort((a, b) => a.track_id - b.track_id);
  }, [results]);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchSearch = !searchQuery || 
        String(t.track_id).includes(searchQuery) ||
        t.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.states_list.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchClass = selectedClassFilter === 'all' || t.class_name.toLowerCase() === selectedClassFilter.toLowerCase();

      return matchSearch && matchClass;
    });
  }, [tracks, searchQuery, selectedClassFilter]);

  const uniqueClasses = useMemo(() => {
    const set = new Set(tracks.map((t) => t.class_name));
    return ['all', ...Array.from(set)];
  }, [tracks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Filter Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#0f172a',
        padding: '16px 20px',
        borderRadius: '8px',
        border: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search by Track ID (#1), class, or behavior state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '360px',
              padding: '8px 14px',
              backgroundColor: '#020617',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Class Filter Chips */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {uniqueClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClassFilter(cls)}
              style={{
                padding: '6px 12px',
                backgroundColor: selectedClassFilter === cls ? '#38bdf8' : '#1e293b',
                color: selectedClassFilter === cls ? '#0f172a' : '#94a3b8',
                border: `1px solid ${selectedClassFilter === cls ? '#38bdf8' : '#334155'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Entity Dossier Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {filteredTracks.map((track) => (
          <div
            key={track.track_id}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Header: Track ID & Class */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '3px 10px',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  fontSize: '13px',
                }}>
                  #{track.track_id}
                </span>
                <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>
                  {track.class_name}
                </span>
              </div>

              {track.anomalies.length > 0 && (
                <span style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}>
                  {track.anomalies.length} {track.anomalies.length === 1 ? 'Anomaly' : 'Anomalies'}
                </span>
              )}
            </div>

            {/* Metrics Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              backgroundColor: '#020617',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Duration:</span>{' '}
                <strong style={{ color: '#e2e8f0' }}>{track.duration.toFixed(2)}s</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Observations:</span>{' '}
                <strong style={{ color: '#e2e8f0' }}>{track.observations} frames</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>First Seen:</span>{' '}
                <strong style={{ color: '#38bdf8' }}>{track.first_timestamp.toFixed(2)}s</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Last Seen:</span>{' '}
                <strong style={{ color: '#e2e8f0' }}>{track.last_timestamp.toFixed(2)}s</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Mean Speed:</span>{' '}
                <strong style={{ color: '#a855f7' }}>{track.avg_speed.toFixed(1)} px/s</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Peak Speed:</span>{' '}
                <strong style={{ color: '#a855f7' }}>{track.max_speed.toFixed(1)} px/s</strong>
              </div>
            </div>

            {/* Behavior States Observed */}
            {track.states_list.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Behavior States:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {track.states_list.map((state, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: '#1e293b',
                        color: '#94a3b8',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Associated Anomalies List */}
            {track.anomalies.length > 0 && (
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', color: '#f87171', fontWeight: '600', marginBottom: '6px' }}>
                  Associated Anomalies:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {track.anomalies.map((anom, aIdx) => (
                    <div
                      key={aIdx}
                      onClick={() => {
                        selectAnomaly(anom);
                        if (anom.timestamp !== undefined) onSeek?.(anom.timestamp);
                        setActiveWorkspace('video');
                      }}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#1c1917',
                        border: '1px solid #44403c',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: '#fdba74' }}>⚠ {anom.anomaly_type?.replace(/_/g, ' ')}</span>
                      <span style={{ color: '#94a3b8' }}>t={anom.timestamp?.toFixed(2)}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
              <button
                onClick={() => {
                  selectTrack(track);
                  onSeek?.(track.first_timestamp);
                  setActiveWorkspace('video');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Jump to First Seen ({track.first_timestamp.toFixed(2)}s)
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#0f172a',
          borderRadius: '8px',
          border: '1px solid #1e293b',
          color: '#94a3b8',
        }}>
          No tracked entities match the search query "{searchQuery}".
        </div>
      )}
    </div>
  );
};

export default EntityExplorerWorkspace;
