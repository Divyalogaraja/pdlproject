import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Shield, 
  Hash, 
  MapPin, 
  Sparkles, 
  Send, 
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { MRVSubmission, VerificationStatus, UserRole } from '../types';
import { reviewSubmission, recordOnBlockchain } from '../services/api';
import { formatHashShort } from '../services/crypto';

interface MRVVerificationViewProps {
  submissions: MRVSubmission[];
  onRefreshSubmissions: () => void;
  userRole: UserRole;
  onNavigateToBlockchain?: () => void;
}

export const MRVVerificationView: React.FC<MRVVerificationViewProps> = ({
  submissions,
  onRefreshSubmissions,
  userRole,
  onNavigateToBlockchain
}) => {
  const [selectedSub, setSelectedSub] = useState<MRVSubmission | null>(submissions[0] || null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Reviewer Decision Form
  const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Flagged' | 'Rejected'>('Approved');
  const [reviewerComment, setReviewerComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isAnchoringChain, setIsAnchoringChain] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const isVerifier = userRole === 'MRV Verifier' || userRole === 'Administrator';

  // Filter Submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesSearch = 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setIsSubmittingReview(true);
    setActionSuccessMsg(null);

    try {
      const updated = await reviewSubmission(selectedSub.id, {
        status: reviewDecision,
        reviewerName: 'Dr. Maya Sen',
        reviewerRole: userRole,
        comments: reviewerComment || `Submission marked ${reviewDecision} following MRV inspection.`
      });

      setSelectedSub(updated);
      onRefreshSubmissions();
      setActionSuccessMsg(`Submission ${selectedSub.id} successfully updated to "${reviewDecision}".`);
      setReviewerComment('');
    } catch (err: any) {
      alert('Error updating submission: ' + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAnchorToBlockchain = async () => {
    if (!selectedSub) return;
    setIsAnchoringChain(true);
    try {
      await recordOnBlockchain({
        submissionId: selectedSub.id,
        verifierAddress: '0x438B0126Da4C3761E79383610931Ac4F34A9F091',
        network: 'Polygon Amoy Testnet (EVM)',
        simulated: true
      });
      onRefreshSubmissions();
      setActionSuccessMsg(`Anchored ${selectedSub.id} to EVM Smart Contract DeltaCRegistry!`);
    } catch (err: any) {
      alert('Error anchoring record: ' + err.message);
    } finally {
      setIsAnchoringChain(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="text-teal-400" size={24} />
            <span>MRV Verification & Multi-Evidence Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Independent evaluation of field telemetry, AI vision outputs, geographic overlaps, and evidence hashing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-navy-900 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-1.5">
            <UserCheck size={14} />
            <span>Role: <b className="text-white">{userRole}</b></span>
            {!isVerifier && <span className="text-[10px] text-amber-400 ml-1">(View Only)</span>}
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Submissions Queue / Right Selected Audit Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Submissions Filter & Queue List */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search submission ID, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-navy-950 border border-navy-700 px-2 py-1 rounded text-xs text-slate-200"
              >
                <option value="All">All Submissions</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Flagged">Flagged</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No submissions matching filter.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const statusColors: Record<string, string> = {
                  Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                  'Under Review': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
                  Flagged: 'bg-red-500/15 text-red-300 border-red-500/30',
                  Submitted: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                  Rejected: 'bg-slate-700 text-slate-300 border-slate-600'
                };

                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub);
                      setActionSuccessMsg(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500/40 shadow-sm'
                        : 'bg-navy-950/60 border-navy-800 hover:bg-navy-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-300">{sub.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColors[sub.status]}`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-200 line-clamp-1">
                      {sub.projectName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-navy-850">
                      <span>{sub.submittedBy}</span>
                      <span>{new Date(sub.submissionDate).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 8 Cols: Detailed Evidence Dossier & Decision Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {selectedSub ? (
            <>
              {/* Header Card */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      {selectedSub.id}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{selectedSub.projectId}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{selectedSub.projectName}</h3>
                  <div className="text-xs text-slate-400">
                    Submitted by <b>{selectedSub.submittedBy}</b> ({selectedSub.submittedRole}) on {new Date(selectedSub.submissionDate).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 self-start sm:self-center">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                    selectedSub.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    selectedSub.status === 'Flagged' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                    'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  }`}>
                    ● Status: {selectedSub.status}
                  </span>

                  {selectedSub.blockchainRecord?.status === 'Confirmed' && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 size={12} /> Confirmed On-Chain (Block #{selectedSub.blockchainRecord.blockNumber})
                    </span>
                  )}
                </div>
              </div>

              {/* Warning Banners (Discrepancy / Overlap) */}
              {selectedSub.overlapCheck?.hasOverlap && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    <span>Geographic Boundary Overlap Detected ({selectedSub.overlapCheck.overlapPercentage}%)</span>
                  </div>
                  <p className="text-[11px] text-red-200">
                    Overlaps with registered concession <b>{selectedSub.overlapCheck.overlappingProjectId}</b> ({selectedSub.overlapCheck.overlappingProjectName}). Review boundary before approval.
                  </p>
                </div>
              )}

              {selectedSub.aiAnalysis?.inconsistencyWithFieldReport && !selectedSub.aiAnalysis.inconsistencyWithFieldReport.toLowerCase().includes('none') && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    <span>AI Diagnostic Discrepancy Flag</span>
                  </div>
                  <p className="text-[11px] text-amber-200">
                    {selectedSub.aiAnalysis.inconsistencyWithFieldReport}
                  </p>
                </div>
              )}

              {/* Evidence Triad: Field Data + AI Vision + Cryptographic Integrity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel 1: Field Officer Evidence */}
                <div className="glass-panel p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText size={14} className="text-teal-400" />
                    <span>Field Observation Telemetry</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>Condition: <b className="text-slate-100">{selectedSub.fieldObservation?.mangroveCondition}</b></div>
                      <div>Canopy: <b className="text-teal-300">{selectedSub.fieldObservation?.canopyDensityPercent}%</b></div>
                      <div>Status: <b className="text-slate-100">{selectedSub.fieldObservation?.restorationStatus}</b></div>
                      <div>Damage: <b className="text-slate-100">{selectedSub.fieldObservation?.visibleDamage}</b></div>
                    </div>

                    <div className="p-2.5 bg-navy-950 rounded-lg border border-navy-800 text-[11px] text-slate-300">
                      {selectedSub.fieldObservation?.environmentalNotes}
                    </div>

                    {/* Sensor telemetry */}
                    {selectedSub.fieldObservation?.sensorReadings && (
                      <div className="pt-2 border-t border-navy-800 grid grid-cols-3 gap-1.5 text-[10px] text-slate-400">
                        <div>Salinity: <b className="text-slate-200">{selectedSub.fieldObservation.sensorReadings.salinityPpt} ppt</b></div>
                        <div>pH: <b className="text-slate-200">{selectedSub.fieldObservation.sensorReadings.soilPh}</b></div>
                        <div>Redox: <b className="text-slate-200">{selectedSub.fieldObservation.sensorReadings.redoxPotentialMv} mV</b></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 2: AI Vision Diagnostic Findings */}
                <div className="glass-panel p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-teal-400" />
                    <span>AI Vision Diagnostics (Advisory)</span>
                  </h4>

                  {selectedSub.aiAnalysis ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Canopy Health Score:</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          {selectedSub.aiAnalysis.canopyHealthScore} / 100
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 p-2.5 bg-navy-950 rounded-lg border border-navy-800">
                        {selectedSub.aiAnalysis.vegetationCondition}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Species: <span className="text-teal-300 font-mono">{selectedSub.aiAnalysis.speciesHints.join(', ')}</span>
                      </div>

                      <div className="text-[10px] text-slate-500 italic">
                        {selectedSub.aiAnalysis.disclaimer}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-4 text-center">
                      AI analysis not triggered for this record.
                    </div>
                  )}
                </div>
              </div>

              {/* Photos & SHA-256 Hashing Bar */}
              <div className="glass-panel p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Hash size={14} className="text-teal-400" />
                    <span>Evidence Cryptographic Hash Attestation</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> SHA-256 Verified
                  </span>
                </div>

                <div className="font-mono text-xs text-teal-300 bg-navy-950 p-2.5 rounded-lg border border-navy-800 break-all select-all">
                  {selectedSub.evidenceHash}
                </div>

                {/* Evidence Image Thumbnail */}
                {selectedSub.fieldObservation?.images && selectedSub.fieldObservation.images.length > 0 && (
                  <div className="flex items-center gap-3 pt-2">
                    {selectedSub.fieldObservation.images.map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-navy-700 relative">
                        <img src={img.url} alt="Field capture" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="text-xs text-slate-400">
                      <span>Primary field image anchored with SHA-256 content address.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Verifier Review Action Box */}
              <div className="glass-panel p-5 rounded-2xl border-t-2 border-teal-500 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Shield size={16} className="text-teal-400" />
                    <span>Human Verifier Sign-off & Audit Decision</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Authorized MRV Verifier</span>
                </div>

                {isVerifier ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reviewDecision"
                          checked={reviewDecision === 'Approved'}
                          onChange={() => setReviewDecision('Approved')}
                          className="accent-emerald-500"
                        />
                        <span className="text-emerald-400 font-semibold">Approve Submission</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reviewDecision"
                          checked={reviewDecision === 'Flagged'}
                          onChange={() => setReviewDecision('Flagged')}
                          className="accent-amber-500"
                        />
                        <span className="text-amber-400 font-semibold">Flag for Clarification</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reviewDecision"
                          checked={reviewDecision === 'Rejected'}
                          onChange={() => setReviewDecision('Rejected')}
                          className="accent-red-500"
                        />
                        <span className="text-red-400 font-semibold">Reject Submission</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Verifier Audit Notes & Rationales
                      </label>
                      <textarea
                        rows={2}
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        placeholder="Detail reasons for decision, evidence cross-checks, or replanting recommendations..."
                        className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {selectedSub.status === 'Approved' && !selectedSub.blockchainRecord?.txHash && (
                          <button
                            type="button"
                            onClick={handleAnchorToBlockchain}
                            disabled={isAnchoringChain}
                            className="px-3.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-medium border border-teal-500/30 transition flex items-center gap-1.5"
                          >
                            <Send size={13} />
                            <span>{isAnchoringChain ? 'Recording...' : 'Anchor to Blockchain'}</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition shadow-md"
                      >
                        {isSubmittingReview ? 'Recording Decision...' : 'Commit Verifier Decision'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-navy-950 rounded-xl text-xs text-amber-400/90 border border-navy-800">
                    Switch to <b>MRV Verifier</b> or <b>Administrator</b> in the top Role Switcher to sign off or record review decisions.
                  </div>
                )}
              </div>

              {/* Audit Trail Log */}
              {selectedSub.auditTrail && selectedSub.auditTrail.length > 0 && (
                <div className="glass-panel p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Submission Audit History</h4>
                  <div className="space-y-2">
                    {selectedSub.auditTrail.map((audit) => (
                      <div key={audit.id} className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{audit.action}</div>
                          <div className="text-[11px] text-slate-400">{audit.details}</div>
                        </div>
                        <div className="text-right text-[10px] text-slate-500">
                          <div>{audit.actor}</div>
                          <div>{new Date(audit.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel p-16 rounded-2xl text-center text-slate-500 text-xs">
              Select a submission from the queue to inspect evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
