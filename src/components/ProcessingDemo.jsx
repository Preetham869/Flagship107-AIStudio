/**
 * Processing Demo & Case Launcher Component
 * Premium AI Video Intelligence Investigation Hub
 * Displays verified 5-scenario demo gallery and custom video upload workflow.
 */
import { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import DashboardView from './DashboardView';
import DemoGallery from './DemoGallery';
import { 
  processVideo, 
  getJobStatus, 
  getJobResults, 
  cancelProcessing, 
  getDemoScenarios, 
  launchDemoScenario,
  getSystemStatus 
} from '../services/api';

const ProcessingDemo = () => {
  const [currentJob, setCurrentJob] = useState(null);
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [launchingScenarioId, setLaunchingScenarioId] = useState(null);
  const [systemTelemetry, setSystemTelemetry] = useState(null);

  // Load verified scenarios and telemetry on mount
  useEffect(() => {
    const fetchScenariosAndTelemetry = async () => {
      setLoadingScenarios(true);
      try {
        const [scenariosData, statusData] = await Promise.all([
          getDemoScenarios().catch(() => []),
          getSystemStatus().catch(() => null)
        ]);
        if (Array.isArray(scenariosData) && scenariosData.length > 0) {
          setScenarios(scenariosData);
        }
        setSystemTelemetry(statusData);
      } catch (err) {
        console.warn('Failed to load scenarios list:', err);
      } finally {
        setLoadingScenarios(false);
      }
    };

    fetchScenariosAndTelemetry();
  }, []);

  // Poll job status during custom video processing
  useEffect(() => {
    if (!currentJob || !polling) return;

    const pollInterval = setInterval(async () => {
      try {
        const statusData = await getJobStatus(currentJob.job_id);
        setStatus(statusData);

        // If completed, fetch results and stop polling
        if (statusData.status === 'completed') {
          setPolling(false);
          const resultsData = await getJobResults(currentJob.job_id);
          setResults(resultsData);
        }

        // If failed or canceled, stop polling
        if (statusData.status === 'failed' || statusData.status === 'canceled') {
          setPolling(false);
          setError(statusData.error || statusData.message || 'Processing halted');
        }
      } catch (err) {
        console.error('Status polling error:', err);
        setError('Failed to check status');
        setPolling(false);
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [currentJob, polling]);

  const handleLaunchScenario = async (scenarioId) => {
    setLaunchingScenarioId(scenarioId);
    setError(null);
    try {
      const response = await launchDemoScenario(scenarioId);
      setCurrentJob({
        job_id: response.job_id,
        filename: response.filename,
        video_duration: response.video_duration,
        video_width: response.video_width,
        video_height: response.video_height,
        video_fps: response.video_fps,
        scenario_id: response.scenario_id,
        scenario_name: response.scenario_name,
      });
      // Result is returned immediately for precomputed calibrated scenarios
      if (response.result) {
        setResults(response.result);
      } else {
        const resultsData = await getJobResults(response.job_id);
        setResults(resultsData);
      }
    } catch (err) {
      console.error('Failed to launch scenario:', err);
      setError('Failed to launch demo scenario investigation. Please retry.');
    } finally {
      setLaunchingScenarioId(null);
    }
  };

  const handleUploadComplete = (uploadResponse) => {
    setCurrentJob(uploadResponse);
    setStatus(null);
    setResults(null);
    setError(null);
  };

  const handleStartProcessing = async () => {
    if (!currentJob) return;

    setError(null);
    setPolling(true);

    try {
      const response = await processVideo(currentJob.job_id, {
        frameSkip: 1,
        confidenceThreshold: 0.5,
        personOnly: false,
      });
      setStatus(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start processing');
      setPolling(false);
      console.error('Processing error:', err);
    }
  };

  const handleCancel = async () => {
    if (!currentJob) return;
    try {
      await cancelProcessing(currentJob.job_id);
      setPolling(false);
      setError('Processing was canceled by investigator.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setCurrentJob(null);
    setStatus(null);
    setResults(null);
    setError(null);
    setPolling(false);
    setLaunchingScenarioId(null);
  };

  // If we have results, switch into the Full AI Investigation Workstation
  if (results && currentJob) {
    return <DashboardView jobId={currentJob.job_id} results={results} onBack={handleReset} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070a12',
      color: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Professional Mission Control Header */}
      <header style={{
        backgroundColor: '#0b1120',
        borderBottom: '1px solid #1e293b',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '15px',
            color: '#fff',
            boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)'
          }}>
            107
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: '#f8fafc' }}>
                Flagship 107
              </h1>
              <span style={{ fontSize: '12px', color: '#64748b' }}>·</span>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '600' }}>
                AUTONOMOUS VISION & BEHAVIOUR
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
              HackNEX 2026 Problem Statement HNX26PSI07 Validated Workstation
            </div>
          </div>
        </div>

        {/* Top Telemetry Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ color: '#cbd5e1' }}>TELEMETRY ONLINE</span>
          </div>
          <span>·</span>
          <span>5 PLAYABLE DEMOS (1080P)</span>
          <span>·</span>
          <span>YOLOV8 + BOT-SORT</span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        maxWidth: '1360px',
        width: '100%',
        margin: '0 auto',
        padding: '28px 24px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Hero Mission Statement & Mode Switcher */}
        <div style={{
          backgroundColor: '#0b1120',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Autonomous Video Intelligence Workstation
            </div>
            <h2 style={{ margin: '4px 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' }}>
              Investigation Launchpad & Scenario Hub
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '680px', lineHeight: '1.5' }}>
              Select a verified demonstration scenario below to inspect pre-calibrated detections, spatial loitering, velocity surges, and zone intrusions—or upload custom CCTV footage for end-to-end pipeline analysis.
            </p>
          </div>

          {/* Mode Tabs (Clean Segmented Buttons) */}
          <div style={{
            display: 'flex',
            backgroundColor: '#020617',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid #1e293b'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'gallery' ? '#0284c7' : 'transparent',
                color: activeTab === 'gallery' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>⚡</span> Demo Gallery (5 Scenarios)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'upload' ? '#0284c7' : 'transparent',
                color: activeTab === 'upload' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>📁</span> Custom Video Upload
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '14px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <strong>Notice:</strong> {error}
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #f87171',
                color: '#f87171',
                padding: '5px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Demo Video Gallery */}
        {activeTab === 'gallery' && !currentJob && (
          <DemoGallery
            scenarios={scenarios}
            onSelectScenario={handleLaunchScenario}
            loading={loadingScenarios}
            launchingId={launchingScenarioId}
          />
        )}

        {/* Tab 2: Custom Video Upload */}
        {activeTab === 'upload' && !currentJob && (
          <div style={{
            backgroundColor: '#0b1120',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '36px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
              Custom Surveillance Video Upload
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
              Upload an MP4, AVI, MOV, or MKV file up to 100MB to execute M1 detection, M2 tracking, M3 kinematic analysis, M4 anomaly classification, and M5 event correlation.
            </p>

            <VideoUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Step 2: Uploaded Video Ready to Process */}
        {currentJob && !polling && !results && (
          <div style={{
            backgroundColor: '#0b1120',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '36px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
              Video Asset Verified
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
              Video file uploaded and verified via FFprobe. Ready to execute multi-stage analysis pipeline.
            </p>

            <div style={{
              backgroundColor: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div style={{ color: '#64748b' }}>Job ID</div>
                <div style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{currentJob.job_id.slice(0, 12)}...</div>

                <div style={{ color: '#64748b' }}>Filename</div>
                <div style={{ color: '#f1f5f9' }}>{currentJob.filename}</div>

                <div style={{ color: '#64748b' }}>Duration</div>
                <div style={{ color: '#f1f5f9' }}>{currentJob.video_duration?.toFixed(2)}s (Verified via FFprobe)</div>

                <div style={{ color: '#64748b' }}>Resolution</div>
                <div style={{ color: '#f1f5f9' }}>{currentJob.video_width}×{currentJob.video_height}</div>

                <div style={{ color: '#64748b' }}>Framerate</div>
                <div style={{ color: '#f1f5f9' }}>{currentJob.video_fps?.toFixed(2)} FPS</div>

                <div style={{ color: '#64748b' }}>Benchmark Status</div>
                <div style={{ color: currentJob.scenario_id ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                  {currentJob.scenario_id 
                    ? `Matched: ${currentJob.scenario_id.replace(/_/g, ' ').toUpperCase()}` 
                    : 'Uncalibrated Upload (Engine Offline)'}
                </div>
              </div>

              {!currentJob.scenario_id && (
                <div style={{
                  marginTop: '14px',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#fbbf24',
                  lineHeight: '1.45'
                }}>
                  <strong>Notice:</strong> Real-time Python YOLOv8 worker is offline in this container. In accordance with Flagship 107 anti-fabrication standards, synthetic anomalies will not be generated for uncalibrated uploads. Please launch one of the 5 verified scenarios in the Demo Gallery to test full multi-stage tracking and anomaly detection.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleStartProcessing}
                style={{
                  flex: 1,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
                }}
              >
                Execute M1–M8 Processing Pipeline →
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Real-Time Pipeline Progress */}
        {polling && status && (
          <div style={{
            backgroundColor: '#0b1120',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '36px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
              <strong style={{ color: '#f1f5f9' }}>
                {status.status === 'processing' ? 'Pipeline Active: Processing Video Frames...' : 'Finalizing Investigation...'}
              </strong>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>
                {status.progress !== null && status.progress !== undefined 
                  ? `${status.progress.toFixed(0)}%` 
                  : ''}
              </span>
            </div>

            {status.progress !== null && status.progress !== undefined && (
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#1e293b',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '16px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  width: `${status.progress}%`,
                  height: '100%',
                  backgroundColor: '#38bdf8',
                  transition: 'width 0.3s ease-out'
                }} />
              </div>
            )}

            {status.message && (
              <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid #38bdf8',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>{status.message}</span>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '7px 14px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Cancel Processing
              </button>
            </div>

            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0b1120',
        borderTop: '1px solid #1e293b',
        padding: '16px 28px',
        fontSize: '12px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          Flagship 107 · Video Intelligence & Anomaly Detection Workstation · HackNEX 2026
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>YOLOv8 Detection</span>
          <span>·</span>
          <span>BoT-SORT Tracking</span>
          <span>·</span>
          <span>M4 Kinematic Engine</span>
          <span>·</span>
          <span>Deterministic Provenance</span>
        </div>
      </footer>
    </div>
  );
};

export default ProcessingDemo;
