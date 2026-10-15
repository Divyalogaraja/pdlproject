import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw, 
  Eye, 
  FileText, 
  Info, 
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';
import { Project, AIAnalysisResult } from '../types';
import { analyzeImage } from '../services/api';

interface AIEnvironmentalViewProps {
  projects: Project[];
}

export const AIEnvironmentalView: React.FC<AIEnvironmentalViewProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'PRJ-MANG-001');
  const [fieldCondition, setFieldCondition] = useState<string>('Good');
  const [fieldDamage, setFieldDamage] = useState<string>('None');
  const [fieldNotes, setFieldNotes] = useState<string>('Field officer reported dense canopy with active pneumatophore root systems.');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1000&q=80');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sample presets for quick demo testing
  const presets = [
    {
      title: 'Healthy Sundarbans Rhizophora Stand',
      url: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1000&q=80',
      condition: 'Good',
      damage: 'None',
      notes: 'Dense high-chlorophyll canopy along low-intertidal mudflat.'
    },
    {
      title: 'Kilifi Creek Shoreline Scouring & Saplings',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      condition: 'Moderate',
      damage: 'Erosion',
      notes: 'Peripheral tidal edge erosion visible with exposed young roots.'
    },
    {
      title: 'Urabá Delta Boundary Disturbance',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      condition: 'Poor',
      damage: 'Illegal Cutting',
      notes: 'Discontinuous tree line with cleared perimeter patches bordering shrimp pond canal.'
    }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setPreviewUrl(preset.url);
    setImageFile(null);
    setFieldCondition(preset.condition);
    setFieldDamage(preset.damage);
    setFieldNotes(preset.notes);
    setAnalysisResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('projectId', selectedProjectId);
      formData.append('condition', fieldCondition);
      formData.append('notes', `${fieldNotes} (Damage reported: ${fieldDamage})`);

      const res = await analyzeImage(formData);
      setAnalysisResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="text-teal-400" size={24} />
            <span>AI Environmental Vision Analysis Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated remote-sensing and computer vision diagnostics for coastal blue carbon restoration monitoring.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-navy-900 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2 self-start sm:self-auto">
          <Sparkles size={14} className="text-purple-400 animate-pulse" />
          <span>Multimodal Gemini 1.5 & Heuristic Vision</span>
        </div>
      </div>

      {/* Disclaimers Bar */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-navy-700/80 text-xs text-slate-400 flex items-start gap-3">
        <Info size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b className="text-slate-200">Scientific & MRV Integrity Notice:</b> Optical AI analysis identifies canopy color indices, visible disturbance patterns, and root segmentation. AI observation <b>does not establish subterranean carbon sequestration</b> or replace accredited human MRV verifiers.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Upload & Context Workspace */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-4">
          <div className="pb-2 border-b border-navy-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Upload size={16} className="text-teal-400" />
              <span>Input Image & Field Context</span>
            </h3>
            <span className="text-[10px] text-slate-400 bg-navy-950 px-2 py-0.5 rounded">
              Step 1 of 2
            </span>
          </div>

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Load Preset Benchmark Scenario:
            </label>
            <div className="space-y-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition border flex items-center justify-between ${
                    previewUrl === preset.url
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 font-semibold'
                      : 'bg-navy-950/60 border-navy-800 text-slate-300 hover:bg-navy-900'
                  }`}
                >
                  <span className="truncate">{preset.title}</span>
                  <span className="text-[10px] opacity-75 font-mono">{preset.condition}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Or Upload Custom Field / Drone Image:
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-navy-700 hover:border-teal-500 rounded-xl cursor-pointer bg-navy-950/60 transition">
              <ImageIcon size={22} className="text-teal-400 mb-1" />
              <span className="text-xs text-slate-300 font-medium">Browse Local Image</span>
              <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Preview Image Frame */}
          {previewUrl && (
            <div className="rounded-xl overflow-hidden border border-navy-700 bg-navy-950 relative h-48 w-full group">
              <img src={previewUrl} alt="Ecosystem preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent opacity-90 p-3 flex flex-col justify-end">
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {imageFile ? imageFile.name : 'Sample Drone Observation Frame'}
                </span>
                <span className="text-[10px] text-teal-400">Ready for automated segmentation</span>
              </div>
            </div>
          )}

          {/* Project & Submitted Observation Selection */}
          <div className="space-y-3 pt-2 border-t border-navy-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Associated Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-navy-900">
                    {p.id} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Field Rating</label>
                <select
                  value={fieldCondition}
                  onChange={(e) => setFieldCondition(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded text-xs text-slate-100"
                >
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Field Damage</label>
                <select
                  value={fieldDamage}
                  onChange={(e) => setFieldDamage(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded text-xs text-slate-100"
                >
                  <option value="None">None</option>
                  <option value="Erosion">Erosion</option>
                  <option value="Illegal Cutting">Illegal Cutting</option>
                  <option value="Pollution">Pollution</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Submitted Field Notes for AI Comparison
              </label>
              <textarea
                rows={2}
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100"
              />
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Processing Environmental Diagnostics...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Execute AI Vision Diagnostic</span>
              </>
            )}
          </button>
        </div>

        {/* Right 7 Cols: Structured AI Diagnostic Results */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles size={18} className="text-teal-400" />
                  <span>Structured Diagnostic Findings</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Automated computer vision output & comparison against submitted field telemetry
                </p>
              </div>

              {analysisResult && (
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                  analysisResult.recommendedVerificationAction === 'Approve'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  AI Recommendation: {analysisResult.recommendedVerificationAction}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/15 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {!analysisResult && !isAnalyzing && (
              <div className="py-20 text-center space-y-3">
                <BrainCircuit size={48} className="mx-auto text-navy-600" />
                <h4 className="text-sm font-semibold text-slate-300">No Active AI Analysis</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Execute AI Vision Diagnostic" to evaluate optical canopy reflectance, species classification, and field discrepancy detection.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="py-24 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-400 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Evaluating Coastal Optical Imagery</h4>
                  <p className="text-xs text-slate-400 mt-1">Segmenting pneumatophore root indices & estimating chlorophyll reflectance...</p>
                </div>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="mt-4 space-y-4">
                {/* Score & Confidence Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                    <span className="text-[11px] text-slate-400 block">Canopy Health Score</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className={`text-2xl font-bold font-display ${
                        analysisResult.canopyHealthScore > 80 ? 'text-emerald-400' : analysisResult.canopyHealthScore > 60 ? 'text-teal-300' : 'text-red-400'
                      }`}>
                        {analysisResult.canopyHealthScore}
                      </span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                    <span className="text-[11px] text-slate-400 block">AI Confidence Score</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-display text-teal-300">
                        {Math.round(analysisResult.confidenceScore * 100)}%
                      </span>
                      <span className="text-xs text-slate-500">Certainty</span>
                    </div>
                  </div>

                  <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block">Engine Model</span>
                    <div className="mt-1 text-xs font-semibold text-slate-200 truncate">
                      {analysisResult.modelUsed}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      {analysisResult.isSimulated ? 'Heuristic Simulator' : 'Live Google Gemini API'}
                    </span>
                  </div>
                </div>

                {/* Core Diagnostic Observations */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
                    <span className="font-semibold text-slate-200 block mb-1">Vegetation & Foliage Condition</span>
                    <p className="text-slate-300 leading-relaxed">{analysisResult.vegetationCondition}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
                    <span className="font-semibold text-slate-200 block mb-1">Visible Disturbance & Damage</span>
                    <p className="text-slate-300 leading-relaxed">{analysisResult.visibleDamageDetected}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
                    <span className="font-semibold text-slate-200 block mb-1">Ecosystem Dynamics & Structural Changes</span>
                    <p className="text-slate-300 leading-relaxed">{analysisResult.apparentEcosystemChanges}</p>
                  </div>

                  {/* Species & Soil Visuals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
                      <span className="font-semibold text-slate-200 block mb-1">Taxonomic Species Hints</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {analysisResult.speciesHints.map((sp, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 text-[11px] font-mono border border-teal-500/30">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
                      <span className="font-semibold text-slate-200 block mb-1">Soil / Substrate Assessment</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{analysisResult.soilWaterVisualAssessment}</p>
                    </div>
                  </div>

                  {/* Discrepancy & Inconsistency Warning Box */}
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold">
                      <AlertTriangle size={15} />
                      <span>Field vs. AI Discrepancy Evaluation</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {analysisResult.inconsistencyWithFieldReport || 'AI findings are congruent with submitted field observation.'}
                    </p>
                  </div>

                  {/* Image Limitations Note */}
                  <div className="text-[11px] text-slate-500 italic">
                    Optical limitations note: {analysisResult.imageQualityLimitations}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 text-[11px] text-slate-400">
            {analysisResult?.disclaimer || 'DeltaC MRV Engine: AI observations provide automated recommendations for human verifier consideration.'}
          </div>
        </div>
      </div>
    </div>
  );
};
