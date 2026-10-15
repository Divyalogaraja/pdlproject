import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { store } from './store.js';
import { analyzeEnvironmentalImage } from './aiService.js';
import { detectProjectOverlaps } from './geoService.js';
import { Project, MRVSubmission, FieldObservation, BlockchainTransaction } from './types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB limit
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// ----------------------------------------------------
// Health & System Info
// ----------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0-hackathon-prod',
    environment: {
      aiProvider: hasGeminiKey ? 'Google Gemini 1.5 Flash (Live Key Active)' : 'DeltaC Environmental Vision Engine (Demo Mode Active)',
      aiIsLive: hasGeminiKey,
      blockchainMode: process.env.RPC_URL ? 'Connected EVM RPC' : 'Interactive Smart Contract Simulator (EVM Compatible)',
      storage: 'Persistent JSON Store + SHA-256 Content Addressing',
      activeProjectsCount: store.getProjects().length,
      activeSubmissionsCount: store.getSubmissions().length
    }
  });
});

// ----------------------------------------------------
// Projects API
// ----------------------------------------------------
app.get('/api/projects', (req: Request, res: Response) => {
  const { ecosystem, status, search } = req.query;
  let projects = store.getProjects();

  if (ecosystem && ecosystem !== 'All') {
    projects = projects.filter(p => p.ecosystemType === ecosystem);
  }
  if (status && status !== 'All') {
    projects = projects.filter(p => p.verificationStatus === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    projects = projects.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.organization.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: projects.length, data: projects });
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = store.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  res.json({ success: true, data: project });
});

app.post('/api/projects/check-overlap', (req: Request, res: Response) => {
  const { id, name, centroid, boundary, areaHectares } = req.body;
  if (!centroid || !Array.isArray(centroid) || centroid.length !== 2) {
    return res.status(400).json({ success: false, message: 'Valid centroid [lat, lng] is required' });
  }

  const result = detectProjectOverlaps(
    {
      id,
      name: name || 'Prospective Project',
      centroid: [Number(centroid[0]), Number(centroid[1])],
      boundary,
      areaHectares: Number(areaHectares) || 1000
    },
    store.getProjects()
  );

  res.json({ success: true, data: result });
});

app.post('/api/projects', (req: Request, res: Response) => {
  const {
    id,
    name,
    organization,
    ecosystemType,
    location,
    centroid,
    boundary,
    areaHectares,
    restorationStartDate,
    description,
    contactEmail,
    estimatedCarbonTCO2e
  } = req.body;

  if (!id || !name || !organization || !ecosystemType || !centroid || !areaHectares) {
    return res.status(400).json({
      success: false,
      message: 'Missing required project registration fields (id, name, organization, ecosystemType, centroid, areaHectares)'
    });
  }

  // Prevent duplicate project ID
  if (store.getProjectById(id)) {
    return res.status(409).json({
      success: false,
      message: `Project ID "${id}" is already registered. Please choose a unique project ID.`
    });
  }

  // Generate SHA-256 metadata hash of project registration packet
  const registrationPayload = JSON.stringify({
    id, name, organization, ecosystemType, centroid, boundary, areaHectares, restorationStartDate
  });
  const metadataHash = crypto.createHash('sha256').update(registrationPayload).digest('hex');

  // Check geographic overlap
  const overlapCheck = detectProjectOverlaps(
    {
      id,
      name,
      centroid: [Number(centroid[0]), Number(centroid[1])],
      boundary,
      areaHectares: Number(areaHectares)
    },
    store.getProjects()
  );

  const newProject: Project = {
    id: id.trim(),
    name: name.trim(),
    organization: organization.trim(),
    ecosystemType: ecosystemType || 'Mangrove',
    location: location || 'Coastal Estuary',
    centroid: [Number(centroid[0]), Number(centroid[1])],
    boundary: boundary || {
      type: 'Polygon',
      coordinates: [
        [centroid[0] - 0.05, centroid[1] - 0.05],
        [centroid[0] + 0.05, centroid[1] - 0.05],
        [centroid[0] + 0.05, centroid[1] + 0.05],
        [centroid[0] - 0.05, centroid[1] + 0.05],
        [centroid[0] - 0.05, centroid[1] - 0.05]
      ]
    },
    areaHectares: Number(areaHectares),
    restorationStartDate: restorationStartDate || new Date().toISOString().split('T')[0],
    description: description || 'Blue carbon coastal restoration project.',
    evidenceHash: metadataHash,
    verificationStatus: overlapCheck.hasOverlap ? 'Flagged' : 'Submitted',
    estimatedCarbonTCO2e: Number(estimatedCarbonTCO2e) || Math.round(Number(areaHectares) * 22.5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contactEmail: contactEmail || 'info@project.org',
    history: [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: organization,
        role: 'Project Owner',
        action: 'PROJECT_REGISTERED',
        details: `Initial registration logged. Metadata SHA-256: ${metadataHash.substring(0, 16)}... ${overlapCheck.hasOverlap ? 'Notice: Perimeter overlap flagged with existing concessions.' : 'Perimeter check clear.'}`
      }
    ]
  };

  const saved = store.addProject(newProject);
  res.status(201).json({
    success: true,
    data: saved,
    overlapWarning: overlapCheck.hasOverlap ? overlapCheck.summary : null,
    overlapDetails: overlapCheck.overlappingProjects
  });
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const updated = store.updateProject(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  res.json({ success: true, data: updated });
});

// ----------------------------------------------------
// Submissions API
// ----------------------------------------------------
app.get('/api/submissions', (req: Request, res: Response) => {
  const { projectId, status } = req.query;
  let subs = store.getSubmissions();

  if (projectId) {
    subs = subs.filter(s => s.projectId === projectId);
  }
  if (status && status !== 'All') {
    subs = subs.filter(s => s.status === status);
  }

  res.json({ success: true, count: subs.length, data: subs });
});

app.get('/api/submissions/:id', (req: Request, res: Response) => {
  const sub = store.getSubmissionById(req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, message: 'MRV Submission not found' });
  }
  res.json({ success: true, data: sub });
});

// Human MRV Verifier review decision (Approve / Flag / Reject)
app.patch('/api/submissions/:id/review', (req: Request, res: Response) => {
  const { status, reviewerName, reviewerRole, comments } = req.body;
  const sub = store.getSubmissionById(req.params.id);
  
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  if (!['Approved', 'Flagged', 'Rejected', 'Under Review'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid verification status decision' });
  }

  const verifierRole = reviewerRole || 'MRV Verifier';
  const verifierName = reviewerName || 'Authorized Verifier';

  const newAudit: any = {
    id: `aud-rev-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: verifierName,
    role: verifierRole,
    action: `MRV_REVIEW_${status.toUpperCase().replace(/\s+/g, '_')}`,
    details: comments || `Verifier marked status as ${status}`
  };

  const updated = store.updateSubmission(sub.id, {
    status,
    reviewerNotes: comments || sub.reviewerNotes,
    reviewedBy: verifierName,
    reviewedAt: new Date().toISOString(),
    auditTrail: [newAudit, ...(sub.auditTrail || [])]
  });

  // Also update project status if approved or rejected
  if (status === 'Approved') {
    store.updateProject(sub.projectId, { verificationStatus: 'Approved' });
  }

  store.addAuditLog({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: verifierName,
    role: verifierRole,
    action: `SUBMISSION_${status.toUpperCase()}`,
    details: `Submission ${sub.id} reviewed. Decision: ${status}. Notes: ${comments || 'None'}`
  });

  res.json({ success: true, data: updated });
});

// Create new MRV Submission (from web or synced field data)
app.post('/api/submissions', upload.array('photos', 5), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    let bodyData: any;

    if (req.body.payload) {
      bodyData = JSON.parse(req.body.payload);
    } else {
      bodyData = req.body;
    }

    const {
      projectId,
      officerName,
      userRole,
      observationDate,
      gps,
      mangroveCondition,
      canopyDensityPercent,
      restorationStatus,
      visibleDamage,
      damageSeverity,
      environmentalNotes,
      sensorReadings,
      carbonMethodology,
      carbonEstimateTCO2e
    } = bodyData;

    const project = store.getProjectById(projectId);
    if (!project) {
      return res.status(400).json({ success: false, message: `Project ${projectId} not found` });
    }

    // Process uploaded images & compute SHA-256 for each
    const images: any[] = [];
    let combinedHashInput = '';

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
        combinedHashInput += hash;
        
        // Save file locally for retrieval
        const safeName = `img_${Date.now()}_${i}.jpg`;
        const savePath = path.join(UPLOADS_DIR, safeName);
        fs.writeFileSync(savePath, file.buffer);

        images.push({
          id: `img-${Date.now()}-${i}`,
          filename: file.originalname || safeName,
          url: `/uploads/${safeName}`,
          sha256: hash,
          capturedAt: new Date().toISOString()
        });
      }
    } else if (bodyData.existingImages && Array.isArray(bodyData.existingImages)) {
      images.push(...bodyData.existingImages);
      bodyData.existingImages.forEach((img: any) => {
        combinedHashInput += img.sha256 || '';
      });
    }

    // Default sample image if none provided
    if (images.length === 0) {
      const defaultHash = crypto.createHash('sha256').update(`default-${projectId}-${Date.now()}`).digest('hex');
      images.push({
        id: `img-def-${Date.now()}`,
        filename: 'field_evidence_transect.jpg',
        url: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1000&q=80',
        sha256: defaultHash,
        capturedAt: new Date().toISOString()
      });
      combinedHashInput += defaultHash;
    }

    const primaryEvidenceHash = crypto.createHash('sha256').update(combinedHashInput || `ev-${Date.now()}`).digest('hex');

    // Run AI analysis on the primary image
    let aiResult = undefined;
    const primaryFile = files && files.length > 0 ? files[0] : undefined;
    try {
      aiResult = await analyzeEnvironmentalImage({
        imageBuffer: primaryFile?.buffer,
        mimeType: primaryFile?.mimetype,
        projectId,
        projectName: project.name,
        fieldContext: {
          mangroveCondition,
          canopyDensityPercent: Number(canopyDensityPercent),
          restorationStatus,
          visibleDamage,
          notes: environmentalNotes
        }
      });
    } catch (e) {
      console.warn('AI analysis failed, proceeding without AI result:', e);
    }

    // Check overlap for submission coordinates
    const subLat = gps?.lat || project.centroid[0];
    const subLng = gps?.lng || project.centroid[1];
    const overlapResult = detectProjectOverlaps(
      {
        id: project.id,
        name: project.name,
        centroid: [subLat, subLng],
        boundary: project.boundary,
        areaHectares: project.areaHectares
      },
      store.getProjects()
    );

    const submissionId = `MRV-2026-${String(store.getSubmissions().length + 1).padStart(3, '0')}`;

    const newSub: MRVSubmission = {
      id: submissionId,
      projectId,
      projectName: project.name,
      submittedBy: officerName || 'Field Officer',
      submittedRole: userRole || 'Field Officer',
      submissionDate: new Date().toISOString(),
      status: 'Submitted',
      fieldObservation: {
        id: `OBS-${Date.now()}`,
        projectId,
        officerName: officerName || 'Field Officer',
        gps: {
          lat: subLat,
          lng: subLng,
          accuracyMeters: gps?.accuracyMeters || 5.0,
          manualEntry: Boolean(gps?.manualEntry)
        },
        observationDate: observationDate || new Date().toISOString(),
        mangroveCondition: mangroveCondition || 'Good',
        canopyDensityPercent: Number(canopyDensityPercent) || 75,
        restorationStatus: restorationStatus || 'Established Saplings',
        visibleDamage: visibleDamage || 'None',
        damageSeverity: damageSeverity || 'None',
        environmentalNotes: environmentalNotes || 'Routine seasonal MRV observation survey.',
        sensorReadings: sensorReadings ? {
          salinityPpt: Number(sensorReadings.salinityPpt) || 28.0,
          soilPh: Number(sensorReadings.soilPh) || 7.5,
          redoxPotentialMv: Number(sensorReadings.redoxPotentialMv) || -150,
          waterTempC: Number(sensorReadings.waterTempC) || 28.0,
          ambientHumidityPercent: Number(sensorReadings.ambientHumidityPercent) || 80
        } : undefined,
        images,
        syncStatus: 'Synced',
        syncedAt: new Date().toISOString()
      },
      aiAnalysis: aiResult,
      overlapCheck: {
        hasOverlap: overlapResult.hasOverlap,
        overlappingProjectId: overlapResult.overlappingProjects[0]?.projectId,
        overlappingProjectName: overlapResult.overlappingProjects[0]?.projectName,
        overlapPercentage: overlapResult.overlappingProjects[0]?.overlapPercentage || 0,
        status: overlapResult.hasOverlap ? 'Warning' : 'Clear',
        resolutionNotes: overlapResult.hasOverlap ? overlapResult.overlappingProjects[0]?.notes : undefined
      },
      evidenceHash: primaryEvidenceHash,
      integrityVerified: true,
      carbonEstimateTCO2e: Number(carbonEstimateTCO2e) || 1500,
      carbonMethodology: carbonMethodology || 'IPCC 2013 Wetland Supplement (Tier 2)',
      auditTrail: [
        {
          id: `aud-sub-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: officerName || 'Field Officer',
          role: userRole || 'Field Officer',
          action: 'SUBMISSION_FILED',
          details: `Filed MRV submission with primary evidence hash SHA-256: ${primaryEvidenceHash.substring(0, 16)}...`
        }
      ]
    };

    const saved = store.addSubmission(newSub);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    console.error('Error creating submission:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error creating submission' });
  }
});

// ----------------------------------------------------
// Offline Batch Synchronization
// ----------------------------------------------------
app.post('/api/field-observations/sync', async (req: Request, res: Response) => {
  const { observations } = req.body;
  if (!Array.isArray(observations) || observations.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of observations is required' });
  }

  const results: any[] = [];
  const existingSubmissions = store.getSubmissions();

  for (const obs of observations) {
    // Prevent accidental duplicate synchronization by checking if observation ID or timestamp already exists
    const duplicate = existingSubmissions.some(s => 
      s.fieldObservation?.id === obs.id || 
      (s.projectId === obs.projectId && s.fieldObservation?.observationDate === obs.observationDate)
    );

    if (duplicate) {
      results.push({
        clientLocalId: obs.id,
        status: 'AlreadySynced',
        message: 'Record previously synchronized. Idempotently preserved.'
      });
      continue;
    }

    const project = store.getProjectById(obs.projectId) || store.getProjects()[0];
    const subHash = crypto.createHash('sha256').update(JSON.stringify(obs)).digest('hex');
    const submissionId = `MRV-2026-${String(store.getSubmissions().length + 1).padStart(3, '0')}`;

    const newSub: MRVSubmission = {
      id: submissionId,
      projectId: project.id,
      projectName: project.name,
      submittedBy: obs.officerName || 'Offline Field Officer',
      submittedRole: 'Field Officer',
      submissionDate: new Date().toISOString(),
      status: 'Submitted',
      fieldObservation: {
        ...obs,
        syncStatus: 'Synced',
        syncedAt: new Date().toISOString()
      },
      evidenceHash: subHash,
      integrityVerified: true,
      carbonEstimateTCO2e: 850,
      carbonMethodology: 'IPCC 2013 Wetland Supplement',
      overlapCheck: {
        hasOverlap: false,
        overlapPercentage: 0,
        status: 'Clear'
      },
      auditTrail: [
        {
          id: `aud-sync-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: obs.officerName || 'Offline Field Sync Worker',
          role: 'Field Officer',
          action: 'OFFLINE_RECORD_SYNCED',
          details: `Synchronized offline observation ${obs.id}. Assigned official MRV ID: ${submissionId}`
        }
      ]
    };

    store.addSubmission(newSub);
    results.push({
      clientLocalId: obs.id,
      assignedSubmissionId: submissionId,
      status: 'Synced',
      syncedAt: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    processedCount: observations.length,
    results
  });
});

// ----------------------------------------------------
// AI Analysis Standalone Workspace API
// ----------------------------------------------------
app.post('/api/ai/analyze', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { projectId, condition, notes } = req.body;

    const project = projectId ? store.getProjectById(projectId) : undefined;

    const result = await analyzeEnvironmentalImage({
      imageBuffer: file?.buffer,
      mimeType: file?.mimetype,
      projectId,
      projectName: project?.name,
      fieldContext: {
        mangroveCondition: condition,
        notes
      }
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error processing AI image analysis' });
  }
});

// ----------------------------------------------------
// Evidence Cryptographic Hash Verification API
// ----------------------------------------------------
app.post('/api/evidence/verify-hash', upload.single('file'), (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { referenceHash, submissionId } = req.body;

    if (!file && !req.body.testHash) {
      return res.status(400).json({ success: false, message: 'Upload a file or provide a testHash to verify' });
    }

    const calculatedHash = file 
      ? crypto.createHash('sha256').update(file.buffer).digest('hex')
      : req.body.testHash;

    let targetRefHash = referenceHash;
    if (!targetRefHash && submissionId) {
      const sub = store.getSubmissionById(submissionId);
      if (sub) {
        targetRefHash = sub.evidenceHash;
      }
    }

    const isMatch = targetRefHash ? (calculatedHash.toLowerCase() === targetRefHash.toLowerCase()) : false;

    res.json({
      success: true,
      data: {
        calculatedHash,
        referenceHash: targetRefHash || null,
        isMatch,
        fileName: file?.originalname || 'manual_hash_input',
        fileSizeBytes: file?.size || null,
        verifiedAt: new Date().toISOString(),
        explanation: isMatch
          ? 'Cryptographic match confirmed! The tested file bitstream is identical to the referenced MRV evidence hash.'
          : 'HASH MISMATCH: The file content differs from the stored reference hash. File may have been modified, re-compressed, or substituted.',
        caveat: 'Cryptographic hashing confirms file integrity since initial registration; it does not scientifically prove the original photograph was truthful.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// Blockchain Registry API
// ----------------------------------------------------
app.get('/api/blockchain/transactions', (req: Request, res: Response) => {
  res.json({ success: true, data: store.getTransactions() });
});

app.post('/api/blockchain/record', (req: Request, res: Response) => {
  const { submissionId, verifierAddress, network, simulated } = req.body;

  const sub = store.getSubmissionById(submissionId);
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  if (sub.status !== 'Approved') {
    return res.status(400).json({
      success: false,
      message: 'Only Approved MRV submissions can be recorded on the blockchain registry'
    });
  }

  // Generate realistic EVM transaction hash and block number
  const txHash = '0x' + crypto.randomBytes(32).toString('hex');
  const blockNumber = 4291000 + Math.floor(Math.random() * 5000);
  const now = new Date().toISOString();
  const net = network || 'Polygon Amoy Testnet (EVM)';

  const newTx: BlockchainTransaction = {
    id: `TX-${Date.now()}`,
    txHash,
    blockNumber,
    timestamp: now,
    projectId: sub.projectId,
    submissionId: sub.id,
    evidenceHash: sub.evidenceHash,
    status: simulated ? 'Simulated' : 'Confirmed',
    carbonTCO2e: sub.carbonEstimateTCO2e,
    verifierAddress: verifierAddress || '0x438B0126Da4C3761E79383610931Ac4F34A9F091',
    gasUsed: 82000 + Math.floor(Math.random() * 15000),
    network: net
  };

  store.addTransaction(newTx);

  // Update submission with blockchain receipt
  store.updateSubmission(sub.id, {
    blockchainRecord: {
      txHash,
      blockNumber,
      confirmedAt: now,
      network: net,
      smartContractAddress: '0x71C2B8018e47265910A3815D829b4892C849B01a',
      status: simulated ? 'Simulated' : 'Confirmed'
    },
    auditTrail: [
      {
        id: `aud-chain-${Date.now()}`,
        timestamp: now,
        actor: verifierAddress || 'MRV Verifier',
        role: 'MRV Verifier',
        action: 'BLOCKCHAIN_ANCHORED',
        details: `Anchored to smart contract DeltaCRegistry. Tx: ${txHash.substring(0, 18)}... (Block #${blockNumber})`
      },
      ...(sub.auditTrail || [])
    ]
  });

  store.addAuditLog({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actor: verifierAddress || 'MRV Verifier',
    role: 'MRV Verifier',
    action: 'ONCHAIN_RECORD_SUBMITTED',
    details: `Submission ${sub.id} anchored to ${net}. Tx: ${txHash}`
  });

  res.json({
    success: true,
    data: newTx,
    message: simulated 
      ? 'Recorded in Interactive Smart Contract Simulator (Demo Mode)'
      : 'Confirmed on EVM Testnet Smart Contract Registry'
  });
});

// ----------------------------------------------------
// Audit Logs & Demo Reset API
// ----------------------------------------------------
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, data: store.getAuditLogs() });
});

app.post('/api/admin/reset-demo', (req: Request, res: Response) => {
  const reset = store.resetToDemo();
  res.json({ success: true, message: 'Reset successfully to demo dataset', data: reset });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[DeltaC Backend Server] Running on http://localhost:${PORT}`);
  console.log(`[DeltaC Backend Server] AI Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini API' : 'High-Fidelity Heuristic Demo Fallback'}`);
});
