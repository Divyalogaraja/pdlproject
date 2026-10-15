import React, { useState } from 'react';
import { 
  Users2, 
  Shield, 
  Key, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  RotateCcw, 
  Lock, 
  Terminal,
  FileText
} from 'lucide-react';
import { UserRole, AuditEvent } from '../types';

interface SettingsViewProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  auditLogs: AuditEvent[];
  onResetDemo: () => void;
  aiMode: { isLive: boolean; provider: string };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userRole,
  setUserRole,
  auditLogs,
  onResetDemo,
  aiMode
}) => {
  const [resetConfirm, setResetConfirm] = useState(false);

  const rolesList: { role: UserRole; desc: string; permissions: string[] }[] = [
    {
      role: 'Administrator',
      desc: 'Full administrative control over user access, system configuration, smart contract deployment, and baseline resets.',
      permissions: ['Manage Users', 'Register Projects', 'Approve/Reject MRV', 'Anchor on Blockchain', 'Reset Demo Datasets']
    },
    {
      role: 'Field Officer',
      desc: 'Mobile field operative responsible for coastal transect monitoring, GPS geolocation capture, and offline IndexedDB sync.',
      permissions: ['Collect Field Observations', 'Upload Evidence Photos', 'Manage Offline Sync Queue', 'Record Sensor Telemetry']
    },
    {
      role: 'MRV Verifier',
      desc: 'Accredited environmental auditor responsible for evaluating field telemetry, AI diagnostic findings, and certifying on-chain records.',
      permissions: ['Inspect Multi-Evidence Dossiers', 'Flag Discrepancies', 'Approve/Reject Submissions', 'Anchor Verified Records on Blockchain']
    },
    {
      role: 'Project Owner',
      desc: 'Conservation trust or coastal community representative registering new blue carbon restoration concessions.',
      permissions: ['Register New Projects', 'View Carbon Estimates', 'Track MRV Progress', 'Export Compliance Dossiers']
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Users2 className="text-teal-400" size={24} />
            <span>Role-Based Access Control & System Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role definitions, authentication boundaries, and environment connectivity settings.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2 self-start sm:self-auto">
          <Shield size={14} />
          <span>Demo Role Switcher Active</span>
        </div>
      </div>

      {/* Role Switcher & Permissions Matrix */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Shield size={16} className="text-teal-400" />
            <span>Active Demonstration Role Switcher</span>
          </h3>
          <span className="text-[10px] text-slate-400">Current Role: <b className="text-teal-300">{userRole}</b></span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          In this Product Development Lab prototype, you can dynamically switch roles to inspect how permission boundaries and gated actions appear across the platform. In production, roles are authenticated via OAuth / JWT and cryptographic Ethereum wallet signatures.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolesList.map((item) => {
            const isActive = userRole === item.role;
            return (
              <div
                key={item.role}
                onClick={() => setUserRole(item.role)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-teal-500/15 border-teal-500 shadow-md ring-1 ring-teal-500/50'
                    : 'bg-navy-950/70 border-navy-800 hover:border-navy-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-teal-400' : 'bg-slate-500'}`} />
                      {item.role}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-navy-950">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-850">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Permitted Actions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.permissions.map((perm, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-navy-900 text-slate-300 border border-navy-800">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Infrastructure & API Keys Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Integrations */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Key size={16} className="text-teal-400" />
            <span>Connected Services & Environment Integrations</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Google Gemini API</div>
                <div className="text-[11px] text-slate-400">{aiMode.provider}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                aiMode.isLive 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {aiMode.isLive ? 'Live API Key' : 'Demo Fallback'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Blockchain Smart Contract</div>
                <div className="text-[11px] text-slate-400">Solidity DeltaCRegistry (EVM Compatible)</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-purple-500/20 text-purple-300 border-purple-500/40">
                Connected
              </span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Browser Offline Storage</div>
                <div className="text-[11px] text-slate-400">HTML5 IndexedDB (DeltaCOfflineDB)</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Prototype Maintenance & Reset */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <RotateCcw size={16} className="text-teal-400" />
              <span>Prototype Data Reset</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restore the original realistic mangrove demonstration dataset (Sundarbans, Kilifi Creek, Pichavaram, Urabá). Clears user-submitted demo data and restores verified records.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Re-seed Baseline Demo Records</div>
              <div className="text-[10px] text-slate-500">Restores 5 sample projects and 3 MRV records</div>
            </div>

            <button
              onClick={() => {
                if (resetConfirm) {
                  onResetDemo();
                  setResetConfirm(false);
                } else {
                  setResetConfirm(true);
                  setTimeout(() => setResetConfirm(false), 4000);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                resetConfirm
                  ? 'bg-red-500/20 text-red-300 border-red-500'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-300 border-navy-700'
              }`}
            >
              {resetConfirm ? 'Confirm Reset?' : 'Reset Baseline'}
            </button>
          </div>
        </div>
      </div>

      {/* System Audit Log View */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Terminal size={16} className="text-teal-400" />
            <span>Full System Audit & Event History</span>
          </h3>
          <span className="text-[10px] text-slate-400 bg-navy-950 px-2.5 py-0.5 rounded font-mono">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-teal-400 font-bold">{log.action}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium">{log.actor} ({log.role})</span>
                </div>
                <div className="text-[11px] text-slate-400">{log.details}</div>
              </div>

              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap self-end sm:self-auto">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
