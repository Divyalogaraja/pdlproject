import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Popup,
  ScaleControl,
  AttributionControl,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Project } from '../types';

interface InteractiveMapProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (project: Project) => void;
  onCoordinateClick?: (lat: number, lng: number) => void;
  highlightOverlap?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showAllBoundaries?: boolean;
}

// Controller component to manage dynamic map events, viewport shifts, and resize invalidations
const MapViewController: React.FC<{
  center: [number, number];
  zoom: number;
  selectedCentroid?: [number, number];
  onCoordinateClick?: (lat: number, lng: number) => void;
}> = ({ center, zoom, selectedCentroid, onCoordinateClick }) => {
  const map = useMap();
  const lastTargetKey = useRef<string | null>(null);

  // Capture user coordinate clicks
  useMapEvents({
    click(e) {
      if (onCoordinateClick) {
        onCoordinateClick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
      }
    }
  });

  // Pan smoothly when project is selected or center/zoom changes
  useEffect(() => {
    if (selectedCentroid) {
      const key = `sel-${selectedCentroid[0].toFixed(4)},${selectedCentroid[1].toFixed(4)}`;
      if (lastTargetKey.current !== key) {
        lastTargetKey.current = key;
        map.setView(selectedCentroid, 8, { animate: true });
      }
    } else {
      const key = `center-${center[0].toFixed(4)},${center[1].toFixed(4)}-${zoom}`;
      if (lastTargetKey.current !== key) {
        lastTargetKey.current = key;
        map.setView(center, zoom, { animate: true });
      }
    }
  }, [selectedCentroid, center, zoom, map]);

  // Handle responsive resize & initial tile alignment
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onCoordinateClick,
  highlightOverlap = false,
  center = [15.0, 45.0], // Global ocean view centered between Africa and Asia
  zoom = 3,
  height = '460px',
  showAllBoundaries = true
}) => {
  const [isLoadingTiles, setIsLoadingTiles] = useState<boolean>(true);
  const [hasTileError, setHasTileError] = useState<boolean>(false);
  const [tileKey, setTileKey] = useState<number>(0);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const getStatusColor = (status: string, isFlagged: boolean) => {
    if (isFlagged || status === 'Flagged') return '#EF4444'; // Red
    if (status === 'Approved') return '#10B981'; // Emerald
    if (status === 'Under Review') return '#14B8A6'; // Teal
    if (status === 'Submitted') return '#06B6D4'; // Cyan
    return '#F59E0B'; // Amber
  };

  const createCustomIcon = (color: string, isSelected: boolean) => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background: ${color};
          width: ${isSelected ? '28px' : '22px'};
          height: ${isSelected ? '28px' : '22px'};
          border-radius: 50%;
          border: 3px solid #0E1F36;
          box-shadow: 0 0 12px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: bold;
          transition: transform 0.2s ease;
        ">
          🌱
        </div>
      `,
      iconSize: isSelected ? [28, 28] : [22, 22],
      iconAnchor: isSelected ? [14, 14] : [11, 11]
    });
  };

  const handleRetryTiles = () => {
    setHasTileError(false);
    setIsLoadingTiles(true);
    setTileKey(prev => prev + 1);
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-navy-700 shadow-xl bg-navy-900"
      style={{ height, minHeight: height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={true}
        attributionControl={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', background: '#0B192C' }}
      >
        {/* Dynamic viewport controller */}
        <MapViewController
          center={center}
          zoom={zoom}
          selectedCentroid={selectedProject?.centroid}
          onCoordinateClick={onCoordinateClick}
        />

        {/* Standard OpenStreetMap Raster Tiles with attribution */}
        <TileLayer
          key={tileKey}
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
          eventHandlers={{
            loading: () => setIsLoadingTiles(true),
            load: () => {
              setIsLoadingTiles(false);
              setHasTileError(false);
            },
            tileerror: () => {
              setHasTileError(true);
              setIsLoadingTiles(false);
            }
          }}
        />

        {/* Standard controls with custom styling */}
        <ScaleControl imperial={false} position="bottomleft" />
        <AttributionControl position="bottomleft" />

        {/* Render Project Markers and Boundaries */}
        {projects.map(project => {
          const isSelected = project.id === selectedProjectId;
          const isFlagged = project.verificationStatus === 'Flagged';
          const color = getStatusColor(project.verificationStatus, isFlagged);
          const icon = createCustomIcon(color, isSelected);

          const popupContent = (
            <div className="font-sans text-xs leading-relaxed p-1 text-slate-100 min-w-[210px]">
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-navy-700/60">
                <span className="bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                  {project.id}
                </span>
                <span style={{ color }} className="font-semibold text-[10px] flex items-center gap-1">
                  <span>●</span>
                  <span>{project.verificationStatus}</span>
                </span>
              </div>
              <div className="font-bold text-[13px] text-slate-100 mb-1 leading-snug">
                {project.name}
              </div>
              <div className="text-slate-400 text-[11px] mb-2 flex items-start gap-1">
                <span className="shrink-0">📍</span>
                <span>{project.location}</span>
              </div>
              <div className="border-t border-navy-700 pt-1.5 grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-slate-400">Area:</span> <b className="text-slate-200">{project.areaHectares.toLocaleString()} ha</b>
                </div>
                <div>
                  <span className="text-slate-400">Ecosystem:</span> <b className="text-slate-200">{project.ecosystemType}</b>
                </div>
                <div className="col-span-2 mt-0.5">
                  <span className="text-slate-400">Est. Carbon:</span> <b className="text-emerald-400">~{project.estimatedCarbonTCO2e.toLocaleString()} tCO2e</b> <span className="text-[10px] text-slate-400">(Demo)</span>
                </div>
              </div>
            </div>
          );

          const hasBoundary = showAllBoundaries && project.boundary?.coordinates && project.boundary.coordinates.length > 2;

          return (
            <React.Fragment key={project.id}>
              <Marker
                position={project.centroid}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    if (onSelectProject) onSelectProject(project);
                  }
                }}
              >
                <Popup>{popupContent}</Popup>
              </Marker>

              {hasBoundary && (
                <Polygon
                  positions={project.boundary.coordinates}
                  pathOptions={{
                    color: color,
                    weight: isSelected ? 3 : 1.5,
                    opacity: 0.9,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.35 : 0.15,
                    dashArray: isFlagged ? '6, 6' : undefined
                  }}
                  eventHandlers={{
                    click: () => {
                      if (onSelectProject) onSelectProject(project);
                    }
                  }}
                >
                  <Popup>{popupContent}</Popup>
                </Polygon>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Loading state indicator */}
      {isLoadingTiles && !hasTileError && (
        <div className="absolute top-3 left-14 bg-navy-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-teal-500/30 text-teal-300 text-[11px] flex items-center gap-1.5 z-[1000] shadow-md pointer-events-none animate-pulse">
          <RefreshCw size={11} className="animate-spin text-teal-400" />
          <span>Loading map tiles...</span>
        </div>
      )}

      {/* Error state overlay with retry */}
      {hasTileError && (
        <div className="absolute inset-0 bg-navy-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-[1001]">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-3 text-red-400">
            <AlertTriangle size={24} />
          </div>
          <h4 className="text-sm font-semibold text-slate-100 mb-1">Map Imagery Offline</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Unable to load OpenStreetMap tiles. Please check your network connection and retry.
          </p>
          <button
            onClick={handleRetryTiles}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-teal-900/30 flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            <span>Retry Loading Tiles</span>
          </button>
        </div>
      )}

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 right-3 bg-navy-900/90 backdrop-blur-md p-2.5 rounded-lg border border-navy-700/80 shadow-lg text-xs z-[1000] text-slate-300 pointer-events-auto">
        <div className="font-semibold text-slate-100 mb-1.5 flex items-center justify-between gap-3">
          <span>Boundary Status</span>
          <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Sample Data</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Approved / Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Under Review</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Flagged / Boundary Overlap</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Submitted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
