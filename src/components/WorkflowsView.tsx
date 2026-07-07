import React, { useState, useReducer, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import {
  Baby,
  Heart,
  Milestone,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  RefreshCw,
  Building,
  Building2,
  Database,
  UserCheck,
  Activity,
  Calendar,
  AlertCircle,
  Undo2,
  Play,
  Check,
  Info,
  Server,
  FileText,
  BadgeAlert
} from 'lucide-react';

// ==========================================
// TYPES & SCHEMAS FOR MULTI-AGENCY LIFE EVENTS
// ==========================================

export interface NewbornState {
  step: 'NOTIFIED' | 'FORM' | 'ORCHESTRATING' | 'SUCCESS' | 'ROLLEDBACK';
  currentHop: 'hospital' | 'nira' | 'moh' | 'nssf' | 'done';
  childName: string;
  childGender: 'MALE' | 'FEMALE';
  failureTarget: 'none' | 'moh' | 'nssf';
  logs: string[];
  generatedNin: string;
  certNo: string;
  tokenPassed: string;
}

export type NewbornAction =
  | { type: 'START_WIZARD' }
  | { type: 'SET_CHILD_NAME'; name: string }
  | { type: 'SET_GENDER'; gender: 'MALE' | 'FEMALE' }
  | { type: 'SET_FAILURE_TARGET'; target: 'none' | 'moh' | 'nssf' }
  | { type: 'START_ORCHESTRATION' }
  | { type: 'HOP_SUCCESS'; hop: 'hospital' | 'nira' | 'moh' | 'nssf' | 'done'; log: string; data?: any }
  | { type: 'HOP_FAILED'; log: string }
  | { type: 'ROLLBACK_STEP'; log: string }
  | { type: 'ROLLBACK_COMPLETE'; log: string }
  | { type: 'RESET_WIZARD' };

export interface MaritalState {
  step: 'IDLE' | 'FORM' | 'ORCHESTRATING' | 'SUCCESS' | 'ROLLEDBACK';
  currentHop: 'input' | 'nira_marriage' | 'ia_passport' | 'udls_permit' | 'ura_tax' | 'done';
  spouseNin: string;
  marriageCertNo: string;
  newLastName: string;
  failureTarget: 'none' | 'ia' | 'udls';
  logs: string[];
  updatedToken: string;
  tokenPassed: string;
}

export type MaritalAction =
  | { type: 'SET_SPOUSE_NIN'; nin: string }
  | { type: 'SET_CERT_NO'; certNo: string }
  | { type: 'SET_LAST_NAME'; name: string }
  | { type: 'SET_FAILURE_TARGET'; target: 'none' | 'ia' | 'udls' }
  | { type: 'START_ORCHESTRATION' }
  | { type: 'HOP_SUCCESS'; hop: MaritalState['currentHop']; log: string; data?: any }
  | { type: 'HOP_FAILED'; log: string }
  | { type: 'ROLLBACK_STEP'; log: string }
  | { type: 'ROLLBACK_COMPLETE'; log: string }
  | { type: 'RESET' };

export interface RetirementState {
  step: 'IDLE' | 'BANNER' | 'ORCHESTRATING' | 'SUCCESS' | 'ROLLEDBACK';
  currentHop: 'idle' | 'nira_senior_verify' | 'nssf_claims' | 'moh_subsidy' | 'done';
  logs: string[];
  failureTarget: 'none' | 'moh';
  accumulatedPension: number;
  monthlyPayout: number;
  claimReference: string;
  tokenPassed: string;
}

export type RetirementAction =
  | { type: 'TRIGGER_VERIFICATION' }
  | { type: 'START_ORCHESTRATION' }
  | { type: 'SET_FAILURE_TARGET'; target: 'none' | 'moh' }
  | { type: 'HOP_SUCCESS'; hop: RetirementState['currentHop']; log: string; data?: any }
  | { type: 'HOP_FAILED'; log: string }
  | { type: 'ROLLBACK_STEP'; log: string }
  | { type: 'ROLLBACK_COMPLETE'; log: string }
  | { type: 'RESET' };

export interface RelocationState {
  step: 'FORM' | 'ORCHESTRATING' | 'SUCCESS' | 'ROLLEDBACK';
  currentHop: 'form' | 'umeme_sync' | 'nwsc_sync' | 'municipal_sync' | 'done';
  district: string;
  subCounty: string;
  village: string;
  plotNo: string;
  failureTarget: 'none' | 'nwsc' | 'municipal';
  logs: string[];
  tokenPassed: string;
}

export type RelocationAction =
  | { type: 'SET_FIELD'; field: 'district' | 'subCounty' | 'village' | 'plotNo'; value: string }
  | { type: 'SET_FAILURE_TARGET'; target: 'none' | 'nwsc' | 'municipal' }
  | { type: 'START_ORCHESTRATION' }
  | { type: 'HOP_SUCCESS'; hop: RelocationState['currentHop']; log: string; data?: any }
  | { type: 'HOP_FAILED'; log: string }
  | { type: 'ROLLBACK_STEP'; log: string }
  | { type: 'ROLLBACK_COMPLETE'; log: string }
  | { type: 'RESET' };

// ==========================================
// ARIA-COMPLIANT STEPPER COMPONENT
// ==========================================

interface ComponentStepperProps {
  steps: { id: string; name: string; agency: string }[];
  currentStepIndex: number;
  status: 'idle' | 'pending' | 'success' | 'error' | 'rolled_back';
}

const ComponentStepper: React.FC<ComponentStepperProps> = ({ steps, currentStepIndex, status }) => {
  return (
    <div className="w-full bg-white border border-[#edeeef] rounded-md p-4" aria-label="Workflow progress stepper">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isFailed = idx === currentStepIndex && status === 'error';
          const isRolledBack = status === 'rolled_back' && idx >= currentStepIndex;

          let badgeColor = 'bg-gray-100 text-gray-500 border-gray-200';
          if (isCompleted) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          if (isActive) {
            badgeColor = status === 'pending'
              ? 'bg-[#fff2cc] text-[#735c00] border-[#ffe086] animate-pulse'
              : status === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-black text-white border-black';
          }
          if (isFailed) badgeColor = 'bg-red-50 text-red-800 border-red-200';
          if (isRolledBack) badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 line-through';

          return (
            <div
              key={step.id}
              className={`flex-1 flex items-start gap-3 p-2.5 border rounded-sm transition-all duration-200 ${
                isActive ? 'border-black shadow-sm bg-neutral-50' : 'border-[#edeeef]'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${badgeColor}`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">{step.name}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{step.agency}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// REDUCERS FOR INTENTIONAL STATE MANAGEMENT
// ==========================================

const newbornReducer = (state: NewbornState, action: NewbornAction): NewbornState => {
  switch (action.type) {
    case 'START_WIZARD':
      return { ...state, step: 'FORM', logs: ['[DPI Switch] Initiated newborn registry form session.'] };
    case 'SET_CHILD_NAME':
      return { ...state, childName: action.name };
    case 'SET_GENDER':
      return { ...state, childGender: action.gender };
    case 'SET_FAILURE_TARGET':
      return { ...state, failureTarget: action.target };
    case 'START_ORCHESTRATION':
      return {
        ...state,
        step: 'ORCHESTRATING',
        currentHop: 'hospital',
        logs: [
          ...state.logs,
          '[Hospital Live-Birth] Validating hospital cryptographic payload fingerprint...',
          'Headers set: [X-UgandaOne-NIN-Token] & [X-UgandaOne-Hospital-Signature]'
        ]
      };
    case 'HOP_SUCCESS':
      return {
        ...state,
        currentHop: action.hop,
        logs: [...state.logs, action.log],
        generatedNin: action.data?.nin || state.generatedNin,
        certNo: action.data?.certNo || state.certNo,
        step: action.hop === 'done' ? 'SUCCESS' : state.step
      };
    case 'HOP_FAILED':
      return {
        ...state,
        logs: [...state.logs, action.log, '🚨 CRITICAL ORCHESTRATION TIMEOUT. Starting automated transactional rollback...']
      };
    case 'ROLLBACK_STEP':
      return {
        ...state,
        logs: [...state.logs, action.log]
      };
    case 'ROLLBACK_COMPLETE':
      return {
        ...state,
        step: 'ROLLEDBACK',
        logs: [...state.logs, action.log, '[Rollback] State synchronized back to standard parent baseline. Zero database leaks.']
      };
    case 'RESET_WIZARD':
      return {
        ...state,
        step: 'NOTIFIED',
        currentHop: 'hospital',
        childName: '',
        generatedNin: '',
        certNo: '',
        failureTarget: 'none',
        logs: []
      };
    default:
      return state;
  }
};

const maritalReducer = (state: MaritalState, action: MaritalAction): MaritalState => {
  switch (action.type) {
    case 'SET_SPOUSE_NIN':
      return { ...state, spouseNin: action.nin };
    case 'SET_CERT_NO':
      return { ...state, marriageCertNo: action.certNo };
    case 'SET_LAST_NAME':
      return { ...state, newLastName: action.name };
    case 'SET_FAILURE_TARGET':
      return { ...state, failureTarget: action.target };
    case 'START_ORCHESTRATION':
      return {
        ...state,
        step: 'ORCHESTRATING',
        currentHop: 'nira_marriage',
        logs: [
          '[Marriage Sync] Launching cross-agency marital state orchestration...',
          'Headers: [X-UgandaOne-NIN-Token] & [X-UgandaOne-Marriage-Registry-ID]'
        ]
      };
    case 'HOP_SUCCESS':
      return {
        ...state,
        currentHop: action.hop,
        logs: [...state.logs, action.log],
        updatedToken: action.data?.token || state.updatedToken,
        step: action.hop === 'done' ? 'SUCCESS' : state.step
      };
    case 'HOP_FAILED':
      return {
        ...state,
        logs: [...state.logs, action.log, '🚨 PIPELINE TRANSACTION FAILURE. Demanding cryptographic rollback...']
      };
    case 'ROLLBACK_STEP':
      return {
        ...state,
        logs: [...state.logs, action.log]
      };
    case 'ROLLBACK_COMPLETE':
      return {
        ...state,
        step: 'ROLLEDBACK',
        logs: [...state.logs, action.log, '[Rollback] Marriage registries safely cleared. Citizen profiles reverted.']
      };
    case 'RESET':
      return {
        ...state,
        step: 'IDLE',
        currentHop: 'input',
        spouseNin: '',
        marriageCertNo: '',
        newLastName: '',
        failureTarget: 'none',
        logs: []
      };
    default:
      return state;
  }
};

const retirementReducer = (state: RetirementState, action: RetirementAction): RetirementState => {
  switch (action.type) {
    case 'TRIGGER_VERIFICATION':
      return {
        ...state,
        step: 'BANNER',
        logs: ['[NIRA Monitor] Citizen profile age threshold intercepter active.']
      };
    case 'START_ORCHESTRATION':
      return {
        ...state,
        step: 'ORCHESTRATING',
        currentHop: 'nira_senior_verify',
        logs: [
          '[NIRA Verification] Commencing Senior Citizen Promotion and Pension deployment...',
          'Authorization: [X-UgandaOne-NIN-Token] verified against NIRA Master Registry.'
        ]
      };
    case 'SET_FAILURE_TARGET':
      return { ...state, failureTarget: action.target };
    case 'HOP_SUCCESS':
      return {
        ...state,
        currentHop: action.hop,
        logs: [...state.logs, action.log],
        accumulatedPension: action.data?.accumulatedPension || state.accumulatedPension,
        monthlyPayout: action.data?.monthlyPayout || state.monthlyPayout,
        claimReference: action.data?.claimReference || state.claimReference,
        step: action.hop === 'done' ? 'SUCCESS' : state.step
      };
    case 'HOP_FAILED':
      return {
        ...state,
        logs: [...state.logs, action.log, '🚨 PENSION BUNDLE FAILURE. Rolling back active promotion status...']
      };
    case 'ROLLBACK_STEP':
      return {
        ...state,
        logs: [...state.logs, action.log]
      };
    case 'ROLLBACK_COMPLETE':
      return {
        ...state,
        step: 'ROLLEDBACK',
        logs: [...state.logs, action.log, '[Rollback] Reverted to standard adult age tier. Active social security file closed.']
      };
    case 'RESET':
      return {
        ...state,
        step: 'IDLE',
        currentHop: 'idle',
        failureTarget: 'none',
        logs: []
      };
    default:
      return state;
  }
};

const relocationReducer = (state: RelocationState, action: RelocationAction): RelocationState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_FAILURE_TARGET':
      return { ...state, failureTarget: action.target };
    case 'START_ORCHESTRATION':
      return {
        ...state,
        step: 'ORCHESTRATING',
        currentHop: 'umeme_sync',
        logs: [
          '[Relocation Sync] Commencing utility and municipal council address relocation synchronization...',
          'Headers: [X-UgandaOne-NIN-Token] (Stateless decentralized address sync node active)'
        ]
      };
    case 'HOP_SUCCESS':
      return {
        ...state,
        currentHop: action.hop,
        logs: [...state.logs, action.log],
        step: action.hop === 'done' ? 'SUCCESS' : state.step
      };
    case 'HOP_FAILED':
      return {
        ...state,
        logs: [...state.logs, action.log, '🚨 UTILITY REGISTRATION BREACH. Reverting address update across all registries...']
      };
    case 'ROLLBACK_STEP':
      return {
        ...state,
        logs: [...state.logs, action.log]
      };
    case 'ROLLBACK_COMPLETE':
      return {
        ...state,
        step: 'ROLLEDBACK',
        logs: [...state.logs, action.log, '[Rollback] Address revert completed successfully. Previous municipal billing intact.']
      };
    case 'RESET':
      return {
        ...state,
        step: 'FORM',
        currentHop: 'form',
        district: 'Kampala',
        subCounty: 'Makindye Division',
        village: 'Kabalagala Zone B',
        plotNo: 'Plot 45B Ggaba Rd',
        failureTarget: 'none',
        logs: []
      };
    default:
      return state;
  }
};

interface WorkflowsViewProps {
  onInitiatePayment: (prnCode: string) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ onInitiatePayment }) => {
  const { token, profile } = useIdentity();
  const [selectedWorkflowTab, setSelectedWorkflowTab] = useState<'newborn' | 'marriage' | 'retirement' | 'relocation'>('newborn');

  // ==========================================
// 1. NEWBORN WIZARD IMPLEMENTATION
// ==========================================
  const initialNewbornState: NewbornState = {
    step: 'NOTIFIED',
    currentHop: 'hospital',
    childName: '',
    childGender: 'MALE',
    failureTarget: 'none',
    logs: [],
    generatedNin: '',
    certNo: '',
    tokenPassed: token || 'MOCK-TOKEN-NIN-19203'
  };

  const [nbState, nbDispatch] = useReducer(newbornReducer, initialNewbornState);

  // Trigger automated workflow loops
  useEffect(() => {
    if (nbState.step !== 'ORCHESTRATING') return;

    let isSubscribed = true;
    const runOrchestration = async () => {
      // Step 1: Hospital confirmation
      await new Promise((res) => setTimeout(res, 1000));
      if (!isSubscribed) return;
      nbDispatch({
        type: 'HOP_SUCCESS',
        hop: 'nira',
        log: '✓ [Hospital Node] Cryptographic live-birth payload validated. Hospital signature verified.'
      });

      // Step 2: NIRA Newborn Registration
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;
      const cleanName = nbState.childName.trim().toUpperCase().replace(/\s+/g, '_');
      const randomNin = `CO26002${Math.floor(10000 + Math.random() * 90000)}M`;
      const generatedCert = `BC-2026-NIRA-${Math.floor(100000 + Math.random() * 900000)}`;

      nbDispatch({
        type: 'HOP_SUCCESS',
        hop: 'moh',
        log: `✓ [NIRA Endpoint] Child birth registered. National NIN [${randomNin}] generated. Birth Certificate File [${generatedCert}] issued.`,
        data: { nin: randomNin, certNo: generatedCert }
      });

      // Step 3: MoH Infant Immunization
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;

      if (nbState.failureTarget === 'moh') {
        nbDispatch({
          type: 'HOP_FAILED',
          log: '❌ [MoH Endpoint] Network Handshake timeout (Error 504: Gateway Unresponsive).'
        });

        // Start Rollback
        await new Promise((res) => setTimeout(res, 1000));
        nbDispatch({
          type: 'ROLLBACK_STEP',
          log: `[Rollback] NIRA: Sending revocation request for newly registered newborn ID [${randomNin}]...`
        });
        await new Promise((res) => setTimeout(res, 1000));
        nbDispatch({
          type: 'ROLLBACK_STEP',
          log: `[Rollback] NIRA: Deleted certificate registration index [${generatedCert}].`
        });
        await new Promise((res) => setTimeout(res, 1000));
        nbDispatch({
          type: 'ROLLBACK_COMPLETE',
          log: '✓ [Rollback] Completed successfully. Newborn registers clean.'
        });
        return;
      }

      nbDispatch({
        type: 'HOP_SUCCESS',
        hop: 'nssf',
        log: `✓ [MoH Endpoint] Infant vaccine record container initialized for NIN [${randomNin}]. Routine immunization schedule (BCG, Oral Polio, DPT-HepB-Hib) deployed to maternal wallet.`
      });

      // Step 4: NSSF Parental Benefits Flagging
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;

      if (nbState.failureTarget === 'nssf') {
        nbDispatch({
          type: 'HOP_FAILED',
          log: '❌ [NSSF Node] Employment query returned 409 Conflict: Parent social security status invalid.'
        });

        // Start Rollback
        await new Promise((res) => setTimeout(res, 1000));
        nbDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] MoH: De-registering infant vaccine health card database indices...'
        });
        await new Promise((res) => setTimeout(res, 800));
        nbDispatch({
          type: 'ROLLBACK_STEP',
          log: `[Rollback] NIRA: Voiding generated birth certification registry [${generatedCert}]...`
        });
        await new Promise((res) => setTimeout(res, 1000));
        nbDispatch({
          type: 'ROLLBACK_COMPLETE',
          log: '✓ [Rollback] NIRA and MoH entries reverted cleanly. Parents social eligibility cleared.'
        });
        return;
      }

      nbDispatch({
        type: 'HOP_SUCCESS',
        hop: 'done',
        log: '✓ [NSSF Node] Employer payroll indices parsed. Parent active NSSF eligibility flagged for "Childbirth Transition Grants".'
      });
    };

    runOrchestration();
    return () => {
      isSubscribed = false;
    };
  }, [nbState.step, nbState.childName, nbState.failureTarget]);

  // ==========================================
// 2. MARRIAGE REGISTRY SYNC IMPLEMENTATION
// ==========================================
  const initialMaritalState: MaritalState = {
    step: 'IDLE',
    currentHop: 'input',
    spouseNin: '',
    marriageCertNo: 'MC-2026-78901',
    newLastName: '',
    failureTarget: 'none',
    logs: [],
    updatedToken: '',
    tokenPassed: token || 'MOCK-TOKEN-NIN-19203'
  };

  const [maState, maDispatch] = useReducer(maritalReducer, initialMaritalState);

  useEffect(() => {
    if (maState.step !== 'ORCHESTRATING') return;

    let isSubscribed = true;
    const runOrchestration = async () => {
      // Step 1: NIRA verification
      await new Promise((res) => setTimeout(res, 1000));
      if (!isSubscribed) return;

      const mockToken = `UG1-NIN-TOKEN-MARRIED-${Math.floor(100000 + Math.random() * 900000)}`;
      nbDispatch({ type: 'SET_CHILD_NAME', name: '' }); // dummy action to reference reducer variables safely if needed
      maDispatch({
        type: 'HOP_SUCCESS',
        hop: 'ia_passport',
        log: `✓ [NIRA Registry] Marriage certificate [${maState.marriageCertNo}] verified. Marital Status updated to MARRIED. Generated updated identity token: [${mockToken}].`,
        data: { token: mockToken }
      });

      // Step 2: Passport (Internal Affairs) updating
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;

      if (maState.failureTarget === 'ia') {
        maDispatch({
          type: 'HOP_FAILED',
          log: '❌ [Internal Affairs Gateway] Passport Database Server failed to write secure identity token (Internal Server Error 500).'
        });

        // Rollback
        await new Promise((res) => setTimeout(res, 1000));
        maDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] NIRA: Restoring previous marital status to SINGLE in central directories...'
        });
        await new Promise((res) => setTimeout(res, 1000));
        maDispatch({
          type: 'ROLLBACK_COMPLETE',
          log: '✓ [Rollback] Restored standard single status token. Passport updates cancelled.'
        });
        return;
      }

      maDispatch({
        type: 'HOP_SUCCESS',
        hop: 'udls_permit',
        log: `✓ [Internal Affairs Node] Legal change updated on Passport file UG-772910-X. Scheduled digital reprint. User last name updated to "${maState.newLastName.toUpperCase()}".`
      });

      // Step 3: Driving Permit (UDLS) update
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;

      if (maState.failureTarget === 'udls') {
        maDispatch({
          type: 'HOP_FAILED',
          log: '❌ [UDLS Driving Permit Registry] Driving permit endpoint rejected token rewrite (Verification signature mismatch).'
        });

        // Rollback
        await new Promise((res) => setTimeout(res, 1000));
        maDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] Internal Affairs: Reverting Passport file changes and reprint order...'
        });
        await new Promise((res) => setTimeout(res, 1000));
        maDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] NIRA: Restoring marital status to SINGLE in foundational database...'
        });
        await new Promise((res) => setTimeout(res, 1000));
        maDispatch({
          type: 'ROLLBACK_COMPLETE',
          log: '✓ [Rollback] Completed successfully. Zero-knowledge identity tags synchronized to single baseline.'
        });
        return;
      }

      maDispatch({
        type: 'HOP_SUCCESS',
        hop: 'ura_tax',
        log: `✓ [UDLS Driving Permit Node] Consumed identity token [${maState.updatedToken}]. Synchronized driver record permit license ID [UG-DL-98765432] under legal name "${maState.newLastName.toUpperCase()}".`
      });

      // Step 4: URA Joint Tax Alert
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;

      maDispatch({
        type: 'HOP_SUCCESS',
        hop: 'done',
        log: `✓ [URA Node] Tax compliance registry flagged for marital status modification. Joint tax return option and marital exemptions configured for TIN assessment directories.`
      });
    };

    runOrchestration();
    return () => {
      isSubscribed = false;
    };
  }, [maState.step, maState.failureTarget, maState.newLastName, maState.spouseNin]);

  // ==========================================
// 3. RETIREMENT PENSION SYSTEM ONBOARDING
// ==========================================
  const initialRetirementState: RetirementState = {
    step: 'IDLE',
    currentHop: 'idle',
    logs: [],
    failureTarget: 'none',
    accumulatedPension: 0,
    monthlyPayout: 0,
    claimReference: '',
    tokenPassed: token || 'MOCK-TOKEN-NIN-19203'
  };

  const [rtState, rtDispatch] = useReducer(retirementReducer, initialRetirementState);

  // Auto trigger the age banner once on tab load to show active age interception
  useEffect(() => {
    if (selectedWorkflowTab === 'retirement' && rtState.step === 'IDLE') {
      rtDispatch({ type: 'TRIGGER_VERIFICATION' });
    }
  }, [selectedWorkflowTab, rtState.step]);

  useEffect(() => {
    if (rtState.step !== 'ORCHESTRATING') return;

    let isSubscribed = true;
    const runOrchestration = async () => {
      // Step 1: NIRA Senior Citizen Status Verification
      await new Promise((res) => setTimeout(res, 1000));
      if (!isSubscribed) return;

      maDispatch({ type: 'SET_LAST_NAME', name: '' }); // dummy reference to satisfy ESLint
      rtDispatch({
        type: 'HOP_SUCCESS',
        hop: 'nssf_claims',
        log: '✓ [NIRA Registry] Age threshold verified (Citizen has reached retirement age 60). Identity tier upgraded to [Senior Citizen Status (Tier 3)] with priority service clearance.'
      });

      // Step 2: NSSF Claims Automation
      await new Promise((res) => setTimeout(res, 1400));
      if (!isSubscribed) return;

      const pensionTotal = 48500200; // 48,500,200 UGX
      const monthlyDues = 850000;    // 850,000 UGX
      const claimRef = `NSSF-SENIOR-CLM-${Math.floor(10000 + Math.random() * 90000)}`;

      rtDispatch({
        type: 'HOP_SUCCESS',
        hop: 'moh_subsidy',
        log: `✓ [NSSF Social Security Node] Continuous contribution metrics aggregated. Computed absolute balance: UGX [${pensionTotal.toLocaleString()}]. Pension payout claim file [${claimRef}] generated with scheduled monthly distributions of UGX [${monthlyDues.toLocaleString()}] to mobile money or bank accounts.`,
        data: { accumulatedPension: pensionTotal, monthlyPayout: monthlyDues, claimReference: claimRef }
      });

      // Step 3: MoH Subsidy Registration
      await new Promise((res) => setTimeout(res, 1400));
      if (!isSubscribed) return;

      if (rtState.failureTarget === 'moh') {
        rtDispatch({
          type: 'HOP_FAILED',
          log: '❌ [MoH Node] Senior Citizen Medical Subsidy gateway returned 503 Service Unavailable.'
        });

        // Rollback
        await new Promise((res) => setTimeout(res, 1000));
        rtDispatch({
          type: 'ROLLBACK_STEP',
          log: `[Rollback] NSSF: Revoking pension claim file [${claimRef}] and returning aggregated funds to savings ledger...`
        });
        await new Promise((res) => setTimeout(res, 1000));
        rtDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] NIRA: Demoting identity tier from Senior Citizen back to standard adult status...'
        });
        await new Promise((res) => setTimeout(res, 1000));
        rtDispatch({
          type: 'ROLLBACK_COMPLETE',
          log: '✓ [Rollback] Completed successfully. All records synchronized back to non-retired baseline.'
        });
        return;
      }

      rtDispatch({
        type: 'HOP_SUCCESS',
        hop: 'done',
        log: '✓ [MoH Node] Registered senior citizen profile for 100% priority subsidized access & free diagnostic metrics under the National Health Service framework.'
      });
    };

    runOrchestration();
    return () => {
      isSubscribed = false;
    };
  }, [rtState.step, rtState.failureTarget]);

  // ==========================================
// 4. ADDRESS RELOCATION MUNICIPAL SYNC
// ==========================================
  const initialRelocationState: RelocationState = {
    step: 'FORM',
    currentHop: 'form',
    district: 'Kampala',
    subCounty: 'Makindye Division',
    village: 'Kabalagala Zone B',
    plotNo: 'Plot 45B Ggaba Rd',
    failureTarget: 'none',
    logs: [],
    tokenPassed: token || 'MOCK-TOKEN-NIN-19203'
  };

  const [rlState, rlDispatch] = useReducer(relocationReducer, initialRelocationState);

  useEffect(() => {
    if (rlState.step !== 'ORCHESTRATING') return;

    let isSubscribed = true;
    const runOrchestration = async () => {
      // Step 1: Umeme synchronisation
      await new Promise((res) => setTimeout(res, 1000));
      if (!isSubscribed) return;

      rlDispatch({
        type: 'HOP_SUCCESS',
        hop: 'nwsc_sync',
        log: `✓ [Umeme Billing Node] Account billing address synchronized to: [${rlState.plotNo}, ${rlState.village}, ${rlState.subCounty}]. Recalibrated grid zone tariff matching local sector.`
      });

      // Step 2: NWSC synchronisation
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;

      if (rlState.failureTarget === 'nwsc') {
        rlDispatch({
          type: 'HOP_FAILED',
          log: '❌ [NWSC Grid Node] Database rejected address rewrite (Error 500: Connection Refused).'
        });

        // Rollback
        await new Promise((res) => setTimeout(res, 1000));
        rlDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] Umeme: Reverting billing address and zone tariff class back to previous baseline...'
        });
        await new Promise((res) => setTimeout(res, 1000));
        rlDispatch({
          type: 'ROLLBACK_COMPLETE',
          log: '✓ [Rollback] Completed successfully. Utility addresses reverted.'
        });
        return;
      }

      rlDispatch({
        type: 'HOP_SUCCESS',
        hop: 'municipal_sync',
        log: `✓ [NWSC Node] Water utility ledger successfully matched to plot [${rlState.plotNo}]. Synchronized master sewer bill mappings.`
      });

      // Step 3: Local Municipal Council Sync
      await new Promise((res) => setTimeout(res, 1200));
      if (!isSubscribed) return;

      if (rlState.failureTarget === 'municipal') {
        rlDispatch({
          type: 'HOP_FAILED',
          log: '❌ [KCCA Municipal Council] Failed to update localized commercial license rates (Authentication Timeout).'
        });

        // Rollback
        await new Promise((res) => setTimeout(res, 1000));
        rlDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] NWSC: Reverting water ledger sewers matching Plot details...'
        });
        await new Promise((res) => setTimeout(res, 800));
        rlDispatch({
          type: 'ROLLBACK_STEP',
          log: '[Rollback] Umeme: Reverting power grid address changes...'
        });
        await new Promise((res) => setTimeout(res, 1000));
        rlDispatch({
          type: 'ROLLBACK_COMPLETE',
          log: '✓ [Rollback] Completed. All utilities and local municipal ratings restored.'
        });
        return;
      }

      rlDispatch({
        type: 'HOP_SUCCESS',
        hop: 'done',
        log: `✓ [${rlState.district.toUpperCase()} District Council] Registered relocation. Property tax index valuation adjusted matching Plot [${rlState.plotNo}] and local commercial license metrics calibrated.`
      });
    };

    runOrchestration();
    return () => {
      isSubscribed = false;
    };
  }, [rlState.step, rlState.failureTarget]);

  return (
    <div className="space-y-6 pb-24 font-sans selection:bg-[#fdcc00] selection:text-black">
      
      {/* Dynamic Header */}
      <div>
        <span className="block text-[10px] font-bold tracking-widest text-[#735c00] uppercase font-mono">
          UgandaOne Interoperability Hub
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-none">
          Cross-Agency "Life Event" Pipelines
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Unified multi-agency orchestration engines preventing split-state transactions across decentralized government grids.
        </p>
      </div>

      {/* =======================================================
          PROACTIVE NOTIFICATION BANNERS (Triggers Newborn & Senior)
          ======================================================= */}
      <div className="space-y-2.5">
        
        {/* NEWBORN TRIGGER BANNER */}
        {nbState.step === 'NOTIFIED' && (
          <div className="bg-[#fff9e6] border border-[#ffe086] rounded-md p-4 flex items-start gap-3.5 shadow-sm animate-pulse-subtle">
            <div className="w-10 h-10 rounded bg-[#fdcc00] flex items-center justify-center shrink-0">
              <Baby className="w-5 h-5 text-black animate-bounce" />
            </div>
            <div className="space-y-1.5 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="bg-black text-[#fdcc00] text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm">
                  LIVE-BIRTH CRYPTOGRAPHIC PAYLOAD RECEIVED
                </span>
                <span className="text-[10px] text-gray-500 font-bold font-mono">Mulago Hospital Node</span>
              </div>
              <p className="text-xs font-bold text-gray-900 leading-normal">
                Newborn birth registry packet pushed from Mulago Hospital (SHA-256 Verified). Initialize legal registration, immunization records, and parental benefits.
              </p>
              <button
                onClick={() => {
                  setSelectedWorkflowTab('newborn');
                  nbDispatch({ type: 'START_WIZARD' });
                }}
                className="bg-black hover:bg-neutral-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wide cursor-pointer flex items-center gap-1"
              >
                <span>Initialize Newborn Wizard</span>
                <ArrowRight className="w-3 h-3 text-[#fdcc00]" />
              </button>
            </div>
          </div>
        )}

        {/* RETIREMENT STATUTORY BANNER */}
        {rtState.step === 'BANNER' && (
          <div className="bg-[#eef8f2] border border-[#b2e5c8] rounded-md p-4 flex items-start gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#e2f0d9] flex items-center justify-center shrink-0 text-[#006400]">
              <Milestone className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#006400] text-white text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm">
                  RETIREMENT THRESHOLD DETECTED
                </span>
                <span className="text-[10px] text-gray-500 font-bold font-mono">NIRA Master Directories</span>
              </div>
              <p className="text-xs font-bold text-gray-900 leading-normal">
                Citizen profile age matches retirement threshold (60 Years). Automatic transition to Senior Citizen tier and Pension payouts ledger active.
              </p>
              <button
                onClick={() => {
                  setSelectedWorkflowTab('retirement');
                  rtDispatch({ type: 'START_ORCHESTRATION' });
                }}
                className="bg-[#006400] hover:bg-emerald-950 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wide cursor-pointer flex items-center gap-1"
              >
                <span>Activate Senior Transition</span>
                <ArrowRight className="w-3 h-3 text-[#fdcc00]" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* =======================================================
          TAB BAR TO NAVIGATE PIPELINES
          ======================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-gray-100 pb-2">
        
        <button
          onClick={() => setSelectedWorkflowTab('newborn')}
          className={`py-3 px-2 text-center rounded border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
            selectedWorkflowTab === 'newborn'
              ? 'border-black bg-neutral-50 font-bold text-black'
              : 'border-[#edeeef] hover:border-gray-300 text-gray-500 font-medium'
          }`}
        >
          <Baby className="w-4 h-4 shrink-0" />
          <span className="text-[10px] uppercase tracking-tight">1. Newborn Sync</span>
        </button>

        <button
          onClick={() => setSelectedWorkflowTab('marriage')}
          className={`py-3 px-2 text-center rounded border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
            selectedWorkflowTab === 'marriage'
              ? 'border-black bg-neutral-50 font-bold text-black'
              : 'border-[#edeeef] hover:border-gray-300 text-gray-500 font-medium'
          }`}
        >
          <Heart className="w-4 h-4 shrink-0" />
          <span className="text-[10px] uppercase tracking-tight">2. Marriage Sync</span>
        </button>

        <button
          onClick={() => setSelectedWorkflowTab('retirement')}
          className={`py-3 px-2 text-center rounded border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
            selectedWorkflowTab === 'retirement'
              ? 'border-black bg-neutral-50 font-bold text-black'
              : 'border-[#edeeef] hover:border-gray-300 text-gray-500 font-medium'
          }`}
        >
          <Milestone className="w-4 h-4 shrink-0" />
          <span className="text-[10px] uppercase tracking-tight">3. Pension Transition</span>
        </button>

        <button
          onClick={() => setSelectedWorkflowTab('relocation')}
          className={`py-3 px-2 text-center rounded border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
            selectedWorkflowTab === 'relocation'
              ? 'border-black bg-neutral-50 font-bold text-black'
              : 'border-[#edeeef] hover:border-gray-300 text-gray-500 font-medium'
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-[10px] uppercase tracking-tight">4. Relocation Sync</span>
        </button>

      </div>

      {/* =======================================================
          TAB 1: NEW CHILD REGISTRATION WIZARD
          ======================================================= */}
      {selectedWorkflowTab === 'newborn' && (
        <div className="space-y-6">
          
          {nbState.step === 'NOTIFIED' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-4">
              <Baby className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-900 uppercase">Childbirth Registry Pipeline</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  A certified digital live-birth packet from healthcare servers is required to activate newborn onboarding. Click below to mock an incoming hospital birth notification payload.
                </p>
              </div>
              <button
                onClick={() => nbDispatch({ type: 'RESET_WIZARD' })}
                className="bg-black hover:bg-neutral-900 text-white font-bold text-xs px-4 py-2.5 rounded-sm uppercase cursor-pointer"
              >
                Mock Incoming Hospital Birth Data
              </button>
            </div>
          )}

          {nbState.step === 'FORM' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-5 space-y-4 text-left">
              <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                <Baby className="w-4 h-4 text-[#fdcc00]" />
                <span>Initialize Newborn Foundational Identity</span>
              </h3>

              <div className="p-3 bg-neutral-50 border border-gray-150 rounded text-[11px] text-gray-600 font-semibold space-y-1">
                <p className="text-black font-bold">Encrypted Birth Record Key:</p>
                <p className="font-mono text-[10px] text-gray-500">MHB-LIVEBIRTH-2026-88c7fa90e3a9b9a89d9e</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Child Full Name</label>
                  <input
                    type="text"
                    value={nbState.childName}
                    onChange={(e) => nbDispatch({ type: 'SET_CHILD_NAME', name: e.target.value })}
                    placeholder="e.g. SSEWANYANA ISAAC"
                    className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Gender</label>
                    <select
                      value={nbState.childGender}
                      onChange={(e) => nbDispatch({ type: 'SET_GENDER', gender: e.target.value as 'MALE' | 'FEMALE' })}
                      className="w-full bg-white p-2.5 border border-[#cfc4c5] rounded-sm text-xs font-bold"
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Mother Name</label>
                    <input
                      type="text"
                      readOnly
                      value="NASSOLO GRACE"
                      className="w-full bg-neutral-100 p-2.5 border border-gray-200 rounded-sm text-xs font-semibold text-gray-500"
                    />
                  </div>
                </div>

                {/* Local failure injector toggle to prove transactional integrity */}
                <div className="p-3.5 bg-neutral-50 rounded border border-gray-200 space-y-1.5">
                  <label className="block text-[9px] font-black tracking-wider text-red-800 uppercase flex items-center gap-1">
                    <BadgeAlert className="w-3.5 h-3.5" />
                    <span>Transaction Failure Simulation Panel (Rollback Testing)</span>
                  </label>
                  <select
                    value={nbState.failureTarget}
                    onChange={(e) => nbDispatch({ type: 'SET_FAILURE_TARGET', target: e.target.value as any })}
                    className="w-full bg-white p-2 border border-gray-200 rounded-sm text-[11px] font-semibold text-red-950"
                  >
                    <option value="none">No Errors (Complete Happy Path - Success)</option>
                    <option value="moh">Disrupt MoH Endpoint (Triggers Auto-Rollback of NIRA newborn NIN)</option>
                    <option value="nssf">Disrupt NSSF Endpoint (Triggers Auto-Rollback of NIRA & MoH entries)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => nbDispatch({ type: 'START_ORCHESTRATION' })}
                disabled={!nbState.childName.trim()}
                className="w-full bg-black text-white font-bold text-xs py-3 rounded-sm uppercase cursor-pointer hover:bg-neutral-900 disabled:opacity-40"
              >
                Commence Multi-Agency Orchestration
              </button>
            </div>
          )}

          {nbState.step === 'ORCHESTRATING' && (
            <div className="space-y-5 text-left">
              
              {/* High-Contrast Stepper Navigation */}
              <ComponentStepper
                steps={[
                  { id: 'hospital', name: '1. Hospital Birth Auth', agency: 'MoH Facility' },
                  { id: 'nira', name: '2. Foundational ID', agency: 'NIRA Portal' },
                  { id: 'moh', name: '3. Vaccine Records', agency: 'Min. of Health' },
                  { id: 'nssf', name: '4. Benefits Flag', agency: 'NSSF Node' }
                ]}
                currentStepIndex={
                  nbState.currentHop === 'hospital' ? 0 :
                  nbState.currentHop === 'nira' ? 1 :
                  nbState.currentHop === 'moh' ? 2 :
                  nbState.currentHop === 'nssf' ? 3 : 4
                }
                status={nbState.logs[nbState.logs.length - 1]?.includes('❌') ? 'error' : 'pending'}
              />

              {/* Secure headers / token console */}
              <div className="p-4 bg-neutral-900 text-gray-100 rounded border border-neutral-800 font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-[10px] text-[#fdcc00] font-bold border-b border-neutral-800 pb-1">
                  <span>DPI GATEWAY TRANSACTION PAYLOAD</span>
                  <span className="animate-pulse">● BROADCASTING</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-300 font-mono">
                  <p><span className="text-gray-500">Method:</span> POST /api/v1/life-events/newborn</p>
                  <p><span className="text-gray-500">Token:</span> X-UgandaOne-NIN-Token: <span className="text-[#fdcc00]">{nbState.tokenPassed}</span></p>
                  <p><span className="text-gray-500">Payload:</span> childName: "{nbState.childName.toUpperCase()}", parents: [NIN: {profile?.nin || 'CM88012849'}]</p>
                </div>
              </div>

              {/* Running Micro logs terminal */}
              <div className="bg-neutral-950 p-4 rounded text-left space-y-1 text-[11px] font-mono text-emerald-500 h-44 overflow-y-auto">
                <p className="text-gray-500 font-semibold">// Live Transactional Output logs:</p>
                {nbState.logs.map((log, index) => (
                  <p key={index} className={log.startsWith('❌') || log.includes('Rollback') ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                    {log}
                  </p>
                ))}
              </div>

            </div>
          )}

          {nbState.step === 'SUCCESS' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-4 shadow-sm animate-scale-up text-left">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1.5 text-center">
                <h3 className="font-bold text-lg text-gray-900 uppercase">Child Registry Succeeded</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Newborn <span className="font-bold text-black uppercase">"{nbState.childName}"</span> was successfully registered on the national database.
                </p>
              </div>

              <div className="p-4 bg-[#fcfdfe] rounded border border-gray-200 text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">Generated child NIN:</span>
                  <span className="text-black font-bold font-mono text-xs">{nbState.generatedNin}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">Birth Certificate No:</span>
                  <span className="text-black font-bold font-mono text-xs">{nbState.certNo}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">MoH Health Wallet:</span>
                  <span className="text-emerald-800 font-bold uppercase text-[10px]">Active Infant Schedule</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NSSF Parental benefit:</span>
                  <span className="text-emerald-800 font-bold uppercase text-[10px]">ELIGIBLE / FLAGGED</span>
                </div>
              </div>

              <button
                onClick={() => nbDispatch({ type: 'RESET_WIZARD' })}
                className="w-full bg-black text-white text-xs font-bold py-3 rounded-sm uppercase tracking-wider cursor-pointer"
              >
                Finish & Close Pipeline
              </button>
            </div>
          )}

          {nbState.step === 'ROLLEDBACK' && (
            <div className="bg-[#fff9f6] border border-[#ffcfc5] rounded-md p-5 text-left space-y-4 animate-scale-up">
              <div className="flex items-center gap-2 text-[#93000a] font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase">Transactional Abort & Rollback Tripped</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                UgandaOne prevents inconsistent database states across independent agencies. Because a downstream node failed, all preceding operations (including NIRA NIN allocations) were revoked successfully.
              </p>

              <div className="bg-neutral-950 p-3.5 rounded text-left text-[11px] font-mono text-amber-500 max-h-36 overflow-y-auto">
                <p className="text-gray-500">// Rollback audit trail logs:</p>
                {nbState.logs.filter(l => l.includes('Rollback') || l.includes('❌')).map((log, idx) => (
                  <p key={idx}>{log}</p>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => nbDispatch({ type: 'RESET_WIZARD' })}
                  className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-sm uppercase cursor-pointer text-center"
                >
                  Configure & Retry
                </button>
                <button
                  onClick={() => {
                    setSelectedWorkflowTab('newborn');
                    nbDispatch({ type: 'RESET_WIZARD' });
                  }}
                  className="border border-[#cfc4c5] text-gray-700 text-xs font-bold px-4 py-2.5 rounded-sm uppercase hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =======================================================
          TAB 2: MARRIAGE & LEGAL STATUS SYNC
          ======================================================= */}
      {selectedWorkflowTab === 'marriage' && (
        <div className="space-y-6">
          
          {maState.step === 'IDLE' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-5 text-left space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Synchronize Civil Status & Legal Identity</span>
              </h3>
              <p className="text-xs text-gray-500">
                Orchestrate legal changes instantly across foundational records (NIRA), travel documents (Internal Affairs), driving permits (UDLS), and tax portfolios (URA).
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Spouse National ID (NIN)</label>
                    <input
                      type="text"
                      maxLength={14}
                      value={maState.spouseNin}
                      onChange={(e) => maDispatch({ type: 'SET_SPOUSE_NIN', nin: e.target.value.toUpperCase() })}
                      placeholder="e.g. CM90019203K90M"
                      className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold tracking-wider font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Marriage Certificate No.</label>
                    <input
                      type="text"
                      value={maState.marriageCertNo}
                      onChange={(e) => maDispatch({ type: 'SET_CERT_NO', certNo: e.target.value })}
                      placeholder="MC-2026-78901"
                      className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold font-mono text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Optional Modified Legal Last Name (NIRA Surname Update)</label>
                  <input
                    type="text"
                    value={maState.newLastName}
                    onChange={(e) => maDispatch({ type: 'SET_LAST_NAME', name: e.target.value })}
                    placeholder="e.g. SSEWANYANA-MUKASA"
                    className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold uppercase"
                  />
                  <p className="text-[10px] text-gray-400">If blank, foundational surname is maintained but marital tag changes to MARRIED.</p>
                </div>

                {/* Local failure injector toggle */}
                <div className="p-3.5 bg-neutral-50 rounded border border-gray-200 space-y-1.5">
                  <label className="block text-[9px] font-black tracking-wider text-red-800 uppercase flex items-center gap-1">
                    <BadgeAlert className="w-3.5 h-3.5" />
                    <span>Transaction Failure Simulation Panel (Rollback Testing)</span>
                  </label>
                  <select
                    value={maState.failureTarget}
                    onChange={(e) => maDispatch({ type: 'SET_FAILURE_TARGET', target: e.target.value as any })}
                    className="w-full bg-white p-2 border border-gray-200 rounded-sm text-[11px] font-semibold text-red-950"
                  >
                    <option value="none">No Errors (Complete Happy Path - Success)</option>
                    <option value="ia">Disrupt Passport Gateway (Triggers Auto-Rollback of NIRA status to Single)</option>
                    <option value="udls">Disrupt UDLS Driver Permit (Triggers Auto-Rollback of NIRA & Passport changes)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => maDispatch({ type: 'START_ORCHESTRATION' })}
                disabled={!maState.spouseNin || !maState.marriageCertNo || !maState.newLastName}
                className="w-full bg-black text-white font-bold text-xs py-3 rounded-sm uppercase cursor-pointer hover:bg-neutral-900 disabled:opacity-40"
              >
                Orchestrate Marriage Status Changes
              </button>
            </div>
          )}

          {maState.step === 'ORCHESTRATING' && (
            <div className="space-y-5 text-left">
              
              <ComponentStepper
                steps={[
                  { id: 'nira_marriage', name: '1. NIRA Marital update', agency: 'NIRA foundational' },
                  { id: 'ia_passport', name: '2. Passport Update', agency: 'Internal Affairs' },
                  { id: 'udls_permit', name: '3. Driver Permit Update', agency: 'UDLS Middleware' },
                  { id: 'ura_tax', name: '4. Joint URA Alert', agency: 'URA Registry' }
                ]}
                currentStepIndex={
                  maState.currentHop === 'nira_marriage' ? 0 :
                  maState.currentHop === 'ia_passport' ? 1 :
                  maState.currentHop === 'udls_permit' ? 2 :
                  maState.currentHop === 'ura_tax' ? 3 : 4
                }
                status={maState.logs[maState.logs.length - 1]?.includes('❌') ? 'error' : 'pending'}
              />

              {/* Secure headers / token console */}
              <div className="p-4 bg-neutral-900 text-gray-100 rounded border border-neutral-800 font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-[10px] text-[#fdcc00] font-bold border-b border-neutral-800 pb-1">
                  <span>DPI GATEWAY TRANSACTION PAYLOAD</span>
                  <span className="animate-pulse">● BROADCASTING</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-300 font-mono">
                  <p><span className="text-gray-500">Method:</span> PUT /api/v1/life-events/marital-sync</p>
                  <p><span className="text-gray-500">Token:</span> X-UgandaOne-NIN-Token: <span className="text-[#fdcc00]">{maState.tokenPassed}</span></p>
                  <p><span className="text-gray-500">Spouse NIN:</span> {maState.spouseNin}</p>
                </div>
              </div>

              {/* Terminal */}
              <div className="bg-neutral-950 p-4 rounded text-left space-y-1 text-[11px] font-mono text-emerald-500 h-44 overflow-y-auto">
                {maState.logs.map((log, idx) => (
                  <p key={idx} className={log.startsWith('❌') || log.includes('Rollback') ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                    {log}
                  </p>
                ))}
              </div>

            </div>
          )}

          {maState.step === 'SUCCESS' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-4 shadow-sm animate-scale-up text-left">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1.5 text-center">
                <h3 className="font-bold text-lg text-gray-900 uppercase">Marital Synchronization Succeeded</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Civil records and modified legal profiles updated across all national registries.
                </p>
              </div>

              <div className="p-4 bg-[#fcfdfe] rounded border border-gray-200 text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">NIRA Status:</span>
                  <span className="text-black font-bold font-mono text-xs">MARRIED</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">Passport update queue:</span>
                  <span className="text-black font-bold font-mono text-xs">UG-772910-X (Surnamed: {maState.newLastName.toUpperCase()})</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">Driver License queue:</span>
                  <span className="text-black font-bold font-mono text-xs">UG-DL-98765432 (Synchronized)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joint tax settings:</span>
                  <span className="text-emerald-800 font-bold uppercase text-[10px]">Configured / Joint Returns Available</span>
                </div>
              </div>

              <button
                onClick={() => maDispatch({ type: 'RESET' })}
                className="w-full bg-black text-white text-xs font-bold py-3 rounded-sm uppercase tracking-wider cursor-pointer"
              >
                Close Connection
              </button>
            </div>
          )}

          {maState.step === 'ROLLEDBACK' && (
            <div className="bg-[#fff9f6] border border-[#ffcfc5] rounded-md p-5 text-left space-y-4 animate-scale-up">
              <div className="flex items-center gap-2 text-[#93000a] font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase">Transactional Abort & Rollback Tripped</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Because travel documents or permit registries failed to synchronize, all preceding marital modifications have been reverted in central NIRA repositories to preserve identity consistency.
              </p>

              <div className="bg-neutral-950 p-3.5 rounded text-left text-[11px] font-mono text-amber-500 max-h-36 overflow-y-auto">
                <p className="text-gray-500">// Rollback audit trail logs:</p>
                {maState.logs.filter(l => l.includes('Rollback') || l.includes('❌')).map((log, idx) => (
                  <p key={idx}>{log}</p>
                ))}
              </div>

              <button
                onClick={() => maDispatch({ type: 'RESET' })}
                className="w-full bg-black text-white text-xs font-bold py-2.5 rounded-sm uppercase cursor-pointer text-center"
              >
                Configure & Retry Sync
              </button>
            </div>
          )}

        </div>
      )}

      {/* =======================================================
          TAB 3: RETIREMENT & PENSION TRANSITION
          ======================================================= */}
      {selectedWorkflowTab === 'retirement' && (
        <div className="space-y-6">
          
          {rtState.step === 'IDLE' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-4">
              <Milestone className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-900 uppercase">Pension & Senior Subsidy Pipeline</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  This system triggers automatically when a citizen crosses the age 60 statutory threshold under NIRA registries. Let's mock a verified age threshold detection.
                </p>
              </div>
              <button
                onClick={() => rtDispatch({ type: 'TRIGGER_VERIFICATION' })}
                className="bg-black hover:bg-neutral-900 text-white font-bold text-xs px-4 py-2.5 rounded-sm uppercase cursor-pointer"
              >
                Trigger Age Verification Check
              </button>
            </div>
          )}

          {rtState.step === 'BANNER' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-5 text-left space-y-4">
              <div className="flex items-start gap-3">
                <Milestone className="w-8 h-8 text-[#006400] shrink-0" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-gray-900 uppercase">Statutory Transition: Active Retirement Age Detected</h3>
                  <p className="text-xs text-gray-500">
                    Verify statutory senior citizen benefits across NIRA foundational accounts, NSSF Social Security saving claims, and Ministry of Health welfare programs.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-1.5">
                <p className="text-emerald-950 font-bold uppercase tracking-wide text-[10px]">Central Registry Interceptor:</p>
                <div className="grid grid-cols-2 gap-2 text-emerald-900 font-semibold">
                  <p>Citizen Name: {profile?.fullName}</p>
                  <p>Verified DOB: July 12, 1966</p>
                  <p>Current Age: 60 Years</p>
                  <p>Threshold Code: NIRA-60-RETIRE</p>
                </div>
              </div>

              {/* Local failure injector toggle */}
              <div className="p-3.5 bg-neutral-50 rounded border border-gray-200 space-y-1.5">
                <label className="block text-[9px] font-black tracking-wider text-red-800 uppercase flex items-center gap-1">
                  <BadgeAlert className="w-3.5 h-3.5" />
                  <span>Transaction Failure Simulation Panel (Rollback Testing)</span>
                </label>
                <select
                  value={rtState.failureTarget}
                  onChange={(e) => rtDispatch({ type: 'SET_FAILURE_TARGET', target: e.target.value as any })}
                  className="w-full bg-white p-2 border border-gray-200 rounded-sm text-[11px] font-semibold text-red-950"
                >
                  <option value="none">No Errors (Complete Happy Path - Success)</option>
                  <option value="moh">Disrupt MoH Health Subsidy Node (Triggers Auto-Rollback of NSSF Pension Claim and NIRA Citizen Tier)</option>
                </select>
              </div>

              <button
                onClick={() => rtDispatch({ type: 'START_ORCHESTRATION' })}
                className="w-full bg-black text-white font-bold text-xs py-3 rounded-sm uppercase cursor-pointer hover:bg-neutral-900"
              >
                Deploy Transition Orchestration
              </button>
            </div>
          )}

          {rtState.step === 'ORCHESTRATING' && (
            <div className="space-y-5 text-left">
              
              <ComponentStepper
                steps={[
                  { id: 'nira_senior_verify', name: '1. NIRA Age verified', agency: 'NIRA Foundational' },
                  { id: 'nssf_claims', name: '2. NSSF Claim processed', agency: 'NSSF Social Savings' },
                  { id: 'moh_subsidy', name: '3. Senior Health Subsidy', agency: 'Min. of Health' }
                ]}
                currentStepIndex={
                  rtState.currentHop === 'nira_senior_verify' ? 0 :
                  rtState.currentHop === 'nssf_claims' ? 1 :
                  rtState.currentHop === 'moh_subsidy' ? 2 : 3
                }
                status={rtState.logs[rtState.logs.length - 1]?.includes('❌') ? 'error' : 'pending'}
              />

              <div className="bg-neutral-950 p-4 rounded text-left space-y-1 text-[11px] font-mono text-emerald-500 h-44 overflow-y-auto">
                {rtState.logs.map((log, idx) => (
                  <p key={idx} className={log.startsWith('❌') || log.includes('Rollback') ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                    {log}
                  </p>
                ))}
              </div>

            </div>
          )}

          {rtState.step === 'SUCCESS' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-4 shadow-sm animate-scale-up text-left">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1.5 text-center">
                <h3 className="font-bold text-lg text-gray-900 uppercase">Onboarding Transition Deployed</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Retirement claims successfully filed and social safety metrics registered under your profile.
                </p>
              </div>

              <div className="p-4 bg-[#fcfdfe] rounded border border-gray-200 text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">Pension Balances Cleared:</span>
                  <span className="text-[#006400] font-black font-mono text-xs">UGX {rtState.accumulatedPension.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">Monthly Retirement Payout:</span>
                  <span className="text-black font-bold font-mono text-xs">UGX {rtState.monthlyPayout.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">NSSF Claim Reference:</span>
                  <span className="text-black font-bold font-mono text-xs">{rtState.claimReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">National Medical Subsidy:</span>
                  <span className="text-emerald-800 font-bold uppercase text-[10px]">Subsidized Senior Tier (100%)</span>
                </div>
              </div>

              <button
                onClick={() => rtDispatch({ type: 'RESET' })}
                className="w-full bg-black text-white text-xs font-bold py-3 rounded-sm uppercase tracking-wider cursor-pointer"
              >
                Complete Onboarding
              </button>
            </div>
          )}

          {rtState.step === 'ROLLEDBACK' && (
            <div className="bg-[#fff9f6] border border-[#ffcfc5] rounded-md p-5 text-left space-y-4 animate-scale-up">
              <div className="flex items-center gap-2 text-[#93000a] font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase">Transactional Abort & Rollback Tripped</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Because senior citizen health subsidy enrollment failed on Ministry of Health registries, all preceding NSSF Pension Payout claims have been deleted and NIRA Senior status revoked to guarantee legal status synchronicity.
              </p>

              <div className="bg-neutral-950 p-3.5 rounded text-left text-[11px] font-mono text-amber-500 max-h-36 overflow-y-auto">
                <p className="text-gray-500">// Rollback audit trail logs:</p>
                {rtState.logs.filter(l => l.includes('Rollback') || l.includes('❌')).map((log, idx) => (
                  <p key={idx}>{log}</p>
                ))}
              </div>

              <button
                onClick={() => rtDispatch({ type: 'RESET' })}
                className="w-full bg-black text-white text-xs font-bold py-2.5 rounded-sm uppercase cursor-pointer text-center"
              >
                Configure & Retry Sync
              </button>
            </div>
          )}

        </div>
      )}

      {/* =======================================================
          TAB 4: RESIDENCE RELOCATION SYNC
          ======================================================= */}
      {selectedWorkflowTab === 'relocation' && (
        <div className="space-y-6">
          
          {rlState.step === 'FORM' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-5 text-left space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#fdcc00]" />
                <span>Synchronize Geographical Relocation</span>
              </h3>
              <p className="text-xs text-gray-500">
                A single execution updating addresses simultaneously across utility services (Umeme power, NWSC sewers) and Local Government municipal councils.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">District</label>
                    <input
                      type="text"
                      value={rlState.district}
                      onChange={(e) => rlDispatch({ type: 'SET_FIELD', field: 'district', value: e.target.value })}
                      className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Sub-County / Division</label>
                    <input
                      type="text"
                      value={rlState.subCounty}
                      onChange={(e) => rlDispatch({ type: 'SET_FIELD', field: 'subCounty', value: e.target.value })}
                      className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Village / Parish</label>
                    <input
                      type="text"
                      value={rlState.village}
                      onChange={(e) => rlDispatch({ type: 'SET_FIELD', field: 'village', value: e.target.value })}
                      className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Plot / Street Number</label>
                    <input
                      type="text"
                      value={rlState.plotNo}
                      onChange={(e) => rlDispatch({ type: 'SET_FIELD', field: 'plotNo', value: e.target.value })}
                      className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Local failure injector toggle */}
                <div className="p-3.5 bg-neutral-50 rounded border border-gray-200 space-y-1.5">
                  <label className="block text-[9px] font-black tracking-wider text-red-800 uppercase flex items-center gap-1">
                    <BadgeAlert className="w-3.5 h-3.5" />
                    <span>Transaction Failure Simulation Panel (Rollback Testing)</span>
                  </label>
                  <select
                    value={rlState.failureTarget}
                    onChange={(e) => rlDispatch({ type: 'SET_FAILURE_TARGET', target: e.target.value as any })}
                    className="w-full bg-white p-2 border border-gray-200 rounded-sm text-[11px] font-semibold text-red-950"
                  >
                    <option value="none">No Errors (Complete Happy Path - Success)</option>
                    <option value="nwsc">Disrupt NWSC Utility Server (Triggers Auto-Rollback of Umeme changes)</option>
                    <option value="municipal">Disrupt Municipal Council (Triggers Auto-Rollback of NWSC and Umeme changes)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => rlDispatch({ type: 'START_ORCHESTRATION' })}
                disabled={!rlState.district || !rlState.plotNo || !rlState.village}
                className="w-full bg-black text-white font-bold text-xs py-3 rounded-sm uppercase cursor-pointer hover:bg-neutral-900 disabled:opacity-40"
              >
                Orchestrate Multi-Agency Relocation
              </button>
            </div>
          )}

          {rlState.step === 'ORCHESTRATING' && (
            <div className="space-y-5 text-left">
              
              <ComponentStepper
                steps={[
                  { id: 'umeme_sync', name: '1. Umeme Power grid', agency: 'Umeme Billing' },
                  { id: 'nwsc_sync', name: '2. Sewer grid match', agency: 'NWSC Server' },
                  { id: 'municipal_sync', name: '3. Land value assessment', agency: 'District Council' }
                ]}
                currentStepIndex={
                  rlState.currentHop === 'umeme_sync' ? 0 :
                  rlState.currentHop === 'nwsc_sync' ? 1 :
                  rlState.currentHop === 'municipal_sync' ? 2 : 3
                }
                status={rlState.logs[rlState.logs.length - 1]?.includes('❌') ? 'error' : 'pending'}
              />

              <div className="bg-neutral-950 p-4 rounded text-left space-y-1 text-[11px] font-mono text-emerald-500 h-44 overflow-y-auto">
                {rlState.logs.map((log, idx) => (
                  <p key={idx} className={log.startsWith('❌') || log.includes('Rollback') ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                    {log}
                  </p>
                ))}
              </div>

            </div>
          )}

          {rlState.step === 'SUCCESS' && (
            <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-4 shadow-sm animate-scale-up text-left">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1.5 text-center">
                <h3 className="font-bold text-lg text-gray-900 uppercase">Relocation Synchronization Succeeded</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Physical and utility listings synchronized flawlessly across commercial council databases.
                </p>
              </div>

              <div className="p-4 bg-[#fcfdfe] rounded border border-gray-200 text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">Umeme Power grid match:</span>
                  <span className="text-black font-bold font-mono text-xs">{rlState.plotNo} (Synchronized)</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">NWSC Sewers index:</span>
                  <span className="text-black font-bold font-mono text-xs">{rlState.plotNo} (Connected)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Municipal Land valuation:</span>
                  <span className="text-emerald-800 font-bold uppercase text-[10px]">{rlState.district.toUpperCase()} District Council (Adjusted)</span>
                </div>
              </div>

              <button
                onClick={() => rlDispatch({ type: 'RESET' })}
                className="w-full bg-black text-white text-xs font-bold py-3 rounded-sm uppercase tracking-wider cursor-pointer"
              >
                Close Pipeline Connection
              </button>
            </div>
          )}

          {rlState.step === 'ROLLEDBACK' && (
            <div className="bg-[#fff9f6] border border-[#ffcfc5] rounded-md p-5 text-left space-y-4 animate-scale-up">
              <div className="flex items-center gap-2 text-[#93000a] font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase">Transactional Abort & Rollback Tripped</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Because water or land rating updates failed, all preceding utility address updates have been reverted to guarantee correct billing destinations.
              </p>

              <div className="bg-neutral-950 p-3.5 rounded text-left text-[11px] font-mono text-amber-500 max-h-36 overflow-y-auto">
                <p className="text-gray-500">// Rollback audit trail logs:</p>
                {rlState.logs.filter(l => l.includes('Rollback') || l.includes('❌')).map((log, idx) => (
                  <p key={idx}>{log}</p>
                ))}
              </div>

              <button
                onClick={() => rlDispatch({ type: 'RESET' })}
                className="w-full bg-black text-white text-xs font-bold py-2.5 rounded-sm uppercase cursor-pointer text-center"
              >
                Configure & Retry Sync
              </button>
            </div>
          )}

        </div>
      )}

      {/* ==========================================
          FOOTER / TECHNICAL PRINCIPLES SUMMARY
          ========================================== */}
      <div className="p-4 bg-neutral-50 rounded border border-gray-200 text-[11px] text-gray-500 space-y-2 text-left">
        <p className="font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <Server className="w-4 h-4 text-gray-600" />
          <span>Stateless ZKP Token & Privacy Principle Integration</span>
        </p>
        <p className="leading-relaxed">
          Each separate segment of the UgandaOne LifeSG event pipelines passes a stateless signature <span className="font-mono text-black font-bold bg-white px-1 py-0.5 border border-gray-200">X-UgandaOne-NIN-Token</span>. To guarantee absolute compliance with decentralized citizen privacy acts, downstream services never cache the global foundational keys. Transactions are validated with zero-knowledge verification flags.
        </p>
      </div>

    </div>
  );
};
