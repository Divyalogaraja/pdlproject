export const DELTAC_REGISTRY_ABI = [
  "function registerProject(string projectId, string name, string ecosystemType, string location, uint256 areaHectares, string boundaryHash, string metadataHash) external",
  "function recordMRVVerification(string submissionId, string projectId, string evidenceHash, string aiAnalysisHash, uint256 carbonTCO2e, uint8 status, string notes) external",
  "function getProject(string projectId) external view returns (tuple(string projectId, string name, string ecosystemType, string location, uint256 areaHectares, string boundaryHash, string metadataHash, address owner, uint256 registeredAt, bool exists))",
  "function getMRVRecord(string submissionId) external view returns (tuple(string submissionId, string projectId, string evidenceHash, string aiAnalysisHash, uint256 carbonTCO2e, uint8 status, address verifiedBy, uint256 verifiedAt, string verificationNotes, uint256 blockNumber, bool exists))",
  "function getProjectSubmissions(string projectId) external view returns (string[])",
  "function verifyEvidenceHash(string submissionId, string testHash) external view returns (bool matches, uint8 status, uint256 verifiedAt)",
  "function getTotalProjects() external view returns (uint256)",
  "function getTotalSubmissions() external view returns (uint256)",
  "event ProjectRegistered(string indexed projectId, string name, string ecosystemType, address indexed owner, uint256 areaHectares, uint256 timestamp)",
  "event MRVRecordRecorded(string indexed submissionId, string indexed projectId, string evidenceHash, uint8 status, uint256 carbonTCO2e, address indexed verifier, uint256 timestamp)"
];

export const DEFAULT_CONTRACT_ADDRESS = "0x71C2B8018e47265910A3815D829b4892C849B01a";
export const POLYGON_AMOY_CHAIN_ID = 80002;
export const SEPOLIA_CHAIN_ID = 11155111;
