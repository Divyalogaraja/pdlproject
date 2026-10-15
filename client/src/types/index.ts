export type EcosystemType = 'Mangrove' | 'Seagrass' | 'Salt Marsh';

export type VerificationStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Flagged' 
  | 'Approved' 
  | 'Rejected';

export type UserRole = 'Administrator' | 'Field Officer' | 'MRV Verifier' | 'Project Owner';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface ProjectBoundary {
  type: 'Polygon';
  coordinates: [number, number][]; // [lat, lng]
}

export interface Project {
  id: string;
  name: string;
  organization: string;
  ecosystemType: EcosystemType;
  location: string;
  centroid: [number, number];
  boundary: ProjectBoundary;
  areaHectares: number;
  restorationStartDate: string;
  description: string;
  evidenceHash: string;
  verificationStatus: VerificationStatus;
  estimatedCarbonTCO2e: number;
  createdAt: string;
  updatedAt: string;
  contactEmail: string;
  history?: AuditEvent[];
}

export interface FieldObservation {
  id: string;
  projectId: string;
  officerName: string;
  gps: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    manualEntry: boolean;
  };
  observationDate: string;
  mangroveCondition: 'Good' | 'Moderate' | 'Poor';
  canopyDensityPercent: number;
  restorationStatus: 'Early Planting' | 'Established Saplings' | 'Mature Forest' | 'Disturbed';
  visibleDamage: 'None' | 'Erosion' | 'Illegal Cutting' | 'Pollution' | 'Storm Damage' | 'Pest/Disease';
  damageSeverity: 'None' | 'Minor' | 'Moderate' | 'Severe';
  environmentalNotes: string;
  sensorReadings?: {
    salinityPpt: number;
    soilPh: number;
    redoxPotentialMv: number;
    waterTempC: number;
    ambientHumidityPercent: number;
  };
  images: Array<{
    id: string;
    filename: string;
    url: string;
    sha256: string;
    capturedAt: string;
  }>;
  syncStatus: 'Pending' | 'Syncing' | 'Synced' | 'Failed';
  syncedAt?: string;
  errorMessage?: string;
}

export interface AIAnalysisResult {
  id: string;
  imageId: string;
  canopyHealthScore: number;
  vegetationCondition: string;
  visibleDamageDetected: string;
  apparentEcosystemChanges: string;
  speciesHints: string[];
  soilWaterVisualAssessment: string;
  imageQualityLimitations: string;
  inconsistencyWithFieldReport?: string;
  confidenceScore: number;
  recommendedVerificationAction: 'Approve' | 'Flag for Clarification' | 'Reject';
  analyzedAt: string;
  modelUsed: string;
  isSimulated: boolean;
  disclaimer: string;
}

export interface MRVSubmission {
  id: string;
  projectId: string;
  projectName: string;
  submittedBy: string;
  submittedRole: UserRole;
  submissionDate: string;
  status: VerificationStatus;
  fieldObservation: FieldObservation;
  aiAnalysis?: AIAnalysisResult;
  overlapCheck: {
    hasOverlap: boolean;
    overlappingProjectId?: string;
    overlappingProjectName?: string;
    overlapPercentage: number;
    status: 'Clear' | 'Warning' | 'Resolved';
    resolutionNotes?: string;
  };
  evidenceHash: string;
  integrityVerified: boolean;
  carbonEstimateTCO2e: number;
  carbonMethodology: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  blockchainRecord?: {
    txHash: string;
    blockNumber: number;
    confirmedAt: string;
    network: string;
    smartContractAddress: string;
    status: 'Confirmed' | 'Simulated';
  };
  auditTrail: AuditEvent[];
}

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  projectId: string;
  submissionId: string;
  evidenceHash: string;
  status: 'Confirmed' | 'Pending' | 'Simulated';
  carbonTCO2e: number;
  verifierAddress: string;
  gasUsed: number;
  network: string;
}
