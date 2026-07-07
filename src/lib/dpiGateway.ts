import {
  CitizenProfile,
  TinDetails,
  TaxLedgerEntry,
  PrnRecord,
  EFilingSummary,
  CompanyRegistry,
  DrivingPermitDetails,
  VehicleDetails,
  InsuranceAlert,
  OwnershipTransferRecord,
  NssfAccount,
  PassportApplication,
  GatewayResponse,
  ActiveFile
} from '../types';

/**
 * Isolated Agency Database States (X-Road Emulation)
 * These exist in completely isolated state partitions to reflect multi-agency boundaries.
 */

// 1. NIRA (National Identification & Registration Authority) Legacy Node
let niraDb: CitizenProfile = {
  nin: 'CM89021105G12F',
  fullName: 'MUKASA SSEWANYANA',
  pin: '1962', // Independent Security PIN
  gender: 'MALE',
  dateOfBirth: '1989-10-12',
  nationality: 'UGANDAN',
  cardStatus: 'VERIFIED',
  isCardLocked: false,
  phoneNumber: '+256 772 345 678',
  address: 'Plot 45, Acacia Avenue, Kampala, Central',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
};

// 2. URA (Uganda Revenue Authority) Legacy Node
let uraTinDb: TinDetails = {
  tin: '1029 3847 5610',
  status: 'Active',
  lastVerified: 'Today, 08:42 AM'
};

let uraLedgerDb: TaxLedgerEntry[] = [
  { id: 'tx-01', category: 'Income Tax (PAYE)', period: 'Jul 2023 - Jun 2024', amount: 1250000, status: 'Cleared' },
  { id: 'tx-02', category: 'Local Service Tax', period: 'FY 2023/24', amount: 100000, status: 'Cleared' },
  { id: 'tx-03', category: 'Motor Vehicle Transfer', period: 'PRN: 293847192', amount: 85000, status: 'Pending', prn: '293847192' }
];

let uraPrnDb: PrnRecord[] = [
  {
    prn: 'UG-2023-8945-XYZ',
    amount: 250000,
    category: 'Passport Renewal',
    applicantName: 'MUKASA SSEWANYANA',
    status: 'PAID',
    generatedAt: '2023-10-09T14:30:00Z',
    expiryDate: '2023-11-09T14:30:00Z'
  }
];

let eFilingSummaryDb: EFilingSummary = {
  period: 'FY 2023/2024',
  dueDate: '2026-07-21', // Dynamic relative to the current mock date 2026-07-07
  status: 'Annual Individual Income Tax Return',
  daysRemaining: 14
};

// 3. URSB (Uganda Registration Services Bureau) Legacy Node
let ursbCompaniesDb: CompanyRegistry[] = [
  { id: 'co-01', name: 'Equatorial Tech Solutions Ltd', regNo: '8002001928374', status: 'ACTIVE', annualReturnStatus: 'Due', annualReturnDueDate: '15 Nov 2026', filedDate: '15 Nov 2025' },
  { id: 'co-02', name: 'Nile Agro-Processors Syndicate', regNo: '8002001928112', status: 'ACTIVE', annualReturnStatus: 'Compliant', filedDate: '02 Mar 2026 (For 2025)' }
];

let reservedNamesDb: string[] = ['KLA TECH HUB', 'ACACIA ROASTERS', 'SSEWANYANA & SONS'];

// 4. MoWT (Ministry of Works & Transport / UDLS) Legacy Node
let mowtPermitDb: DrivingPermitDetails = {
  permitNo: 'UG-DL-98765432',
  classes: ['B', 'A'],
  status: 'Active',
  expiryDate: '2026-11-15', // Relative to 2026-07-07
  expiresInDays: 142
};

let mowtVehiclesDb: VehicleDetails[] = [
  { id: 'vh-01', makeModel: 'Toyota Harrier (2018)', regNo: 'UBC 123X', syncStatus: true }
];

let insuranceAlertsDb: InsuranceAlert[] = [
  { vehicleId: 'vh-01', vehicleReg: 'UBC 123X', expiresInDays: 5, policyNo: 'MTP-89382103' }
];

let ownershipTransfersDb: OwnershipTransferRecord[] = [];

// 5. NSSF (National Social Security Fund) Legacy Node
let nssfAccountDb: NssfAccount = {
  totalBalance: 45230000,
  employeeContribution: 15076666,
  employerContribution: 30153334,
  claimStatus: 'NONE',
  monthlyContributions: [
    { month: 'Oct', amount: 450000 },
    { month: 'Nov', amount: 900000 },
    { month: 'Dec', amount: 850000 },
    { month: 'Jan', amount: 1200000 },
    { month: 'Feb', amount: 1100000 }
  ],
  recentAlerts: [
    { id: 'al-01', type: 'CONTRIBUTION_RECEIVED', title: 'Employer Contribution Received', description: 'Uganda Tech Corp deposited UGX 450,000 for January 2026.', date: '2 days ago' },
    { id: 'al-02', type: 'STATEMENT_READY', title: 'Annual Statement Ready', description: 'Your 2025/2026 NSSF statement is now available for download.', date: '1 week ago' }
  ]
};

// 6. DCIC (Directorate of Citizenship and Immigration Control - Passports) Legacy Node
let dcicPassportDb: PassportApplication = {
  applicationId: 'UG-772910-X',
  status: 'Under Review',
  expectedDate: '2026-10-24',
  queuePosition: 1204,
  pages: 48,
  feeStatus: 'PAID',
  appointmentDate: '2026-10-10 • 10:00 AM',
  timeline: [
    { step: 1, title: 'Application Submitted', description: 'Sept 12, 2025 • 09:45 AM', completed: true, active: false },
    { step: 2, title: 'Under Review', description: 'Your documents are being verified by the immigration officer.', timestamp: 'Verified: Fingerprints, Photo, NIN', completed: true, active: true },
    { step: 3, title: 'Printing', description: 'Final security features application.', completed: false, active: false },
    { step: 4, title: 'Ready for Collection', description: 'Passport Office, Port Bell Rd, Kampala.', completed: false, active: false }
  ]
};

// Citizen active files tracking list
let activeFilesDb: ActiveFile[] = [
  { id: 'af-01', title: 'Passport Renewal', agencyName: 'Internal Affairs', reference: 'UG-882910', status: 'Processing', updatedAt: '2 hours ago' },
  { id: 'af-02', title: 'Income Tax Return', agencyName: 'Uganda Revenue Authority', reference: 'FY 2025/26', status: 'Completed', updatedAt: 'Yesterday' }
];

/**
 * DPI Interoperability Gateway Adapter
 * Simulates Estonian X-Road service mapping with dynamic network states
 */
export const dpiGateway = {
  // Configurable dynamic properties
  latencyEnabled: true,
  offlineMode: false,

  // Helper to resolve latency
  async wait(): Promise<number> {
    if (this.offlineMode) {
      throw new Error('GATEWAY_OFFLINE: Could not connect to UgandaOne Interoperability Hub.');
    }
    const delay = this.latencyEnabled ? Math.floor(Math.random() * 400) + 400 : 50; // 400ms - 800ms
    await new Promise((resolve) => setTimeout(resolve, delay));
    return delay;
  },

  // Helper to sign JWT e-KYC Identity Token
  signNINToken(nin: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: nin,
        fullName: niraDb.fullName,
        iss: 'NIRA_SECURE_GATEWAY',
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
      })
    );
    const signature = 'X_UGANDAONE_HMAC_SIG_NIRA_APPROVED';
    return `jwt_${header}.${payload}.${signature}`;
  },

  // Verify the JWT is intact and valid
  verifyToken(token: string | null): boolean {
    if (!token) return false;
    return token.startsWith('jwt_') && token.includes('X_UGANDAONE_HMAC_SIG_NIRA_APPROVED');
  },

  /**
   * PILLAR 1: Foundational Identity (NIRA e-KYC Node)
   */
  async verifyNIN(nin: string, pin: string): Promise<GatewayResponse<{ token: string; profile: CitizenProfile }>> {
    const latency = await this.wait();
    
    // NIRA database search
    if (niraDb.nin.toUpperCase() !== nin.toUpperCase().replace(/\s/g, '')) {
      return {
        success: false,
        error: 'NIN_NOT_FOUND: The requested National Identification Number does not exist.',
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'NIRA_NODE'
      };
    }

    if (niraDb.pin !== pin) {
      return {
        success: false,
        error: 'INVALID_PIN: Secure PIN authorization failed.',
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'NIRA_NODE'
      };
    }

    if (niraDb.isCardLocked) {
      return {
        success: false,
        error: 'CARD_LOCKED: Digital Identity Card is suspended or locked. Unlock card first.',
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'NIRA_NODE'
      };
    }

    // Success e-KYC Verification returns Atomic ID Token (India Stack Strategy)
    const secureToken = this.signNINToken(niraDb.nin);
    return {
      success: true,
      data: {
        token: secureToken,
        profile: { ...niraDb }
      },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NIRA_NODE'
    };
  },

  async toggleIdentityLock(token: string): Promise<GatewayResponse<boolean>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NIRA_NODE' };
    }
    niraDb.isCardLocked = !niraDb.isCardLocked;
    return {
      success: true,
      data: niraDb.isCardLocked,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NIRA_NODE'
    };
  },

  /**
   * PILLAR 2: Revenue & Taxation (URA Node)
   * All calls require authorization via Atomic ID Token (representing the citizen)
   */
  async getTinDetails(token: string): Promise<GatewayResponse<TinDetails>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }
    return {
      success: true,
      data: { ...uraTinDb },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async getTaxLedger(token: string): Promise<GatewayResponse<TaxLedgerEntry[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }
    return {
      success: true,
      data: [...uraLedgerDb],
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async generatePRN(token: string, category: string, amount: number): Promise<GatewayResponse<PrnRecord>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    if (amount <= 0) {
      return { success: false, error: 'INVALID_AMOUNT: Assessment amount must be greater than zero.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    // Generate strict 11-digit PRN code starting with 1 or 2 (institutional format)
    const prefix = Math.random() > 0.5 ? '19' : '29';
    const randomBody = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 digits
    const prnCode = `UG-${prefix}${randomBody.substring(0, 4)}-${randomBody.substring(4)}`;

    const newRecord: PrnRecord = {
      prn: prnCode,
      amount,
      category,
      applicantName: niraDb.fullName,
      status: 'PENDING',
      generatedAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString() // 14 days expiry
    };

    uraPrnDb.unshift(newRecord);

    // Also append as pending to tax ledger for full tracking
    uraLedgerDb.push({
      id: `tx-${Date.now()}`,
      category,
      period: 'Instant Assessment',
      amount,
      status: 'Pending',
      prn: prnCode
    });

    return {
      success: true,
      data: newRecord,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async getPrnHistory(token: string): Promise<GatewayResponse<PrnRecord[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }
    return {
      success: true,
      data: [...uraPrnDb],
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async getEFilingSummary(token: string): Promise<GatewayResponse<EFilingSummary>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }
    return {
      success: true,
      data: { ...eFilingSummaryDb },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  /**
   * PILLAR 3: Transaction & Payment Flows (Secure Mobile Money Integration)
   */
  async verifyPRNForPayment(prn: string): Promise<GatewayResponse<PrnRecord>> {
    const latency = await this.wait();
    const record = uraPrnDb.find((p) => p.prn.replace(/\s/g, '').toUpperCase() === prn.replace(/\s/g, '').toUpperCase());
    
    if (!record) {
      return {
        success: false,
        error: 'PRN_NOT_FOUND: The specified PRN is invalid or expired.',
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    }

    return {
      success: true,
      data: { ...record },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async executeMobileMoneyPayment(
    prnCode: string,
    phoneNumber: string,
    provider: 'MTN' | 'AIRTEL'
  ): Promise<GatewayResponse<{ transactionId: string; record: PrnRecord }>> {
    const latency = await this.wait();
    
    const index = uraPrnDb.findIndex((p) => p.prn === prnCode);
    if (index === -1) {
      return {
        success: false,
        error: 'PRN_NOT_FOUND: Transaction payment target missing.',
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    }

    // Verify phone number pattern (standard Ugandan format +256 7XX XXX XXX or 07XX XXX XXX)
    const cleanedPhone = phoneNumber.replace(/\s/g, '');
    if (cleanedPhone.length < 9) {
      return {
        success: false,
        error: 'INVALID_PHONE_NUMBER: Please provide a valid Ugandan mobile money number.',
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    }

    // Update PRN Database
    uraPrnDb[index].status = 'PAID';
    
    // Update Tax Ledger
    const ledgerIndex = uraLedgerDb.findIndex((l) => l.prn === prnCode || (l.category === uraPrnDb[index].category && l.status === 'Pending'));
    if (ledgerIndex !== -1) {
      uraLedgerDb[ledgerIndex].status = 'Cleared';
    }

    // Propagate changes to relevant agency legacy nodes based on the payment workflow
    const paidCategory = uraPrnDb[index].category;
    if (paidCategory.includes('Passport')) {
      dcicPassportDb.status = 'Printing';
      dcicPassportDb.timeline[1].completed = true;
      dcicPassportDb.timeline[1].active = false;
      dcicPassportDb.timeline[2].completed = true;
      dcicPassportDb.timeline[2].active = true;
      
      const fileIndex = activeFilesDb.findIndex((f) => f.title.includes('Passport'));
      if (fileIndex !== -1) {
        activeFilesDb[fileIndex].status = 'Processing';
        activeFilesDb[fileIndex].updatedAt = 'Just Paid via Mobile Money';
      }
    } else if (paidCategory.includes('Permit') || paidCategory.includes('License')) {
      mowtPermitDb.status = 'Active';
      mowtPermitDb.expiresInDays = 1095; // 3 years extension
      mowtPermitDb.expiryDate = new Date(Date.now() + 1095 * 24 * 3600 * 1000).toISOString().substring(0, 10);
      insuranceAlertsDb = []; // Cleared action alert
    } else if (paidCategory.includes('Business') || paidCategory.includes('Company')) {
      const coIndex = ursbCompaniesDb.findIndex((c) => c.annualReturnStatus === 'Due');
      if (coIndex !== -1) {
        ursbCompaniesDb[coIndex].annualReturnStatus = 'Compliant';
        ursbCompaniesDb[coIndex].filedDate = `Today, via UgandaOne (${new Date().getFullYear()})`;
      }
    }

    const mtnId = 'TXN-MTN-' + Math.floor(10000000 + Math.random() * 90000000).toString();
    const airtelId = 'TXN-ART-' + Math.floor(10000000 + Math.random() * 90000000).toString();
    const txnId = provider === 'MTN' ? mtnId : airtelId;

    return {
      success: true,
      data: {
        transactionId: txnId,
        record: { ...uraPrnDb[index] }
      },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  /**
   * PILLAR 4: URSB Business Registries Node
   */
  async getMyCompanies(token: string): Promise<GatewayResponse<CompanyRegistry[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URSB_NODE' };
    }
    return {
      success: true,
      data: [...ursbCompaniesDb],
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URSB_NODE'
    };
  },

  async checkNameAvailability(name: string): Promise<GatewayResponse<{ available: boolean; name: string }>> {
    const latency = await this.wait();
    const sanitizedInput = name.trim().toUpperCase();
    
    if (!sanitizedInput) {
      return { success: false, error: 'INVALID_INPUT: Company name is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URSB_NODE' };
    }

    const alreadyTaken = reservedNamesDb.includes(sanitizedInput) || ursbCompaniesDb.some((c) => c.name.toUpperCase() === sanitizedInput);
    
    return {
      success: true,
      data: {
        available: !alreadyTaken,
        name: sanitizedInput
      },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URSB_NODE'
    };
  },

  async registerBusinessName(token: string, name: string): Promise<GatewayResponse<CompanyRegistry>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URSB_NODE' };
    }

    const sanitizedName = name.trim().toUpperCase();
    reservedNamesDb.push(sanitizedName);

    // Generate strict URSB registration index
    const randomId = Math.floor(8002000000000 + Math.random() * 999999999).toString();
    const newCompany: CompanyRegistry = {
      id: `co-${Date.now()}`,
      name: sanitizedName,
      regNo: randomId,
      status: 'PENDING',
      annualReturnStatus: 'Compliant',
      filedDate: 'Registered Today'
    };

    ursbCompaniesDb.unshift(newCompany);

    // Append to citizen tracking logs
    activeFilesDb.unshift({
      id: `af-${Date.now()}`,
      title: `URSB Business: ${sanitizedName}`,
      agencyName: 'URSB',
      reference: randomId,
      status: 'Pending',
      updatedAt: 'Submitted Today'
    });

    return {
      success: true,
      data: newCompany,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URSB_NODE'
    };
  },

  /**
   * Transport & Mobility Node (MoWT/UDLS)
   */
  async getDrivingPermit(token: string): Promise<GatewayResponse<DrivingPermitDetails>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }
    return {
      success: true,
      data: { ...mowtPermitDb },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'MoWT_NODE'
    };
  },

  async getRegisteredVehicles(token: string): Promise<GatewayResponse<VehicleDetails[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }
    return {
      success: true,
      data: [...mowtVehiclesDb],
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'MoWT_NODE'
    };
  },

  async getInsuranceAlerts(token: string): Promise<GatewayResponse<InsuranceAlert[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }
    return {
      success: true,
      data: [...insuranceAlertsDb],
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'MoWT_NODE'
    };
  },

  async initiateOwnershipTransfer(
    token: string,
    regNo: string,
    buyerName: string,
    buyerNin: string
  ): Promise<GatewayResponse<OwnershipTransferRecord>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }

    if (!regNo || !buyerName || !buyerNin) {
      return { success: false, error: 'INVALID_PARAMETERS: Vehicle Registration, Buyer Name, and Buyer NIN are required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }

    const newTransfer: OwnershipTransferRecord = {
      id: `tf-${Date.now()}`,
      vehicleReg: regNo.toUpperCase(),
      buyerName: buyerName.toUpperCase(),
      status: 'PENDING',
      initiatedAt: new Date().toISOString()
    };

    ownershipTransfersDb.unshift(newTransfer);

    // Track file
    activeFilesDb.unshift({
      id: `af-${Date.now()}`,
      title: `Ownership Transfer: ${regNo.toUpperCase()}`,
      agencyName: 'MoWT / URA',
      reference: newTransfer.id,
      status: 'Processing',
      updatedAt: 'Submitted Today'
    });

    return {
      success: true,
      data: newTransfer,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'MoWT_NODE'
    };
  },

  async getOwnershipTransfers(token: string): Promise<GatewayResponse<OwnershipTransferRecord[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }
    return {
      success: true,
      data: [...ownershipTransfersDb],
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'MoWT_NODE'
    };
  },

  /**
   * social security NSSF legacy node
   */
  async getNssfAccount(token: string): Promise<GatewayResponse<NssfAccount>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NSSF_NODE' };
    }
    return {
      success: true,
      data: { ...nssfAccountDb },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NSSF_NODE'
    };
  },

  async initiateNssfClaim(token: string, claimType: string): Promise<GatewayResponse<NssfAccount>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NSSF_NODE' };
    }

    nssfAccountDb.claimStatus = 'UNDER_REVIEW';
    nssfAccountDb.claimDetails = `Age Benefit Claim - Initiated Today (${claimType})`;
    
    nssfAccountDb.recentAlerts.unshift({
      id: `al-${Date.now()}`,
      type: 'ALERT',
      title: 'Claim Processing Underway',
      description: `Your Age Benefit claim (${claimType}) is being verified by NSSF Auditors.`,
      date: 'Just Now'
    });

    // Add file tracking
    activeFilesDb.unshift({
      id: `af-${Date.now()}`,
      title: `NSSF Benefit Claim`,
      agencyName: 'NSSF',
      reference: 'NSSF-CLM-0921',
      status: 'Processing',
      updatedAt: 'Initiated Today'
    });

    return {
      success: true,
      data: { ...nssfAccountDb },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NSSF_NODE'
    };
  },

  /**
   * passport applications (DCIC) legacy node
   */
  async getPassportApplication(token: string): Promise<GatewayResponse<PassportApplication>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'DCIC_NODE' };
    }
    return {
      success: true,
      data: { ...dcicPassportDb },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'DCIC_NODE'
    };
  },

  /**
   * general tracking files
   */
  async getActiveFiles(token: string): Promise<GatewayResponse<ActiveFile[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NIRA_NODE' };
    }
    return {
      success: true,
      data: [...activeFilesDb],
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NIRA_NODE'
    };
  }
};
