import React, { useState } from 'react';
import { 
  Shield, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTabTitle: string;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  onResetDemo: () => void;
  aiMode: { isLive: boolean; provider: string };
}

export const Header: React.FC<HeaderProps> = ({
  currentTabTitle,
  userRole,
  setUserRole,
  isOnline,
  setIsOnline,
  onResetDemo,
  aiMode
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const roles: UserRole[] = ['Administrator', 'Field Officer', 'MRV Verifier', 'Project Owner'];

  return (
    <header className="sticky top-0 z-20 bg-navy-950/85 backdrop-blur-md border-b border-navy-700/80 px-6 py-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Page Title & Breadcrumbs */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">DeltaC Enterprise</span>
            <span className="text-slate-600">/</span>
            <h1 className="text-xl font-display font-bold text-slate-100">{currentTabTitle}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Blue Carbon MRV Engine & Smart Contract Registry</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
              Prototype Demo Mode
            </span>
          </div>
        </div>

        {/* Right: Controls & Role Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Mode Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-300"
            title={aiMode.provider}
          >
            <Sparkles size={14} className={aiMode.isLive ? "text-purple-400 animate-spin" : "text-teal-400"} />
            <span className="hidden sm:inline text-slate-400">AI:</span>
            <span className="font-medium text-slate-200">
              {aiMode.isLive ? 'Gemini Live' : 'Demo Vision'}
            </span>
          </div>

          {/* Network Simulator Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
            }`}
            title="Toggle simulated connectivity to test offline IndexedDB queue and sync behavior"
          >
            {isOnline ? (
              <>
                <Wifi size={14} className="text-emerald-400" />
                <span>Simulate Offline</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-amber-400 animate-pulse" />
                <span>Restore Online</span>
              </>
            )}
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700/80 border border-navy-600 text-xs text-slate-200 font-medium transition shadow-sm"
            >
              <Shield size={14} className="text-teal-400" />
              <span>Role: <b className="text-white">{userRole}</b></span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-1.5 w-60 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 border-b border-navy-800 text-[11px] text-amber-400 font-semibold">
                  Demo Role Switcher (For Testing)
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRole(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-navy-800 transition ${
                      userRole === r ? 'text-teal-300 font-semibold bg-teal-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span>{r}</span>
                    {userRole === r && <CheckCircle2 size={14} className="text-teal-400" />}
                  </button>
                ))}
                <div className="px-3 pt-2 text-[10px] text-slate-400 border-t border-navy-800/80">
                  Switch roles to inspect role-gated buttons, review workflows, and permissions.
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (showResetConfirm) {
                onResetDemo();
                setShowResetConfirm(false);
              } else {
                setShowResetConfirm(true);
                setTimeout(() => setShowResetConfirm(false), 4000);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              showResetConfirm 
                ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse' 
                : 'bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-slate-200 border-navy-700'
            }`}
            title="Reset store to baseline sample projects and submissions"
          >
            <RotateCcw size={13} className={showResetConfirm ? "text-red-400" : "text-slate-400"} />
            <span>{showResetConfirm ? 'Confirm Reset?' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
