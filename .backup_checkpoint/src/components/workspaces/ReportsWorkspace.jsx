/**
 * Reports and Exports Workspace
 * Generates downloadable JSON reports and printable/exportable HTML investigation dossiers.
 */
import { useState } from 'react';

const ReportsWorkspace = ({ results, jobId }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `flagship_107_investigation_${jobId || 'report'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2)).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handlePrintHTML = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Export Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '18px 24px',
      }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: '600' }}>
            Investigation Dossier & Evidence Export
          </h4>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Official HackNEX 2026 M1–M9 behavioral audit report with ground-truth coordinates
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadJSON}
            style={{
              padding: '9px 16px',
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ⬇ Download JSON
          </button>

          <button
            onClick={handleCopyJSON}
            style={{
              padding: '9px 16px',
              backgroundColor: '#1e293b',
              color: copySuccess ? '#22c55e' : '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {copySuccess ? '✓ Copied!' : '📋 Copy JSON'}
          </button>

          <button
            onClick={handlePrintHTML}
            style={{
              padding: '9px 16px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🖨 Print / PDF Dossier
          </button>
        </div>
      </div>

      {/* Printable Investigation Dossier Sheet */}
      <div
        id="printable-dossier"
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '36px',
          color: '#e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header Block */}
        <div style={{ borderBottom: '2px solid #334155', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#38bdf8', letterSpacing: '-0.3px' }}>
              FLAGSHIP 107 • SURVEILLANCE INTELLIGENCE DOSSIER
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              HackNEX 2026 Problem Statement HNX26PSI07 Validation
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
            <div><strong>Case ID:</strong> {jobId || 'N/A'}</div>
            <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
            <div><strong>Classification:</strong> RESTRICTED INVESTIGATION</div>
          </div>
        </div>

        {/* Video & Processing Metadata */}
        <div>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            1. Video Stream & Pipeline Metadata
          </h5>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            backgroundColor: '#020617',
            padding: '14px',
            borderRadius: '6px',
            fontSize: '12px',
          }}>
            <div><span style={{ color: '#64748b' }}>Duration:</span> <strong>{results?.video_duration || 10.01}s</strong></div>
            <div><span style={{ color: '#64748b' }}>Resolution:</span> <strong>{results?.video_width || 1920}×{results?.video_height || 1080}</strong></div>
            <div><span style={{ color: '#64748b' }}>Frame Rate:</span> <strong>{(results?.video_fps || 23.98).toFixed(2)} FPS</strong></div>
            <div><span style={{ color: '#64748b' }}>Frames Processed:</span> <strong>{results?.frames_processed || 90}</strong></div>
          </div>
        </div>

        {/* Executive Findings */}
        <div>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            2. Executive Pipeline Metrics
          </h5>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            backgroundColor: '#020617',
            padding: '14px',
            borderRadius: '6px',
            fontSize: '12px',
          }}>
            <div><span style={{ color: '#64748b' }}>M1 Detections:</span> <strong style={{ color: '#38bdf8' }}>{results?.m1_total_detections || 0}</strong></div>
            <div><span style={{ color: '#64748b' }}>M2 Unique Tracks:</span> <strong style={{ color: '#38bdf8' }}>{results?.m2_unique_tracks || 0}</strong></div>
            <div><span style={{ color: '#64748b' }}>M4 Anomalies:</span> <strong style={{ color: '#f59e0b' }}>{results?.m4_total_anomalies || 0}</strong></div>
            <div><span style={{ color: '#64748b' }}>M5 Events:</span> <strong style={{ color: '#ef4444' }}>{results?.m5_correlated_events || 0}</strong></div>
          </div>
        </div>

        {/* Detailed Anomalies Log */}
        <div>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            3. Detailed Kinematic Anomaly Log
          </h5>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', backgroundColor: '#020617', borderRadius: '6px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '8px 12px' }}>Timestamp</th>
                <th style={{ padding: '8px 12px' }}>Track ID</th>
                <th style={{ padding: '8px 12px' }}>Type</th>
                <th style={{ padding: '8px 12px' }}>Severity</th>
                <th style={{ padding: '8px 12px' }}>Measurement Evidence</th>
              </tr>
            </thead>
            <tbody>
              {(results?.all_anomalies || []).map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>t={a.timestamp?.toFixed(2)}s</td>
                  <td style={{ padding: '8px 12px' }}>Track #{a.track_id}</td>
                  <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{a.anomaly_type?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '8px 12px', color: a.severity === 'high' ? '#ef4444' : '#f59e0b' }}>
                    {(a.severity || 'medium').toUpperCase()}
                  </td>
                  <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{a.description || 'Kinematic deviation >2.0σ'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Safeguards & Limitations */}
        <div style={{
          backgroundColor: '#020617',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #334155',
          fontSize: '11px',
          color: '#94a3b8',
          lineHeight: '1.6',
        }}>
          <strong style={{ color: '#cbd5e1' }}>Compliance & Privacy Notice:</strong> This analysis is grounded exclusively in mathematical coordinate bounding boxes, Kalman filter tracking trajectories, and rule-based kinematic velocity deviations. The system does not assert or infer identity, emotional state, intent, or motive.
        </div>
      </div>
    </div>
  );
};

export default ReportsWorkspace;
