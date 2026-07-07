/**
 * UgandaOne Digital Public Infrastructure (DPI)
 * Strict Type Definitions
 */

export interface CitizenProfile {
  nin: string;
  fullName: string;
  pin: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  nationality: string;
  cardStatus: 'VERIFIED' | 'PENDING' | 'ERROR';
  isCardLocked: boolean;
  phoneNumber: string;
  avatarUrl?: string;
  address: string;
  signatureUrl?: string;
}

export interface TinDetails {
  tin: string;
  status: 'Active' | 'Inactive';
  lastVerified: string;
}

export interface TaxLedgerEntry {
  id: string;
  category: string;
  period: string;
  amount: number;
  status: 'Cleared' | 'Pending' | 'Overdue';
  prn?: string;
}

export interface PrnRecord {
  prn: string;
  amount: number;
  category: string;
  applicantName: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  generatedAt: string;
  expiryDate: string;
}

export interface EFilingSummary {
  period: string;
  dueDate: string;
  status: string;
  daysRemaining: number;
}

export interface CompanyRegistry {
  id: string;
  name: string;
  regNo: string;
  status: 'ACTIVE' | 'PENDING' | 'DISSOLVED';
  annualReturnStatus: 'Compliant' | 'Due' | 'Overdue';
  annualReturnDueDate?: string;
  filedDate?: string;
}

export interface DrivingPermitDetails {
  permitNo: string;
  classes: string[];
  status: 'Active' | 'Suspended' | 'Expired';
  expiryDate: string;
  expiresInDays: number;
}

export interface VehicleDetails {
  id: string;
  makeModel: string;
  regNo: string;
  syncStatus: boolean;
}

export interface InsuranceAlert {
  vehicleId: string;
  vehicleReg: string;
  expiresInDays: number;
  policyNo: string;
}

export interface OwnershipTransferRecord {
  id: string;
  vehicleReg: string;
  buyerName: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  initiatedAt: string;
}

export interface NssfAccount {
  totalBalance: number;
  employeeContribution: number;
  employerContribution: number;
  claimStatus: 'NONE' | 'INITIATED' | 'UNDER_REVIEW' | 'PAID';
  claimDetails?: string;
  monthlyContributions: { month: string; amount: number }[];
  recentAlerts: {
    id: string;
    type: 'CONTRIBUTION_RECEIVED' | 'STATEMENT_READY' | 'ALERT';
    title: string;
    description: string;
    date: string;
  }[];
}

export interface PassportApplication {
  applicationId: string;
  status: 'Application Submitted' | 'Under Review' | 'Printing' | 'Ready for Collection';
  expectedDate: string;
  queuePosition: number;
  pages: 32 | 48;
  feeStatus: 'PAID' | 'PENDING';
  appointmentDate: string;
  timeline: {
    step: number;
    title: string;
    description: string;
    timestamp?: string;
    completed: boolean;
    active: boolean;
  }[];
}

// X-Road Gateway Response types
export interface GatewayResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  networkLatencyMs: number;
  timestamp: string;
  agencyNode: 'NIRA_NODE' | 'URA_NODE' | 'URSB_NODE' | 'MoWT_NODE' | 'NSSF_NODE' | 'DCIC_NODE';
}

// Active files tracked by the citizen
export interface ActiveFile {
  id: string;
  title: string;
  agencyName: string;
  reference: string;
  status: 'Pending' | 'Completed' | 'Processing';
  updatedAt: string;
}

// App navigation views
export type AppView = 'home' | 'services' | 'docs' | 'support' | 'workflows';

// LifeSG workflows
export type LifeEventWorkflow = 'none' | 'register_business' | 'renew_permit';
