/**
 * Enhanced Video Player Component
 * Professional video analysis workstation with HUD telemetry, frame-stepping,
 * trajectory trail controls, and keyboard shortcuts.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import VideoOverlay from './VideoOverlay';
import { useSelection } from '../context/SelectionContext';

const VideoPlayer = ({ 
  videoUrl, 
  onTimeUpdate, 
  currentTime, 
  selectedItem, 
  selectedType, 
  videoMetadata, 
  allTracks 
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(videoMetadata?.video_duration || 10.01);
  const [localTime, setLocalTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { overlaySettings, toggleOverlaySetting } = useSelection();

  // Update local time when video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setLocalTime(time);
      onTimeUpdate?.(time);
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  // Seek to timestamp when currentTime prop changes
  useEffect(() => {
    if (currentTime !== undefined && currentTime !== null && videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const stepTime = (deltaSeconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    const newTime = Math.max(0, Math.min(duration, video.currentTime + deltaSeconds));
    video.currentTime = newTime;
    setLocalTime(newTime);
    onTimeUpdate?.(newTime);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    video.currentTime = percentage * duration;
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTimePrecise = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00.00';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  };

  const fps = videoMetadata?.video_fps || 24;
  const currentFrame = Math.floor(localTime * fps);
  const totalFrames = Math.floor(duration * fps);

  return (
    <div 
      ref={containerRef}
      style={{ 
        backgroundColor: '#0a0e17', 
        borderRadius: '10px', 
        overflow: 'hidden',
        border: '1px solid #1e293b',
        boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* HUD Telemetry Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        fontSize: '12px',
      }}>
        {/* Left: Stream Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: '#38bdf8', 
            fontWeight: '600',
            letterSpacing: '0.3px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
            CCTV CAM-01 • PRIMARY FEED
          </span>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
            {videoMetadata?.video_width || 1920}×{videoMetadata?.video_height || 1080} @ {fps.toFixed(1)} FPS
          </span>
        </div>

        {/* Right: HUD Overlay Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => toggleOverlaySetting('showBoxes')}
            style={{
              padding: '4px 10px',
              backgroundColor: overlaySettings.showBoxes ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
              border: `1px solid ${overlaySettings.showBoxes ? '#38bdf8' : '#334155'}`,
              color: overlaySettings.showBoxes ? '#38bdf8' : '#94a3b8',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
            }}
            title="Toggle YOLO Bounding Boxes"
          >
            ▢ Bounding Boxes
          </button>

          <button
            type="button"
            onClick={() => toggleOverlaySetting('showTrails')}
            style={{
              padding: '4px 10px',
              backgroundColor: overlaySettings.showTrails ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
              border: `1px solid ${overlaySettings.showTrails ? '#38bdf8' : '#334155'}`,
              color: overlaySettings.showTrails ? '#38bdf8' : '#94a3b8',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
            }}
            title="Toggle Trajectory Motion Trails"
          >
            〰 Trajectory Trails
          </button>

          <button
            type="button"
            onClick={() => toggleOverlaySetting('showTags')}
            style={{
              padding: '4px 10px',
              backgroundColor: overlaySettings.showTags ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
              border: `1px solid ${overlaySettings.showTags ? '#38bdf8' : '#334155'}`,
              color: overlaySettings.showTags ? '#38bdf8' : '#94a3b8',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
            }}
            title="Toggle Entity ID Badges"
          >
            🏷 Entity IDs
          </button>
        </div>
      </div>

      {/* Video Container with Overlays */}
      <div style={{ position: 'relative', backgroundColor: '#000', minHeight: '380px' }}>
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          style={{ 
            width: '100%', 
            display: 'block',
            minHeight: '380px',
            maxHeight: '560px',
            objectFit: 'contain',
            backgroundColor: '#020617',
          }}
        />
        
        {/* Dynamic Bounding Box & Trajectory Trail Overlay */}
        <VideoOverlay
          videoRef={videoRef}
          allTracks={allTracks}
          currentTime={localTime}
          videoMetadata={videoMetadata}
          selectedItem={selectedItem}
          selectedType={selectedType}
          allAnomalies={videoMetadata?.all_anomalies || []}
        />
        
        {/* Selected Item Floating HUD Badge */}
        {selectedItem && (
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid #38bdf8',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            maxWidth: '300px',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ color: '#38bdf8', fontWeight: '700' }}>TARGET LOCKED</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#e2e8f0', textTransform: 'uppercase' }}>{selectedType}</span>
            </div>
            {selectedItem.anomaly_type && (
              <div style={{ color: '#f87171' }}>⚠ {selectedItem.anomaly_type.replace(/_/g, ' ')}</div>
            )}
            {selectedItem.event_type && (
              <div style={{ color: '#fbbf24' }}>◆ {selectedItem.event_type.replace(/_/g, ' ')}</div>
            )}
            {selectedItem.track_id && (
              <div style={{ color: '#38bdf8' }}># Track ID: {selectedItem.track_id}</div>
            )}
            {selectedItem.scene_number !== undefined && (
              <div style={{ color: '#a855f7' }}>◈ Contextual Scene #{selectedItem.scene_number}</div>
            )}
          </div>
        )}

        {/* Live Frame Clock in Top Right */}
        <div style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '4px',
          padding: '4px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.5px',
          backdropFilter: 'blur(4px)',
          zIndex: 15,
        }}>
          FR: {currentFrame} / {totalFrames}
        </div>
      </div>
      
      {/* Bottom Transport Controls */}
      <div style={{ 
        padding: '12px 18px', 
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b'
      }}>
        {/* Scrub Progress Bar */}
        <div
          onClick={handleSeek}
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#1e293b',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}
          title="Click to seek timestamp"
        >
          <div style={{
            width: `${Math.min(100, (localTime / duration) * 100)}%`,
            height: '100%',
            backgroundColor: '#38bdf8',
            borderRadius: '4px',
            transition: 'width 0.08s ease-out',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)'
          }} />
        </div>

        {/* Transport Buttons & Telemetry Clock */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Play/Pause & Step Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={togglePlayPause}
              style={{
                padding: '7px 16px',
                backgroundColor: isPlaying ? '#0284c7' : '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s',
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            {/* Stepping buttons */}
            <button
              onClick={() => stepTime(-0.2)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
              }}
              title="Step Backward (-0.2s)"
            >
              ⏮ -0.2s
            </button>

            <button
              onClick={() => stepTime(0.2)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
              }}
              title="Step Forward (+0.2s)"
            >
              +0.2s ⏭
            </button>

            {/* Playback rate selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: playbackRate === rate ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                    border: `1px solid ${playbackRate === rate ? '#38bdf8' : '#334155'}`,
                    color: playbackRate === rate ? '#38bdf8' : '#94a3b8',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
          
          {/* Volume and Precise Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Volume */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {volume === 0 ? '🔇' : '🔊'}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '60px',
                  accentColor: '#38bdf8',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Precision Timestamp Display */}
            <div style={{ 
              fontSize: '13px', 
              color: '#38bdf8',
              fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
              fontWeight: '600',
              backgroundColor: '#020617',
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #1e293b',
              letterSpacing: '0.5px',
            }}>
              {formatTimePrecise(localTime)} <span style={{ color: '#475569' }}>/</span> {formatTimePrecise(duration)}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? '⤢ Exit' : '⤢ Full'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
