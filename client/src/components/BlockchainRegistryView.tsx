import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  ShieldCheck, 
  ExternalLink, 
  Hash, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Upload, 
  FileCheck, 
  Lock, 
  Copy, 
  Check, 
  Clock,
  Radio,
  FileCode
} from 'lucide-react';
import { BlockchainTransaction, MRVSubmission, Project } from '../types';
import { getBlockchainTransactions, recordOnBlockchain, verifyEvidenceHash } from '../services/api';
import { computeSHA256 } from '../services/crypto';
import { DEFAULT_CONTRACT_ADDRESS } from '../blockchain/contractABI';

interface BlockchainRegistryViewProps {
  submissions: MRVSubmission[];
  projects: Project[];
  onRefreshData: () => void;
}

export const BlockchainRegistryView: React.FC<BlockchainRegistryViewProps> = ({
  submissions,
  projects,
  onRefreshData
}) => {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [networkMode, setNetworkMode] = useState<'simulated' | 'amoy' | 'localhost'>('simulated');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  // Search & Lookup State
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  // Record Form Modal State
  const [selectedSubId, setSelectedSubId] = useState<string>(
    submissions.find(s => s.status === 'Approved' && !s.blockchainRecord?.txHash)?.id || ''
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSuccess, setRecordSuccess] = useState<string | null>(null);

  // Evidence Verification Tool State
  const [testFile, setTestFile] = useState<File | null>(null);
  const [refHashInput, setRefHashInput] = useState<string>('4a1b89ef32a4e98f0291a27b87c0e812d4567bca9812ef901283fae019284756');
  const [isVerifyingFile, setIsVerifyingFile] = useState<boolean>(false);
  const [verificationOutput, setVerificationOutput] = useState<any | null>(null);

  const loadTransactions = async () => {
    try {
      const txs = await getBlockchainTransactions();
      setTransactions(txs);
    } catch (e) {
      console.warn('Error loading transactions:', e);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2500);
  };

  const handleRecordSubmission = async () => {
    if (!selectedSubId) {
      alert('Please select an Approved MRV submission to record.');
      return;
    }
    setIsRecording(true);
    setRecordSuccess(null);
    try {
      const networkLabel = 
        networkMode === 'amoy' ? 'Polygon Amoy Testnet (EVM)' :
        networkMode === 'localhost' ? 'Local Hardhat Node (EVM)' :
        'DeltaC Interactive Smart Node (Demo Mode)';

      const res = await recordOnBlockchain({
        submissionId: selectedSubId,
        verifierAddress: '0x438B0126Da4C3761E79383610931Ac4F34A9F091',
        network: networkLabel,
        simulated: networkMode === 'simulated'
      });

      setRecordSuccess(`Successfully anchored ${selectedSubId} on ${networkLabel}! Block #${res.data.blockNumber}`);
      await loadTransactions();
      onRefreshData();
    } catch (err: any) {
      alert('Failed to record on blockchain: ' + err.message);
    } finally {
      setIsRecording(false);
    }
  };

  const handleVerifyEvidence = async () => {
    setIsVerifyingFile(true);
    setVerificationOutput(null);
    try {
      let hash = refHashInput;
      if (testFile) {
        hash = await computeSHA256(testFile);
      }

      const formData = new FormData();
      if (testFile) {
        formData.append('file', testFile);
      }
      formData.append('testHash', hash);
      formData.append('referenceHash', refHashInput);

      const res = await verifyEvidenceHash(formData);
      setVerificationOutput(res);
    } catch (err: any) {
      alert('Verification error: ' + err.message);
    } finally {
      setIsVerifyingFile(false);
    }
  };

  const approvedUnrecordedSubmissions = submissions.filter(
    s => s.status === 'Approved' && !s.blockchainRecord?.txHash
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="text-teal-400" size={24} />
            <span>Tamper-Evident Blockchain Registry (EVM Smart Contract)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable audit trail of verified MRV records, cryptographic SHA-256 evidence hashes, and on-chain attestations.
          </p>
        </div>

        {/* Network Mode Switcher */}
        <div className="flex items-center gap-2 bg-navy-900 border border-navy-700 p-1 rounded-xl text-xs">
          <button
            onClick={() => setNetworkMode('simulated')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              networkMode === 'simulated' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Simulator
          </button>
          <button
            onClick={() => setNetworkMode('amoy')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              networkMode === 'amoy' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Polygon Amoy
          </button>
          <button
            onClick={() => setNetworkMode('localhost')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              networkMode === 'localhost' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hardhat Local
          </button>
        </div>
      </div>

      {/* Disclaimers & Contract Info Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl space-y-1 md:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <FileCode size={16} className="text-teal-400" />
            <span>Deployed Smart Contract: <span className="font-mono text-teal-300">DeltaCRegistry.sol</span></span>
          </div>
          <div className="font-mono text-xs text-slate-400 break-all select-all flex items-center justify-between">
            <span>{DEFAULT_CONTRACT_ADDRESS}</span>
            <button onClick={() => handleCopy(DEFAULT_CONTRACT_ADDRESS)} className="text-teal-400 hover:text-teal-300 p-1">
              {copiedTx === DEFAULT_CONTRACT_ADDRESS ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Stores minimal essential metadata, verifier identity, and SHA-256 evidence digests on-chain. Bulky imagery is retained off-chain.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1 bg-amber-500/5 border-amber-500/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <AlertTriangle size={15} />
            <span>Credit Issuance Disclaimer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Attestations on this contract record verification integrity. <b>They do not constitute officially recognized financial carbon credits</b> unless certified by accredited standards bodies (e.g. Verra, Gold Standard).
          </p>
        </div>
      </div>

      {recordSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{recordSuccess}</span>
        </div>
      )}

      {/* Main Grid: On-Chain Records + Evidence Hashing Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Confirmed Blockchain Transactions Explorer */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
          <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Cpu size={18} className="text-teal-400" />
              <span>Confirmed On-Chain Ledger ({transactions.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-medium">
              EVM Compatible
            </span>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2.5 hover:border-navy-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-400">Block #{tx.blockNumber}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-300 font-semibold">{tx.submissionId}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    tx.status === 'Confirmed' 
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                      : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  }`}>
                    ● {tx.status}
                  </span>
                </div>

                {/* Tx Hash */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-navy-900 p-2 rounded-lg border border-navy-850">
                  <span className="truncate pr-2">{tx.txHash}</span>
                  <button 
                    onClick={() => handleCopy(tx.txHash)}
                    className="text-teal-400 hover:text-teal-300 p-1 flex-shrink-0"
                    title="Copy transaction hash"
                  >
                    {copiedTx === tx.txHash ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>Project: <b className="text-slate-200">{tx.projectId}</b></div>
                  <div>Carbon: <b className="text-emerald-400">{tx.carbonTCO2e.toLocaleString()} tCO2e</b></div>
                  <div>Gas: <b className="text-slate-200">{tx.gasUsed.toLocaleString()}</b></div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-navy-850">
                  <span>Verifier: {tx.verifierAddress.substring(0, 10)}...</span>
                  <span>{new Date(tx.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Anchor Approved Submission Card */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-teal-500/30 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Lock size={14} className="text-teal-400" />
              <span>Anchor Pending Verified MRV Record On-Chain</span>
            </h4>

            {approvedUnrecordedSubmissions.length > 0 ? (
              <div className="space-y-3">
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-xs text-slate-100"
                >
                  {approvedUnrecordedSubmissions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.projectName} ({s.carbonEstimateTCO2e} tCO2e)
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRecordSubmission}
                  disabled={isRecording}
                  className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <Link2 size={14} />
                  <span>{isRecording ? 'Mining Transaction...' : 'Commit to Smart Contract'}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                All approved submissions are currently anchored to the blockchain registry!
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Evidence Hashing & Tamper-Detection Tool */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-400" />
                <span>Evidence Integrity Verification Tool</span>
              </h3>
              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-mono">
                SHA-256
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Upload any field photo or evidence bundle to verify its bitstream against the registered SHA-256 hash. If even a single byte or pixel was modified, the hash mismatch is flagged immediately.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Upload Evidence File to Re-Check
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTestFile(e.target.files[0]);
                      setVerificationOutput(null);
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-navy-950 border border-navy-700 rounded text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-teal-500/20 file:text-teal-300 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reference SHA-256 Hash to Compare Against
                </label>
                <input
                  type="text"
                  value={refHashInput}
                  onChange={(e) => setRefHashInput(e.target.value)}
                  placeholder="Paste expected SHA-256 hash..."
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-400"
                />
              </div>

              <button
                onClick={handleVerifyEvidence}
                disabled={isVerifyingFile}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck size={15} />
                <span>{isVerifyingFile ? 'Hashing Bitstream...' : 'Verify Cryptographic Integrity'}</span>
              </button>
            </div>

            {/* Verification Result Output */}
            {verificationOutput && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-150 ${
                verificationOutput.isMatch
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-500/15 border-red-500/40 text-red-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {verificationOutput.isMatch ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>CRYPTOGRAPHIC MATCH CONFIRMED</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={18} className="text-red-400" />
                      <span>EVIDENCE HASH MISMATCH (TAMPER ALERT)</span>
                    </>
                  )}
                </div>

                <p className="text-xs opacity-90 leading-relaxed">
                  {verificationOutput.explanation}
                </p>

                <div className="font-mono text-[10px] bg-navy-950 p-2 rounded border border-navy-800 break-all space-y-1">
                  <div><b>Computed:</b> {verificationOutput.calculatedHash}</div>
                  <div><b>Expected:</b> {verificationOutput.referenceHash}</div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-navy-800 text-[11px] text-slate-400 italic">
            <b>Cryptographic Boundary Caveat:</b> SHA-256 proves the file has not been altered since upload. It does not certify that the physical mangrove field measurement was scientifically truthful.
          </div>
        </div>
      </div>
    </div>
  );
};
