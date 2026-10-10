/**
 * Enhanced Video Overlay Component
 * Displays bounding boxes, track IDs, historical motion trajectory vectors,
 * and HUD indicators overlaid on video.
 * Supports interactive entity selection by clicking directly on bounding boxes.
 * Strict compliance with React Rules of Hooks (all hooks unconditional at top level).
 */
import { useMemo } from 'react';
import { useSelection } from '../context/SelectionContext';

// Color palette for distinctive track IDs
const TRACK_COLORS = [
  '#38bdf8', // Cyan
  '#a855f7', // Purple
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Teal
  '#f97316', // Orange
];

const getTrackColor = (trackId, isSelected, isAnomalous) => {
  if (isSelected) return '#38bdf8';
  if (isAnomalous) return '#ef4444';
  const idNum = parseInt(String(trackId), 10) || 0;
  return TRACK_COLORS[idNum % TRACK_COLORS.length];
};

const VideoOverlay = ({ 
  videoRef, 
  allTracks, 
  currentTime, 
  videoMetadata, 
  selectedItem, 
  selectedType, 
  allAnomalies = [] 
}) => {
  // Hook 1: Selection context
  const { selectTrack, overlaySettings } = useSelection();

  // Hook 2: Anomalous track IDs memo
  const anomalousTrackIds = useMemo(() => {
    const set = new Set();
    if (allAnomalies && Array.isArray(allAnomalies)) {
      allAnomalies.forEach((a) => {
        if (a.track_id !== undefined) set.add(a.track_id);
      });
    }
    return set;
  }, [allAnomalies]);

  // Hook 3: Selected track IDs memo
  const selectedTrackIds = useMemo(() => {
    const set = new Set();
    if (selectedType === 'anomaly' && selectedItem?.track_id !== undefined) {
      set.add(selectedItem.track_id);
    } else if (selectedType === 'event' && selectedItem?.track_ids) {
      selectedItem.track_ids.forEach((id) => set.add(id));
    } else if (selectedType === 'track' && (selectedItem?.track_id !== undefined || selectedItem?.id !== undefined)) {
      set.add(selectedItem.track_id !== undefined ? selectedItem.track_id : selectedItem.id);
    }
    return set;
  }, [selectedType, selectedItem]);

  // Derived synchronously per render: zero state latency and no extra re-render passes
  const fps = videoMetadata?.video_fps || 23.98;
  const currentFrameIndex = Math.max(
    0, 
    Math.min(
      Math.floor((currentTime || 0) * fps), 
      (allTracks?.length || 1) - 1
    )
  );

  // Compute geometry based on video element dimensions and aspect ratio
  const getGeometry = () => {
    const video = videoRef?.current;
    if (!video || !videoMetadata) {
      return { scale: 1, offsetX: 0, offsetY: 0, hasVideo: false };
    }

    const videoDisplayWidth = video.offsetWidth || 1;
    const videoDisplayHeight = video.offsetHeight || 1;
    const videoActualWidth = videoMetadata.video_width || 1920;
    const videoActualHeight = videoMetadata.video_height || 1080;

    const videoAspect = videoActualWidth / videoActualHeight;
    const displayAspect = videoDisplayWidth / videoDisplayHeight;

    let s, ox, oy;
    if (videoAspect > displayAspect) {
      s = videoDisplayWidth / videoActualWidth;
      ox = 0;
      oy = (videoDisplayHeight - (videoActualHeight * s)) / 2;
    } else {
      s = videoDisplayHeight / videoActualHeight;
      ox = (videoDisplayWidth - (videoActualWidth * s)) / 2;
      oy = 0;
    }

    return { scale: s, offsetX: ox, offsetY: oy, hasVideo: true };
  };

  const geometry = getGeometry();

  // Hook 4: Trajectory trails memo
  const trajectoryTrails = useMemo(() => {
    if (!overlaySettings?.showTrails || !allTracks || allTracks.length === 0 || !geometry.hasVideo) {
      return [];
    }

    const { scale, offsetX, offsetY } = geometry;
    const trailMap = new Map();
    const startFrame = Math.max(0, currentFrameIndex - 35);

    for (let f = startFrame; f <= currentFrameIndex; f++) {
      const frameTracks = allTracks[f] || [];
      frameTracks.forEach((t) => {
        if (!t?.bbox) return;
        const [x1, y1, x2, y2] = t.bbox;
        const cx = ((x1 + x2) / 2) * scale + offsetX;
        const cy = ((y1 + y2) / 2) * scale + offsetY;

        if (!trailMap.has(t.track_id)) {
          trailMap.set(t.track_id, {
            track_id: t.track_id,
            points: [],
            isAnomalous: anomalousTrackIds.has(t.track_id),
            isSelected: selectedTrackIds.has(t.track_id),
          });
        }
        trailMap.get(t.track_id).points.push(`${cx.toFixed(1)},${cy.toFixed(1)}`);
      });
    }

    return Array.from(trailMap.values()).filter((t) => t.points.length > 1);
  }, [allTracks, currentFrameIndex, geometry.scale, geometry.offsetX, geometry.offsetY, geometry.hasVideo, overlaySettings?.showTrails, anomalousTrackIds, selectedTrackIds]);

  // Safe early exit if prerequisites not met
  if (!allTracks || allTracks.length === 0 || !videoRef?.current || !videoMetadata) {
    return null;
  }

  const currentFrameTracks = allTracks[currentFrameIndex] || [];
  const { scale, offsetX, offsetY } = geometry;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* SVG Trajectory Trails */}
      {overlaySettings?.showTrails && trajectoryTrails.length > 0 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {trajectoryTrails.map((trail) => {
            const color = getTrackColor(trail.track_id, trail.isSelected, trail.isAnomalous);
            return (
              <g key={`trail-${trail.track_id}`}>
                <polyline
                  points={trail.points.join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth={trail.isSelected ? 3.5 : 2}
                  strokeDasharray={trail.isAnomalous ? '4,4' : 'none'}
                  strokeOpacity={trail.isSelected ? 0.95 : 0.65}
                />
                {trail.points.length > 0 && (() => {
                  const lastPoint = trail.points[trail.points.length - 1].split(',');
                  return (
                    <circle
                      cx={lastPoint[0]}
                      cy={lastPoint[1]}
                      r={trail.isSelected ? 5 : 3.5}
                      fill={color}
                      opacity={0.9}
                    />
                  );
                })()}
              </g>
            );
          })}
        </svg>
      )}

      {/* Bounding Boxes */}
      {overlaySettings?.showBoxes && currentFrameTracks.map((track, idx) => {
        if (!track?.bbox) return null;
        const [x1, y1, x2, y2] = track.bbox;
        const isSelected = selectedTrackIds.has(track.track_id);
        const isAnomalous = anomalousTrackIds.has(track.track_id);

        // Transform coordinates to overlay space
        const overlayX = x1 * scale + offsetX;
        const overlayY = y1 * scale + offsetY;
        const overlayWidth = (x2 - x1) * scale;
        const overlayHeight = (y2 - y1) * scale;

        const boxColor = getTrackColor(track.track_id, isSelected, isAnomalous);

        return (
          <div
            key={`${track.track_id}-${idx}`}
            onClick={(e) => {
              e.stopPropagation();
              selectTrack({
                id: track.track_id,
                track_id: track.track_id,
                class_name: track.class_name,
                confidence: track.confidence,
                bbox: track.bbox,
                first_seen: currentTime,
              });
            }}
            style={{
              position: 'absolute',
              left: `${overlayX}px`,
              top: `${overlayY}px`,
              width: `${overlayWidth}px`,
              height: `${overlayHeight}px`,
              border: `2px solid ${boxColor}`,
              borderRadius: '4px',
              opacity: isSelected ? 1 : 0.75,
              transition: 'opacity 0.15s, border-color 0.15s',
              boxShadow: isSelected ? `0 0 16px ${boxColor}` : (isAnomalous ? '0 0 8px rgba(239,68,68,0.5)' : 'none'),
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            title={`Track #${track.track_id} (${track.class_name}) - Click to inspect`}
          >
            {/* Track ID Label */}
            {overlaySettings?.showTags && (
              <div
                style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '0',
                  backgroundColor: isSelected ? '#0284c7' : (isAnomalous ? '#dc2626' : '#1e293b'),
                  color: '#fff',
                  border: `1px solid ${boxColor}`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  letterSpacing: '0.3px',
                }}
              >
                <span>#{track.track_id}</span>
                <span style={{ opacity: 0.85, fontSize: '10px', textTransform: 'uppercase' }}>{track.class_name}</span>
                {isAnomalous && (
                  <span style={{ color: '#fef08a', fontSize: '10px' }}>⚠️</span>
                )}
              </div>
            )}

            {/* Confidence & Speed Badge */}
            {overlaySettings?.showSpeed && track.confidence && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-22px',
                  left: '0',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                conf: {(track.confidence * 100).toFixed(0)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VideoOverlay;
