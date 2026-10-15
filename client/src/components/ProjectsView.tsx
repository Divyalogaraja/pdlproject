import React, { useState } from 'react';
import { 
  Trees, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Calendar, 
  Leaf, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Check, 
  Eye, 
  Edit3, 
  Hash, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Project, EcosystemType, VerificationStatus, UserRole } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { createProject, updateProject, checkProjectOverlap } from '../services/api';
import { computeSHA256, formatHashShort } from '../services/crypto';

interface ProjectsViewProps {
  projects: Project[];
  onRefreshProjects: () => void;
  userRole: UserRole;
  onSelectProjectForMRV?: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onRefreshProjects,
  userRole,
  onSelectProjectForMRV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ecosystemFilter, setEcosystemFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: `PRJ-MANG-${String(projects.length + 1).padStart(3, '0')}`,
    name: '',
    organization: '',
    ecosystemType: 'Mangrove' as EcosystemType,
    location: '',
    lat: '21.5000',
    lng: '89.2000',
    areaHectares: '2500',
    restorationStartDate: new Date().toISOString().split('T')[0],
    description: '',
    contactEmail: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingOverlap, setIsCheckingOverlap] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesEco = ecosystemFilter === 'All' || p.ecosystemType === ecosystemFilter;
    const matchesStatus = statusFilter === 'All' || p.verificationStatus === statusFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEco && matchesStatus && matchesSearch;
  });

  // Check overlap while filling form
  const handleCheckOverlap = async () => {
    setIsCheckingOverlap(true);
    setOverlapWarning(null);
    try {
      const lat = parseFloat(formData.lat);
      const lng = parseFloat(formData.lng);
      const area = parseFloat(formData.areaHectares) || 1000;

      const res = await checkProjectOverlap({
        id: formData.id,
        name: formData.name,
        centroid: [lat, lng],
        areaHectares: area
      });

      if (res.hasOverlap) {
        setOverlapWarning(res.summary);
      } else {
        setOverlapWarning('No overlapping project claims detected in proximity.');
      }
    } catch (err: any) {
      console.warn('Overlap check error:', err);
    } finally {
      setIsCheckingOverlap(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const lat = parseFloat(formData.lat);
      const lng = parseFloat(formData.lng);
      const area = parseFloat(formData.areaHectares);

      if (isNaN(lat) || isNaN(lng) || isNaN(area)) {
        throw new Error('Please enter valid numeric values for Latitude, Longitude, and Area');
      }

      // Generate boundary box from centroid
      const delta = 0.04;
      const boundary = {
        type: 'Polygon' as const,
        coordinates: [
          [Number((lat - delta).toFixed(4)), Number((lng - delta).toFixed(4))],
          [Number((lat + delta).toFixed(4)), Number((lng - delta).toFixed(4))],
          [Number((lat + delta).toFixed(4)), Number((lng + delta).toFixed(4))],
          [Number((lat - delta).toFixed(4)), Number((lng + delta).toFixed(4))],
          [Number((lat - delta).toFixed(4)), Number((lng - delta).toFixed(4))]
        ] as [number, number][]
      };

      const payload = {
        ...formData,
        centroid: [lat, lng],
        boundary,
        areaHectares: area,
        estimatedCarbonTCO2e: Math.round(area * 22.8)
      };

      const result = await createProject(payload);
      setIsRegisterOpen(false);
      onRefreshProjects();
      setSelectedProject(result.project);
    } catch (err: any) {
      setFormError(err.message || 'Failed to register project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSubmitting(true);
    try {
      const updated = await updateProject(editingProject.id, {
        name: editingProject.name,
        description: editingProject.description,
        contactEmail: editingProject.contactEmail
      });
      setEditingProject(null);
      setSelectedProject(updated);
      onRefreshProjects();
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Trees className="text-teal-400" size={24} />
            <span>Blue Carbon Project Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Register and manage coastal blue carbon conservation and restoration initiatives.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              id: `PRJ-MANG-${String(projects.length + 1).padStart(3, '0')}`,
              name: '',
              organization: '',
              ecosystemType: 'Mangrove',
              location: '',
              lat: '21.5000',
              lng: '89.2000',
              areaHectares: '2500',
              restorationStartDate: new Date().toISOString().split('T')[0],
              description: '',
              contactEmail: ''
            });
            setFormError(null);
            setOverlapWarning(null);
            setIsRegisterOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Register New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, ID, location, or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-navy-950/80 border border-navy-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ecosystem Filter */}
          <div className="flex items-center gap-1.5 bg-navy-950/80 border border-navy-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter size={14} className="text-teal-400" />
            <span className="text-slate-400">Ecosystem:</span>
            <select
              value={ecosystemFilter}
              onChange={(e) => setEcosystemFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-navy-900">All</option>
              <option value="Mangrove" className="bg-navy-900">Mangrove</option>
              <option value="Seagrass" className="bg-navy-900">Seagrass</option>
              <option value="Salt Marsh" className="bg-navy-900">Salt Marsh</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-navy-950/80 border border-navy-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-navy-900">All Statuses</option>
              <option value="Approved" className="bg-navy-900">Approved</option>
              <option value="Under Review" className="bg-navy-900">Under Review</option>
              <option value="Flagged" className="bg-navy-900">Flagged</option>
              <option value="Submitted" className="bg-navy-900">Submitted</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 pl-2">
            Showing <b className="text-slate-200">{filteredProjects.length}</b> projects
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const statusColors: Record<string, string> = {
            Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
            'Under Review': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
            Flagged: 'bg-red-500/15 text-red-300 border-red-500/30',
            Submitted: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
            Draft: 'bg-slate-700 text-slate-300 border-slate-600'
          };

          return (
            <div
              key={project.id}
              className="glass-panel glass-panel-hover p-5 rounded-xl flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    {project.id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColors[project.verificationStatus]}`}>
                    ● {project.verificationStatus}
                  </span>
                </div>

                {/* Title & Organization */}
                <div>
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-teal-300 transition line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {project.organization}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-navy-800">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin size={13} className="text-teal-400 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Layers size={13} className="text-teal-400 flex-shrink-0" />
                    <span><b>{project.areaHectares.toLocaleString()}</b> ha</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Leaf size={13} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate">~{project.estimatedCarbonTCO2e.toLocaleString()} tCO2e</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={13} className="text-teal-400 flex-shrink-0" />
                    <span>Est. {new Date(project.restorationStartDate).getFullYear()}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Eye size={13} />
                  <span>Inspect Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition"
                    title="Edit permitted fields"
                  >
                    <Edit3 size={14} />
                  </button>
                  {onSelectProjectForMRV && (
                    <button
                      onClick={() => onSelectProjectForMRV(project)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-medium transition flex items-center gap-1"
                      title="Create MRV submission for this project"
                    >
                      <span>MRV</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                  <Trees size={20} className="text-teal-400" />
                  <span>Register Blue Carbon Project</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register a coastal project and establish baseline geospatial boundaries.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-navy-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {overlapWarning && (
              <div className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                overlapWarning.includes('Warning') 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}>
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{overlapWarning.includes('Warning') ? 'Perimeter Overlap Warning' : 'Geographic Perimeter Clear'}</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{overlapWarning}</div>
                  <div className="text-[10px] text-slate-400 mt-1 italic">
                    Note: Boundary overlap does not automatically imply fraud; legitimate multi-zone concessions may intersect.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Project ID <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    placeholder="e.g. PRJ-MANG-006"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ecosystem Type <span className="text-teal-400">*</span>
                  </label>
                  <select
                    value={formData.ecosystemType}
                    onChange={(e) => setFormData({ ...formData, ecosystemType: e.target.value as EcosystemType })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                  >
                    <option value="Mangrove">Mangrove Tidal Forest</option>
                    <option value="Seagrass">Seagrass Meadow</option>
                    <option value="Salt Marsh">Tidal Salt Marsh</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Project Name <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lamu Archipelago Mangrove Re-wilding Initiative"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Owner or Organization <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Kenya Marine Ecology Trust"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Geographic Location <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Lamu County, Kenya"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Centroid Latitude <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="-2.2717"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Centroid Longitude <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="40.9020"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Project Area (Hectares) <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.areaHectares}
                    onChange={(e) => setFormData({ ...formData, areaHectares: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Restoration Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.restorationStartDate}
                    onChange={(e) => setFormData({ ...formData, restorationStartDate: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Project Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe species planted, local community stewardship model, and coastal protection goals..."
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Geographic Overlap Pre-Check Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCheckOverlap}
                  disabled={isCheckingOverlap}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-teal-400 text-xs font-medium border border-navy-700 flex items-center gap-1.5 transition"
                >
                  <Search size={14} />
                  <span>{isCheckingOverlap ? 'Evaluating Proximity...' : 'Pre-Check Boundary Overlap'}</span>
                </button>
                <span className="text-[11px] text-slate-500">Auto-checks 5 km radius</span>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  {selectedProject.id}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{selectedProject.name}</h3>
                  <p className="text-xs text-slate-400">{selectedProject.organization} • {selectedProject.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-navy-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Boundary Map */}
            <div className="h-60 w-full rounded-xl overflow-hidden border border-navy-800">
              <InteractiveMap
                projects={[selectedProject]}
                selectedProjectId={selectedProject.id}
                center={selectedProject.centroid}
                zoom={9}
                height="240px"
              />
            </div>

            {/* Key Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-slate-500 block">Ecosystem</span>
                <b className="text-slate-200 text-sm">{selectedProject.ecosystemType}</b>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-slate-500 block">Project Area</span>
                <b className="text-slate-200 text-sm">{selectedProject.areaHectares.toLocaleString()} ha</b>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-slate-500 block">Verification Status</span>
                <b className="text-emerald-400 text-sm">{selectedProject.verificationStatus}</b>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-slate-500 block">Est. Carbon</span>
                <b className="text-teal-300 text-sm">~{selectedProject.estimatedCarbonTCO2e.toLocaleString()} tCO2e</b>
              </div>
            </div>

            {/* Description & Metadata Hash */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1">Restoration Scope & Context</h4>
                <p className="text-xs text-slate-400 leading-relaxed bg-navy-950 p-3 rounded-lg border border-navy-800">
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Hash size={14} className="text-teal-400" />
                  <span>Metadata SHA-256 Hash (Registration Integrity)</span>
                </h4>
                <div className="font-mono text-xs text-teal-300 bg-navy-950 p-2.5 rounded-lg border border-navy-800 break-all select-all">
                  {selectedProject.evidenceHash}
                </div>
              </div>
            </div>

            {/* Audit History */}
            {selectedProject.history && selectedProject.history.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Registration Audit Events</h4>
                <div className="space-y-2">
                  {selectedProject.history.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-200">{h.action}</div>
                        <div className="text-[11px] text-slate-400">{h.details}</div>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-navy-800 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permitted Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="text-base font-bold text-slate-100">Edit Project Info ({editingProject.id})</h3>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={editingProject.contactEmail}
                  onChange={(e) => setEditingProject({ ...editingProject, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
