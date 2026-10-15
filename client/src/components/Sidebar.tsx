import React from 'react';
import {
  LayoutDashboard,
  Trees,
  Smartphone,
  BrainCircuit,
  FileCheck2,
  MapPinOff,
  Link2,
  BarChart3,
  Users2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CloudOff,
  Radio
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userRole: UserRole;
  pendingSyncCount: number;
  isOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  userRole,
  pendingSyncCount,
  isOnline
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'projects', label: 'Blue Carbon Projects', icon: Trees, badge: null },
    { 
      id: 'field', 
      label: 'Field Data Collection', 
      icon: Smartphone, 
      badge: pendingSyncCount > 0 ? `${pendingSyncCount} queued` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    },
    { id: 'ai', label: 'AI Environmental Analysis', icon: BrainCircuit, badge: 'Vision' },
    { id: 'mrv', label: 'MRV Verification', icon: FileCheck2, badge: null },
    { id: 'geo', label: 'Geographic Claim Detection', icon: MapPinOff, badge: null },
    { id: 'blockchain', label: 'Blockchain Registry', icon: Link2, badge: 'EVM' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Users & Settings', icon: Users2, badge: null },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-navy-900 border-r border-navy-700/80 transition-all duration-300 z-30 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-700/80 bg-navy-950/40">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-500/20">
                Δ
              </div>
              <div>
                <span className="font-display font-bold text-lg text-slate-100 tracking-tight">DeltaC</span>
                <span className="block text-[10px] text-teal-400 font-medium uppercase tracking-wider">Blue Carbon MRV</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              Δ
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-navy-800 transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate text-left flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      item.badgeColor || 'bg-navy-800 text-teal-400 border border-navy-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Status */}
      <div className="p-3 border-t border-navy-700/80 bg-navy-950/60">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <Radio size={12} className="text-emerald-400 animate-pulse" />
                    <span className="text-slate-300">Online Mode</span>
                  </>
                ) : (
                  <>
                    <CloudOff size={12} className="text-amber-400" />
                    <span className="text-amber-300">Offline Cache</span>
                  </>
                )}
              </span>
              <span className="text-[10px] bg-navy-800 text-slate-300 px-1.5 py-0.5 rounded">
                v1.0-PDL
              </span>
            </div>

            <div className="bg-navy-800/80 rounded-lg p-2 border border-navy-700/60 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs font-bold border border-teal-500/30">
                {userRole.charAt(0)}
              </div>
              <div className="overflow-hidden text-left">
                <div className="text-xs font-semibold text-slate-200 truncate">{userRole}</div>
                <div className="text-[10px] text-teal-400 truncate">Role-based Access</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500'}`}
              title={isOnline ? 'Online' : 'Offline'}
            />
            <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs font-bold border border-teal-500/30" title={userRole}>
              {userRole.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
