import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { RealtimeProvider } from './context/RealtimeContext';
import { AgentProvider } from './features/agent-workspace/context/AgentContext';
import { AgentOverview } from './features/agent-workspace/components/AgentOverview';
import { AgentleaderboardRealtime } from './features/agent-workspace/components/AgentleaderboardRealtime';
import { AuthProvider } from './context/AuthContext';

const StandaloneLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Super Simple Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-2">
        <h1 className="text-xl font-bold text-slate-900 mb-6">HQ Standalone</h1>
        <a href="#/" className="px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold">
          Overview
        </a>
        <a href="#/leaderboard" className="px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold">
          Live Leaderboard
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        <Routes>
          <Route path="/" element={<AgentOverview />} />
          <Route path="/leaderboard" element={<AgentleaderboardRealtime />} />
        </Routes>
      </div>
    </div>
  );
};

export const StandaloneApp: React.FC = () => {
  return (
    <AuthProvider>
      <AgentProvider>
        <RealtimeProvider>
          <HashRouter>
            <StandaloneLayout />
          </HashRouter>
        </RealtimeProvider>
      </AgentProvider>
    </AuthProvider>
  );
};

export default StandaloneApp;
