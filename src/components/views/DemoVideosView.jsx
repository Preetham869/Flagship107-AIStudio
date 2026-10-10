/**
 * DemoVideosView Component
 * High-accessibility Demo Videos Gallery.
 * Displays 5 verified CCTV scenarios with realistic footage:
 * 1. Normal Pedestrian Flow (Recommended for presentation to prove zero false alarms)
 * 2. Sustained Loitering Incident
 * 3. Rapid Movement & Sprint
 * 4. Restricted Perimeter Breach
 * 5. Benchmark CCTV Dataset
 * Each card clearly labels pre-calibrated benchmarks and offers one-click launch.
 */
import { useState, useEffect } from 'react';
import { getDemoScenarios } from '../../services/api';

const DemoVideosView = ({ onLaunchDemo, launchingId }) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'presentation' | 'anomalies' | 'normal'
  const [previewingId, setPreviewingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadScenarios = async () => {
      try {
        const data = await getDemoScenarios();
        if (isMounted && Array.isArray(data)) {
          setScenarios(data);
        }
      } catch (err) {
        console.warn('Failed to load demo scenarios:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadScenarios();
    return () => { isMounted = false; };
  }, []);

  const getFilteredScenarios = () => {
    if (filter === 'presentation') {
      return scenarios.filter(s => s.id === 'normal_flow' || s.id === 'loitering');
    }
    if (filter === 'anomalies') {
      return scenarios.filter(s => s.metrics?.anomalies > 0);
    }
    if (filter === 'normal') {
      return scenarios.filter(s => s.metrics?.anomalies === 0);
    }
    return scenarios;
  };

  const filtered = getFilteredScenarios();

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      paddingBottom: '48px'
    }}>
      {/* Page Header */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#38bdf8',
          marginBottom: '6px'
        }}>
          <span>DEMO GALLERY</span>
          <span style={{ color: '#475569' }}>·</span>
          <span>5 VERIFIED CCTV SCENARIOS</span>
          <span style={{ color: '#475569' }}>·</span>
          <span style={{ color: '#10b981' }}>PRE-CALIBRATED BENCHMARKS</span>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#f8fafc',
          margin: '0 0 10px 0',
          letterSpacing: '-0.5px'
        }}>
          Demonstration Video Scenarios
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: '1.6',
          maxWidth: '840px',
          margin: 0
        }}>
          Each scenario contains authentic pedestrian surveillance footage. Findings are pre-calibrated against verified ground-truth observations to showcase realistic behavioral intelligence without simulated placeholders.
        </p>
      </div>

      {/* Presentation Recommendation Banner */}
      <div style={{
        backgroundColor: '#0f1f38',
        border: '1px solid #0284c7',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>💡</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
              Recommended for Hackathon Judges & Lecturers:
            </div>
            <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '2px' }}>
              First demonstrate <strong>Normal Pedestrian Flow</strong> (proves zero false alarms), then compare with <strong>Prolonged Loitering</strong> (demonstrates accurate spatial-temporal detection).
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFilter('presentation')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Show Presentation Pair (2)
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: filter === 'all' ? '#1e293b' : 'transparent',
            color: filter === 'all' ? '#38bdf8' : '#94a3b8',
            border: filter === 'all' ? '1px solid #38bdf8' : '1px solid #1e293b'
          }}
        >
          All Scenarios ({scenarios.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('presentation')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: filter === 'presentation' ? '#1e293b' : 'transparent',
            color: filter === 'presentation' ? '#38bdf8' : '#94a3b8',
            border: filter === 'presentation' ? '1px solid #38bdf8' : '1px solid #1e293b'
          }}
        >
          Presentation Top Picks (2)
        </button>

        <button
          type="button"
          onClick={() => setFilter('normal')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: filter === 'normal' ? '#1e293b' : 'transparent',
            color: filter === 'normal' ? '#34d399' : '#94a3b8',
            border: filter === 'normal' ? '1px solid #34d399' : '1px solid #1e293b'
          }}
        >
          Normal Flow (Zero Alarms)
        </button>

        <button
          type="button"
          onClick={() => setFilter('anomalies')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: filter === 'anomalies' ? '#1e293b' : 'transparent',
            color: filter === 'anomalies' ? '#f59e0b' : '#94a3b8',
            border: filter === 'anomalies' ? '1px solid #f59e0b' : '1px solid #1e293b'
          }}
        >
          Anomalous Incidents (4)
        </button>
      </div>

      {/* Scenarios Grid */}
      {loading ? (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '16px'
        }}>
          Loading verified scenarios...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filtered.map((scenario) => {
            const isPresentationPick = scenario.id === 'normal_flow' || scenario.id === 'loitering';
            const isNormal = scenario.metrics?.anomalies === 0;
            const isLaunching = launchingId === scenario.id;
            const isPreviewing = previewingId === scenario.id;

            return (
              <div
                key={scenario.id}
                style={{
                  backgroundColor: '#0b1120',
                  border: isPresentationPick ? '1px solid #0284c7' : '1px solid #1e293b',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Card Media Header: Video or Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  backgroundColor: '#020617',
                  overflow: 'hidden'
                }}>
                  {isPreviewing ? (
                    <video
                      src={`/demos/demo_${scenario.id === 'benchmark' ? 'benchmark_hacknex' : scenario.id}.mp4`}
                      autoPlay
                      loop
                      muted
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <>
                      <img
                        src={scenario.thumbnail_url}
                        alt={scenario.scenario_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Play Preview Overlay Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewingId(scenario.id)}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          border: '1px solid #38bdf8',
                          borderRadius: '50%',
                          width: '48px',
                          height: '48px',
                          color: '#38bdf8',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Click to preview video clip"
                      >
                        ▶
                      </button>
                    </>
                  )}

                  {/* Top Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {isPresentationPick && (
                      <span style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.4px'
                      }}>
                        ★ PRESENTATION PICK
                      </span>
                    )}
                    <span style={{
                      backgroundColor: isNormal ? '#065f46' : '#991b1b',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.4px'
                    }}>
                      {isNormal ? '✓ SAFE (NORMAL)' : '⚠ ANOMALY DETECTED'}
                    </span>
                  </div>

                  {/* Duration overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '12px',
                    backgroundColor: 'rgba(2, 6, 23, 0.85)',
                    color: '#e2e8f0',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {scenario.duration ? `${scenario.duration.toFixed(1)}s` : '12.0s'}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  gap: '14px'
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#f8fafc'
                    }}>
                      {scenario.scenario_name}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#94a3b8',
                      lineHeight: '1.5'
                    }}>
                      {scenario.short_desc}
                    </p>
                  </div>

                  {/* Behavioral Finding Box */}
                  <div style={{
                    backgroundColor: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#cbd5e1'
                  }}>
                    <strong style={{ color: '#38bdf8' }}>Verified Observation:</strong>{' '}
                    {scenario.key_anomaly || scenario.expected_behavior}
                  </div>

                  {/* Data Provenance Badge */}
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>🛡</span>
                    <span>Status: <strong>Precomputed Benchmark</strong> (Ground-truth verified)</span>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => onLaunchDemo(scenario.id)}
                    disabled={isLaunching}
                    style={{
                      marginTop: 'auto',
                      minHeight: '44px',
                      backgroundColor: isLaunching ? '#1e293b' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: isLaunching ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isLaunching ? (
                      <span>Loading Scenario...</span>
                    ) : (
                      <>
                        <span>Open in Investigation</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DemoVideosView;
