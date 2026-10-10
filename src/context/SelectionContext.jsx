/**
 * Selection Context & Global Investigation State
 * Synchronizes selection across video player, timeline, tabs, evidence inspector,
 * search filters, theme preferences, and overlay controls.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const SelectionContext = createContext(null);

export const SelectionProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'anomaly' | 'event' | 'track' | 'scene' | 'relationship'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState('video'); // 'command' | 'video' | 'entities' | 'events' | 'behaviour' | 'assistant' | 'evidence' | 'reports' | 'settings' | 'compare'
  
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('flagship_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('flagship_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Video Overlay visualization toggles
  const [overlaySettings, setOverlaySettings] = useState({
    showBoxes: true,
    showTrails: true,
    showTags: true,
    showSpeed: true,
    showGrid: false,
  });

  const toggleOverlaySetting = (key) => {
    setOverlaySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAnomaly = (anomaly) => {
    setSelectedItem(anomaly);
    setSelectedType('anomaly');
  };

  const selectEvent = (event) => {
    setSelectedItem(event);
    setSelectedType('event');
  };

  const selectTrack = (track) => {
    setSelectedItem(track);
    setSelectedType('track');
  };

  const selectScene = (scene) => {
    setSelectedItem(scene);
    setSelectedType('scene');
  };

  const selectRelationship = (relationship) => {
    setSelectedItem(relationship);
    setSelectedType('relationship');
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setSelectedType(null);
  };

  const value = {
    selectedItem,
    selectedType,
    selectAnomaly,
    selectEvent,
    selectTrack,
    selectScene,
    selectRelationship,
    clearSelection,
    searchQuery,
    setSearchQuery,
    activeWorkspace,
    setActiveWorkspace,
    theme,
    setTheme,
    overlaySettings,
    setOverlaySettings,
    toggleOverlaySetting,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export default SelectionContext;
