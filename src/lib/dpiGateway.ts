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
  ActiveFile,
  PaymentReceipt
} from '../types';

/**
 * Estonia X-Road Model: Isolated Legacy Node Services
 * Strictly isolated memory structures, representing autonomous agency databases
 * with independent memory states and security constraints.
 */

const sentReceiptsDb: PaymentReceipt[] = [];

class NiraNodeService {
  private niraDb: CitizenProfile = {
    nin: 'CM89021105G12F',
    fullName: 'MUKASA SSEWANYANA',
    pin: '1962', // Independent Security PIN
    gender: 'MALE',
    dateOfBirth: '1989-10-12',
    nationality: 'UGANDAN',
    cardStatus: 'VERIFIED',
    isCardLocked: false,
    phoneNumber: '+256 772 345 678',
    email: 'mpangabenard2584@gmail.com',
    address: 'Plot 45, Acacia Avenue, Kampala, Central',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  };

  getProfile(tokenVerified: boolean): CitizenProfile {
    if (!tokenVerified) throw new Error('UNAUTHORIZED: Access to NIRA registry denied.');
    // Strip sensitive fields (biometric PIN) before passing to any consumer
    const { pin, ...stripped } = this.niraDb;
    return stripped as CitizenProfile;
  }

  isLocked(): boolean {
    return this.niraDb.isCardLocked;
  }

  toggleLock(): boolean {
    this.niraDb.isCardLocked = !this.niraDb.isCardLocked;
    return this.niraDb.isCardLocked;
  }

  verifyPin(nin: string, pin: string): boolean {
    if (this.niraDb.nin.toUpperCase() !== nin.toUpperCase().replace(/\s/g, '')) {
      throw new Error('NIN_NOT_FOUND: NIN profile is not registered in the civil ledger.');
    }
    if (this.niraDb.isCardLocked) {
      throw new Error('CARD_LOCKED: e-KYC query blocked. Account is frozen.');
    }
    return this.niraDb.pin === pin;
  }
}

class UraNodeService {
  private tinDetails: TinDetails = {
    tin: '1029 3847 5610',
    status: 'Active',
    lastVerified: 'Today, 08:42 AM'
  };

  private ledger: TaxLedgerEntry[] = [
    { id: 'tx-01', category: 'Income Tax (PAYE)', period: 'Jul 2023 - Jun 2024', amount: 1250000, status: 'Cleared' },
    { id: 'tx-02', category: 'Local Service Tax', period: 'FY 2023/24', amount: 100000, status: 'Cleared' },
    { id: 'tx-03', category: 'Motor Vehicle Transfer', period: 'PRN: 293847192', amount: 85000, status: 'Pending', prn: '293847192' }
  ];

  private prns: PrnRecord[] = [
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

  private eFiling: EFilingSummary = {
    period: 'FY 2023/2024',
    dueDate: '2026-07-21',
    status: 'Annual Individual Income Tax Return',
    daysRemaining: 14
  };

  getTin() {
    return { ...this.tinDetails };
  }

  getLedger() {
    return [...this.ledger];
  }

  getPrns() {
    return [...this.prns];
  }

  getEFiling() {
    return { ...this.eFiling };
  }

  generatePRN(category: string, amount: number, fullName: string): PrnRecord {
    const prefix = Math.random() > 0.5 ? '19' : '29';
    const randomBody = Math.floor(100000000 + Math.random() * 900000000).toString();
    const prnCode = `UG-${prefix}${randomBody.substring(0, 4)}-${randomBody.substring(4)}`;

    const newRecord: PrnRecord = {
      prn: prnCode,
      amount,
      category,
      applicantName: fullName,
      status: 'PENDING',
      generatedAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
    };

    this.prns.unshift(newRecord);

    this.ledger.push({
      id: `tx-${Date.now()}`,
      category,
      period: 'Instant Assessment',
      amount,
      status: 'Pending',
      prn: prnCode
    });

    return newRecord;
  }

  verifyPRN(prn: string): PrnRecord | null {
    const record = this.prns.find((p) => p.prn.replace(/\s/g, '').toUpperCase() === prn.replace(/\s/g, '').toUpperCase());
    return record ? { ...record } : null;
  }

  markPrnPaid(prnCode: string): PrnRecord {
    const index = this.prns.findIndex((p) => p.prn === prnCode);
    if (index === -1) throw new Error('PRN_NOT_FOUND: Record not found.');

    this.prns[index].status = 'PAID';

    const ledgerIndex = this.ledger.findIndex((l) => l.prn === prnCode || (l.category === this.prns[index].category && l.status === 'Pending'));
    if (ledgerIndex !== -1) {
      this.ledger[ledgerIndex].status = 'Cleared';
    }

    return { ...this.prns[index] };
  }
}

class UrsbNodeService {
  private companies: CompanyRegistry[] = [
    { id: 'co-01', name: 'Equatorial Tech Solutions Ltd', regNo: '8002001928374', status: 'ACTIVE', annualReturnStatus: 'Due', annualReturnDueDate: '15 Nov 2026', filedDate: '15 Nov 2025' },
    { id: 'co-02', name: 'Nile Agro-Processors Syndicate', regNo: '8002001928112', status: 'ACTIVE', annualReturnStatus: 'Compliant', filedDate: '02 Mar 2026 (For 2025)' }
  ];

  private reservedNames: string[] = ['KLA TECH HUB', 'ACACIA ROASTERS', 'SSEWANYANA & SONS'];

  getCompanies() {
    return [...this.companies];
  }

  checkName(name: string): boolean {
    const san = name.trim().toUpperCase();
    return !this.reservedNames.includes(san) && !this.companies.some((c) => c.name.toUpperCase() === san);
  }

  registerBusiness(name: string): CompanyRegistry {
    const san = name.trim().toUpperCase();
    this.reservedNames.push(san);

    const randomId = Math.floor(8002000000000 + Math.random() * 999999999).toString();
    const newCompany: CompanyRegistry = {
      id: `co-${Date.now()}`,
      name: san,
      regNo: randomId,
      status: 'PENDING',
      annualReturnStatus: 'Compliant',
      filedDate: 'Registered Today'
    };

    this.companies.unshift(newCompany);
    return newCompany;
  }

  markAnnualReturnsCompliant() {
    const index = this.companies.findIndex((c) => c.annualReturnStatus === 'Due');
    if (index !== -1) {
      this.companies[index].annualReturnStatus = 'Compliant';
      this.companies[index].filedDate = `Today, via UgandaOne (${new Date().getFullYear()})`;
    }
  }
}

class MowtNodeService {
  private permit: DrivingPermitDetails = {
    permitNo: 'UG-DL-98765432',
    classes: ['B', 'A'],
    status: 'Active',
    expiryDate: '2026-11-15',
    expiresInDays: 142
  };

  private vehicles: VehicleDetails[] = [
    { id: 'vh-01', makeModel: 'Toyota Harrier (2018)', regNo: 'UBC 123X', syncStatus: true }
  ];

  private insuranceAlerts: InsuranceAlert[] = [
    { vehicleId: 'vh-01', vehicleReg: 'UBC 123X', expiresInDays: 5, policyNo: 'MTP-89382103' }
  ];

  private transfers: OwnershipTransferRecord[] = [];

  getPermit() {
    return { ...this.permit };
  }

  getVehicles() {
    return [...this.vehicles];
  }

  getInsuranceAlerts() {
    return [...this.insuranceAlerts];
  }

  getTransfers() {
    return [...this.transfers];
  }

  initiateTransfer(regNo: string, buyerName: string): OwnershipTransferRecord {
    const newTransfer: OwnershipTransferRecord = {
      id: `tf-${Date.now()}`,
      vehicleReg: regNo.toUpperCase(),
      buyerName: buyerName.toUpperCase(),
      status: 'PENDING',
      initiatedAt: new Date().toISOString()
    };
    this.transfers.unshift(newTransfer);
    return newTransfer;
  }

  extendPermitValidity() {
    this.permit.status = 'Active';
    this.permit.expiresInDays = 1095;
    this.permit.expiryDate = new Date(Date.now() + 1095 * 24 * 3600 * 1000).toISOString().substring(0, 10);
    this.insuranceAlerts = [];
  }
}

class NssfNodeService {
  private nssfAccount: NssfAccount = {
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

  getAccount() {
    return { ...this.nssfAccount };
  }

  initiateClaim(claimType: string): NssfAccount {
    this.nssfAccount.claimStatus = 'UNDER_REVIEW';
    this.nssfAccount.claimDetails = `Age Benefit Claim - Initiated Today (${claimType})`;
    this.nssfAccount.recentAlerts.unshift({
      id: `al-${Date.now()}`,
      type: 'ALERT',
      title: 'Claim Processing Underway',
      description: `Your Age Benefit claim (${claimType}) is being verified by NSSF Auditors.`,
      date: 'Just Now'
    });
    return { ...this.nssfAccount };
  }
}

class DcicNodeService {
  private passport: PassportApplication = {
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

  getPassport() {
    return { ...this.passport };
  }

  markPaid() {
    this.passport.status = 'Printing';
    this.passport.timeline[1].completed = true;
    this.passport.timeline[1].active = false;
    this.passport.timeline[2].completed = true;
    this.passport.timeline[2].active = true;
  }
}

// Instantiate fully sandboxed services inside independent memory modules (Strict isolation)
const niraNode = new NiraNodeService();
const uraNode = new UraNodeService();
const ursbNode = new UrsbNodeService();
const mowtNode = new MowtNodeService();
const nssfNode = new NssfNodeService();
const dcicNode = new DcicNodeService();

// Local append-only tracking log in memory
let activeFilesDb: ActiveFile[] = [
  { id: 'af-01', title: 'Passport Renewal', agencyName: 'Internal Affairs', reference: 'UG-882910', status: 'Processing', updatedAt: '2 hours ago' },
  { id: 'af-02', title: 'Income Tax Return', agencyName: 'Uganda Revenue Authority', reference: 'FY 2025/26', status: 'Completed', updatedAt: 'Yesterday' }
];

/**
 * Estonia Transparency Model - Secure Transaction Ledger Definitions
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  dataAccessed: string;
  status: 'SUCCESS' | 'SUSPENDED' | 'DENIED' | 'DECENTRALIZED_VERIFIED';
  agencyNode: 'NIRA_NODE' | 'URA_NODE' | 'URSB_NODE' | 'MoWT_NODE' | 'NSSF_NODE' | 'DCIC_NODE';
}

export let dpiAuditLog: AuditLogEntry[] = [
  {
    id: 'TX-100412',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: 'Civil Ledger Service Device Handshake',
    action: 'Initial e-KYC Verification',
    dataAccessed: 'NIN status and cryptographic parameters checks',
    status: 'SUCCESS',
    agencyNode: 'NIRA_NODE'
  },
  {
    id: 'TX-100411',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actor: 'URA Portal Service Hub Router',
    action: 'TIN Validity Query',
    dataAccessed: 'Cleared status indicator (data-minimized)',
    status: 'DECENTRALIZED_VERIFIED',
    agencyNode: 'URA_NODE'
  }
];

type AuditLogListener = (logs: AuditLogEntry[]) => void;
let auditListeners: AuditLogListener[] = [];

export function subscribeToAuditLogs(listener: AuditLogListener) {
  auditListeners.push(listener);
  // Send current state
  listener([...dpiAuditLog]);
  return () => {
    auditListeners = auditListeners.filter((l) => l !== listener);
  };
}

export function logAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const newEntry: AuditLogEntry = {
    id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  dpiAuditLog.unshift(newEntry);
  auditListeners.forEach((l) => l([...dpiAuditLog]));
}

/**
 * Secure Citizen-Facing Error Mapper (Network Fault Resiliency & Threat Mitigation)
 * Translates low-level network dropouts or potential security failures into safe, explanatory notifications.
 */
export function secureErrorMapper(err: any): string {
  const errMsg = err?.message || String(err);
  if (errMsg.includes('GATEWAY_OFFLINE')) {
    return 'DPI Interoperability Hub is temporarily unreachable. Rest assured, your cryptographic identities remain secure and isolated. Please check your connectivity and retry.';
  }
  if (errMsg.includes('UNAUTHORIZED') || errMsg.includes('INVALID_TOKEN')) {
    return 'National ID credential handshake expired or failed verification. Access denied in compliance with NIRA zero-trust data safety rules.';
  }
  if (errMsg.includes('CARD_LOCKED') || errMsg.includes('SUSPENDED')) {
    return 'Registry lookup aborted. Your e-KYC digital card is frozen by NIRA Identity Lock. Please unlock your National ID card to resume cross-agency access.';
  }
  if (errMsg.includes('DB_ERROR') || errMsg.includes('CONNECTION_POOL')) {
    return 'The requested downstream agency registry is currently undergoing secure blockchain audits. Your data is protected; please retry in a few moments.';
  }
  return errMsg;
}

/**
 * Stateless Interoperability Gateway Adapter (Estonian X-Road Orchestrator Model)
 * Coordinates isolated data routing, cryptographic e-KYC handshakes, and strict data minimization.
 */
export const dpiGateway = {
  latencyEnabled: true,
  offlineMode: false,

  async wait(): Promise<number> {
    if (this.offlineMode) {
      throw new Error('GATEWAY_OFFLINE: Could not connect to UgandaOne Interoperability Hub.');
    }
    const delay = this.latencyEnabled ? Math.floor(Math.random() * 400) + 400 : 50;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return delay;
  },

  signNINToken(nin: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: nin,
        fullName: 'MUKASA SSEWANYANA',
        iss: 'NIRA_SECURE_GATEWAY',
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    );
    const signature = 'X_UGANDAONE_HMAC_SIG_NIRA_APPROVED';
    return `jwt_${header}.${payload}.${signature}`;
  },

  verifyToken(token: string | null): boolean {
    if (!token) return false;
    return token.startsWith('jwt_') && token.includes('X_UGANDAONE_HMAC_SIG_NIRA_APPROVED');
  },

  /**
   * ZERO-KNOWLEDGE INQUIRIES & STRICT DATA MINIMIZATION
   * Checks specific compliance criteria without transmitting complete user dossiers
   */
  async verifyAgeAndCitizenship(token: string): Promise<GatewayResponse<{ verified: boolean; criteria: string }>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      logAuditEntry({
        actor: 'Multi-Agency Workflow Hub',
        action: 'ZKP Age & Citizenship Inquiry',
        dataAccessed: 'Header Handshake validation (unauthorized)',
        status: 'DENIED',
        agencyNode: 'NIRA_NODE'
      });
      return { success: false, error: 'UNAUTHORIZED: Handshake signature verification failed.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NIRA_NODE' };
    }

    if (niraNode.isLocked()) {
      logAuditEntry({
        actor: 'Multi-Agency Workflow Hub',
        action: 'ZKP Age & Citizenship Inquiry',
        dataAccessed: 'Identity lock validation - blocked',
        status: 'SUSPENDED',
        agencyNode: 'NIRA_NODE'
      });
      return { success: false, error: 'CARD_LOCKED: Account is currently locked.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NIRA_NODE' };
    }

    logAuditEntry({
      actor: 'MoWT Driving Permit Auditor',
      action: 'Zero-Knowledge Verification Query',
      dataAccessed: 'Is_Adult && Is_Citizen boolean result only (Data minimized)',
      status: 'DECENTRALIZED_VERIFIED',
      agencyNode: 'NIRA_NODE'
    });

    return {
      success: true,
      data: { verified: true, criteria: 'Age >= 18 && Citizenship == UGANDAN' },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NIRA_NODE'
    };
  },

  async verifyTaxCompliance(token: string): Promise<GatewayResponse<{ compliant: boolean; lastAuditCode: string }>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      logAuditEntry({
        actor: 'URSB Registrar Office',
        action: 'Tax Compliance Query',
        dataAccessed: 'TIN search (unauthorized)',
        status: 'DENIED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'UNAUTHORIZED: Handshake signature verification failed.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    logAuditEntry({
      actor: 'URSB Registrar Office',
      action: 'Tax Compliance Query',
      dataAccessed: 'Is_Tax_Compliant boolean query (Data minimized)',
      status: 'DECENTRALIZED_VERIFIED',
      agencyNode: 'URA_NODE'
    });

    return {
      success: true,
      data: { compliant: true, lastAuditCode: 'URA-AUD-998231' },
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  /**
   * PILLAR 1: Foundational Identity (NIRA e-KYC Node)
   */
  async verifyNIN(nin: string, pin: string): Promise<GatewayResponse<{ token: string; profile: CitizenProfile }>> {
    const latency = await this.wait();
    try {
      if (!niraNode.verifyPin(nin, pin)) {
        logAuditEntry({
          actor: 'NIRA e-KYC Secure Gateway',
          action: 'PIN Challenge',
          dataAccessed: 'Security credentials hash (failed)',
          status: 'DENIED',
          agencyNode: 'NIRA_NODE'
        });
        return {
          success: false,
          error: 'INVALID_PIN: Secure PIN authorization failed.',
          networkLatencyMs: latency,
          timestamp: new Date().toISOString(),
          agencyNode: 'NIRA_NODE'
        };
      }

      const rawProfile = niraNode.getProfile(true);
      const secureToken = this.signNINToken(rawProfile.nin);

      logAuditEntry({
        actor: 'NIRA e-KYC Secure Gateway',
        action: 'SIM-Bound Authentication & e-KYC handshake',
        dataAccessed: 'Foundational profile metadata',
        status: 'SUCCESS',
        agencyNode: 'NIRA_NODE'
      });

      return {
        success: true,
        data: {
          token: secureToken,
          profile: rawProfile
        },
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'NIRA_NODE'
      };
    } catch (err: any) {
      logAuditEntry({
        actor: 'NIRA e-KYC Secure Gateway',
        action: 'Identity Verification Check',
        dataAccessed: 'NIN ledger record (failed)',
        status: err.message.includes('LOCKED') ? 'SUSPENDED' : 'DENIED',
        agencyNode: 'NIRA_NODE'
      });
      return {
        success: false,
        error: secureErrorMapper(err),
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'NIRA_NODE'
      };
    }
  },

  async toggleIdentityLock(token: string): Promise<GatewayResponse<boolean>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      logAuditEntry({
        actor: 'NIRA Secure Gateway',
        action: 'Toggle Card Lock State',
        dataAccessed: 'NIN database record (unauthorized)',
        status: 'DENIED',
        agencyNode: 'NIRA_NODE'
      });
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NIRA_NODE' };
    }

    const locked = niraNode.toggleLock();
    logAuditEntry({
      actor: 'Citizen Device Client',
      action: locked ? 'Card Locked / Freeze Downstream Access' : 'Card Unlocked / Re-enable Downstream Access',
      dataAccessed: 'Identity lock status parameter only',
      status: 'SUCCESS',
      agencyNode: 'NIRA_NODE'
    });

    return {
      success: true,
      data: locked,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NIRA_NODE'
    };
  },

  /**
   * PILLAR 2: Revenue & Taxation (URA Node)
   */
  async getTinDetails(token: string): Promise<GatewayResponse<TinDetails>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      logAuditEntry({
        actor: 'URA Portal API',
        action: 'Get TIN registration details',
        dataAccessed: 'TIN profiles (unauthorized)',
        status: 'DENIED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    if (niraNode.isLocked()) {
      logAuditEntry({
        actor: 'URA Portal API',
        action: 'Get TIN registration details',
        dataAccessed: 'None - Query blocked by lock',
        status: 'SUSPENDED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    logAuditEntry({
      actor: 'URA Tax Assessment Daemon',
      action: 'Retrieve individual TIN record',
      dataAccessed: 'Tax identification registry index',
      status: 'SUCCESS',
      agencyNode: 'URA_NODE'
    });

    return {
      success: true,
      data: uraNode.getTin(),
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async getTaxLedger(token: string): Promise<GatewayResponse<TaxLedgerEntry[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      logAuditEntry({
        actor: 'URA Tax Ledger API',
        action: 'Get payment tax ledger transactions',
        dataAccessed: 'Historical tax dues (unauthorized)',
        status: 'DENIED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    if (niraNode.isLocked()) {
      logAuditEntry({
        actor: 'URA Tax Ledger API',
        action: 'Get payment tax ledger transactions',
        dataAccessed: 'None - Query blocked',
        status: 'SUSPENDED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    logAuditEntry({
      actor: 'URA Tax Auditing Engine',
      action: 'Retrieve individual ledger',
      dataAccessed: 'Historical receipts & liabilities',
      status: 'SUCCESS',
      agencyNode: 'URA_NODE'
    });

    return {
      success: true,
      data: uraNode.getLedger(),
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async generatePRN(token: string, category: string, amount: number): Promise<GatewayResponse<PrnRecord>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      logAuditEntry({
        actor: 'URA Payment Gateway',
        action: 'Assess & Generate PRN Code',
        dataAccessed: 'Tax records (unauthorized)',
        status: 'DENIED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    if (niraNode.isLocked()) {
      logAuditEntry({
        actor: 'URA Payment Gateway',
        action: 'Assess & Generate PRN Code',
        dataAccessed: 'None - Query blocked',
        status: 'SUSPENDED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    if (amount <= 0) {
      return { success: false, error: 'INVALID_AMOUNT: Assessment amount must be greater than zero.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    const niraProfile = niraNode.getProfile(true);
    const newPrn = uraNode.generatePRN(category, amount, niraProfile.fullName);

    logAuditEntry({
      actor: 'URA Billing System',
      action: 'Generate Payment Registration Number (PRN)',
      dataAccessed: 'Billed citizen name, assessment category & fee',
      status: 'SUCCESS',
      agencyNode: 'URA_NODE'
    });

    return {
      success: true,
      data: newPrn,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async getPrnHistory(token: string): Promise<GatewayResponse<PrnRecord[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      logAuditEntry({
        actor: 'URA Billing History API',
        action: 'Retrieve PRN registries',
        dataAccessed: 'Bill records (unauthorized)',
        status: 'DENIED',
        agencyNode: 'URA_NODE'
      });
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URA_NODE' };
    }

    return {
      success: true,
      data: uraNode.getPrns(),
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
      data: uraNode.getEFiling(),
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  /**
   * PILLAR 3: Mobile Money Payments Orchestrator (MTN & Airtel API Interop)
   */
  async verifyPRNForPayment(prn: string): Promise<GatewayResponse<PrnRecord>> {
    const latency = await this.wait();
    const record = uraNode.verifyPRN(prn);

    if (!record) {
      logAuditEntry({
        actor: 'Decentralized Mobile Money Node',
        action: 'Query PRN Standing',
        dataAccessed: `PRN index ${prn} (not found)`,
        status: 'DENIED',
        agencyNode: 'URA_NODE'
      });
      return {
        success: false,
        error: 'PRN_NOT_FOUND: The specified PRN is invalid or expired.',
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    }

    logAuditEntry({
      actor: 'Decentralized Mobile Money Node',
      action: 'Query PRN Standing',
      dataAccessed: 'PRN records amount and billing validation',
      status: 'SUCCESS',
      agencyNode: 'URA_NODE'
    });

    return {
      success: true,
      data: record,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URA_NODE'
    };
  },

  async executeMobileMoneyPayment(
    prnCode: string,
    phoneNumber: string,
    provider: 'MTN' | 'AIRTEL',
    email?: string
  ): Promise<GatewayResponse<{ transactionId: string; record: PrnRecord; receipt: PaymentReceipt }>> {
    const latency = await this.wait();

    try {
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

      // Perform isolated payment registration at the URA Node
      const paidRecord = uraNode.markPrnPaid(prnCode);

      // Secure Zero-Knowledge state transitions triggered downstream
      if (paidRecord.category.includes('Passport')) {
        dcicNode.markPaid();
        const fileIndex = activeFilesDb.findIndex((f) => f.title.includes('Passport'));
        if (fileIndex !== -1) {
          activeFilesDb[fileIndex].status = 'Processing';
          activeFilesDb[fileIndex].updatedAt = 'Paid via Secure SIM Handshake';
        }
      } else if (paidRecord.category.includes('Permit') || paidRecord.category.includes('License')) {
        mowtNode.extendPermitValidity();
      } else if (paidRecord.category.includes('Business') || paidRecord.category.includes('Company')) {
        ursbNode.markAnnualReturnsCompliant();
      }

      const mtnId = 'TXN-MTN-' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const airtelId = 'TXN-ART-' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const txnId = provider === 'MTN' ? mtnId : airtelId;

      const payerEmail = email || 'mpangabenard2584@gmail.com';

      // Generate payment receipt
      const receipt: PaymentReceipt = {
        id: 'RCP-' + Math.floor(100000 + Math.random() * 900000).toString(),
        prn: prnCode,
        category: paidRecord.category,
        amount: paidRecord.amount,
        payerName: paidRecord.applicantName,
        payerEmail: payerEmail,
        paymentMethod: 'momo',
        paymentDetails: `${provider} MoMo (+256 ${cleanedPhone})`,
        transactionId: txnId,
        timestamp: new Date().toISOString()
      };

      sentReceiptsDb.push(receipt);

      logAuditEntry({
        actor: `${provider} MoMo Ledger Broker`,
        action: `Execute USSD Push Secure Settlement (Receipt sent to ${payerEmail})`,
        dataAccessed: 'Payment clearance token matching PRN',
        status: 'SUCCESS',
        agencyNode: 'URA_NODE'
      });

      return {
        success: true,
        data: {
          transactionId: txnId,
          record: paidRecord,
          receipt
        },
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    } catch (err: any) {
      return {
        success: false,
        error: secureErrorMapper(err),
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    }
  },

  async executeCardPayment(
    prnCode: string,
    cardNumber: string,
    expiry: string,
    cvv: string,
    cardholderName: string,
    email: string
  ): Promise<GatewayResponse<{ transactionId: string; record: PrnRecord; receipt: PaymentReceipt }>> {
    const latency = await this.wait();

    try {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        return {
          success: false,
          error: 'INVALID_CARD: Please provide a valid 16-digit debit/credit card number.',
          networkLatencyMs: latency,
          timestamp: new Date().toISOString(),
          agencyNode: 'URA_NODE'
        };
      }

      // Perform isolated payment registration at the URA Node
      const paidRecord = uraNode.markPrnPaid(prnCode);

      // Secure Zero-Knowledge state transitions triggered downstream
      if (paidRecord.category.includes('Passport')) {
        dcicNode.markPaid();
        const fileIndex = activeFilesDb.findIndex((f) => f.title.includes('Passport'));
        if (fileIndex !== -1) {
          activeFilesDb[fileIndex].status = 'Processing';
          activeFilesDb[fileIndex].updatedAt = 'Paid via Secure Card Terminal';
        }
      } else if (paidRecord.category.includes('Permit') || paidRecord.category.includes('License')) {
        mowtNode.extendPermitValidity();
      } else if (paidRecord.category.includes('Business') || paidRecord.category.includes('Company')) {
        ursbNode.markAnnualReturnsCompliant();
      }

      const txnId = 'TXN-CRD-' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const payerEmail = email || 'mpangabenard2584@gmail.com';
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);

      // Generate payment receipt
      const receipt: PaymentReceipt = {
        id: 'RCP-' + Math.floor(100000 + Math.random() * 900000).toString(),
        prn: prnCode,
        category: paidRecord.category,
        amount: paidRecord.amount,
        payerName: cardholderName || paidRecord.applicantName,
        payerEmail: payerEmail,
        paymentMethod: 'card',
        paymentDetails: `Card ending in *${last4}`,
        transactionId: txnId,
        timestamp: new Date().toISOString()
      };

      sentReceiptsDb.push(receipt);

      logAuditEntry({
        actor: 'URA Credit/Debit Card Broker',
        action: `Execute Card Clearance Secure Settlement (Receipt sent to ${payerEmail})`,
        dataAccessed: 'Card authorization token matching PRN',
        status: 'SUCCESS',
        agencyNode: 'URA_NODE'
      });

      return {
        success: true,
        data: {
          transactionId: txnId,
          record: paidRecord,
          receipt
        },
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    } catch (err: any) {
      return {
        success: false,
        error: secureErrorMapper(err),
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    }
  },

  async executeBankTransferPayment(
    prnCode: string,
    bankName: string,
    accountNumber: string,
    accountName: string,
    email: string
  ): Promise<GatewayResponse<{ transactionId: string; record: PrnRecord; receipt: PaymentReceipt }>> {
    const latency = await this.wait();

    try {
      if (!accountNumber || accountNumber.trim().length < 8) {
        return {
          success: false,
          error: 'INVALID_ACCOUNT: Please provide a valid bank account number.',
          networkLatencyMs: latency,
          timestamp: new Date().toISOString(),
          agencyNode: 'URA_NODE'
        };
      }

      // Perform isolated payment registration at the URA Node
      const paidRecord = uraNode.markPrnPaid(prnCode);

      // Secure Zero-Knowledge state transitions triggered downstream
      if (paidRecord.category.includes('Passport')) {
        dcicNode.markPaid();
        const fileIndex = activeFilesDb.findIndex((f) => f.title.includes('Passport'));
        if (fileIndex !== -1) {
          activeFilesDb[fileIndex].status = 'Processing';
          activeFilesDb[fileIndex].updatedAt = 'Paid via EFT/Bank Transfer';
        }
      } else if (paidRecord.category.includes('Permit') || paidRecord.category.includes('License')) {
        mowtNode.extendPermitValidity();
      } else if (paidRecord.category.includes('Business') || paidRecord.category.includes('Company')) {
        ursbNode.markAnnualReturnsCompliant();
      }

      const txnId = 'TXN-EFT-' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const payerEmail = email || 'mpangabenard2584@gmail.com';

      // Generate payment receipt
      const receipt: PaymentReceipt = {
        id: 'RCP-' + Math.floor(100000 + Math.random() * 900000).toString(),
        prn: prnCode,
        category: paidRecord.category,
        amount: paidRecord.amount,
        payerName: accountName || paidRecord.applicantName,
        payerEmail: payerEmail,
        paymentMethod: 'bank',
        paymentDetails: `Bank EFT: ${bankName} (${accountNumber.slice(-4).padStart(accountNumber.length, '*')})`,
        transactionId: txnId,
        timestamp: new Date().toISOString()
      };

      sentReceiptsDb.push(receipt);

      logAuditEntry({
        actor: 'NITA-U Interoperability Bank Gateway',
        action: `Execute Bank Transfer Clearing (Receipt sent to ${payerEmail})`,
        dataAccessed: 'EFT payment settlements index',
        status: 'SUCCESS',
        agencyNode: 'URA_NODE'
      });

      return {
        success: true,
        data: {
          transactionId: txnId,
          record: paidRecord,
          receipt
        },
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    } catch (err: any) {
      return {
        success: false,
        error: secureErrorMapper(err),
        networkLatencyMs: latency,
        timestamp: new Date().toISOString(),
        agencyNode: 'URA_NODE'
      };
    }
  },

  async getSentReceipts(): Promise<PaymentReceipt[]> {
    return [...sentReceiptsDb];
  },

  /**
   * PILLAR 4: Corporate & Commercial Registries Node (URSB Node)
   */
  async getMyCompanies(token: string): Promise<GatewayResponse<CompanyRegistry[]>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URSB_NODE' };
    }

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URSB_NODE' };
    }

    logAuditEntry({
      actor: 'URSB Registry Index',
      action: 'Retrieve Commercial Directors list',
      dataAccessed: 'Corporate records matching validated NIN',
      status: 'SUCCESS',
      agencyNode: 'URSB_NODE'
    });

    return {
      success: true,
      data: ursbNode.getCompanies(),
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'URSB_NODE'
    };
  },

  async checkNameAvailability(name: string): Promise<GatewayResponse<{ available: boolean; name: string }>> {
    const latency = await this.wait();
    if (!name.trim()) {
      return { success: false, error: 'INVALID_INPUT: Company name is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URSB_NODE' };
    }

    const avail = ursbNode.checkName(name);

    logAuditEntry({
      actor: 'URSB Public Registry Daemon',
      action: 'Query Commercial Brand Name Index',
      dataAccessed: 'Public corporate name databases only (ZKP style)',
      status: 'SUCCESS',
      agencyNode: 'URSB_NODE'
    });

    return {
      success: true,
      data: {
        available: avail,
        name: name.trim().toUpperCase()
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

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'URSB_NODE' };
    }

    const newCompany = ursbNode.registerBusiness(name);

    // Append file logging
    activeFilesDb.unshift({
      id: `af-${Date.now()}`,
      title: `URSB Business: ${name.trim().toUpperCase()}`,
      agencyName: 'URSB',
      reference: newCompany.regNo,
      status: 'Pending',
      updatedAt: 'Submitted Today'
    });

    logAuditEntry({
      actor: 'URSB Registrar Office',
      action: 'Register Corporate Entity (Isolated Node)',
      dataAccessed: 'Director identity records, custom commercial indices',
      status: 'SUCCESS',
      agencyNode: 'URSB_NODE'
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
   * PILLAR 5: Transport & UDLS Registry Node (MoWT Node)
   */
  async getDrivingPermit(token: string): Promise<GatewayResponse<DrivingPermitDetails>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }

    if (niraNode.isLocked()) {
      logAuditEntry({
        actor: 'MoWT UDLS Registry Router',
        action: 'Query permit status',
        dataAccessed: 'None - locked',
        status: 'SUSPENDED',
        agencyNode: 'MoWT_NODE'
      });
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }

    logAuditEntry({
      actor: 'MoWT UDLS Registry Router',
      action: 'Query driving license status',
      dataAccessed: 'Permit classification codes, violations ledger',
      status: 'SUCCESS',
      agencyNode: 'MoWT_NODE'
    });

    return {
      success: true,
      data: mowtNode.getPermit(),
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

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }

    logAuditEntry({
      actor: 'Ministry of Works & Transport Portal',
      action: 'Fetch registered vehicles indices',
      dataAccessed: 'License plates index matching e-KYC',
      status: 'SUCCESS',
      agencyNode: 'MoWT_NODE'
    });

    return {
      success: true,
      data: mowtNode.getVehicles(),
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
      data: mowtNode.getInsuranceAlerts(),
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

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }

    if (!regNo || !buyerName || !buyerNin) {
      return { success: false, error: 'INVALID_PARAMETERS: Vehicle Registration, Buyer Name, and Buyer NIN are required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'MoWT_NODE' };
    }

    const record = mowtNode.initiateTransfer(regNo, buyerName);

    activeFilesDb.unshift({
      id: `af-${Date.now()}`,
      title: `Ownership Transfer: ${regNo.toUpperCase()}`,
      agencyName: 'MoWT / URA',
      reference: record.id,
      status: 'Processing',
      updatedAt: 'Submitted Today'
    });

    logAuditEntry({
      actor: 'Ministry of Works & Transport Portal',
      action: 'Initiate Peer-to-Peer Ownership Transfer',
      dataAccessed: 'Vehicle chassis indexes, buyer and seller identifiers',
      status: 'SUCCESS',
      agencyNode: 'MoWT_NODE'
    });

    return {
      success: true,
      data: record,
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
      data: mowtNode.getTransfers(),
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'MoWT_NODE'
    };
  },

  /**
   * PILLAR 6: Social Security Savings Node (NSSF Node)
   */
  async getNssfAccount(token: string): Promise<GatewayResponse<NssfAccount>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NSSF_NODE' };
    }

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NSSF_NODE' };
    }

    logAuditEntry({
      actor: 'NSSF Member Portal Gateway',
      action: 'Fetch contribution savings analytics',
      dataAccessed: 'Historical savings deposits balance, employer identifiers',
      status: 'SUCCESS',
      agencyNode: 'NSSF_NODE'
    });

    return {
      success: true,
      data: nssfNode.getAccount(),
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

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'NSSF_NODE' };
    }

    const updatedAccount = nssfNode.initiateClaim(claimType);

    activeFilesDb.unshift({
      id: `af-${Date.now()}`,
      title: `NSSF Benefit Claim`,
      agencyName: 'NSSF',
      reference: 'NSSF-CLM-0921',
      status: 'Processing',
      updatedAt: 'Initiated Today'
    });

    logAuditEntry({
      actor: 'NSSF Claim Processing Module',
      action: 'Initiate Social Security Payout Claim',
      dataAccessed: 'Verified civil biodata indices, contribution balance audits',
      status: 'SUCCESS',
      agencyNode: 'NSSF_NODE'
    });

    return {
      success: true,
      data: updatedAccount,
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'NSSF_NODE'
    };
  },

  /**
   * PILLAR 7: Passport Application Node (DCIC Node)
   */
  async getPassportApplication(token: string): Promise<GatewayResponse<PassportApplication>> {
    const latency = await this.wait();
    if (!this.verifyToken(token)) {
      return { success: false, error: 'UNAUTHORIZED: Valid X-UgandaOne-NIN-Token header is required.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'DCIC_NODE' };
    }

    if (niraNode.isLocked()) {
      return { success: false, error: 'CARD_LOCKED: Access blocked by NIRA Identity Lock.', networkLatencyMs: latency, timestamp: new Date().toISOString(), agencyNode: 'DCIC_NODE' };
    }

    logAuditEntry({
      actor: 'DCIC Passport Control Core',
      action: 'Retrieve application tracking timeline',
      dataAccessed: 'Passport application record status & queue position',
      status: 'SUCCESS',
      agencyNode: 'DCIC_NODE'
    });

    return {
      success: true,
      data: dcicNode.getPassport(),
      networkLatencyMs: latency,
      timestamp: new Date().toISOString(),
      agencyNode: 'DCIC_NODE'
    };
  },

  /**
   * Stateless Tracking List passthrough
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
