import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
// Initial realistic demo dataset
const INITIAL_PROJECTS = [
    {
        id: 'PRJ-MANG-001',
        name: 'Sundarbans Delta Mangrove Conservation & Restoration',
        organization: 'Sundarbans Coastal Biosphere Trust',
        ecosystemType: 'Mangrove',
        location: 'Khulna & Satkhira Districts, Bangladesh / Bay of Bengal',
        centroid: [21.9497, 89.1833],
        boundary: {
            type: 'Polygon',
            coordinates: [
                [21.85, 89.10],
                [22.05, 89.10],
                [22.05, 89.30],
                [21.85, 89.30],
                [21.85, 89.10]
            ]
        },
        areaHectares: 14200,
        restorationStartDate: '2023-03-15',
        description: 'Community-led restoration of high-density Rhizophora mucronata and Avicennia marina tidal mangrove forests protecting 45,000 coastal villagers against cyclone surges.',
        evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        verificationStatus: 'Approved',
        estimatedCarbonTCO2e: 324500, // clearly labeled estimate
        createdAt: '2023-03-01T08:00:00Z',
        updatedAt: '2026-09-12T14:30:00Z',
        contactEmail: 'mrv@sundarbans-trust.org',
        history: [
            {
                id: 'aud-101',
                timestamp: '2023-03-01T08:00:00Z',
                actor: 'Dr. Tariq Rahman',
                role: 'Project Owner',
                action: 'PROJECT_REGISTERED',
                details: 'Initial registration submitted with 14,200 ha perimeter survey'
            },
            {
                id: 'aud-102',
                timestamp: '2026-09-12T14:30:00Z',
                actor: 'Dr. Maya Sen',
                role: 'MRV Verifier',
                action: 'MRV_APPROVED',
                details: 'Verified Q3 field monitoring package and anchored SHA-256 to Smart Contract'
            }
        ]
    },
    {
        id: 'PRJ-MANG-002',
        name: 'Kilifi Creek Community Blue Carbon Initiative',
        organization: 'Kilifi SeaGuard Forest Alliance',
        ecosystemType: 'Mangrove',
        location: 'Kilifi County, Kenya / Indian Ocean Coast',
        centroid: [-3.6300, 39.8500],
        boundary: {
            type: 'Polygon',
            coordinates: [
                [-3.68, 39.80],
                [-3.58, 39.80],
                [-3.58, 39.90],
                [-3.68, 39.90],
                [-3.68, 39.80]
            ]
        },
        areaHectares: 3850,
        restorationStartDate: '2024-01-10',
        description: 'Restoration of degraded intertidal mudflats featuring Ceriops tagal and Rhizophora planting. Integration of community mangrove beekeeping and coastal fish nurseries.',
        evidenceHash: 'c7d812d8a8bcf4b63e527d721bf95834f8e5f2dc2a04874b9714777d11ec26a4',
        verificationStatus: 'Under Review',
        estimatedCarbonTCO2e: 78200,
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2026-10-02T11:20:00Z',
        contactEmail: 'coastal@kilifiseaguard.org',
        history: [
            {
                id: 'aud-103',
                timestamp: '2024-01-05T10:00:00Z',
                actor: 'Fatima Omar',
                role: 'Project Owner',
                action: 'PROJECT_REGISTERED',
                details: 'Registered 3,850 ha coastal tidal wetland project'
            }
        ]
    },
    {
        id: 'PRJ-MANG-003',
        name: 'Pichavaram Estuarine Mangrove Buffer Zone',
        organization: 'Tamil Nadu Marine Ecology Mission',
        ecosystemType: 'Mangrove',
        location: 'Cuddalore District, Tamil Nadu, India',
        centroid: [11.4285, 79.7820],
        boundary: {
            type: 'Polygon',
            coordinates: [
                [11.39, 79.75],
                [11.46, 79.75],
                [11.46, 79.82],
                [11.39, 79.82],
                [11.39, 79.75]
            ]
        },
        areaHectares: 1470,
        restorationStartDate: '2023-08-20',
        description: 'Pichavaram is one of the oldest mangrove wetland systems in India. This project focuses on restoring disconnected canal systems to restore tidal flushing and revive Avicennia marina stands.',
        evidenceHash: '9b2c3498a1f4b2382903fead3999bc0e451276aef01823904bbcefa901239842',
        verificationStatus: 'Approved',
        estimatedCarbonTCO2e: 31400,
        createdAt: '2023-08-15T09:00:00Z',
        updatedAt: '2026-08-25T16:00:00Z',
        contactEmail: 'ecology@tn-marine.gov.in',
        history: [
            {
                id: 'aud-104',
                timestamp: '2023-08-15T09:00:00Z',
                actor: 'K. Rajagopal',
                role: 'Project Owner',
                action: 'PROJECT_REGISTERED',
                details: 'Registered 1,470 ha estuarine restoration buffer'
            }
        ]
    },
    {
        id: 'PRJ-MANG-004',
        name: 'Gulf of Urabá Caribbean Mangrove Corridor',
        organization: 'Fundación Humedales Caribe',
        ecosystemType: 'Mangrove',
        location: 'Antioquia & Chocó, Colombia',
        centroid: [8.1000, -76.8000],
        boundary: {
            type: 'Polygon',
            coordinates: [
                [8.05, -76.85],
                [8.18, -76.85],
                [8.18, -76.72],
                [8.05, -76.72],
                [8.05, -76.85]
            ]
        },
        areaHectares: 5200,
        restorationStartDate: '2024-05-14',
        description: 'Protection and natural regeneration of Pelliciera rhizophorae and Laguncularia racemosa in the Atrato River delta. Overlaps with municipal coastal reserve concession.',
        evidenceHash: '72384a8bc92801efea3012984bcaef01928471203984faef9012839401293847',
        verificationStatus: 'Flagged',
        estimatedCarbonTCO2e: 112000,
        createdAt: '2024-05-01T12:00:00Z',
        updatedAt: '2026-10-08T09:45:00Z',
        contactEmail: 'info@humedalescaribe.org',
        history: [
            {
                id: 'aud-105',
                timestamp: '2024-05-01T12:00:00Z',
                actor: 'Carlos Morales',
                role: 'Project Owner',
                action: 'PROJECT_REGISTERED',
                details: 'Project registered with 5,200 ha polygon'
            },
            {
                id: 'aud-106',
                timestamp: '2026-10-08T09:45:00Z',
                actor: 'System (Geo-Overlap Engine)',
                role: 'Administrator',
                action: 'OVERLAP_FLAGGED',
                details: 'Automated geospatial intersection check detected 18.4% coordinate overlap with neighboring zone'
            }
        ]
    },
    {
        id: 'PRJ-MANG-005',
        name: 'Rufiji Delta Intertidal Forest Rehabilitation',
        organization: 'Tanzania Forest Services & Wetlands International',
        ecosystemType: 'Mangrove',
        location: 'Rufiji District, Pwani Region, Tanzania',
        centroid: [-7.8000, 39.3000],
        boundary: {
            type: 'Polygon',
            coordinates: [
                [-7.88, 39.22],
                [-7.72, 39.22],
                [-7.72, 39.38],
                [-7.88, 39.38],
                [-7.88, 39.22]
            ]
        },
        areaHectares: 8900,
        restorationStartDate: '2024-09-01',
        description: 'Rehabilitation of river channel mangroves severely affected by altered siltation rates. Replanting of Sonneratia alba with community nurseries.',
        evidenceHash: '1982736450abcdef01928374650192837465abcdeffedcba0987654321019283',
        verificationStatus: 'Submitted',
        estimatedCarbonTCO2e: 195000,
        createdAt: '2024-08-20T14:15:00Z',
        updatedAt: '2026-10-10T16:30:00Z',
        contactEmail: 'rufiji@tfs.go.tz',
        history: [
            {
                id: 'aud-107',
                timestamp: '2024-08-20T14:15:00Z',
                actor: 'Amani Mwinyi',
                role: 'Project Owner',
                action: 'PROJECT_REGISTERED',
                details: 'Initial submission of 8,900 ha intertidal restoration plan'
            }
        ]
    }
];
const INITIAL_SUBMISSIONS = [
    {
        id: 'MRV-2026-001',
        projectId: 'PRJ-MANG-001',
        projectName: 'Sundarbans Delta Mangrove Conservation & Restoration',
        submittedBy: 'Rashid Al-Karim',
        submittedRole: 'Field Officer',
        submissionDate: '2026-09-10T08:45:00Z',
        status: 'Approved',
        fieldObservation: {
            id: 'OBS-001',
            projectId: 'PRJ-MANG-001',
            officerName: 'Rashid Al-Karim',
            gps: {
                lat: 21.9497,
                lng: 89.1833,
                accuracyMeters: 4.2,
                manualEntry: false
            },
            observationDate: '2026-09-10T08:30:00Z',
            mangroveCondition: 'Good',
            canopyDensityPercent: 88,
            restorationStatus: 'Mature Forest',
            visibleDamage: 'None',
            damageSeverity: 'None',
            environmentalNotes: 'Dense pneumatophore root systems observed across Transect 4. High crab burrowing activity indicating healthy tidal flushing. Average canopy height 6.5 meters.',
            sensorReadings: {
                salinityPpt: 26.8,
                soilPh: 7.4,
                redoxPotentialMv: -185,
                waterTempC: 28.2,
                ambientHumidityPercent: 84
            },
            images: [
                {
                    id: 'IMG-001',
                    filename: 'sundarbans_transect_4_dense_roots.jpg',
                    url: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1000&q=80',
                    sha256: '4a1b89ef32a4e98f0291a27b87c0e812d4567bca9812ef901283fae019284756',
                    capturedAt: '2026-09-10T08:35:00Z'
                }
            ],
            syncStatus: 'Synced',
            syncedAt: '2026-09-10T09:00:00Z'
        },
        aiAnalysis: {
            id: 'AI-001',
            imageId: 'IMG-001',
            canopyHealthScore: 94,
            vegetationCondition: 'Vibrant, high-chlorophyll Rhizophora / Avicennia canopy with uniform green reflectance.',
            visibleDamageDetected: 'No perceptible defoliation, insect defoliation, or wave undercutting along transect boundary.',
            apparentEcosystemChanges: 'Notable 14% increase in stilt root density compared to previous baseline satellite survey.',
            speciesHints: ['Rhizophora mucronata', 'Avicennia marina'],
            soilWaterVisualAssessment: 'Tidal sediment saturation consistent with low-intertidal zone; no visible hydrocarbon sheen.',
            imageQualityLimitations: 'Minor direct sun glint on upper leaf surfaces; does not impede automated segmentation.',
            inconsistencyWithFieldReport: 'None. AI observation strongly corroborates Field Officer rating of Good.',
            confidenceScore: 0.96,
            recommendedVerificationAction: 'Approve',
            analyzedAt: '2026-09-10T09:05:00Z',
            modelUsed: 'Gemini 1.5 Pro / Environmental Vision Engine',
            isSimulated: false,
            disclaimer: 'AI observations assist MRV verifiers by highlighting vegetation patterns. AI does not directly measure carbon sequestration or certify legal credit issuance.'
        },
        overlapCheck: {
            hasOverlap: false,
            overlapPercentage: 0,
            status: 'Clear'
        },
        evidenceHash: '4a1b89ef32a4e98f0291a27b87c0e812d4567bca9812ef901283fae019284756',
        integrityVerified: true,
        carbonEstimateTCO2e: 4850.25,
        carbonMethodology: 'IPCC 2013 Wetland Supplement (Tier 2 Estuarine Mangrove Model)',
        reviewerNotes: 'Evidence integrity confirmed via SHA-256 match. Field data, IoT sensor ranges, and AI vision analysis are consistent with high-growth restoration. Approved for smart contract registry recording.',
        reviewedBy: 'Dr. Maya Sen',
        reviewedAt: '2026-09-12T14:28:00Z',
        blockchainRecord: {
            txHash: '0x8f2d593021a812e9b0487532a1048f729b870192e48271049c819203984fae12',
            blockNumber: 4291054,
            confirmedAt: '2026-09-12T14:30:15Z',
            network: 'Polygon Amoy Testnet (EVM)',
            smartContractAddress: '0x71C2B8018e47265910A3815D829b4892C849B01a',
            status: 'Confirmed'
        },
        auditTrail: [
            {
                id: 'aud-s1',
                timestamp: '2026-09-10T08:45:00Z',
                actor: 'Rashid Al-Karim (Field Officer)',
                role: 'Field Officer',
                action: 'SUBMISSION_CREATED',
                details: 'Uploaded observation OBS-001 with 1 evidence photo and IoT telemetry'
            },
            {
                id: 'aud-s2',
                timestamp: '2026-09-10T09:05:00Z',
                actor: 'DeltaC AI Vision Worker',
                role: 'Administrator',
                action: 'AI_ANALYSIS_COMPLETED',
                details: 'Canopy health rated 94/100, zero anomalies identified'
            },
            {
                id: 'aud-s3',
                timestamp: '2026-09-12T14:28:00Z',
                actor: 'Dr. Maya Sen',
                role: 'MRV Verifier',
                action: 'SUBMISSION_APPROVED',
                details: 'Verified evidence integrity and signed approval'
            },
            {
                id: 'aud-s4',
                timestamp: '2026-09-12T14:30:15Z',
                actor: 'Dr. Maya Sen',
                role: 'MRV Verifier',
                action: 'BLOCKCHAIN_RECORDED',
                details: 'Recorded to smart contract DeltaCRegistry at block 4291054'
            }
        ]
    },
    {
        id: 'MRV-2026-002',
        projectId: 'PRJ-MANG-002',
        projectName: 'Kilifi Creek Community Blue Carbon Initiative',
        submittedBy: 'Evans Mwangi',
        submittedRole: 'Field Officer',
        submissionDate: '2026-10-02T10:15:00Z',
        status: 'Under Review',
        fieldObservation: {
            id: 'OBS-002',
            projectId: 'PRJ-MANG-002',
            officerName: 'Evans Mwangi',
            gps: {
                lat: -3.6300,
                lng: 39.8500,
                accuracyMeters: 5.8,
                manualEntry: false
            },
            observationDate: '2026-10-02T09:40:00Z',
            mangroveCondition: 'Moderate',
            canopyDensityPercent: 62,
            restorationStatus: 'Established Saplings',
            visibleDamage: 'Erosion',
            damageSeverity: 'Minor',
            environmentalNotes: 'Tidal creek bank shows localized edge scouring following spring high tides. Replanted Ceriops saplings are surviving, but soil sediment deposit is slightly shallower than expected.',
            sensorReadings: {
                salinityPpt: 35.2,
                soilPh: 8.1,
                redoxPotentialMv: -95,
                waterTempC: 30.1,
                ambientHumidityPercent: 78
            },
            images: [
                {
                    id: 'IMG-002',
                    filename: 'kilifi_sapling_bed_erosion.jpg',
                    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
                    sha256: 'c7d812d8a8bcf4b63e527d721bf95834f8e5f2dc2a04874b9714777d11ec26a4',
                    capturedAt: '2026-10-02T09:45:00Z'
                }
            ],
            syncStatus: 'Synced',
            syncedAt: '2026-10-02T10:05:00Z'
        },
        aiAnalysis: {
            id: 'AI-002',
            imageId: 'IMG-002',
            canopyHealthScore: 68,
            vegetationCondition: 'Moderate canopy density with patchy seedling spacing and exposed intertidal substrate.',
            visibleDamageDetected: 'Signs of peripheral soil erosion and exposed roots on 20% of young saplings.',
            apparentEcosystemChanges: 'Canopy cover has thinned 8% in western bank zone compared to baseline quarter.',
            speciesHints: ['Ceriops tagal', 'Avicennia'],
            soilWaterVisualAssessment: 'Dry hypersaline crust visible on upper littoral fringe.',
            imageQualityLimitations: 'Slight glare on wet mud surface; adequate for feature segmentation.',
            inconsistencyWithFieldReport: 'AI canopy rating (68%) closely matches field officer observation of Moderate condition.',
            confidenceScore: 0.89,
            recommendedVerificationAction: 'Flag for Clarification',
            analyzedAt: '2026-10-02T10:20:00Z',
            modelUsed: 'Gemini 1.5 Pro / Environmental Vision Engine',
            isSimulated: false,
            disclaimer: 'AI observations assist MRV verifiers by highlighting vegetation patterns. AI does not directly measure carbon sequestration or certify legal credit issuance.'
        },
        overlapCheck: {
            hasOverlap: false,
            overlapPercentage: 0,
            status: 'Clear'
        },
        evidenceHash: 'c7d812d8a8bcf4b63e527d721bf95834f8e5f2dc2a04874b9714777d11ec26a4',
        integrityVerified: true,
        carbonEstimateTCO2e: 1240.80,
        carbonMethodology: 'CDM AR-AM0014 (Tidal Wetland Restoration)',
        reviewerNotes: 'Pending secondary drone verification to determine if soil erosion is seasonal or requires replanting stabilization.',
        reviewedBy: 'Dr. Maya Sen',
        reviewedAt: '2026-10-04T15:00:00Z',
        auditTrail: [
            {
                id: 'aud-s5',
                timestamp: '2026-10-02T10:15:00Z',
                actor: 'Evans Mwangi (Field Officer)',
                role: 'Field Officer',
                action: 'SUBMISSION_CREATED',
                details: 'Uploaded observation OBS-002 for Kilifi Creek'
            },
            {
                id: 'aud-s6',
                timestamp: '2026-10-04T15:00:00Z',
                actor: 'Dr. Maya Sen',
                role: 'MRV Verifier',
                action: 'STATUS_UNDER_REVIEW',
                details: 'Requested additional soil stabilization audit'
            }
        ]
    },
    {
        id: 'MRV-2026-003',
        projectId: 'PRJ-MANG-004',
        projectName: 'Gulf of Urabá Caribbean Mangrove Corridor',
        submittedBy: 'Mateo Restrepo',
        submittedRole: 'Field Officer',
        submissionDate: '2026-10-08T09:30:00Z',
        status: 'Flagged',
        fieldObservation: {
            id: 'OBS-003',
            projectId: 'PRJ-MANG-004',
            officerName: 'Mateo Restrepo',
            gps: {
                lat: 8.1000,
                lng: -76.8000,
                accuracyMeters: 6.5,
                manualEntry: false
            },
            observationDate: '2026-10-08T09:10:00Z',
            mangroveCondition: 'Moderate',
            canopyDensityPercent: 74,
            restorationStatus: 'Established Saplings',
            visibleDamage: 'Illegal Cutting',
            damageSeverity: 'Moderate',
            environmentalNotes: 'Localized timber cutting detected near the eastern boundary bordering commercial shrimp canal.',
            sensorReadings: {
                salinityPpt: 19.5,
                soilPh: 7.2,
                redoxPotentialMv: -140,
                waterTempC: 29.4,
                ambientHumidityPercent: 88
            },
            images: [
                {
                    id: 'IMG-003',
                    filename: 'uraba_caribbean_mangrove_perimeter.jpg',
                    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
                    sha256: '72384a8bc92801efea3012984bcaef01928471203984faef9012839401293847',
                    capturedAt: '2026-10-08T09:15:00Z'
                }
            ],
            syncStatus: 'Synced',
            syncedAt: '2026-10-08T09:25:00Z'
        },
        aiAnalysis: {
            id: 'AI-003',
            imageId: 'IMG-003',
            canopyHealthScore: 71,
            vegetationCondition: 'Heterogeneous canopy with clear perimeter breakages.',
            visibleDamageDetected: 'Clear-felled patches observed near waterline boundary.',
            apparentEcosystemChanges: 'Artificial drainage cut visible at eastern boundary.',
            speciesHints: ['Pelliciera rhizophorae', 'Laguncularia racemosa'],
            soilWaterVisualAssessment: 'High turbidity along shoreline.',
            imageQualityLimitations: 'High humidity mist in background.',
            inconsistencyWithFieldReport: 'Corroborates field officer report of illegal boundary cutting.',
            confidenceScore: 0.91,
            recommendedVerificationAction: 'Flag for Clarification',
            analyzedAt: '2026-10-08T09:35:00Z',
            modelUsed: 'Gemini 1.5 Pro / Environmental Vision Engine',
            isSimulated: false,
            disclaimer: 'AI observations assist MRV verifiers by highlighting vegetation patterns. AI does not directly measure carbon sequestration or certify legal credit issuance.'
        },
        overlapCheck: {
            hasOverlap: true,
            overlappingProjectId: 'CONC-COL-009',
            overlappingProjectName: 'Atrato Basin Municipal Marine Concession',
            overlapPercentage: 18.4,
            status: 'Warning',
            resolutionNotes: 'Overlap detected with municipal marine reserve. Boundary survey adjustment required before crediting.'
        },
        evidenceHash: '72384a8bc92801efea3012984bcaef01928471203984faef9012839401293847',
        integrityVerified: true,
        carbonEstimateTCO2e: 2150.00,
        carbonMethodology: 'Blue Carbon Initiative (Howard et al. 2014)',
        reviewerNotes: 'Flagged for two reasons: (1) 18.4% overlap with Atrato Municipal Marine Concession, and (2) evidence of perimeter timber harvesting.',
        reviewedBy: 'Dr. Maya Sen',
        reviewedAt: '2026-10-09T11:00:00Z',
        auditTrail: [
            {
                id: 'aud-s7',
                timestamp: '2026-10-08T09:30:00Z',
                actor: 'Mateo Restrepo',
                role: 'Field Officer',
                action: 'SUBMISSION_CREATED',
                details: 'Submitted Uraba field report'
            },
            {
                id: 'aud-s8',
                timestamp: '2026-10-09T11:00:00Z',
                actor: 'Dr. Maya Sen',
                role: 'MRV Verifier',
                action: 'SUBMISSION_FLAGGED',
                details: 'Flagged due to boundary overlap and timber harvesting notice'
            }
        ]
    }
];
const INITIAL_TRANSACTIONS = [
    {
        id: 'TX-001',
        txHash: '0x8f2d593021a812e9b0487532a1048f729b870192e48271049c819203984fae12',
        blockNumber: 4291054,
        timestamp: '2026-09-12T14:30:15Z',
        projectId: 'PRJ-MANG-001',
        submissionId: 'MRV-2026-001',
        evidenceHash: '4a1b89ef32a4e98f0291a27b87c0e812d4567bca9812ef901283fae019284756',
        status: 'Confirmed',
        carbonTCO2e: 4850.25,
        verifierAddress: '0x438B0126Da4C3761E79383610931Ac4F34A9F091',
        gasUsed: 84210,
        network: 'Polygon Amoy Testnet (EVM)'
    }
];
class DataStore {
    state;
    constructor() {
        this.state = this.loadOrCreate();
    }
    loadOrCreate() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (fs.existsSync(STORE_PATH)) {
                const raw = fs.readFileSync(STORE_PATH, 'utf-8');
                return JSON.parse(raw);
            }
        }
        catch (err) {
            console.warn('Failed to load store.json, re-initializing with seed data:', err);
        }
        const initial = {
            projects: INITIAL_PROJECTS,
            submissions: INITIAL_SUBMISSIONS,
            fieldObservations: [],
            blockchainTransactions: INITIAL_TRANSACTIONS,
            auditLogs: [
                {
                    id: 'aud-sys-1',
                    timestamp: new Date().toISOString(),
                    actor: 'System Initialization',
                    role: 'Administrator',
                    action: 'SYSTEM_BOOT',
                    details: 'DeltaC Blue Carbon MRV Engine & Registry initialized with baseline demo datasets'
                }
            ]
        };
        this.save(initial);
        return initial;
    }
    save(state) {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            fs.writeFileSync(STORE_PATH, JSON.stringify(state || this.state, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Error saving data store:', err);
        }
    }
    // Projects
    getProjects() {
        return this.state.projects;
    }
    getProjectById(id) {
        return this.state.projects.find(p => p.id === id);
    }
    addProject(project) {
        this.state.projects.unshift(project);
        this.addAuditLog({
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: project.organization,
            role: 'Project Owner',
            action: 'PROJECT_REGISTERED',
            details: `Project ${project.id} (${project.name}) registered with area ${project.areaHectares} ha.`
        });
        this.save();
        return project;
    }
    updateProject(id, updates) {
        const idx = this.state.projects.findIndex(p => p.id === id);
        if (idx === -1)
            return null;
        this.state.projects[idx] = {
            ...this.state.projects[idx],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.save();
        return this.state.projects[idx];
    }
    // Submissions
    getSubmissions() {
        return this.state.submissions;
    }
    getSubmissionById(id) {
        return this.state.submissions.find(s => s.id === id);
    }
    addSubmission(submission) {
        this.state.submissions.unshift(submission);
        this.addAuditLog({
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: submission.submittedBy,
            role: submission.submittedRole,
            action: 'MRV_SUBMISSION_CREATED',
            details: `Submission ${submission.id} logged for project ${submission.projectId}`
        });
        this.save();
        return submission;
    }
    updateSubmission(id, updates) {
        const idx = this.state.submissions.findIndex(s => s.id === id);
        if (idx === -1)
            return null;
        this.state.submissions[idx] = {
            ...this.state.submissions[idx],
            ...updates
        };
        this.save();
        return this.state.submissions[idx];
    }
    // Blockchain Transactions
    getTransactions() {
        return this.state.blockchainTransactions;
    }
    addTransaction(tx) {
        this.state.blockchainTransactions.unshift(tx);
        this.save();
        return tx;
    }
    // Audit Logs
    getAuditLogs() {
        return this.state.auditLogs;
    }
    addAuditLog(log) {
        this.state.auditLogs.unshift(log);
        // keep last 500 audit logs
        if (this.state.auditLogs.length > 500) {
            this.state.auditLogs.pop();
        }
        this.save();
    }
    resetToDemo() {
        this.state = {
            projects: INITIAL_PROJECTS,
            submissions: INITIAL_SUBMISSIONS,
            fieldObservations: [],
            blockchainTransactions: INITIAL_TRANSACTIONS,
            auditLogs: [
                {
                    id: `aud-reset-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    actor: 'Demo Reset Action',
                    role: 'Administrator',
                    action: 'DEMO_DATA_RESET',
                    details: 'Restored baseline demonstration dataset'
                }
            ]
        };
        this.save();
        return this.state;
    }
}
export const store = new DataStore();
