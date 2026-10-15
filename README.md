# DeltaC — AI-Powered Blockchain-Based Blue Carbon MRV & Registry System

> **Product Development Lab / Hackathon Prototype**  
> An enterprise-grade environmental intelligence platform for Monitoring, Reporting, Verification (MRV) and transparent tamper-evident registry tracking of coastal blue carbon ecosystems (mangroves, seagrasses, salt marshes).

---

## 🌊 Overview & Core Capabilities

DeltaC addresses the critical integrity, transparency, and double-counting challenges in coastal blue carbon restoration projects. The platform combines:

1. **AI-Assisted Environmental Diagnostics**: Multimodal Google Gemini API image analysis to inspect canopy closure, visible defoliation, pneumatophore root expansion, and discrepancy detection against field officer reports.
2. **Offline-First Field Data Collection**: Mobile-responsive surveyor interface with browser GPS auto-capture, client-side SHA-256 photographic hashing, and HTML5 IndexedDB storage with automatic background synchronization.
3. **Geographic Duplicate-Claim Detection**: Geospatial polygon and bounding-box intersection algorithms that flag overlapping coastal concession claims before crediting.
4. **Tamper-Evident EVM Blockchain Registry**: Production Solidity smart contract (`DeltaCRegistry.sol`) recording verified MRV attestations, cryptographic evidence digests, and immutable auditor actions.
5. **Defensible Carbon Estimation Engine**: Transparent formula-driven quantification based on peer-reviewed **IPCC 2013 Wetland Supplement (Tier 2)** and **CDM AR-AM0014** methodologies, complete with strict "Insufficient Data" gates.
6. **Multi-Evidence MRV Auditing**: Role-based verification workflow allowing accredited auditors to inspect field logs, AI diagnostics, IoT water quality telemetry, and cryptographic proofs before on-chain certification.
7. **Compliance Dossiers & CSV Analytics**: Audit-grade printable reports, CSV exports, and immutable event tracking.

---

## 👥 Role-Based Access Control (RBAC)

DeltaC implements four distinct user roles, testable via the interactive **Demo Role Switcher** in the top navigation bar:

| Role | Core Permissions | Key Workflow Actions |
|---|---|---|
| **Administrator** | Full platform governance & audits | Manage system configuration, deploy contracts, reset baseline datasets, view system audit logs |
| **Field Officer** | Data collection & offline queue | Capture GPS coordinates, record transect condition, upload photographs, manage IndexedDB sync queue |
| **MRV Verifier** | Evidence inspection & certification | Audit field telemetry vs AI diagnostics, flag boundary overlaps, approve/reject submissions, anchor on blockchain |
| **Project Owner** | Concession registration & tracking | Register new blue carbon restoration projects, view carbon estimation models, download compliance dossiers |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet, Lucide Icons, WebCrypto API
- **Offline Storage**: HTML5 IndexedDB (`DeltaCOfflineDB`) with `localStorage` fallback
- **Backend API**: Node.js, Express, TypeScript, Multer, Crypto
- **AI Diagnostics**: Google Gemini 1.5 Flash (via `@google/generative-ai`) with high-fidelity Heuristic Environmental Vision Engine fallback
- **Smart Contracts**: Solidity 0.8.20, Hardhat, ethers.js v6, EVM testnet deployment configuration (Polygon Amoy / Sepolia)

---

## 🚀 Quickstart & Running Locally

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v10+

### 1. Installation

Install dependencies across the client and server:

```bash
# Install root orchestrator dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 2. Environment Configuration (Optional)

Create or edit `server/.env`:

```env
PORT=5000

# Google Gemini API Key for live AI environmental analysis
# If left blank, DeltaC automatically runs in labeled Demo Mode
GEMINI_API_KEY=your_gemini_api_key_here

# EVM Testnet RPC
RPC_URL=https://rpc-amoy.polygon.technology
```

### 3. Launching the Development Servers

Run both backend API and Vite client concurrently:

```bash
# From workspace root:
npm run dev

# Or launch independently in two terminals:
# Terminal 1: Backend API (port 5000)
cd server && npm run dev

# Terminal 2: Frontend Dashboard (port 5173)
cd client && npm run dev
```

Open your browser to: **`http://localhost:5173`**

---

## 📜 Smart Contract Architecture (`DeltaCRegistry.sol`)

The `DeltaCRegistry` smart contract deployed to EVM testnets maintains tamper-evident records:

- `registerProject(...)`: Records project ID, name, ecosystem type, area in hectares, and SHA-256 metadata hash.
- `recordMRVVerification(...)`: Anchors verified submission ID, project ID, evidence SHA-256 hash, AI diagnostic hash, certified carbon tCO2e, and verifier address.
- `verifyEvidenceHash(...)`: On-chain cryptographic hash verification matching an uploaded file digest against the immutable record.
- `onlyVerifier` / `onlyAdmin`: Access-controlled modifier preventing unauthorized claims.

To compile or test the contract locally with Hardhat:
```bash
cd contracts
npx hardhat compile
npx hardhat test
```

---

## 🔬 Scientific Carbon Calculation Methodology

DeltaC uses standard IPCC Tier 2 formulas for estuarine and tidal mangroves:

$$\Delta C_{\text{total}} = \left( \Delta C_{\text{biomass}} + \Delta C_{\text{soil}} + \Delta C_{\text{avoided}} \right) \times \left(\frac{44}{12}\right)$$

Where:
- $\Delta C_{\text{biomass}} = \text{AGB increment} \times (1 + \text{Root-to-Shoot ratio}) \times \text{Carbon fraction (0.47)}$
- $\Delta C_{\text{soil}} = \text{Soil Organic Carbon (SOC) accumulation rate (t C/ha/yr)}$
- Stoichiometric factor $\frac{44}{12} \approx 3.667$ converts elemental Carbon to $\text{CO}_2\text{e}$.

> **Scientific Integrity Rule:** If mandatory area or verified sediment core metrics are missing, the system outputs:  
> **"Insufficient data for a defensible estimate"** instead of generating fictitious credits.

---

## ⚖️ Demonstrational & Scientific Disclaimers

1. **Sample & Demo Data**: All baseline project concessions (Sundarbans, Kilifi Creek, Pichavaram, Urabá) and numeric figures are realistic sample data created for evaluation.
2. **AI Advisory Role**: AI image observations assist MRV verifiers by identifying optical features and discrepancies; AI does not directly measure subterranean biomass or certify legal credits.
3. **Blockchain Attestation**: Smart contract records prove audit integrity and timestamped existence; they do not constitute officially tradeable carbon credits unless certified by an accredited registry authority (e.g. Verra, Gold Standard).
4. **Evidence Hashing**: SHA-256 cryptographic hashing detects any modification to a referenced digital asset; it cannot verify whether the physical real-world sensor reading or photograph was truthful.
