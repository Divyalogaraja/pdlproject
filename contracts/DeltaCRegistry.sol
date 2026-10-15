// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DeltaCRegistry
 * @dev Smart Contract Registry for Blue Carbon MRV (Monitoring, Reporting, and Verification)
 *      Maintains tamper-evident records of registered blue-carbon projects, field evidence hashes,
 *      and MRV verification decisions.
 *
 * NOTE: Records on this smart contract serve as tamper-evident MRV audit attestations.
 * They do not constitute officially tradeable carbon credits unless certified by an accredited registry authority.
 */
contract DeltaCRegistry {
    address public admin;

    enum VerificationStatus {
        Draft,          // 0
        Submitted,      // 1
        UnderReview,    // 2
        Flagged,        // 3
        Approved,       // 4
        Rejected        // 5
    }

    struct Project {
        string projectId;
        string name;
        string ecosystemType;
        string location;
        uint256 areaHectares;
        string boundaryHash;
        string metadataHash;
        address owner;
        uint256 registeredAt;
        bool exists;
    }

    struct MRVRecord {
        string submissionId;
        string projectId;
        string evidenceHash;     // SHA-256 of image/sensor evidence bundle
        string aiAnalysisHash;   // SHA-256 of AI observation diagnostic payload
        uint256 carbonTCO2e;     // Scaled by 100 (e.g., 4500.50 tCO2e = 450050)
        VerificationStatus status;
        address verifiedBy;
        uint256 verifiedAt;
        string verificationNotes;
        uint256 blockNumber;
        bool exists;
    }

    // Storage mappings
    mapping(string => Project) private projects;
    mapping(string => MRVRecord) private mrvRecords;
    mapping(string => string[]) private projectSubmissions; // projectId => submissionIds
    mapping(address => bool) public authorizedVerifiers;
    string[] public allProjectIds;
    string[] public allSubmissionIds;

    // Events
    event ProjectRegistered(
        string indexed projectId,
        string name,
        string ecosystemType,
        address indexed owner,
        uint256 areaHectares,
        uint256 timestamp
    );

    event MRVRecordRecorded(
        string indexed submissionId,
        string indexed projectId,
        string evidenceHash,
        VerificationStatus status,
        uint256 carbonTCO2e,
        address indexed verifier,
        uint256 timestamp
    );

    event VerifierAuthorized(address indexed verifier, bool authorized);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "DeltaC: Caller is not admin");
        _;
    }

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == admin, "DeltaC: Caller is not an authorized verifier");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedVerifiers[msg.sender] = true;
        emit VerifierAuthorized(msg.sender, true);
    }

    function setVerifier(address verifier, bool authorized) external onlyAdmin {
        require(verifier != address(0), "DeltaC: Invalid verifier address");
        authorizedVerifiers[verifier] = authorized;
        emit VerifierAuthorized(verifier, authorized);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "DeltaC: Invalid new admin address");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    /**
     * @notice Register a new blue-carbon project with tamper-evident boundary and metadata hashes
     */
    function registerProject(
        string calldata projectId,
        string calldata name,
        string calldata ecosystemType,
        string calldata location,
        uint256 areaHectares,
        string calldata boundaryHash,
        string calldata metadataHash
    ) external {
        require(bytes(projectId).length > 0, "DeltaC: Empty projectId");
        require(!projects[projectId].exists, "DeltaC: Project ID already registered");

        projects[projectId] = Project({
            projectId: projectId,
            name: name,
            ecosystemType: ecosystemType,
            location: location,
            areaHectares: areaHectares,
            boundaryHash: boundaryHash,
            metadataHash: metadataHash,
            owner: msg.sender,
            registeredAt: block.timestamp,
            exists: true
        });

        allProjectIds.push(projectId);

        emit ProjectRegistered(
            projectId,
            name,
            ecosystemType,
            msg.sender,
            areaHectares,
            block.timestamp
        );
    }

    /**
     * @notice Record a verified MRV submission on-chain with evidence SHA-256 hash
     */
    function recordMRVVerification(
        string calldata submissionId,
        string calldata projectId,
        string calldata evidenceHash,
        string calldata aiAnalysisHash,
        uint256 carbonTCO2e,
        VerificationStatus status,
        string calldata notes
    ) external onlyVerifier {
        require(projects[projectId].exists, "DeltaC: Target project does not exist");
        require(bytes(submissionId).length > 0, "DeltaC: Empty submissionId");
        require(bytes(evidenceHash).length > 0, "DeltaC: Empty evidenceHash");

        bool isNew = !mrvRecords[submissionId].exists;

        mrvRecords[submissionId] = MRVRecord({
            submissionId: submissionId,
            projectId: projectId,
            evidenceHash: evidenceHash,
            aiAnalysisHash: aiAnalysisHash,
            carbonTCO2e: carbonTCO2e,
            status: status,
            verifiedBy: msg.sender,
            verifiedAt: block.timestamp,
            verificationNotes: notes,
            blockNumber: block.number,
            exists: true
        });

        if (isNew) {
            projectSubmissions[projectId].push(submissionId);
            allSubmissionIds.push(submissionId);
        }

        emit MRVRecordRecorded(
            submissionId,
            projectId,
            evidenceHash,
            status,
            carbonTCO2e,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Retrieve project details
     */
    function getProject(string calldata projectId) external view returns (Project memory) {
        require(projects[projectId].exists, "DeltaC: Project not found");
        return projects[projectId];
    }

    /**
     * @notice Retrieve MRV submission record
     */
    function getMRVRecord(string calldata submissionId) external view returns (MRVRecord memory) {
        require(mrvRecords[submissionId].exists, "DeltaC: Record not found");
        return mrvRecords[submissionId];
    }

    /**
     * @notice Get all MRV submission IDs for a project
     */
    function getProjectSubmissions(string calldata projectId) external view returns (string[] memory) {
        return projectSubmissions[projectId];
    }

    /**
     * @notice Verify if a given evidence hash matches what was recorded on-chain
     */
    function verifyEvidenceHash(string calldata submissionId, string calldata testHash) external view returns (bool matches, uint8 status, uint256 verifiedAt) {
        require(mrvRecords[submissionId].exists, "DeltaC: Record not found");
        MRVRecord memory rec = mrvRecords[submissionId];
        bool isMatch = keccak256(bytes(rec.evidenceHash)) == keccak256(bytes(testHash));
        return (isMatch, uint8(rec.status), rec.verifiedAt);
    }

    function getTotalProjects() external view returns (uint256) {
        return allProjectIds.length;
    }

    function getTotalSubmissions() external view returns (uint256) {
        return allSubmissionIds.length;
    }
}
