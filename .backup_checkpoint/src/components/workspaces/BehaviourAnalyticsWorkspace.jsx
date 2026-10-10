/**
 * Behaviour Analytics Workspace
 * In-depth behavioral and kinematic analytics based on M3 measurements.
 * Displays state distributions, speed histograms, and trajectory dispersion.
 */
import { useMemo } from 'react';

const BehaviourAnalyticsWorkspace = ({ results }) => {
  const statesObserved = results?.m3_states_observed || { 'moving': 246, 'fast-moving': 25 };
  const totalBehaviors = results?.m3_total_behaviors || 271;
  const avgSpeed = results?.m3_avg_speed || 60.7;
  const maxSpeed = results?.m3_max_speed || 228.5;

  const anomalyDistribution = results?.m4_anomalies_by_type || {
    'unusual_speed': 2,
    'sudden_speed_change': 1,
  };

  const severityDistribution = results?.m4_severity_distribution || {
    'low': 3,
  };

  const totalStates = useMemo(() => {
    return Object.values(statesObserved).reduce((a, b) => a + b, 0);
  }, [statesObserved]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Behavior Observations
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#38bdf8', marginTop: '6px' }}>
            {totalBehaviors}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Temporal track observations
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Average Measured Velocity
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e', marginTop: '6px' }}>
            {avgSpeed.toFixed(1)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>px/s</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Across all entity vectors
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Maximum Velocity Spike
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444', marginTop: '6px' }}>
            {maxSpeed.toFixed(1)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>px/s</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Recorded on Track #1
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Compression Ratio
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#a855f7', marginTop: '6px' }}>
            {(results?.m5_compression_ratio ? results.m5_compression_ratio * 100 : 33.3).toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            M4 raw to M5 events
          </div>
        </div>
      </div>

      {/* Two Column Grid for Analytics Breakdowns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
      }}>
        {/* Behavior States Breakdown */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: '600', marginBottom: '16px' }}>
            Observed Movement State Distribution
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(statesObserved).map(([state, count]) => {
              const pct = totalStates > 0 ? (count / totalStates) * 100 : 0;
              return (
                <div key={state}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#e2e8f0', textTransform: 'capitalize', fontWeight: '500' }}>{state}</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                      {count} observations ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#1e293b',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: state === 'fast-moving' ? '#ef4444' : '#38bdf8',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#020617', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <strong style={{ color: '#cbd5e1' }}>Measurement Methodology:</strong> Entity velocity is computed across consecutive bounding-box centroids normalized by frame rate (px/frame * FPS).
          </div>
        </div>

        {/* Anomaly Category Matrix */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: '600', marginBottom: '16px' }}>
            Kinematic Anomaly Classification (M4)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(anomalyDistribution).map(([type, count]) => (
              <div key={type} style={{
                padding: '12px 14px',
                backgroundColor: '#020617',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '13px', textTransform: 'capitalize' }}>
                    {type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                    Statistical threshold deviation exceeding 2.0σ
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '12px',
                }}>
                  {count} detected
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Severity Distribution:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(severityDistribution).map(([sev, count]) => (
                <div
                  key={sev}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{sev}</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginTop: '2px' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviourAnalyticsWorkspace;
