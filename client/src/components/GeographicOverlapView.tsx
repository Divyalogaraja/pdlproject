import React, { useState } from 'react';
import { 
  MapPinOff, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Search, 
  Info,
  Maximize2,
  Compass
} from 'lucide-react';
import { Project } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { checkProjectOverlap } from '../services/api';

interface GeographicOverlapViewProps {
  projects: Project[];
}

export const GeographicOverlapView: React.FC<GeographicOverlapViewProps> = ({ projects }) => {
  const [selectedProjectA, setSelectedProjectA] = useState<string>(projects[3]?.id || projects[0]?.id || '');
  const [selectedProjectB, setSelectedProjectB] = useState<string>(projects[0]?.id || '');
  
  // Custom Comparison Centroid
  const [customLat, setCustomLat] = useState<string>('8.1200');
  const [customLng, setCustomLng] = useState<string>('-76.8200');
  const [customArea, setCustomArea] = useState<string>('4200');
  
  const [overlapResult, setOverlapResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [resolvedNotice, setResolvedNotice] = useState<string | null>(null);

  const projA = projects.find(p => p.id === selectedProjectA);

  const handleRunGeographicCheck = async () => {
    setIsEvaluating(true);
    setResolvedNotice(null);
    try {
      const lat = parseFloat(customLat);
      const lng = parseFloat(customLng);
      const area = parseFloat(customArea);

      const delta = 0.04;
      const boundary = {
        type: 'Polygon',
        coordinates: [
          [lat - delta, lng - delta],
          [lat + delta, lng - delta],
          [lat + delta, lng + delta],
          [lat - delta, lng + delta],
          [lat - delta, lng - delta]
        ]
      };

      const res = await checkProjectOverlap({
        id: 'TEST-PROSPECTIVE-CONCESSION',
        name: 'Prospective Coastal Concession Area',
        centroid: [lat, lng],
        boundary,
        areaHectares: area
      });

      setOverlapResult(res);
    } catch (err: any) {
      alert('Error evaluating overlap: ' + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <MapPinOff className="text-red-400" size={24} />
            <span>Geographic Duplicate-Claim & Boundary Collision Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial polygon intersection algorithms preventing double-counting and overlapping blue carbon claims.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-navy-900 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2 self-start sm:self-auto">
          <Compass size={14} className="text-teal-400" />
          <span>Haversine & Bounding Box Intersections</span>
        </div>
      </div>

      {/* Critical Principle Notice */}
      <div className="p-4 rounded-xl bg-navy-900/90 border border-teal-500/30 text-xs text-slate-300 flex items-start gap-3">
        <Info size={18} className="text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b className="text-slate-100">Why Geographic Detection is Required:</b> A unique blockchain token or smart contract ID <b>does not prevent overlapping physical geographic claims</b>. Two different parties could register different project IDs for the same mangrove forest. DeltaC executes rigorous coordinate and polygon intersection comparisons prior to crediting.
        </div>
      </div>

      {/* Interactive Map */}
      <div className="glass-panel p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-teal-400" />
            <span>Global Concession Boundaries & Flagged Intersections</span>
          </h3>
          <span className="text-[11px] text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20 font-medium">
            Red Dashed = Overlap Flag
          </span>
        </div>

        <InteractiveMap
          projects={projects}
          selectedProjectId={selectedProjectA}
          height="400px"
          showAllBoundaries={true}
          highlightOverlap={true}
        />
      </div>

      {/* Comparison Engine Controls & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Prospective Area or Pair Selector */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-4">
          <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Search size={16} className="text-teal-400" />
              <span>Simulate Prospective Boundary</span>
            </h3>
            <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-mono">
              GeoJSON Query
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Test a new prospective project concession against all registered project footprints to detect boundary overlaps before filing.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Concession Name
              </label>
              <input
                type="text"
                disabled
                value="Gulf of Urabá Prospective Concession (Test Corridor)"
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Centroid Lat</label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Centroid Lng</label>
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Concession Area (Hectares)
              </label>
              <input
                type="number"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100"
              />
            </div>

            <button
              onClick={handleRunGeographicCheck}
              disabled={isEvaluating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 mt-2"
            >
              <Search size={15} />
              <span>{isEvaluating ? 'Executing Spatial Intersection...' : 'Check Geographic Overlaps'}</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Overlap Diagnostics & Resolution */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-400" />
                <span>Geospatial Overlap Report</span>
              </h3>
              {overlapResult && (
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                  overlapResult.hasOverlap
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {overlapResult.hasOverlap ? 'Overlap Detected' : 'Perimeter Clear'}
                </span>
              )}
            </div>

            {resolvedNotice && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{resolvedNotice}</span>
              </div>
            )}

            {!overlapResult ? (
              <div className="py-16 text-center space-y-2">
                <MapPinOff size={40} className="mx-auto text-navy-600" />
                <h4 className="text-xs font-semibold text-slate-300">Run Spatial Comparison</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Check Geographic Overlaps" to compute polygon bounding box overlaps and centroid separation distances.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  overlapResult.hasOverlap
                    ? 'bg-red-500/10 border-red-500/30 text-red-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}>
                  <b className="block mb-1 font-semibold">{overlapResult.hasOverlap ? 'Collision Alert:' : 'Clearance Report:'}</b>
                  {overlapResult.summary}
                </div>

                {overlapResult.overlappingProjects && overlapResult.overlappingProjects.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-200">Intersecting Registered Concessions:</h4>
                    {overlapResult.overlappingProjects.map((p: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-teal-300">{p.projectId}</span>
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
                            {p.overlapPercentage}% Area Overlap ({p.overlapHectares} ha)
                          </span>
                        </div>
                        <div className="text-slate-300 font-medium">{p.projectName}</div>
                        <p className="text-slate-400 text-[11px]">{p.notes}</p>

                        <div className="pt-2 border-t border-navy-850 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Centroid Distance: {p.centroidDistanceKm} km</span>
                          <button
                            onClick={() => {
                              setResolvedNotice(`Overlap with ${p.projectId} reviewed and marked as Resolved (Legitimate buffer multi-zone concession).`);
                            }}
                            className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-medium border border-teal-500/30 transition"
                          >
                            Mark Overlap as Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 text-[11px] text-slate-400">
            Geographic comparison accounts for preliminary coordinate approximations. Full CAD / SHP file boundary verification recommended before final legal gazettement.
          </div>
        </div>
      </div>
    </div>
  );
};
