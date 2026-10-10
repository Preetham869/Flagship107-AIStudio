/**
 * Processing Demo & Case Launcher Component
 * Demonstrates upload -> process -> status -> results workflow
 * Also provides one-click launch for pre-calibrated benchmark investigation
 */
import { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import DashboardView from './DashboardView';
import { processVideo, getJobStatus, getJobResults, cancelProcessing } from '../services/api';

const ProcessingDemo = () => {
  const [currentJob, setCurrentJob] = useState(null);
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  // Poll job status
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

  const handleUploadComplete = (uploadResponse) => {
    setCurrentJob(uploadResponse);
    setStatus(null);
    setResults(null);
    setError(null);
  };

  const handleOpenBenchmark = async () => {
    try {
      const benchmarkJob = {
        job_id: 'demo-job-benchmark-001',
        filename: 'cctv_surveillance_benchmark_1080p.mp4',
        video_duration: 10.01,
        video_width: 1920,
        video_height: 1080,
        video_fps: 23.98,
      };
      setCurrentJob(benchmarkJob);
      const resultsData = await getJobResults(benchmarkJob.job_id);
      setResults(resultsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load benchmark dataset');
    }
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
      setError('Processing was canceled by user.');
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
  };

  // If we have results, switch entirely to DashboardView
  if (results && currentJob) {
    return <DashboardView jobId={currentJob.job_id} results={results} onBack={handleReset} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0e17',
      color: '#eceff1',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '16px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '15px',
            color: '#fff',
          }}>
            107
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px', color: '#f8fafc' }}>
            Flagship 107
          </h1>
          <div style={{
            padding: '3px 10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#38bdf8',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            AI Video Intelligence Workstation
          </div>
        </div>

        <button
          onClick={handleOpenBenchmark}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⚡</span> Open Calibrated Benchmark Case
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '620px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>
            New Video Investigation
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5' }}>
            Upload surveillance video footage to initiate M1–M9 behavioral anomaly detection, tracking, and contextual scene synthesis.
          </p>

          {/* Quick Benchmark Button Banner */}
          {!currentJob && (
            <div style={{
              backgroundColor: '#020617',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#38bdf8' }}>
                  HackNEX 2026 Ground-Truth Dataset
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Pre-calibrated 1080p CCTV footage with 734 detections & 44 anomalies
                </div>
              </div>
              <button
                onClick={handleOpenBenchmark}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Inspect Now →
              </button>
            </div>
          )}

          {/* Step 1: Upload */}
          {!currentJob && (
            <VideoUpload onUploadComplete={handleUploadComplete} />
          )}

          {/* Step 2: Start Processing */}
          {currentJob && !polling && !results && (
            <div>
              <div style={{
                backgroundColor: '#020617',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div style={{ color: '#64748b' }}>Job ID</div>
                  <div style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{currentJob.job_id.split('-')[0]}...</div>
                  
                  <div style={{ color: '#64748b' }}>Filename</div>
                  <div style={{ color: '#f1f5f9' }}>{currentJob.filename}</div>
                  
                  <div style={{ color: '#64748b' }}>Duration</div>
                  <div style={{ color: '#f1f5f9' }}>{currentJob.video_duration?.toFixed(2)}s</div>
                  
                  <div style={{ color: '#64748b' }}>Resolution</div>
                  <div style={{ color: '#f1f5f9' }}>{currentJob.video_width}x{currentJob.video_height}</div>
                  
                  <div style={{ color: '#64748b' }}>Framerate</div>
                  <div style={{ color: '#f1f5f9' }}>{currentJob.video_fps?.toFixed(2)} FPS</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleStartProcessing} 
                  style={{
                    flex: 1,
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Start M1–M8 Processing Pipeline
                </button>
                <button 
                  onClick={handleReset} 
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '12px 16px',
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

          {/* Step 3: Processing Status */}
          {polling && status && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <strong style={{ color: '#f1f5f9' }}>
                  {status.status === 'processing' ? 'Pipeline Active' : 'Finalizing...'}
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
                <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    border: '2px solid #38bdf8', 
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  {status.message}
                </div>
              )}

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
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

          {/* Error Display */}
          {error && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171', 
              padding: '16px', 
              borderRadius: '6px',
              marginTop: '24px',
              fontSize: '13px'
            }}>
              <strong>Notice:</strong> {error}
              <button 
                onClick={handleReset}
                style={{
                  display: 'block',
                  marginTop: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #f87171',
                  color: '#f87171',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Reset & Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingDemo;
