import React from 'react';
import { 
  Trees, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Leaf, 
  Globe2, 
  ArrowUpRight, 
  Info,
  CheckCircle,
  FileText,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { Project, MRVSubmission } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface DashboardViewProps {
  projects: Project[];
  submissions: MRVSubmission[];
  onSelectProject: (project: Project) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  submissions,
  onSelectProject,
  onNavigateTab
}) => {
  // Aggregate statistics
  const totalProjects = projects.length;
  const verifiedProjects = projects.filter(p => p.verificationStatus === 'Approved').length;
  const underReviewCount = projects.filter(p => p.verificationStatus === 'Under Review' || p.verificationStatus === 'Submitted').length;
  const flaggedCount = projects.filter(p => p.verificationStatus === 'Flagged').length;
  const totalCoverageHectares = projects.reduce((acc, p) => acc + p.areaHectares, 0);
  const totalCarbonTCO2e = projects.reduce((acc, p) => acc + (p.estimatedCarbonTCO2e || 0), 0);

  // Status breakdown for Recharts
  const statusData = [
    { name: 'Approved', value: verifiedProjects, color: '#10B981' },
    { name: 'Under Review / Submitted', value: underReviewCount, color: '#14B8A6' },
    { name: 'Flagged / Overlap', value: flaggedCount, color: '#EF4444' },
    { name: 'Draft', value: projects.filter(p => p.verificationStatus === 'Draft').length, color: '#64748B' }
  ].filter(d => d.value > 0);

  // Sequestration by Project Bar Data
  const carbonByProjectData = projects.slice(0, 5).map(p => ({
    name: p.id,
    carbon: p.estimatedCarbonTCO2e,
    area: p.areaHectares
  }));

  // Mock quarterly trend data
  const trendData = [
    { quarter: '2024 Q1', fieldSurveys: 12, aiAnalyses: 14, verifiedCredits: 3800 },
    { quarter: '2024 Q2', fieldSurveys: 19, aiAnalyses: 22, verifiedCredits: 6200 },
    { quarter: '2024 Q3', fieldSurveys: 27, aiAnalyses: 31, verifiedCredits: 8900 },
    { quarter: '2024 Q4', fieldSurveys: 34, aiAnalyses: 40, verifiedCredits: 11400 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-teal-500/30 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 mt-0.5 border border-teal-500/30">
            <Info size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">DeltaC Demonstration Environment Active</h2>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">
                PROTOTYPE DATA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              All baseline statistics, polygon boundaries, and carbon estimates are realistic sample data for product evaluation. AI observations assist MRV verifiers and do not constitute certified carbon credits.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
          <button 
            onClick={() => onNavigateTab('field')}
            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition shadow-md flex items-center gap-1.5"
          >
            <span>+ Collect Field Data</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Registered Projects */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Registered Projects</span>
            <Trees size={16} className="text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-slate-100">{totalProjects}</span>
            <span className="text-[11px] text-teal-400 font-medium">Active Baselines</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Global distribution</span>
            <span className="text-slate-500">Demo Data</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Verified Records */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Verified Records</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-emerald-400">{verifiedProjects}</span>
            <span className="text-[11px] text-emerald-400/80 font-medium">MRV Approved</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Anchored on-chain</span>
            <span className="text-slate-500">Demo Data</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Awaiting Verification */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Awaiting Review</span>
            <Clock size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-cyan-400">{underReviewCount}</span>
            <span className="text-[11px] text-cyan-400/80 font-medium">Queue</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Pending verifier signoff</span>
            <span className="text-slate-500">Demo Data</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Flagged Submissions */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Flagged Claims</span>
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-red-400">{flaggedCount}</span>
            <span className="text-[11px] text-red-400/80 font-medium">Overlap Alert</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Boundary intersection</span>
            <span className="text-slate-500">Demo Data</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 5: Mangrove Coverage */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Est. Mangrove Area</span>
            <Globe2 size={16} className="text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display text-slate-100">{totalCoverageHectares.toLocaleString()}</span>
            <span className="text-xs text-slate-400">ha</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Coastal wetland sum</span>
            <span className="text-slate-500">Demo Data</span>
          </div>
        </div>

        {/* Card 6: Estimated Carbon */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden border-teal-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Est. Carbon Sequestration</span>
            <Leaf size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display text-emerald-300">{totalCarbonTCO2e.toLocaleString()}</span>
            <span className="text-xs text-slate-400">tCO2e</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400/90 font-medium flex items-center justify-between">
            <span>Scientific Estimate Only</span>
            <span className="text-slate-500">Tier 2</span>
          </div>
        </div>
      </div>

      {/* Interactive Map & Geographic Section */}
      <div className="glass-panel p-5 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Globe2 size={18} className="text-teal-400" />
              <span>Global Blue Carbon Project Footprint & Boundary Polygons</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive map displaying registered mangrove conservation sites, real-time perimeter boundaries, and duplicate-claim flags.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('geo')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 hover:underline"
            >
              <span>Inspect Boundary Overlaps</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <InteractiveMap
          projects={projects}
          onSelectProject={onSelectProject}
          height="420px"
          showAllBoundaries={true}
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: MRV Verification Status Distribution */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-slate-100">MRV Verification Breakdown</h3>
              <span className="text-[10px] text-slate-400 bg-navy-800 px-2 py-0.5 rounded">Sample Status</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Proportion of projects through audit lifecycle</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0E1F36" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3A5F', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-navy-700/60 text-xs">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-300 truncate">{d.name}:</span>
                <b className="text-slate-100">{d.value}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Estimated Carbon Stock by Project */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-slate-100">Estimated Carbon Sequestration by Project</h3>
              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">tCO2e (Est.)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Derived from area, canopy density, and IPCC Tier 2 mangrove soil models</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonByProjectData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3A5F', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} tCO2e`, 'Est. Sequestration']}
                />
                <Bar dataKey="carbon" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-amber-400/90 pt-3 border-t border-navy-700/60 flex items-center justify-between">
            <span>⚠️ Estimates require field soil core verification before carbon credit tokenization.</span>
            <button 
              onClick={() => onNavigateTab('reports')}
              className="text-teal-400 hover:text-teal-300 font-medium underline"
            >
              Methodology Details
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Monitoring Activities */}
        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity size={16} className="text-teal-400" />
              <span>Recent MRV Field Submissions</span>
            </h3>
            <button
              onClick={() => onNavigateTab('mrv')}
              className="text-xs text-teal-400 hover:underline"
            >
              View All ({submissions.length})
            </button>
          </div>

          <div className="space-y-3">
            {submissions.slice(0, 4).map((sub) => {
              const statusColors: Record<string, string> = {
                Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                'Under Review': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
                Flagged: 'bg-red-500/15 text-red-300 border-red-500/30',
                Submitted: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              };

              return (
                <div 
                  key={sub.id} 
                  className="p-3 rounded-lg bg-navy-950/50 border border-navy-800 hover:border-navy-700 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-400">{sub.id}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-200">{sub.projectName}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {sub.fieldObservation?.environmentalNotes || 'Standard monitoring update.'}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>By: {sub.submittedBy}</span>
                      <span>{new Date(sub.submissionDate).toLocaleDateString()}</span>
                      {sub.blockchainRecord?.status === 'Confirmed' && (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                          <CheckCircle size={10} /> On-Chain
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border whitespace-nowrap ${statusColors[sub.status] || 'bg-slate-800 text-slate-400'}`}>
                    {sub.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Audit Log & System History */}
        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-teal-400" />
              <span>Project Audit Events & Registry Timeline</span>
            </h3>
            <span className="text-[10px] text-slate-400 bg-navy-800 px-2 py-0.5 rounded">
              Immutable Log
            </span>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-800">
            {projects.flatMap(p => (p.history || []).map(h => ({ ...h, projectName: p.name }))).slice(0, 4).map((audit) => (
              <div key={audit.id} className="relative pl-7 text-xs space-y-1">
                <span className="absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-navy-900" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{audit.action}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(audit.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{audit.details}</p>
                <div className="text-[10px] text-teal-400 font-mono">Actor: {audit.actor} ({audit.role})</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
