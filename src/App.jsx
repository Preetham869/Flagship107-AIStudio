/**
 * App Component - Flagship 107
 * Accessibility-First UX Redesign and Workflow Controller.
 * Unifies the 5 primary navigation destinations:
 * 1. Home
 * 2. Investigations
 * 3. Demo Videos
 * 4. Reports
 * 5. Settings
 */
import { useState, useEffect, useCallback } from 'react';
import './App.css';
import NavigationShell from './components/NavigationShell';
import HomeView from './components/views/HomeView';
import InvestigationView from './components/views/InvestigationView';
import DemoVideosView from './components/views/DemoVideosView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
import UploadModal from './components/views/UploadModal';
import { SelectionProvider } from './context/SelectionContext';
import { 
  getJobResults, 
  launchDemoScenario, 
  getInvestigations 
} from './services/api';

const App = () => {
  const [currentDestination, setCurrentDestination] = useState('home');
  const [activeJobId, setActiveJobId] = useState('demo-job-normal_flow-001');
  const [activeResults, setActiveResults] = useState(null);
  const [activeScenarioTitle, setActiveScenarioTitle] = useState('Normal Pedestrian Flow');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [launchingId, setLaunchingId] = useState(null);
  const [backendError, setBackendError] = useState(null);

  // Load default pre-calibrated baseline (Normal Flow) on startup so investigation is immediately ready
  useEffect(() => {
    let isMounted = true;
    const initializeBaseline = async () => {
      try {
        const response = await launchDemoScenario('normal_flow');
        if (isMounted && response?.result) {
          setActiveJobId(response.job_id);
          setActiveResults(response.result);
          setActiveScenarioTitle(response.scenario_name || 'Normal Pedestrian Flow');
        }
      } catch (err) {
        console.warn('Initial baseline load error:', err);
        // Fallback: try fetching by job id
        try {
          const res = await getJobResults('demo-job-normal_flow-001');
          if (isMounted) {
            setActiveJobId('demo-job-normal_flow-001');
            setActiveResults(res);
            setActiveScenarioTitle('Normal Pedestrian Flow');
          }
        } catch (e) {
          console.warn('Fallback failed:', e);
        }
      }
    };

    initializeBaseline();
    return () => { isMounted = false; };
  }, []);

  // Launch a demo scenario and navigate into investigation view
  const handleLaunchDemo = useCallback(async (scenarioId) => {
    setLaunchingId(scenarioId);
    try {
      const response = await launchDemoScenario(scenarioId);
      setActiveJobId(response.job_id);
      setActiveScenarioTitle(response.scenario_name || response.filename);
      if (response.result) {
        setActiveResults(response.result);
      } else {
        const res = await getJobResults(response.job_id);
        setActiveResults(res);
      }
      setCurrentDestination('investigations');
    } catch (err) {
      console.error('Failed to launch demo scenario:', err);
      setBackendError('Failed to launch demo scenario. Please retry.');
    } finally {
      setLaunchingId(null);
    }
  }, []);

  // Select an investigation from recent cases
  const handleSelectInvestigation = useCallback(async (jobId) => {
    try {
      const results = await getJobResults(jobId);
      setActiveJobId(jobId);
      setActiveResults(results);
      setActiveScenarioTitle(results?.scenario_info?.title || results?.video_path || jobId);
      setCurrentDestination('investigations');
    } catch (err) {
      console.error('Failed to select investigation:', err);
    }
  }, []);

  const handleNavigate = useCallback((destination) => {
    setCurrentDestination(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <SelectionProvider>
      <div className="app-container">
        {backendError && (
          <div style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '10px 16px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>⚠️ {backendError}</span>
            <button
              type="button"
              onClick={() => setBackendError(null)}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: 'none',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}

        <NavigationShell
          currentDestination={currentDestination}
          onNavigate={handleNavigate}
          activeJobId={activeJobId}
          activeScenarioTitle={activeScenarioTitle}
          onOpenUpload={() => setIsUploadOpen(true)}
        >
          {/* Destination 1: Home */}
          {currentDestination === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectInvestigation={handleSelectInvestigation}
              activeJobId={activeJobId}
            />
          )}

          {/* Destination 2: Investigations */}
          {currentDestination === 'investigations' && (
            <InvestigationView
              jobId={activeJobId}
              results={activeResults}
              onNavigate={handleNavigate}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {/* Destination 3: Demo Videos */}
          {currentDestination === 'demos' && (
            <DemoVideosView
              onLaunchDemo={handleLaunchDemo}
              launchingId={launchingId}
            />
          )}

          {/* Destination 4: Reports */}
          {currentDestination === 'reports' && (
            <ReportsView
              jobId={activeJobId}
              results={activeResults}
              onNavigate={handleNavigate}
            />
          )}

          {/* Destination 5: Settings */}
          {currentDestination === 'settings' && (
            <SettingsView
              onNavigate={handleNavigate}
            />
          )}
        </NavigationShell>

        {/* Global Accessible Upload Modal */}
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onNavigateToDemos={() => {
            setIsUploadOpen(false);
            handleNavigate('demos');
          }}
        />
      </div>
    </SelectionProvider>
  );
};

export default App;
