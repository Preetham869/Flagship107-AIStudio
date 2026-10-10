/**
 * Comparison Workspace
 * Side-by-side analytical comparison of two processed investigations.
 */
import { useState, useEffect } from 'react';
import { getInvestigations, getJobResults } from '../../services/api';

const ComparisonWorkspace = ({ primaryJobId, primaryResults }) => {
  const [investigations, setInvestigations] = useState([]);
  const [selectedSecondaryId, setSelectedSecondaryId] = useState('');
  const [secondaryResults, setSecondaryResults] = useState(null);
  const [loadingSecondary, setLoadingSecondary] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const list = await getInvestigations();
        setInvestigations(list);
        const other = list.find((item) => item.job_id !== primaryJobId);
        if (other) {
          setSelectedSecondaryId(other.job_id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchList();
  }, [primaryJobId]);

  useEffect(() => {
    if (!selectedSecondaryId) return;
    const fetchSecondary = async () => {
      setLoadingSecondary(true);
      try {
        const data = await getJobResults(selectedSecondaryId);
        setSecondaryResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSecondary(false);
      }
    };
    fetchSecondary();
  }, [selectedSecondaryId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Investigation Selector Header */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: '600' }}>
            Multi-Investigation Comparative Analysis
          </h4>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
            Benchmark primary case against secondary historical or checkpoint recordings
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Compare Against:</span>
          <select
            value={selectedSecondaryId}
            onChange={(e) => setSelectedSecondaryId(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#020617',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: '500',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {investigations.map((inv) => (
              <option key={inv.job_id} value={inv.job_id} disabled={inv.job_id === primaryJobId}>
                {inv.filename} ({inv.job_id.slice(0, 8)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
      }}>
        {/* Primary Case Column */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderTop: '4px solid #38bdf8',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
            Primary Investigation (Active Case)
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginTop: '4px' }}>
            {primaryResults?.video_path || 'Current Video'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Total Detections</span>
              <strong style={{ color: '#f8fafc' }}>{primaryResults?.m1_total_detections || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Unique Entities</span>
              <strong style={{ color: '#38bdf8' }}>{primaryResults?.m2_unique_tracks || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Kinematic Anomalies</span>
              <strong style={{ color: '#f59e0b' }}>{primaryResults?.m4_total_anomalies || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Correlated Events</span>
              <strong style={{ color: '#ef4444' }}>{primaryResults?.m5_correlated_events || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Mean Velocity</span>
              <strong style={{ color: '#a855f7' }}>{primaryResults?.m3_avg_speed?.toFixed(1) || '0.0'} px/s</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Peak Velocity</span>
              <strong style={{ color: '#a855f7' }}>{primaryResults?.m3_max_speed?.toFixed(1) || '0.0'} px/s</strong>
            </div>
          </div>
        </div>

        {/* Secondary Case Column */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderTop: '4px solid #a855f7',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: '700', textTransform: 'uppercase' }}>
            Secondary Investigation (Comparison)
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginTop: '4px' }}>
            {secondaryResults?.video_path || 'Comparison Video'}
          </div>

          {loadingSecondary ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Loading secondary dataset...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Total Detections</span>
                <strong style={{ color: '#f8fafc' }}>{secondaryResults?.m1_total_detections || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Unique Entities</span>
                <strong style={{ color: '#38bdf8' }}>{secondaryResults?.m2_unique_tracks || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Kinematic Anomalies</span>
                <strong style={{ color: '#f59e0b' }}>{secondaryResults?.m4_total_anomalies || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Correlated Events</span>
                <strong style={{ color: '#ef4444' }}>{secondaryResults?.m5_correlated_events || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Mean Velocity</span>
                <strong style={{ color: '#a855f7' }}>{secondaryResults?.m3_avg_speed?.toFixed(1) || '0.0'} px/s</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#020617', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Peak Velocity</span>
                <strong style={{ color: '#a855f7' }}>{secondaryResults?.m3_max_speed?.toFixed(1) || '0.0'} px/s</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonWorkspace;
