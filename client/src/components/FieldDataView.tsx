import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  MapPin, 
  Camera, 
  Clock, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  CloudOff, 
  Radio, 
  Sliders, 
  Check, 
  Hash,
  Database,
  ArrowRight
} from 'lucide-react';
import { Project, FieldObservation } from '../types';
import { computeSHA256, formatHashShort } from '../services/crypto';
import { 
  saveOfflineObservation, 
  getAllLocalObservations, 
  deleteOfflineObservation, 
  updateObservationSyncStatus,
  clearSyncedObservations 
} from '../services/offlineStorage';
import { syncOfflineObservations, createSubmission } from '../services/api';

interface FieldDataViewProps {
  projects: Project[];
  isOnline: boolean;
  onSyncComplete?: () => void;
  selectedProjectId?: string | null;
}

export const FieldDataView: React.FC<FieldDataViewProps> = ({
  projects,
  isOnline,
  onSyncComplete,
  selectedProjectId
}) => {
  // Form State
  const [projectId, setProjectId] = useState<string>(selectedProjectId || projects[0]?.id || 'PRJ-MANG-001');
  const [officerName, setOfficerName] = useState<string>('Officer R. Karim');
  const [lat, setLat] = useState<string>('21.9497');
  const [lng, setLng] = useState<string>('89.1833');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(4.5);
  const [isManualGps, setIsManualGps] = useState<boolean>(false);
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);

  const [observationDate, setObservationDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [mangroveCondition, setMangroveCondition] = useState<'Good' | 'Moderate' | 'Poor'>('Good');
  const [canopyDensity, setCanopyDensity] = useState<number>(85);
  const [restorationStatus, setRestorationStatus] = useState<'Early Planting' | 'Established Saplings' | 'Mature Forest' | 'Disturbed'>('Established Saplings');
  const [visibleDamage, setVisibleDamage] = useState<'None' | 'Erosion' | 'Illegal Cutting' | 'Pollution' | 'Storm Damage' | 'Pest/Disease'>('None');
  const [damageSeverity, setDamageSeverity] = useState<'None' | 'Minor' | 'Moderate' | 'Severe'>('None');
  const [notes, setNotes] = useState<string>('Dense root development observed along low-tide mark. Sapling survival rate approximately 88%.');

  // Sensor Readings (Optional)
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [salinity, setSalinity] = useState<string>('27.4');
  const [soilPh, setSoilPh] = useState<string>('7.6');
  const [redoxMv, setRedoxMv] = useState<string>('-170');
  const [waterTemp, setWaterTemp] = useState<string>('28.5');
  const [humidity, setHumidity] = useState<string>('82');

  // Evidence Photos & Hashing
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // Local Storage / Sync Queue
  const [localQueue, setLocalQueue] = useState<FieldObservation[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load offline queue
  const loadQueue = async () => {
    try {
      const records = await getAllLocalObservations();
      setLocalQueue(records);
    } catch (e) {
      console.warn('Error loading offline queue:', e);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Update form if selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      setProjectId(selectedProjectId);
      const prj = projects.find(p => p.id === selectedProjectId);
      if (prj) {
        setLat(String(prj.centroid[0]));
        setLng(String(prj.centroid[1]));
      }
    }
  }, [selectedProjectId, projects]);

  // Handle GPS capture
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsFeedback('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setIsManualGps(true);
      return;
    }

    setIsCapturingGps(true);
    setGpsFeedback('Accessing device GPS satellites...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(5));
        setLng(position.coords.longitude.toFixed(5));
        setGpsAccuracy(Number(position.coords.accuracy.toFixed(1)));
        setIsManualGps(false);
        setIsCapturingGps(false);
        setGpsFeedback(`GPS lock acquired: Accuracy ±${position.coords.accuracy.toFixed(1)}m`);
      },
      (error) => {
        setIsCapturingGps(false);
        setIsManualGps(true);
        setGpsFeedback(`GPS acquisition error (${error.message}). Enabled manual coordinate input.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle File selection & client-side SHA-256 calculation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsHashing(true);
      try {
        const hash = await computeSHA256(file);
        setImageHash(hash);
      } catch (err) {
        console.error('Hashing error:', err);
      } finally {
        setIsHashing(false);
      }
    }
  };

  // Submit Observation
  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitFeedback(null);

    const numericLat = parseFloat(lat);
    const numericLng = parseFloat(lng);
    if (isNaN(numericLat) || isNaN(numericLng)) {
      setSubmitFeedback({ type: 'error', message: 'Invalid GPS coordinates' });
      return;
    }

    const obsId = `OBS-${Date.now()}`;
    const fileHash = imageHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    const observation: FieldObservation = {
      id: obsId,
      projectId,
      officerName,
      gps: {
        lat: numericLat,
        lng: numericLng,
        accuracyMeters: gpsAccuracy || 5.0,
        manualEntry: isManualGps
      },
      observationDate,
      mangroveCondition,
      canopyDensityPercent: Number(canopyDensity),
      restorationStatus,
      visibleDamage,
      damageSeverity,
      environmentalNotes: notes,
      sensorReadings: showSensors ? {
        salinityPpt: parseFloat(salinity) || 28.0,
        soilPh: parseFloat(soilPh) || 7.5,
        redoxPotentialMv: parseFloat(redoxMv) || -150,
        waterTempC: parseFloat(waterTemp) || 28.0,
        ambientHumidityPercent: parseFloat(humidity) || 80
      } : undefined,
      images: [
        {
          id: `img-${Date.now()}`,
          filename: selectedFile?.name || 'field_capture.jpg',
          url: previewUrl || 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1000&q=80',
          sha256: fileHash,
          capturedAt: new Date().toISOString()
        }
      ],
      syncStatus: isOnline ? 'Synced' : 'Pending',
      syncedAt: isOnline ? new Date().toISOString() : undefined
    };

    try {
      if (isOnline) {
        // Create full submission on backend
        const formData = new FormData();
        if (selectedFile) {
          formData.append('photos', selectedFile);
        }
        formData.append('payload', JSON.stringify({
          projectId,
          officerName,
          observationDate,
          gps: observation.gps,
          mangroveCondition,
          canopyDensityPercent: canopyDensity,
          restorationStatus,
          visibleDamage,
          damageSeverity,
          environmentalNotes: notes,
          sensorReadings: observation.sensorReadings,
          existingImages: observation.images
        }));

        await createSubmission(formData);
        
        // Also save record locally with Synced status
        await saveOfflineObservation(observation);
        setSubmitFeedback({
          type: 'success',
          message: 'Observation submitted online and assigned to MRV verification queue!'
        });
      } else {
        // Save to IndexedDB offline queue
        await saveOfflineObservation(observation);
        setSubmitFeedback({
          type: 'success',
          message: 'Saved to local IndexedDB queue! Record will sync when connectivity returns.'
        });
      }

      await loadQueue();
      if (onSyncComplete) onSyncComplete();

      // Reset file input
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageHash(null);
    } catch (err: any) {
      console.error('Submission error:', err);
      // Fallback: save to offline queue if online submission failed
      observation.syncStatus = 'Pending';
      observation.errorMessage = err.message;
      await saveOfflineObservation(observation);
      await loadQueue();
      setSubmitFeedback({
        type: 'error',
        message: `Online submission failed (${err.message}). Stored safely in local IndexedDB Pending Queue.`
      });
    }
  };

  // Sync All Pending Records
  const handleSyncQueue = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please toggle Online mode or restore network connection.');
      return;
    }

    const pending = localQueue.filter(o => o.syncStatus === 'Pending' || o.syncStatus === 'Failed');
    if (pending.length === 0) {
      alert('No pending records to synchronize.');
      return;
    }

    setIsSyncing(true);
    try {
      // Mark all as Syncing
      for (const p of pending) {
        await updateObservationSyncStatus(p.id, 'Syncing');
      }
      await loadQueue();

      // Call batch sync endpoint
      const result = await syncOfflineObservations(pending);

      // Update statuses
      for (const resItem of result.results) {
        await updateObservationSyncStatus(resItem.clientLocalId, 'Synced', { syncedAt: resItem.syncedAt });
      }

      await loadQueue();
      if (onSyncComplete) onSyncComplete();
      alert(`Synchronized ${result.processedCount} field observations successfully!`);
    } catch (err: any) {
      alert('Synchronization error: ' + err.message);
      // Restore pending status
      for (const p of pending) {
        await updateObservationSyncStatus(p.id, 'Failed', { errorMessage: err.message });
      }
      await loadQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = localQueue.filter(o => o.syncStatus === 'Pending' || o.syncStatus === 'Failed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="text-teal-400" size={24} />
            <span>Field Data Collection & Offline Sync Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Collect observational evidence, GPS coordinates, IoT telemetry, and photographic audits in the field.
          </p>
        </div>

        {/* Connectivity Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            isOnline 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
          }`}>
            {isOnline ? <Radio size={14} className="text-emerald-400" /> : <CloudOff size={14} />}
            <span>{isOnline ? 'Online • Direct Cloud Sync' : 'Offline Mode • IndexedDB Active'}</span>
          </div>
        </div>
      </div>

      {/* Sync Queue Summary Card */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-teal-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center font-bold text-base border border-teal-500/30">
            {pendingCount}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Pending Sync Queue (IndexedDB)</h3>
            <p className="text-xs text-slate-400">
              {pendingCount === 0 
                ? 'All field records are up to date with cloud registry.' 
                : `${pendingCount} observation(s) saved locally awaiting server transmission.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={handleSyncQueue}
            disabled={pendingCount === 0 || isSyncing}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition shadow-md flex items-center gap-2 ${
              pendingCount > 0 && !isSyncing
                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                : 'bg-navy-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? 'Synchronizing...' : `Sync Pending (${pendingCount})`}</span>
          </button>

          <button
            onClick={async () => {
              await clearSyncedObservations();
              await loadQueue();
            }}
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-slate-200 text-xs transition"
            title="Purge synchronized cache records"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {submitFeedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
          submitFeedback.type === 'success'
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
            : 'bg-red-500/15 text-red-300 border-red-500/40'
        }`}>
          {submitFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{submitFeedback.message}</span>
        </div>
      )}

      {/* Main Form & Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mobile-Friendly Field Survey Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5">
          <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Camera size={18} className="text-teal-400" />
              <span>Field Observation Form</span>
            </h3>
            <span className="text-[11px] text-slate-400 bg-navy-950 px-2.5 py-1 rounded border border-navy-800 font-mono">
              Audit-Ready
            </span>
          </div>

          <form onSubmit={handleSubmitObservation} className="space-y-4">
            {/* Project & Officer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Project <span className="text-teal-400">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    const prj = projects.find(p => p.id === e.target.value);
                    if (prj) {
                      setLat(String(prj.centroid[0]));
                      setLng(String(prj.centroid[1]));
                    }
                  }}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-navy-900">
                      {p.id} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Field Officer Name <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* GPS Geolocation Section */}
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin size={14} className="text-teal-400" />
                  <span>Geographic GPS Coordinates</span>
                </span>

                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  disabled={isCapturingGps}
                  className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-medium border border-teal-500/30 flex items-center gap-1 transition"
                >
                  <MapPin size={12} />
                  <span>{isCapturingGps ? 'Locking GPS...' : 'Auto-Capture GPS'}</span>
                </button>
              </div>

              {gpsFeedback && (
                <div className="text-[11px] text-teal-300/90 font-mono bg-teal-950/40 p-2 rounded border border-teal-800/40">
                  {gpsFeedback}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={lat}
                    onChange={(e) => {
                      setLat(e.target.value);
                      setIsManualGps(true);
                    }}
                    className="w-full px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={lng}
                    onChange={(e) => {
                      setLng(e.target.value);
                      setIsManualGps(true);
                    }}
                    className="w-full px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Accuracy / Mode</label>
                  <div className="px-2.5 py-1.5 bg-navy-900 border border-navy-700 rounded text-xs text-slate-300">
                    {isManualGps ? 'Manual Entry' : `±${gpsAccuracy}m GPS`}
                  </div>
                </div>
              </div>
            </div>

            {/* Observation Date & Ecosystem Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Survey Timestamp
                </label>
                <input
                  type="datetime-local"
                  required
                  value={observationDate}
                  onChange={(e) => setObservationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mangrove Condition
                </label>
                <select
                  value={mangroveCondition}
                  onChange={(e) => setMangroveCondition(e.target.value as any)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                >
                  <option value="Good">Good (Healthy foliage & roots)</option>
                  <option value="Moderate">Moderate (Stressed / Thinning)</option>
                  <option value="Poor">Poor (Dieback / Erosion)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Restoration Stage
                </label>
                <select
                  value={restorationStatus}
                  onChange={(e) => setRestorationStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                >
                  <option value="Early Planting">Early Planting (0 - 12 mo)</option>
                  <option value="Established Saplings">Established Saplings (1 - 3 yr)</option>
                  <option value="Mature Forest">Mature Forest (&gt; 3 yr)</option>
                  <option value="Disturbed">Disturbed / Regressing</option>
                </select>
              </div>
            </div>

            {/* Canopy Density Slider & Visible Damage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>Estimated Canopy Density</span>
                  <span className="font-mono text-teal-400 font-bold">{canopyDensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={canopyDensity}
                  onChange={(e) => setCanopyDensity(Number(e.target.value))}
                  className="w-full accent-teal-500 bg-navy-950 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Visible Damage Type
                </label>
                <select
                  value={visibleDamage}
                  onChange={(e) => setVisibleDamage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                >
                  <option value="None">None Detected</option>
                  <option value="Erosion">Wave / Tidal Sediment Erosion</option>
                  <option value="Illegal Cutting">Illegal Timber Harvesting</option>
                  <option value="Pollution">Hydrocarbon / Plastic Pollution</option>
                  <option value="Storm Damage">Cyclone / Gale Surge Damage</option>
                  <option value="Pest/Disease">Leaf Gall / Boring Pest</option>
                </select>
              </div>
            </div>

            {/* Image Upload with Client-Side Cryptographic SHA-256 Hashing */}
            <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Camera size={14} className="text-teal-400" />
                  <span>Field Photographic Evidence & SHA-256 Hashing</span>
                </span>
                <span className="text-[10px] text-teal-400 font-mono">WebCrypto API</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex-1 w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-navy-700 hover:border-teal-500 rounded-xl cursor-pointer bg-navy-900/50 transition">
                  <Upload size={20} className="text-teal-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Select Field Photo</span>
                  <span className="text-[10px] text-slate-500">Computes SHA-256 in browser before upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {previewUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-navy-700 relative flex-shrink-0">
                    <img src={previewUrl} alt="Field preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {isHashing && (
                <div className="text-[11px] text-teal-400 flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Computing cryptographic SHA-256 digest...</span>
                </div>
              )}

              {imageHash && (
                <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Hash size={12} className="text-teal-400" />
                    <span>Cryptographic Evidence Digest (SHA-256):</span>
                  </div>
                  <div className="font-mono text-[11px] text-teal-300 break-all select-all">
                    {imageHash}
                  </div>
                </div>
              )}
            </div>

            {/* Optional Sensor Telemetry Collapsible */}
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800 space-y-3">
              <button
                type="button"
                onClick={() => setShowSensors(!showSensors)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders size={14} className="text-teal-400" />
                  <span>IoT & Water Quality Sensor Measurements (Optional)</span>
                </span>
                <span className="text-teal-400 text-xs">{showSensors ? 'Hide Sensors' : 'Show Sensors'}</span>
              </button>

              {showSensors && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-navy-800">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Salinity (ppt)</label>
                    <input
                      type="text"
                      value={salinity}
                      onChange={(e) => setSalinity(e.target.value)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Soil pH</label>
                    <input
                      type="text"
                      value={soilPh}
                      onChange={(e) => setSoilPh(e.target.value)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Redox (mV)</label>
                    <input
                      type="text"
                      value={redoxMv}
                      onChange={(e) => setRedoxMv(e.target.value)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Water Temp (°C)</label>
                    <input
                      type="text"
                      value={waterTemp}
                      onChange={(e) => setWaterTemp(e.target.value)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Humidity (%)</label>
                    <input
                      type="text"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-xs text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Environmental Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Field Observation Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Transect observations, tidal flush patterns, soil saturation..."
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isOnline ? 'Direct Cloud Upload + Verification Submission' : 'Queued for Local IndexedDB Storage'}
              </span>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
              >
                <Check size={16} />
                <span>{isOnline ? 'Submit Observation Online' : 'Save Offline in IndexedDB'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Local Storage Queue & Inspection */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-2 border-b border-navy-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database size={16} className="text-teal-400" />
                <span>Local Queue Records ({localQueue.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400 bg-navy-950 px-2 py-0.5 rounded">
                Client DB
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {localQueue.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No local records in browser storage.
                </div>
              ) : (
                localQueue.map((obs) => {
                  const statusColors: Record<string, string> = {
                    Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    Syncing: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 animate-pulse',
                    Synced: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    Failed: 'bg-red-500/15 text-red-300 border-red-500/30'
                  };

                  return (
                    <div 
                      key={obs.id} 
                      className="p-3 rounded-xl bg-navy-950/60 border border-navy-800 text-xs space-y-2 hover:border-navy-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-400">{obs.projectId}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColors[obs.syncStatus]}`}>
                          ● {obs.syncStatus}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 line-clamp-2">
                        {obs.environmentalNotes}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-navy-850">
                        <span>{new Date(obs.observationDate).toLocaleString()}</span>
                        <button
                          onClick={async () => {
                            await deleteOfflineObservation(obs.id);
                            await loadQueue();
                          }}
                          className="text-red-400 hover:text-red-300"
                          title="Delete from local queue"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800 text-[11px] text-slate-400 leading-relaxed">
            <b>Offline-First Architecture:</b> All field records, photos, and sensor packets are retained in browser IndexedDB. No data is lost in remote mangrove estuaries with zero cellular reception.
          </div>
        </div>
      </div>
    </div>
  );
};
