import React, { useState } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  Briefcase,
  Compass,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Car,
  Receipt,
  FileCheck,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Undo2
} from 'lucide-react';

interface WorkflowsViewProps {
  onInitiatePayment: (prnCode: string) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ onInitiatePayment }) => {
  const { token, profile } = useIdentity();
  const [activeWorkflow, setActiveWorkflow] = useState<'none' | 'business' | 'permit'>('none');
  
  // 1. BUSINESS BUNDLE STATES
  const [bizStep, setBizStep] = useState(1);
  const [bizName, setBizName] = useState('');
  const [bizLoading, setBizLoading] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);
  const [isNameApproved, setIsNameApproved] = useState(false);
  const [assignedTin, setAssignedTin] = useState('');
  const [licensePrn, setLicensePrn] = useState('');
  const [licenseFee, setLicenseFee] = useState(120000); // 120,000 UGX

  // 2. PERMIT BUNDLE STATES
  const [permitStep, setPermitStep] = useState(1);
  const [permitNo, setPermitNo] = useState('UG-DL-98765432');
  const [permitData, setPermitData] = useState<any>(null);
  const [permitPrn, setPermitPrn] = useState('');
  const [permitFee, setPermitFee] = useState(150000); // 150,000 UGX

  // --- BUSINESS WORKFLOW LOGIC ---
  const handleCheckAndReserveBizName = async () => {
    setBizError(null);
    if (!bizName.trim()) {
      setBizError('Please specify a unique business name.');
      return;
    }
    
    setBizLoading(true);
    try {
      const res = await dpiGateway.checkNameAvailability(bizName);
      if (res.success && res.data) {
        if (res.data.available) {
          setIsNameApproved(true);
          // Auto reserve name to citizen files
          if (token) {
            await dpiGateway.registerBusinessName(token, bizName);
          }
          setBizStep(2);
        } else {
          setBizError(`The name "${bizName.toUpperCase()}" is already reserved or taken by another legal entity.`);
        }
      } else {
        setBizError(res.error || 'Connection to URSB Registry failed.');
      }
    } catch (err: any) {
      setBizError(err.message || 'Lookup latency threshold exceeded.');
    } finally {
      setBizLoading(false);
    }
  };

  const handleRegisterInstantTIN = async () => {
    if (!token) return;
    setBizLoading(true);
    setBizError(null);
    try {
      // Secure Zero-Knowledge query to verify individual tax status eligibility first
      const taxRes = await dpiGateway.verifyTaxCompliance(token);
      if (!taxRes.success) {
        setBizError(taxRes.error || 'Tax standing compliance check failed. Verification aborted.');
        setBizLoading(false);
        return;
      }

      // Simulate generation of dynamic new corporate TIN
      setTimeout(() => {
        const prefix = '800';
        const rand = Math.floor(1000000 + Math.random() * 9000000).toString();
        const generatedCorporateTin = `${prefix}-${rand.substring(0, 3)}-${rand.substring(3)}`;
        setAssignedTin(generatedCorporateTin);
        setBizStep(3);
        setBizLoading(false);
      }, 1200);
    } catch (err: any) {
      setBizError(err.message || 'Interoperability failure during tax audits.');
      setBizLoading(false);
    }
  };

  const handleGenerateTradingLicensePRN = async () => {
    if (!token) return;
    setBizLoading(true);
    setBizError(null);
    try {
      const res = await dpiGateway.generatePRN(token, `Trading License: ${bizName.toUpperCase()}`, licenseFee);
      if (res.success && res.data) {
        setLicensePrn(res.data.prn);
        setBizStep(4);
      } else {
        setBizError(res.error || 'Failed to calculate trading dues assessment.');
      }
    } catch (err: any) {
      setBizError(err.message || 'URA Assessment server timeout.');
    } finally {
      setBizLoading(false);
    }
  };

  // --- PERMIT WORKFLOW LOGIC ---
  const handleQueryPermitDetails = async () => {
    if (!token) return;
    setBizLoading(true);
    setBizError(null);
    try {
      // Enforce zero-knowledge check for age & citizenship eligibility first under zero-trust directives
      const zkpRes = await dpiGateway.verifyAgeAndCitizenship(token);
      if (!zkpRes.success) {
        setBizError(zkpRes.error || 'Zero-Knowledge Proof check failed. Verification aborted.');
        return;
      }
      
      const res = await dpiGateway.getDrivingPermit(token);
      if (res.success && res.data) {
        setPermitData(res.data);
        setPermitStep(2);
      } else {
        setBizError(res.error || 'MoWT/UDLS database query failed.');
      }
    } catch (err: any) {
      setBizError(err.message || 'Interoperability transmission timeout.');
    } finally {
      setBizLoading(false);
    }
  };

  const handleGeneratePermitPRN = async () => {
    if (!token) return;
    setBizLoading(true);
    setBizError(null);
    try {
      const res = await dpiGateway.generatePRN(token, 'Driving Permit 3Yr Renewal', permitFee);
      if (res.success && res.data) {
        setPermitPrn(res.data.prn);
        setPermitStep(3);
      } else {
        setBizError(res.error || 'PRN Generation failed.');
      }
    } catch (err: any) {
      setBizError(err.message || 'Taxation Assessment server timeout.');
    } finally {
      setBizLoading(false);
    }
  };

  const resetAllWorkflows = () => {
    setActiveWorkflow('none');
    setBizStep(1);
    setBizName('');
    setIsNameApproved(false);
    setAssignedTin('');
    setLicensePrn('');
    setBizError(null);

    setPermitStep(1);
    setPermitData(null);
    setPermitPrn('');
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            DPI Life Event Bundles
          </h2>
          <p className="text-gray-500 text-xs">
            Multi-agency workflow mapping based on Singapore LifeSG digital public infrastructure models.
          </p>
        </div>
        {activeWorkflow !== 'none' && (
          <button
            onClick={resetAllWorkflows}
            className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {activeWorkflow === 'none' && (
        <div className="space-y-4">
          
          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-md p-4 text-xs font-medium text-gray-600">
            DPI Life Event Bundling merges separate legacy operations of diverse ministries (URSB, URA, MoWT, Local Municipal councils) under unified transaction tracks for citizens.
          </div>

          {/* Workflow Picker Grid */}
          <div className="space-y-3">
            
            {/* 1. Register Business Bundle */}
            <button
              onClick={() => setActiveWorkflow('business')}
              className="w-full bg-white border border-[#edeeef] p-4 rounded-md text-left flex items-start gap-4 hover:border-black transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-sm bg-[#fff2cc] text-[#735c00] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-black">
                    Start a New Business (Unified)
                  </h3>
                  <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">
                    3 Agencies
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Sequentially handles Business Name Reservation (URSB) → Corporate Tax TIN Registration (URA) → Local Government Trading License fee assessment.
                </p>
                <div className="pt-1.5 flex items-center gap-1 text-[#735c00] font-bold text-xs">
                  <span>Start Unified Track</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>

            {/* 2. Renew Permit Bundle */}
            <button
              onClick={() => setActiveWorkflow('permit')}
              className="w-full bg-white border border-[#edeeef] p-4 rounded-md text-left flex items-start gap-4 hover:border-black transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-sm bg-[#e2f0d9] text-[#006400] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-black">
                    Renew Driving Permit (Unified)
                  </h3>
                  <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">
                    2 Agencies
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Sequentially handles Permit Status Inquiry (MoWT/UDLS) → Tax PRN Generation (URA) → Mobile Money aggregate checkout and automatic renewal extensions.
                </p>
                <div className="pt-1.5 flex items-center gap-1 text-[#006400] font-bold text-xs">
                  <span>Start Unified Track</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>

          </div>

        </div>
      )}

      {/* WORKFLOW 1 ACTION SCREEN: REGISTER BUSINESS */}
      {activeWorkflow === 'business' && (
        <div className="bg-white border border-[#edeeef] p-5 rounded-md space-y-5 shadow-sm">
          
          {/* Progress Header Indicators */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-[10px] font-bold font-mono tracking-wider">
            <span className={bizStep >= 1 ? 'text-[#735c00]' : 'text-gray-400'}>1. URSB Name Check</span>
            <span className="text-gray-300">→</span>
            <span className={bizStep >= 2 ? 'text-black' : 'text-gray-400'}>2. URA Instant TIN</span>
            <span className="text-gray-300">→</span>
            <span className={bizStep >= 3 ? 'text-[#ba1a1a]' : 'text-gray-400'}>3. LG License Fees</span>
          </div>

          {bizError && (
            <div className="p-3 bg-[#ffdad6] border border-[#ffb4a8] text-[#93000a] text-xs rounded-sm flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{bizError}</span>
            </div>
          )}

          {/* STEP 1: Name Reservation Tool check */}
          {bizStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 uppercase">Agency: Uganda Registration Services Bureau (URSB)</h4>
                <p className="text-xs text-gray-500">Provide a corporate name to verify against the national business registers.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Proposed Company Name</label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => {
                    setBizName(e.target.value);
                    if (bizError) setBizError(null);
                  }}
                  placeholder="Enter business name (e.g. ACACIA CAFE LTD)..."
                  className="w-full p-2.5 border border-[#cfc4c5] focus:border-black rounded-sm text-xs font-mono font-bold uppercase tracking-wide"
                />
              </div>

              <button
                onClick={handleCheckAndReserveBizName}
                disabled={bizLoading}
                className="w-full bg-[#fdcc00] hover:bg-[#efc100] text-black py-2.5 rounded-sm text-xs font-bold transition-all min-h-[44px]"
              >
                {bizLoading ? 'URSB Registry Querying...' : 'Verify & Reserve Company Name'}
              </button>
            </div>
          )}

          {/* STEP 2: Instant TIN Registration */}
          {bizStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 uppercase">Agency: Uganda Revenue Authority (URA)</h4>
                <p className="text-xs text-gray-500">Name <span className="font-bold">"{bizName.toUpperCase()}"</span> is reserved. Apply for instant Corporate TIN mapping linked to your primary National ID.</p>
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-150 text-xs space-y-1">
                <p className="font-bold text-black">URSB e-Reservation File Code:</p>
                <p className="font-mono font-bold text-gray-600">URSB-RES-FILE-{(Math.floor(100000 + Math.random() * 900000))}</p>
              </div>

              <button
                onClick={handleRegisterInstantTIN}
                disabled={bizLoading}
                className="w-full bg-black text-white py-2.5 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer min-h-[44px]"
              >
                {bizLoading ? 'Linking downsteam URA tax ledgers...' : 'Register Instant Corporate TIN'}
              </button>
            </div>
          )}

          {/* STEP 3: Local Trading License Assessment */}
          {bizStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 uppercase">Agency: Local Government Municipal Council</h4>
                <p className="text-xs text-gray-500">Company registration successfully linked with TIN: <span className="font-mono font-bold">{assignedTin}</span>. Register for local Trading License assessment to authorize immediate commerce.</p>
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-150 text-xs space-y-1.5">
                <p className="font-bold text-black">Assigned Corporate TIN: <span className="font-mono text-emerald-800">{assignedTin}</span></p>
                <p className="text-[11px] text-gray-500">Trading License Class: Grade 1 Commercial Merchant</p>
                <p className="text-sm font-black text-black">Assessment Fee: UGX {licenseFee.toLocaleString()}</p>
              </div>

              <button
                onClick={handleGenerateTradingLicensePRN}
                disabled={bizLoading}
                className="w-full bg-black text-white py-2.5 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer min-h-[44px]"
              >
                {bizLoading ? 'Connecting to e-tax gateways...' : 'Request Municipal License PRN'}
              </button>
            </div>
          )}

          {/* STEP 4: Checkout Settlement */}
          {bizStep === 4 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-[#006400]" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900 uppercase">All downstreams synchronized</h4>
                <p className="text-xs text-gray-500">PRN generated for combined multi-agency business setup fees. Settle immediately using Mobile Money.</p>
              </div>

              <div className="p-4 bg-[#fffcf0] border border-[#ffe086] rounded-md text-xs space-y-2">
                <p className="font-bold text-gray-700 font-mono tracking-widest text-base bg-white p-2 border border-[#ffe086] rounded-sm">
                  {licensePrn}
                </p>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Assigned TIN:</span>
                  <span className="text-black font-mono">{assignedTin}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Settlement Amount:</span>
                  <span className="text-black font-mono">UGX {licenseFee.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => onInitiatePayment(licensePrn)}
                className="w-full bg-black text-white py-3 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center gap-1 min-h-[44px]"
              >
                <span>Settle via Mobile Money</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* WORKFLOW 2 ACTION SCREEN: RENEW PERMIT */}
      {activeWorkflow === 'permit' && (
        <div className="bg-white border border-[#edeeef] p-5 rounded-md space-y-5 shadow-sm">
          
          {/* Progress Header Indicators */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-[10px] font-bold font-mono tracking-wider">
            <span className={permitStep >= 1 ? 'text-[#006400]' : 'text-gray-400'}>1. MoWT Permit Query</span>
            <span className="text-gray-300">→</span>
            <span className={permitStep >= 2 ? 'text-black' : 'text-gray-400'}>2. URA PRN Gen</span>
            <span className="text-gray-300">→</span>
            <span className={permitStep >= 3 ? 'text-[#ba1a1a]' : 'text-gray-400'}>3. MM Checkout</span>
          </div>

          {bizError && (
            <div className="p-3 bg-[#ffdad6] border border-[#ffb4a8] text-[#93000a] text-xs rounded-sm flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{bizError}</span>
            </div>
          )}

          {/* STEP 1: Query Permit details from MoWT */}
          {permitStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 uppercase font-mono">Agency: Ministry of Works & Transport (MoWT)</h4>
                <p className="text-xs text-gray-500">Querying active driving license databases matching registered National ID.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Driving Permit Number</label>
                <input
                  type="text"
                  value={permitNo}
                  onChange={(e) => setPermitNo(e.target.value.replace(/\s/g, '').toUpperCase())}
                  className="w-full p-2.5 border border-[#cfc4c5] rounded-sm text-xs font-mono font-bold"
                />
              </div>

              <button
                onClick={handleQueryPermitDetails}
                disabled={bizLoading}
                className="w-full bg-[#fdcc00] hover:bg-[#efc100] text-black py-2.5 rounded-sm text-xs font-bold transition-all min-h-[44px]"
              >
                {bizLoading ? 'Interrogating MoWT Nodes...' : 'Query Permit Records'}
              </button>
            </div>
          )}

          {/* STEP 2: Generate renewal PRN fee */}
          {permitStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 uppercase">Agency: Uganda Revenue Authority (URA)</h4>
                <p className="text-xs text-gray-500">Permit record retrieved: <span className="font-bold font-mono text-xs">{permitNo}</span>. Generate standard statutory URA fee slip for 3-Year driver permit renewal.</p>
              </div>

              {permitData && (
                <div className="p-3 bg-[#f8f9fa] border border-gray-150 rounded-sm text-xs space-y-1 font-semibold text-gray-700">
                  <p>Permit Owner: {profile?.fullName}</p>
                  <p>Valid Classes: {permitData.classes.join(', ')}</p>
                  <p>Renewal Fee Class: Class B/A Private</p>
                  <p className="text-black font-black text-sm pt-1">Total Fee Assessment: UGX {permitFee.toLocaleString()}</p>
                </div>
              )}

              <button
                onClick={handleGeneratePermitPRN}
                disabled={bizLoading}
                className="w-full bg-black text-white py-2.5 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer min-h-[44px]"
              >
                {bizLoading ? 'Registering renewal slip...' : 'Generate Renewal PRN Slip'}
              </button>
            </div>
          )}

          {/* STEP 3: MM Checkout */}
          {permitStep === 3 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-[#006400]" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900 uppercase font-mono">Renewal slip registered</h4>
                <p className="text-xs text-gray-500">Settle your statutory license renewal dues instantly via Mobile Money to trigger card extension.</p>
              </div>

              <div className="p-4 bg-[#fffcf0] border border-[#ffe086] rounded-md text-xs space-y-2">
                <p className="font-bold text-gray-700 font-mono tracking-widest text-base bg-white p-2 border border-[#ffe086] rounded-sm">
                  {permitPrn}
                </p>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Dues Assessment:</span>
                  <span className="text-black font-mono">UGX {permitFee.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => onInitiatePayment(permitPrn)}
                className="w-full bg-black text-white py-3 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center gap-1 min-h-[44px]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
