/**
 * Event Investigation Workspace
 * Rigorous event and anomaly inspection workspace with severity grouping,
 * temporal correlation, and direct seeking to incident timestamps.
 */
import { useState, useMemo } from 'react';
import { useSelection } from '../../context/SelectionContext';

const EventInvestigationWorkspace = ({ results, onSeek }) => {
  const { selectAnomaly, selectEvent, setActiveWorkspace, searchQuery, setSearchQuery } = useSelection();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'events' | 'anomalies'

  const events = useMemo(() => results?.all_events || [], [results]);
  const anomalies = useMemo(() => results?.all_anomalies || [], [results]);

  // Combined item list with unified schema
  const unifiedItems = useMemo(() => {
    const list = [];

    if (typeFilter === 'all' || typeFilter === 'events') {
      events.forEach((e, idx) => {
        list.push({
          id: e.event_id || `evt_${idx}`,
          itemType: 'event',
          title: e.event_type?.replace(/_/g, ' ') || 'Correlated Event',
          type: e.event_type,
          severity: (e.severity || 'high').toLowerCase(),
          timestamp: e.start_timestamp !== undefined ? e.start_timestamp : (e.timestamp || 0),
          endTimestamp: e.end_timestamp,
          trackIds: e.track_ids || (e.track_id ? [e.track_id] : []),
          description: e.description || `Correlated incident synthesized from ${e.source_anomalies?.length || 2} raw anomaly observations.`,
          raw: e,
        });
      });
    }

    if (typeFilter === 'all' || typeFilter === 'anomalies') {
      anomalies.forEach((a, idx) => {
        list.push({
          id: `anom_${idx}`,
          itemType: 'anomaly',
          title: a.anomaly_type?.replace(/_/g, ' ') || 'Kinematic Anomaly',
          type: a.anomaly_type,
          severity: (a.severity || 'medium').toLowerCase(),
          timestamp: a.timestamp || 0,
          trackIds: a.track_id !== undefined ? [a.track_id] : [],
          description: a.description || `Kinematic deviation detected for Track #${a.track_id} at ${a.timestamp?.toFixed(2)}s.`,
          raw: a,
        });
      });
    }

    return list.sort((a, b) => a.timestamp - b.timestamp);
  }, [events, anomalies, typeFilter]);

  // Filtered by search and severity
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      const matchSeverity = severityFilter === 'all' || item.severity === severityFilter;
      const matchSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trackIds.some((id) => String(id).includes(searchQuery));

      return matchSeverity && matchSearch;
    });
  }, [unifiedItems, severityFilter, searchQuery]);

  const getSeverityBadge = (severity) => {
    const s = (severity || 'medium').toLowerCase();
    let bg = 'rgba(234, 179, 8, 0.15)';
    let color = '#eab308';
    let border = '#eab308';

    if (s === 'high') {
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#ef4444';
      border = '#ef4444';
    } else if (s === 'low') {
      bg = 'rgba(56, 189, 248, 0.15)';
      color = '#38bdf8';
      border = '#38bdf8';
    }

    return (
      <span style={{
        padding: '2px 8px',
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
      }}>
        {s}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search events, anomaly types, or track IDs..."
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
        </div>

        {/* Severity & Type Selectors */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'events', 'anomalies'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: typeFilter === t ? '#38bdf8' : '#1e293b',
                  color: typeFilter === t ? '#0f172a' : '#94a3b8',
                  border: `1px solid ${typeFilter === t ? '#38bdf8' : '#334155'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', backgroundColor: '#334155' }} />

          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'high', 'medium', 'low'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: severityFilter === s ? '#1e293b' : 'transparent',
                  color: severityFilter === s ? '#38bdf8' : '#64748b',
                  border: `1px solid ${severityFilter === s ? '#38bdf8' : 'transparent'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events & Anomalies Table / Card Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.itemType === 'event') {
                selectEvent(item.raw);
              } else {
                selectAnomaly(item.raw);
              }
              onSeek?.(item.timestamp);
              setActiveWorkspace('video');
            }}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderLeft: item.itemType === 'event' ? '4px solid #ef4444' : '4px solid #f59e0b',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s, border-color 0.15s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
              e.currentTarget.style.borderColor = '#38bdf8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0f172a';
              e.currentTarget.style.borderColor = '#1e293b';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: item.itemType === 'event' ? '#ef4444' : '#f59e0b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {item.itemType === 'event' ? '◆ CORRELATED EVENT (M5)' : '⚠ KINEMATIC ANOMALY (M4)'}
                </span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  fontWeight: '600',
                }}>
                  t={item.timestamp.toFixed(2)}s {item.endTimestamp ? `→ ${item.endTimestamp.toFixed(2)}s` : ''}
                </span>
                {getSeverityBadge(item.severity)}
              </div>

              <div style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', textTransform: 'capitalize' }}>
                {item.title}
              </div>

              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', maxWidth: '800px' }}>
                {item.description}
              </div>

              {item.trackIds.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Associated Entities:</span>
                  {item.trackIds.map((tid, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '1px 6px',
                        backgroundColor: '#0284c7',
                        color: '#fff',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                      }}
                    >
                      #{tid}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Jump to Video ({item.timestamp.toFixed(2)}s) →
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            color: '#94a3b8',
          }}>
            No events or anomalies found matching the current search & filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventInvestigationWorkspace;
