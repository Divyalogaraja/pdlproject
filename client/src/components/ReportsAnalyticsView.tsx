import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Leaf, 
  Layers, 
  Clock, 
  ExternalLink,
  Table,
  CheckCircle2
} from 'lucide-react';
import { Project, MRVSubmission, BlockchainTransaction, AuditEvent } from '../types';

interface ReportsAnalyticsViewProps {
  projects: Project[];
  submissions: MRVSubmission[];
  transactions: BlockchainTransaction[];
  auditLogs: AuditEvent[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  projects,
  submissions,
  transactions,
  auditLogs
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'summary' | 'mrv' | 'carbon' | 'blockchain' | 'audit'>('summary');

  // CSV Export utility
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(fieldName => {
          const val = row[fieldName];
          const escaped = ('' + (val ?? '')).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Print/Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-teal-400" size={24} />
            <span>Reports, Compliance Dossiers & Registry Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade reporting for verifiers, ESG investors, and carbon accounting standard bodies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer size={14} />
            <span>Print Official Report</span>
          </button>

          <button
            onClick={() => {
              if (activeReportTab === 'summary') {
                exportToCSV(projects.map(p => ({
                  ID: p.id,
                  Name: p.name,
                  Organization: p.organization,
                  Ecosystem: p.ecosystemType,
                  Location: p.location,
                  Area_Hectares: p.areaHectares,
                  Status: p.verificationStatus,
                  Est_Carbon_tCO2e: p.estimatedCarbonTCO2e,
                  Evidence_SHA256: p.evidenceHash
                })), 'DeltaC_Projects_Summary');
              } else if (activeReportTab === 'mrv') {
                exportToCSV(submissions.map(s => ({
                  Submission_ID: s.id,
                  Project_ID: s.projectId,
                  Officer: s.submittedBy,
                  Date: s.submissionDate,
                  Status: s.status,
                  Canopy_Health_Score: s.aiAnalysis?.canopyHealthScore || 'N/A',
                  Condition: s.fieldObservation?.mangroveCondition,
                  Evidence_Hash: s.evidenceHash
                })), 'DeltaC_MRV_Submissions');
              } else {
                exportToCSV(transactions, 'DeltaC_Blockchain_Ledger');
              }
            }}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition shadow-md flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Category Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-800 pb-2 no-print overflow-x-auto text-xs">
        {[
          { id: 'summary', label: 'Projects Executive Summary' },
          { id: 'mrv', label: 'MRV Verification Log' },
          { id: 'carbon', label: 'Carbon Accounting Pool Ledger' },
          { id: 'blockchain', label: 'On-Chain Smart Contract Ledger' },
          { id: 'audit', label: 'System Compliance Audit Log' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeReportTab === tab.id
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Official Printable Report Card */}
      <div className="glass-panel p-8 rounded-2xl space-y-6">
        {/* Printable Formal Header */}
        <div className="border-b-2 border-navy-700 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-slate-100 tracking-tight">DeltaC Blue Carbon MRV Registry</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono border border-teal-500/30">
                AUDIT COMPLIANT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              International Wetland Supplement Tier 2 Standards & Cryptographic SHA-256 Content-Addressed Verification Report
            </p>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div>Report Date: <b className="text-slate-200">{new Date().toLocaleDateString()}</b></div>
            <div>Generated by: <b className="text-teal-300">DeltaC Intelligence Platform</b></div>
            <div className="text-[10px] text-amber-400 mt-1 font-semibold">Demo Evaluation Prototype</div>
          </div>
        </div>

        {/* Tab 1: Projects Executive Summary */}
        {activeReportTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Registered Coastal Ecosystem Portfolio</h3>
              <span className="text-xs text-slate-400">Total: {projects.length} Sites</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/80 text-slate-400 font-semibold border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Project ID</th>
                    <th className="p-2.5">Project Name</th>
                    <th className="p-2.5">Ecosystem</th>
                    <th className="p-2.5">Area (ha)</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Est. Sequestration</th>
                    <th className="p-2.5">Metadata SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-navy-900/50">
                      <td className="p-2.5 font-mono font-bold text-teal-400">{p.id}</td>
                      <td className="p-2.5 font-medium text-slate-100">{p.name}</td>
                      <td className="p-2.5">{p.ecosystemType}</td>
                      <td className="p-2.5">{p.areaHectares.toLocaleString()}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.verificationStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                          p.verificationStatus === 'Flagged' ? 'bg-red-500/20 text-red-300' :
                          'bg-teal-500/20 text-teal-300'
                        }`}>
                          {p.verificationStatus}
                        </span>
                      </td>
                      <td className="p-2.5 text-emerald-400 font-mono">~{p.estimatedCarbonTCO2e.toLocaleString()} tCO2e</td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-400">{p.evidenceHash.substring(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: MRV Verification Log */}
        {activeReportTab === 'mrv' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">MRV Verification & Inspection Dossier</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/80 text-slate-400 font-semibold border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Submission ID</th>
                    <th className="p-2.5">Project</th>
                    <th className="p-2.5">Officer</th>
                    <th className="p-2.5">Field Rating</th>
                    <th className="p-2.5">AI Health Score</th>
                    <th className="p-2.5">Overlap Status</th>
                    <th className="p-2.5">Final Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {submissions.map(s => (
                    <tr key={s.id} className="hover:bg-navy-900/50">
                      <td className="p-2.5 font-mono font-bold text-teal-400">{s.id}</td>
                      <td className="p-2.5">{s.projectId}</td>
                      <td className="p-2.5">{s.submittedBy}</td>
                      <td className="p-2.5">{s.fieldObservation?.mangroveCondition}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{s.aiAnalysis?.canopyHealthScore || 'N/A'}/100</td>
                      <td className="p-2.5">
                        {s.overlapCheck?.hasOverlap ? (
                          <span className="text-red-400 font-semibold">{s.overlapCheck.overlapPercentage}% Overlap</span>
                        ) : (
                          <span className="text-emerald-400">Clear</span>
                        )}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-200">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Carbon Accounting Pool Ledger */}
        {activeReportTab === 'carbon' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Carbon Accounting Pool Quantifications</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/80 text-slate-400 font-semibold border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Project ID</th>
                    <th className="p-2.5">Area (ha)</th>
                    <th className="p-2.5">Methodology</th>
                    <th className="p-2.5">Est. Total tCO2e</th>
                    <th className="p-2.5">Annual Sequestration Rate</th>
                    <th className="p-2.5">Scientific Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-navy-900/50">
                      <td className="p-2.5 font-mono font-bold text-teal-400">{p.id}</td>
                      <td className="p-2.5">{p.areaHectares.toLocaleString()}</td>
                      <td className="p-2.5">IPCC 2013 Wetland Supplement</td>
                      <td className="p-2.5 font-bold text-emerald-400">{p.estimatedCarbonTCO2e.toLocaleString()} tCO2e</td>
                      <td className="p-2.5 text-slate-300">~22.8 tCO2e/ha/yr</td>
                      <td className="p-2.5 text-emerald-300">Defensible Baseline</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Blockchain Ledger */}
        {activeReportTab === 'blockchain' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Smart Contract On-Chain Attestation Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/80 text-slate-400 font-semibold border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Block #</th>
                    <th className="p-2.5">Submission ID</th>
                    <th className="p-2.5">Transaction Hash</th>
                    <th className="p-2.5">Evidence SHA-256</th>
                    <th className="p-2.5">Carbon (tCO2e)</th>
                    <th className="p-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-navy-900/50">
                      <td className="p-2.5 font-mono text-teal-400">#{t.blockNumber}</td>
                      <td className="p-2.5 font-medium">{t.submissionId}</td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-400">{t.txHash.substring(0, 20)}...</td>
                      <td className="p-2.5 font-mono text-[10px] text-teal-300">{t.evidenceHash.substring(0, 16)}...</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{t.carbonTCO2e.toLocaleString()}</td>
                      <td className="p-2.5 text-slate-400">{new Date(t.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: System Audit Logs */}
        {activeReportTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">System Activity & Compliance Audit Events</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/80 text-slate-400 font-semibold border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Actor</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Action Event</th>
                    <th className="p-2.5">Audit Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {auditLogs.slice(0, 15).map(log => (
                    <tr key={log.id} className="hover:bg-navy-900/50">
                      <td className="p-2.5 text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-2.5 font-medium text-slate-200">{log.actor}</td>
                      <td className="p-2.5 text-teal-400">{log.role}</td>
                      <td className="p-2.5 font-semibold text-slate-100">{log.action}</td>
                      <td className="p-2.5 text-slate-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures & Disclaimers Footer */}
        <div className="pt-8 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-400">
          <div>
            <span className="block font-semibold text-slate-300 mb-2">MRV Verifier Attestation:</span>
            <div className="border-b border-navy-700 h-10 flex items-end pb-1 text-teal-300 font-mono text-[11px]">
              Dr. Maya Sen, Lead Estuarine Ecology Verifier
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Signed with EVM Key 0x438B0126Da4C3761E79383610931Ac4F34A9F091</span>
          </div>

          <div>
            <span className="block font-semibold text-slate-300 mb-2">Registry Administrator:</span>
            <div className="border-b border-navy-700 h-10 flex items-end pb-1 text-teal-300 font-mono text-[11px]">
              DeltaC Decentralized Environmental Registry Admin
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Automated cryptographic SHA-256 validation applied</span>
          </div>
        </div>
      </div>
    </div>
  );
};
