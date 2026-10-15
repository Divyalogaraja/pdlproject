import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { FieldDataView } from './components/FieldDataView';
import { AIEnvironmentalView } from './components/AIEnvironmentalView';
import { CarbonEstimationView } from './components/CarbonEstimationView';
import { MRVVerificationView } from './components/MRVVerificationView';
import { GeographicOverlapView } from './components/GeographicOverlapView';
import { BlockchainRegistryView } from './components/BlockchainRegistryView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { SettingsView } from './components/SettingsView';

import { Project, MRVSubmission, BlockchainTransaction, AuditEvent, UserRole } from './types';
import { 
  getProjects, 
  getSubmissions, 
  getBlockchainTransactions, 
  getAuditLogs, 
  getHealth, 
  resetDemoData 
} from './services/api';
import { getPendingObservations } from './services/offlineStorage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // Role & Network
  const [userRole, setUserRole] = useState<UserRole>('MRV Verifier');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // App Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<MRVSubmission[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [aiMode, setAiMode] = useState<{ isLive: boolean; provider: string }>({
    isLive: false,
    provider: 'DeltaC Heuristic Environmental Vision Engine (Demo Mode)'
  });
  
  const [selectedProjectIdForMRV, setSelectedProjectIdForMRV] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending queue count
  const refreshPendingCount = async () => {
    try {
      const pending = await getPendingObservations();
      setPendingSyncCount(pending.length);
    } catch (e) {
      console.warn('Could not read pending count:', e);
    }
  };

  // Fetch all live data from backend or local fallback
  const loadData = async () => {
    try {
      const [prjs, subs, txs, logs, health] = await Promise.allSettled([
        getProjects(),
        getSubmissions(),
        getBlockchainTransactions(),
        getAuditLogs(),
        getHealth()
      ]);

      if (prjs.status === 'fulfilled') setProjects(prjs.value);
      if (subs.status === 'fulfilled') setSubmissions(subs.value);
      if (txs.status === 'fulfilled') setTransactions(txs.value);
      if (logs.status === 'fulfilled') setAuditLogs(logs.value);
      if (health.status === 'fulfilled' && health.value?.environment) {
        setAiMode({
          isLive: health.value.environment.aiIsLive,
          provider: health.value.environment.aiProvider
        });
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
      await refreshPendingCount();
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      refreshPendingCount();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      await resetDemoData();
      await loadData();
    } catch (e) {
      alert('Reset failed: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Overview Dashboard';
      case 'projects': return 'Blue Carbon Projects';
      case 'field': return 'Field Data Collection';
      case 'ai': return 'AI Environmental Analysis';
      case 'carbon': return 'Carbon Estimation Module';
      case 'mrv': return 'MRV Verification Workflow';
      case 'geo': return 'Geographic Claim Detection';
      case 'blockchain': return 'Blockchain Registry';
      case 'reports': return 'Reports & Analytics';
      case 'settings': return 'Users & Settings';
      default: return 'Overview Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        userRole={userRole}
        pendingSyncCount={pendingSyncCount}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header
          currentTabTitle={getTabTitle(activeTab)}
          userRole={userRole}
          setUserRole={setUserRole}
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          onResetDemo={handleResetDemo}
          aiMode={aiMode}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" />
              <div className="text-sm font-semibold text-slate-300">Loading DeltaC Registry...</div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  projects={projects}
                  submissions={submissions}
                  onSelectProject={(p) => {
                    setSelectedProjectIdForMRV(p.id);
                    setActiveTab('projects');
                  }}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsView
                  projects={projects}
                  onRefreshProjects={loadData}
                  userRole={userRole}
                  onSelectProjectForMRV={(p) => {
                    setSelectedProjectIdForMRV(p.id);
                    setActiveTab('field');
                  }}
                />
              )}

              {activeTab === 'field' && (
                <FieldDataView
                  projects={projects}
                  isOnline={isOnline}
                  onSyncComplete={loadData}
                  selectedProjectId={selectedProjectIdForMRV}
                />
              )}

              {activeTab === 'ai' && (
                <AIEnvironmentalView projects={projects} />
              )}

              {activeTab === 'mrv' && (
                <MRVVerificationView
                  submissions={submissions}
                  onRefreshSubmissions={loadData}
                  userRole={userRole}
                  onNavigateToBlockchain={() => setActiveTab('blockchain')}
                />
              )}

              {activeTab === 'geo' && (
                <GeographicOverlapView projects={projects} />
              )}

              {activeTab === 'blockchain' && (
                <BlockchainRegistryView
                  submissions={submissions}
                  projects={projects}
                  onRefreshData={loadData}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsAnalyticsView
                  projects={projects}
                  submissions={submissions}
                  transactions={transactions}
                  auditLogs={auditLogs}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  userRole={userRole}
                  setUserRole={setUserRole}
                  auditLogs={auditLogs}
                  onResetDemo={handleResetDemo}
                  aiMode={aiMode}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
