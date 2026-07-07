# 🇺🇬 UgandaOne: Unified Digital Public Infrastructure (DPI) Citizen Portal

UgandaOne is an enterprise-grade, highly polished, unified **Digital Public Infrastructure (DPI)** citizen portal for the Republic of Uganda. Inspired by gold-standard digital government models such as **Estonia's X-Road** and **Singapore's Singpass / LifeSG**, UgandaOne consolidates disjointed legacy state agency systems into a sovereign, secure, and intuitive single-window citizen gateway.

Rather than acting as a simple directory, the platform simulates a secure, federated interoperability layer that connects independent legacy agency nodes, orchestrates cross-agency life-journey workflows, provides cryptographic e-KYC authentication, and integrates decentralized mobile payment rails.

---

## 🏛️ Architectural Inspiration & Core Philosophy

In traditional public service delivery, citizens are forced to navigate siloed government ministries, repeat biometric and identification verification steps, and manage disconnected payment receipts. UgandaOne remedies this by implementing a federated, event-driven design:

1. **Sovereign Node Isolation (X-Road Emulation)**: 
   - Following Estonia's decentralized schema, individual agency databases (NIRA, URA, URSB, MoWT, NSSF, DCIC) are simulated as strictly partitioned, independent legacy data stores. 
   - They share no common database schema. Cross-agency data sharing is conducted solely via a secure simulated gateway representing a zero-trust RPC network.
2. **Unified Life-Journey Workflows (Singpass/LifeSG Model)**:
   - Services are grouped not by bureaucracy, but by real-world citizen milestone triggers (e.g., launching a business, purchasing a vehicle, renewing documents). 
   - One multi-step workflow securely query-pipes inputs to multiple nodes sequentially.
3. **Resilient Local-First Design**:
   - Built to operate gracefully in bandwidth-constrained, offline-prone rural and carrier-throttled environments across Uganda.

---

## 🌟 Core Pillars & Federated Agency Nodes

UgandaOne integrates six simulated sovereign agency endpoints, accessible through individual portals or cross-agency journeys:

### 1. 🪪 NIRA Node (National Identification & Registration Authority)
* **Function**: Foundational Identity and Biometric verification.
* **Technicalities**:
  * Acts as the e-KYC foundational source of truth.
  * Validates National Identification Numbers (NIN) against secure PINs.
  * Signs a stateful JWT e-KYC token (`X_UGANDAONE_HMAC_SIG_NIRA_APPROVED`) representing a cryptographically verified credential.
  * Enables digital credential locking—instantly halting downstream agency requests if a card is reported compromised.

### 2. 🧾 URA Node (Uganda Revenue Authority)
* **Function**: Tax liability verification, e-TIN management, and payment registration.
* **Technicalities**:
  * Tracks individual e-TIN tax ledger entries (PAYE, local service tax, motor vehicle transfer fees).
  * Automatically issues dynamic Payment Registration Numbers (PRNs) for services.
  * Tracks and computes dynamic deadlines (e.g., Annual Individual Income Tax Returns).

### 3. 💼 URSB Node (Uganda Registration Services Bureau)
* **Function**: Corporate registration and commercial compliance.
* **Technicalities**:
  * Performs instant commercial brand-name availability checks.
  * Tracks and displays live corporate registries with compliant, due, or overdue annual return status flags.
  * Simulates direct company registration pipelines with state tracking.

### 4. 🚗 MoWT Node (Ministry of Works & Transport / UDLS)
* **Function**: Driver licensing and motor vehicle asset verification.
* **Technicalities**:
  * Integrates driving permit status, classifications (e.g., Class A, B), and expiration countdowns.
  * Tracks vehicle registrations (e.g., Toyota Harrier reg `UBC 123X`) with third-party insurance warnings.
  * Hosts an interactive vehicle ownership transfer engine, executing peer-to-peer verification.

### 5. 💰 NSSF Node (National Social Security Fund)
* **Function**: Social security contribution savings tracking and claims management.
* **Technicalities**:
  * Displays total balances, broken down into employee and employer contributions.
  * Simulates live contribution alert streams (e.g., Uganda Tech Corp deposits).
  * Evaluates claims eligibility using smart validation rulesets.

### 6. 🛂 DCIC Node (Directorate of Citizenship & Immigration Control)
* **Function**: Electronic passport application and tracking.
* **Technicalities**:
  * Exposes interactive, step-by-step passport renewal applications (32 vs 48 pages).
  * Generates real-time, step-by-step progress timelines (Application Submitted → Under Review → Printing → Collection).
  * Calculates approximate queue positions and appointment verification milestones.

---

## ⚙️ Technical Deep Dive: How It Works Under the Hood

### 🔒 e-KYC & Cryptographic Handshake Emulation
When a citizen logs in, UgandaOne initiates a zero-trust login sequence simulating decentralized identity providers. 
1. The client triggers a multi-step **SIM-Bound Secure Handshake** sequence displaying out-of-band multi-factor authentication stages:
   * **Stage 1**: Initiating decentralized Zero-Knowledge authentication challenge.
   * **Stage 2**: Sending secure out-of-band SIM push notification to registered device (`+256 772 345 678`).
   * **Stage 3**: Waiting for citizen biometric confirmation or swipe on the hardware module.
   * **Stage 4**: Exchanging short-lived scoped cryptographic keys via ECDH-P256.
   * **Stage 5**: Cryptographic signature validation & issuing secure session token.
2. The client then completes the login with `dpiGateway.verifyNIN()`.
3. Upon successful authentication, the node issues a JWT-like signed state token using HMAC emulation:
   ```typescript
   // Emulation of e-KYC crypto signature
   signNINToken(nin: string): string {
     const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
     const payload = btoa(JSON.stringify({
       sub: nin,
       fullName: 'MUKASA SSEWANYANA',
       iss: 'NIRA_SECURE_GATEWAY',
       exp: Math.floor(Date.now() / 1000) + 3600
     }));
     const signature = 'X_UGANDAONE_HMAC_SIG_NIRA_APPROVED';
     return `jwt_${header}.${payload}.${signature}`;
   }
   ```
4. Downstream portals use this token's header validation to authorize cross-agency ledger reads. If the user activates **Identity Lock**, NIRA flags the credential, invalidating downstream queries instantly and demonstrating federated access revocation.

### 🛡️ Estonia Transparency Model & Real-time Audit Logging
Inspired by Estonia's citizen-centric transparency principles, UgandaOne implements an active, real-time decentralized transaction ledger tracking every single data access request:
- **Traceable Ledger**: Every query made by government administrators, third-party services, or the citizen themselves is cryptographically logged with a unique transaction ID (e.g., `TX-100412`), timestamp, active node indicator, actor, action, and access status.
- **Node-Level Filtering**: Citizens can drill down into log history by individual agency nodes (NIRA, URA, URSB, MoWT, NSSF, DCIC) directly within their NIRA Identity portal.
- **Visual Accountability**: The audit trail exposes the exact *Scope of Transmitted Payload*, highlighting compliance with **Data Minimization (Zero-Knowledge Proof)** guidelines (such as verifying age/citizenship thresholds without transmitting complete dossiers).

### ⚡ Zero-Trust Cross-Agency Gatekeeping
Cross-agency workflows enforce rigorous decentralized verification before retrieving sensitive profiles or issuing corporate licenses:
- **Drivers' Licensing Gates**: Before retrieving or renewing driving permit data from the Ministry of Works & Transport (MoWT), the platform performs an upstream Zero-Knowledge check (`verifyAgeAndCitizenship`) against the NIRA foundational node. The request is aborted if criteria are not met or if the National ID is locked.
- **Instant TIN Registration Gates**: Before URA registers a corporate tax identification number, an upstream query verifying tax standing compliance (`verifyTaxCompliance`) is issued. Handshakes are strictly gatekept via ECDH key exchanges to prevent tax spoofing or identity theft.

### 🔌 The DPI Sandbox & Resiliency Console
UgandaOne features an embedded **DPI Developer & Sandbox Console** to let engineers test the platform under realistic African network infrastructure conditions:

* **Simulated Network Latency (Estonia X-Road routing)**:
  * When enabled, the gateway forces asynchronous execution delays of **400ms to 800ms** on every RPC.
  * This simulates multiple federated hop handshakes (e.g., verifying NIN at NIRA, checking tax standing at URA, confirming corporate filing at URSB) over cellular networks.
  * The frontend displays skeletons and loading spinners, proving UI performance under heavy latency conditions.
* **Carrier Offline Simulator**:
  * Toggles the gateway into an offline mode, simulating dropouts.
  * The application displays warning banners and engages local caches for read-only safety, testing the resiliency of state-machine queries.

### 🔗 Orchestrated Life-Journey & Cross-Agency "Life Event" Pipelines

To prevent citizens from making multiple physical trips, UgandaOne hosts complex multi-agency pipelines under a **Workflows** panel, utilizing strict state machines, stateless tokens (`X-UgandaOne-NIN-Token`), and ARIA-compliant steppers (`ComponentStepper`):

1. **New Child Registration Workflow (`NewBornEventWizard`)**:
   * *Step 1 (MoH Facility)*: Parent is notified of incoming cryptographic live-birth hospital payload.
   * *Step 2 (NIRA)*: Birth is registered to generate a new NIN and birth certificate.
   * *Step 3 (MoH)*: Initialize infant Electronic Immunization Record & childhood vaccine schedules.
   * *Step 4 (NSSF)*: Flags parental benefits eligibility based on employer records.
2. **Marriage & Legal Status Sync Workflow (`MaritalStatusSync`)**:
   * *Step 1 (NIRA)*: Submits civil marriage certificate and verifies marital status. Updates legal name.
   * *Step 2 (Internal Affairs)*: Passport profile updated and reprint queued.
   * *Step 3 (UDLS)*: Driving permit registry updated under the new legal name.
   * *Step 4 (URA)*: Tax directories flagged for optional joint returns & marital exemptions.
3. **Retirement & Pension Transition Workflow (`RetirementOnboarding`)**:
   * *Step 1 (NIRA)*: Profile age matched to retirement threshold (60 years) to trigger Senior Citizen status.
   * *Step 2 (NSSF)*: Aggregates contributions, generating active pension claim file & monthly payouts.
   * *Step 3 (MoH)*: Registers profile for senior citizen healthcare subsidies.
4. **Residence Relocation Sync Workflow (`AddressRelocationSync`)**:
   * *Step 1 (Umeme)*: Synchronizes electricity billing address & adjusts grid zone tariffs.
   * *Step 2 (NWSC)*: Coordinates water utility ledger matching the new plot location.
   * *Step 3 (Local Government)*: Notifies local District/Municipal Council to recalibrate local business licenses & property tax rates.

> [!IMPORTANT]
> **Transactional Rollback Policy**: To maintain registry consistency, all life event pipelines implement transactional rollbacks powered by React `useReducer` state machines. If any intermediate hop fails (e.g., NWSC rejects address or MoH gateway is offline), preceding steps are automatically revoked and reverted cleanly across all involved state endpoints, logged via live diagnostic consoles.

1. **Business Setup Journey**:
   * *Step 1 (URSB)*: Verifies and reserves business name.
   * *Step 2 (URA)*: Issues e-TIN matching the new commercial registry.
   * *Step 3 (NSSF)*: Automatically provisions corporate NSSF contribution slots.
2. **Passport Renewal Journey**:
   * *Step 1 (NIRA)*: Fetches secure e-KYC credentials.
   * *Step 2 (URA)*: Generates PRN (Payment Registration Number) for fee payment.
   * *Step 3 (DCIC)*: Book fingerprints and schedule biometric printing slots.
3. **Vehicle Purchase Journey**:
   * *Step 1 (NIRA)*: Interoperable check of buyer and seller NINs.
   * *Step 2 (URA)*: Audits motor vehicle tax liability standing.
   * *Step 3 (MoWT)*: Dispatches transfer requests to the Ministry of Works registry.

### 📱 Mobile Money Payment Orchestration (MTN & Airtel)
Since debit and credit card penetration remains low across East Africa, UgandaOne includes a built-in checkout wrapper mimicking standard mobile money APIs:
* Triggered automatically whenever a PRN payment is generated.
* Emulates push notification requests (USSD prompts) on the citizen's mobile device.
* Simulates two-factor security OTPs.
* Upon completion, immediately updates the digital tax ledger state across corresponding nodes.

---

## 🛠️ Codebase Structure

The codebase is engineered with strict modularity to manage token limits and maintain pristine type integrity:

```bash
/src
├── App.tsx                    # Main layout, router, shell navigation, and core layout.
├── types.ts                   # Strict TypeScript type definitions for all agency schemas.
├── main.tsx                   # Primary entry point.
├── index.css                  # Tailwinds CSS stylesheet and layout presets.
├── context/
│   └── IdentityContext.tsx    # Global state management for login tokens, profiles, and console controls.
├── lib/
│   ├── utils.ts               # Optional utility library.
│   └── dpiGateway.ts          # Core DPI Interoperability Adapter containing isolated agency DB states.
└── components/
    ├── CitizenHome.tsx        # High-density citizen overview with key-value digital wallet and cards.
    ├── LoginScreen.tsx        # National login screen featuring secure PIN entry.
    ├── NiraPortal.tsx         # National Identification interface (biometrics, locking, NIN).
    ├── UraTaxPortal.tsx       # Revenue Authority interface (TIN, ledger, e-filing returns).
    ├── UrsbBusinessPortal.tsx # Business registry interface (registries, name reservation wizard).
    ├── NssfPortal.tsx         # Social Security interface (contribution analytics, claims engine).
    ├── TransportPortal.tsx    # Ministry of Works interface (permits, vehicle transfer).
    ├── WorkflowsView.tsx      # Comprehensive life-journey wizards (Business, Passport, Car purchase).
    ├── MobileMoneyCheckout.tsx# Complete Mobile Money API checkout flow simulation.
    ├── SkeletonLoader.tsx     # Custom loader state for simulated latency.
    └── StatusBadge.tsx        # Resilient badges supporting multiple states.
```

---

## 🎨 Design System & Aesthetic Choices

UgandaOne rejects generic template aesthetics in favor of a customized, high-contrast, professional government design system:

* **Typography**: Clean display headings using modern sans-serif fonts, paired with monospaced accents (`JetBrains Mono` / `Fira Code`) for transaction IDs, tax PINs, registration codes, and latency logs.
* **Color Palette**: Sophisticated, high-contrast palette featuring subtle Ugandan flag accents:
  * Primary: Soft slate-colored off-whites and dark charcoal grays.
  * Accents: Classic gold (`#fdcc00`) and deep crimson accents (`#ba1a1a`).
* **Visual Rhythm**: Generous, balanced padding (`padding: 1.5rem`), clear dividers, and smooth micro-animations powered by `motion` for screen entry and checkout overlays. No unnecessary clutter or unrequested decorations.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm

### Installation
1. Install base dependencies:
   ```bash
   npm install
   ```

2. Run the local Vite development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

---

*UgandaOne - Securing and Accelerating the Digital Journey of Every Ugandan Citizen.*
