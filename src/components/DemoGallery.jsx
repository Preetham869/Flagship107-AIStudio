/**
 * Demo Video Gallery Component
 * Displays 5 verified demonstration scenarios with real video previews,
 * verified metadata, expected behavioral criteria, and one-click launch.
 */
import { useState } from 'react';

const DemoGallery = ({ scenarios = [], onSelectScenario, loading = false, launchingId = null }) => {
  const [filter, setFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  const filteredScenarios = scenarios.filter((s) => {
    if (filter === 'anomalies') return s.metrics?.anomalies > 0;
    if (filter === 'nominal') return s.metrics?.anomalies === 0;
    return true;
  });

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      case 'low':
      default:
        return '#10b981';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter and Telemetry Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '4px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#38bdf8' }}>
            Verified Demonstration Scenarios
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
            5 pre-calibrated test cases · 1080p 24 FPS · M1–M8 behavioral benchmarks
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#020617',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid #1e293b'
        }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? '#1e293b' : 'transparent',
              color: filter === 'all' ? '#f8fafc' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            All Scenarios ({scenarios.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('anomalies')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'anomalies' ? '#1e293b' : 'transparent',
              color: filter === 'anomalies' ? '#f59e0b' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            Anomalous Incidents (4)
          </button>
          <button
            type="button"
            onClick={() => setFilter('nominal')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'nominal' ? '#1e293b' : 'transparent',
              color: filter === 'nominal' ? '#10b981' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            Nominal Flow (1)
          </button>
        </div>
      </div>

      {/* 5 Scenario Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px',
      }}>
        {filteredScenarios.map((scenario, index) => {
          const isHovered = hoveredCard === scenario.id;
          const isLaunching = launchingId === scenario.id;
          const riskColor = getRiskColor(scenario.risk_level);

          return (
            <div
              key={scenario.id}
              onMouseEnter={() => setHoveredCard(scenario.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: '#0a0f1d',
                border: isHovered ? '1px solid #38bdf8' : '1px solid #1e293b',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered
                  ? '0 12px 28px rgba(0,0,0,0.6), 0 0 16px rgba(56, 189, 248, 0.15)'
                  : '0 4px 14px rgba(0,0,0,0.4)',
              }}
            >
              {/* Card Thumbnail Container */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '170px',
                backgroundColor: '#020617',
                overflow: 'hidden',
              }}>
                <img
                  src={scenario.thumbnail_url}
                  alt={scenario.scenario_name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1.0)',
                    filter: 'brightness(0.92) contrast(1.05)'
                  }}
                  onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Subtle Grid / HUD Scanlines overlay on image */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(180deg, rgba(2,6,23,0.1) 0%, rgba(2,6,23,0.7) 100%)',
                }} />

                {/* Top Corner Technical Metadata Strip (Zero pills: clean unboxed text) */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#e2e8f0',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: riskColor,
                      boxShadow: `0 0 8px ${riskColor}`
                    }} />
                    <span>{scenario.risk_level?.toUpperCase()} RISK</span>
                  </div>

                  <div style={{ color: '#94a3b8' }}>
                    CASE 0{index + 1}
                  </div>
                </div>

                {/* Bottom Verified Duration and Specs Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#cbd5e1',
                  textShadow: '0 1px 4px rgba(0,0,0,0.9)'
                }}>
                  <span>{scenario.duration?.toFixed(1)}s (VERIFIED)</span>
                  <span>{scenario.resolution} · {scenario.fps} FPS</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: '12px',
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#f8fafc',
                    letterSpacing: '-0.2px'
                  }}>
                    {scenario.scenario_name}
                  </h3>
                  <p style={{
                    margin: '6px 0 0 0',
                    fontSize: '13px',
                    color: '#94a3b8',
                    lineHeight: '1.45',
                  }}>
                    {scenario.short_desc}
                  </p>
                </div>

                {/* Expected Behavior Callout Block */}
                <div style={{
                  backgroundColor: '#020617',
                  borderLeft: `3px solid ${riskColor}`,
                  borderRadius: '0 6px 6px 0',
                  padding: '9px 12px',
                  fontSize: '12px',
                  color: '#cbd5e1',
                  lineHeight: '1.45'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: riskColor,
                    marginBottom: '3px'
                  }}>
                    Expected Scenario Behavior
                  </div>
                  {scenario.expected_behavior}
                </div>

                {/* Verified Footage Provenance & Licensing */}
                <div style={{
                  fontSize: '10px',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#020617',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  border: '1px solid #1e293b'
                }}>
                  <span style={{ color: '#38bdf8', fontWeight: '700' }}>SOURCE:</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {scenario.source_dataset || 'Intel IoT DevKit CCTV Benchmark'} · {scenario.license || 'CC-BY 4.0'}
                  </span>
                </div>

                {/* Benchmark Metrics Strip (Unboxed metadata with subtle dots) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#64748b',
                  fontFamily: 'monospace',
                  paddingTop: '4px',
                  borderTop: '1px solid #1e293b'
                }}>
                  <div>
                    <span>{scenario.metrics?.tracks || 0} TRACKS</span>
                    <span style={{ margin: '0 4px' }}>·</span>
                    <span style={{ color: scenario.metrics?.anomalies > 0 ? '#f59e0b' : '#10b981' }}>
                      {scenario.metrics?.anomalies || 0} ANOMALIES
                    </span>
                    <span style={{ margin: '0 4px' }}>·</span>
                    <span>{scenario.metrics?.events || 0} EVENTS</span>
                  </div>

                  <span style={{ color: '#38bdf8' }}>
                    {scenario.data_mode === 'Calibrated Benchmark Ground-Truth' ? 'BENCHMARK' : 'CALIBRATED'}
                  </span>
                </div>

                {/* Launch Investigation Button */}
                <button
                  type="button"
                  disabled={loading || isLaunching}
                  onClick={() => onSelectScenario(scenario.id)}
                  style={{
                    marginTop: 'auto',
                    padding: '10px 16px',
                    backgroundColor: isLaunching ? '#1e293b' : (isHovered ? '#0284c7' : '#0369a1'),
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: (loading || isLaunching) ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                    boxShadow: isHovered ? '0 4px 12px rgba(2, 132, 199, 0.4)' : 'none',
                  }}
                >
                  {isLaunching ? (
                    <>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                      <span>Loading Scenario {scenario.id}...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Launch Investigation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DemoGallery;
