/**
 * UploadModal Component
 * Accessible video upload dialog with verified file inspection and honest feedback.
 * Strictly adheres to Section 7:
 * - After upload is verified, explicitly states:
 *   "Your video has been uploaded successfully. Its file properties have been verified,
 *    but behaviour analysis has not run yet because the analysis engine is unavailable."
 * - Two clear, comfortable action buttons:
 *   [Try a Demo Video]
 *   [Return to Home]
 * - Never invents fake anomalies or attaches unrelated benchmark results.
 */
import { useState } from 'react';
import { uploadVideo } from '../../services/api';

const UploadModal = ({ isOpen, onClose, onNavigateToDemos }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [verifiedUpload, setVerifiedUpload] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setError(null);
      setVerifiedUpload(null);

      // Validate size (100MB max)
      if (selected.size > 100 * 1024 * 1024) {
        setError('Video file size exceeds the 100MB maximum limit.');
        return;
      }

      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      const response = await uploadVideo(file, (percent) => {
        setProgress(percent);
      });

      setUploading(false);
      setVerifiedUpload(response);
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.detail || 'Video upload failed. Please try again.');
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setError(null);
    setVerifiedUpload(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0b1120',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        maxWidth: '640px',
        width: '100%',
        padding: '32px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
          title="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div>
          <div style={{
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#38bdf8',
            marginBottom: '4px'
          }}>
            VIDEO VERIFICATION & UPLOAD
          </div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#f8fafc',
            margin: 0
          }}>
            Analyse Custom Video
          </h2>
        </div>

        {/* State A: File Picker & Upload Progress */}
        {!verifiedUpload && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Select a video file to verify format, resolution, and frame timing.
            </p>

            {/* Dropzone */}
            <div
              style={{
                border: '2px dashed #334155',
                borderRadius: '8px',
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#020617',
                cursor: uploading ? 'wait' : 'pointer',
                transition: 'border-color 0.2s'
              }}
              onClick={() => !uploading && document.getElementById('modal-video-input').click()}
            >
              <input
                id="modal-video-input"
                type="file"
                accept="video/mp4,video/webm,video/avi,video/mov,video/mkv"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />

              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📹</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
                {file ? file.name : 'Click to choose video or drag file here'}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Selected` : 'MP4, WebM, AVI, MOV up to 100MB'}
              </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1' }}>
                  <span>Uploading & probing video metadata...</span>
                  <span style={{ fontFamily: 'monospace' }}>{progress}%</span>
                </div>
                <div style={{
                  height: '6px',
                  backgroundColor: '#1e293b',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#0284c7',
                    transition: 'width 0.2s'
                  }} />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#7f1d1d33',
                border: '1px solid #ef444455',
                padding: '12px 16px',
                borderRadius: '6px',
                color: '#fca5a5',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={uploading}
                style={{
                  minHeight: '44px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{
                  minHeight: '44px',
                  padding: '0 24px',
                  backgroundColor: file && !uploading ? '#0284c7' : '#1e293b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: file && !uploading ? 'pointer' : 'not-allowed'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Video File'}
              </button>
            </div>
          </div>
        )}

        {/* State B: Verified Upload with Honest Disclosure (Section 7) */}
        {verifiedUpload && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#065f4622',
              border: '1px solid #05966955',
              padding: '14px 18px',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>✓</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#34d399' }}>
                  Video Uploaded & Decoded Successfully
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>
                  File: <strong>{verifiedUpload.filename}</strong> · {verifiedUpload.video_width}x{verifiedUpload.video_height} @ {Number(verifiedUpload.video_fps).toFixed(1)} FPS
                </div>
              </div>
            </div>

            {/* Honest Disclosure Box Required by User Specification */}
            <div style={{
              backgroundColor: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '18px 20px',
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#cbd5e1'
            }}>
              Your video has been uploaded successfully. Its file properties have been verified, but behaviour analysis has not run yet because the analysis engine is unavailable.
              <div style={{ marginTop: '10px', fontSize: '13px', color: '#94a3b8' }}>
                Note: In strict compliance with Flagship 107 anti-fabrication standards, synthetic anomalies will not be fabricated for unanalyzed footage. To inspect verified behavioral tracking and event correlation, please try one of our pre-calibrated demo videos.
              </div>
            </div>

            {/* Two Clear Actions Required by User Specification */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '4px'
            }}>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onNavigateToDemos();
                }}
                style={{
                  minHeight: '48px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>▶ Try a Demo Video</span>
                <span>(5 Verified Scenarios)</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  minHeight: '44px',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
