import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { TaxLedgerEntry, PrnRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  FileText,
  Plus,
  History,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface UraTaxPortalProps {
  onInitiatePayment: (prnCode: string) => void;
}

export const UraTaxPortal: React.FC<UraTaxPortalProps> = ({ onInitiatePayment }) => {
  const { token, profile } = useIdentity();
  
  // States
  const [tinDetails, setTinDetails] = useState<any>(null);
  const [ledger, setLedger] = useState<TaxLedgerEntry[]>([]);
  const [prnHistory, setPrnHistory] = useState<PrnRecord[]>([]);
  const [efiling, setEfiling] = useState<any>(null);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Form States
  const [assessmentCategory, setAssessmentCategory] = useState('Passport Renewal');
  const [amount, setAmount] = useState('250000');
  const [formError, setFormError] = useState<string | null>(null);
  const [generatedPrn, setGeneratedPrn] = useState<PrnRecord | null>(null);

  // Load Initial URA Legacy data
  const loadUraData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const tinRes = await dpiGateway.getTinDetails(token);
      const ledgerRes = await dpiGateway.getTaxLedger(token);
      const historyRes = await dpiGateway.getPrnHistory(token);
      const efilingRes = await dpiGateway.getEFilingSummary(token);
      
      if (tinRes.success) setTinDetails(tinRes.data);
      if (ledgerRes.success) setLedger(ledgerRes.data || []);
      if (historyRes.success) setPrnHistory(historyRes.data || []);
      if (efilingRes.success) setEfiling(efilingRes.data);
    } catch (err) {
      console.error('Error retrieving URA database contents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUraData();
  }, [token]);

  // Handle PRN generation
  const handleGeneratePrnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setGeneratedPrn(null);
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid numeric assessment amount.');
      return;
    }

    if (!token) return;
    
    setIsGenerating(true);
    try {
      const response = await dpiGateway.generatePRN(token, assessmentCategory, parsedAmount);
      if (response.success && response.data) {
        setGeneratedPrn(response.data);
        // Refresh local ledger logs
        const ledgerRes = await dpiGateway.getTaxLedger(token);
        const historyRes = await dpiGateway.getPrnHistory(token);
        if (ledgerRes.success) setLedger(ledgerRes.data || []);
        if (historyRes.success) setPrnHistory(historyRes.data || []);
      } else {
        setFormError(response.error || 'Failed to generate URA PRN.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Downstream assessment network timed out.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          URA Tax & PRN Hub
        </h2>
        <p className="text-gray-500 text-xs">
          Generate secure Payment Registration Numbers (PRNs) for non-tax and statutory dues.
        </p>
      </div>

      {/* Main launch actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setShowGenerator(true);
            setShowHistory(false);
            setGeneratedPrn(null);
          }}
          className="bg-black hover:bg-neutral-900 text-white p-4 rounded-md text-left flex flex-col justify-between hover:shadow-sm transition-all cursor-pointer min-h-[110px]"
        >
          <Plus className="w-5 h-5 text-[#fdcc00]" />
          <div>
            <h4 className="font-bold text-sm">Generate PRN</h4>
            <p className="text-[10px] text-gray-300">Create new assessment</p>
          </div>
        </button>

        <button
          onClick={() => {
            setShowHistory(!showHistory);
            setShowGenerator(false);
          }}
          className="bg-white border border-[#edeeef] p-4 rounded-md text-left flex flex-col justify-between hover:border-black transition-all cursor-pointer min-h-[110px]"
        >
          <History className="w-5 h-5 text-[#735c00]" />
          <div>
            <h4 className="font-bold text-sm text-gray-900">View PRN History</h4>
            <p className="text-[10px] text-gray-500">Track paid & pending files</p>
          </div>
        </button>
      </div>

      {/* INTERACTIVE FORM: PRN assessment generator */}
      {showGenerator && (
        <div className="bg-white border border-black rounded-md p-5 space-y-4 animate-slide-in relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowGenerator(false)}
              className="text-xs font-bold text-gray-400 hover:text-black uppercase cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#735c00]" />
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-tight">
              Instant Payment Registration Form
            </h3>
          </div>

          {formError && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs rounded-sm border border-[#ffb4a8] flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {!generatedPrn ? (
            <form onSubmit={handleGeneratePrnSubmit} className="space-y-4">
              
              {/* Applicant Name (Locked for identity verification integrity) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  APPLICANT PROFILE (KYC AUTO-FILL)
                </label>
                <input
                  type="text"
                  value={profile?.fullName || 'MUKASA SSEWANYANA'}
                  disabled
                  className="w-full p-2.5 bg-[#f8f9fa] border border-gray-200 rounded-sm text-xs text-gray-500 font-bold"
                />
              </div>

              {/* Assessment Category */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  ASSESSMENT CATEGORY
                </label>
                <select
                  value={assessmentCategory}
                  onChange={(e) => {
                    setAssessmentCategory(e.target.value);
                    // Standard cost values to facilitate quick testing
                    if (e.target.value === 'Passport Renewal') setAmount('250000');
                    if (e.target.value === 'Driving License Renewal') setAmount('150000');
                    if (e.target.value === 'Business Annual Returns') setAmount('50000');
                    if (e.target.value === 'Trading License (Local)') setAmount('120000');
                    if (e.target.value === 'Company Registry Reservation') setAmount('25000');
                  }}
                  className="w-full p-2.5 bg-white border border-[#cfc4c5] rounded-sm text-xs focus:outline-none focus:border-black"
                >
                  <option value="Passport Renewal">Passport Renewal (UGX 250,000)</option>
                  <option value="Driving License Renewal">Driving License Renewal (UGX 150,000)</option>
                  <option value="Business Annual Returns">URSB Company Annual Returns (UGX 50,000)</option>
                  <option value="Trading License (Local)">Local Government Trading License (UGX 120,000)</option>
                  <option value="Company Registry Reservation">URSB Business Name Reservation (UGX 25,000)</option>
                </select>
              </div>

              {/* Assessment Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  ASSESSMENT AMOUNT (UGX)
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter assessment amount..."
                  className="w-full p-2.5 bg-white border border-[#cfc4c5] rounded-sm text-xs focus:outline-none focus:border-black font-mono font-bold text-base"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-black hover:bg-neutral-900 text-white py-3 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 min-h-[48px]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering Assessment with URA...</span>
                  </>
                ) : (
                  <span>Request Payment Registration Number</span>
                )}
              </button>
            </form>
          ) : (
            /* SUCCESS: Display Generated 11-digit PRN code */
            <div className="space-y-4 p-4 bg-[#fffcf0] border border-[#ffe086] rounded-md text-center">
              <div className="flex justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">
                  URA PAYMENT REGISTRATION NUMBER (PRN)
                </span>
                <span className="font-mono text-xl font-black text-gray-900 block tracking-widest bg-white p-2 border border-[#ffe086] rounded-sm select-all">
                  {generatedPrn.prn}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs px-4 py-2 bg-white rounded border border-gray-100 font-semibold">
                <span className="text-gray-500">Service:</span>
                <span className="text-gray-900">{generatedPrn.category}</span>
              </div>

              <div className="flex justify-between items-center text-xs px-4 py-2 bg-white rounded border border-gray-100 font-semibold">
                <span className="text-gray-500">Total Assessment Due:</span>
                <span className="text-lg text-black font-black font-mono">
                  UGX {generatedPrn.amount.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <button
                  onClick={() => onInitiatePayment(generatedPrn.prn)}
                  className="bg-black hover:bg-neutral-900 text-white py-3 rounded-sm font-bold flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <span>Pay Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setGeneratedPrn(null);
                    setShowGenerator(false);
                    triggerDownloadSuccess();
                  }}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-800 py-3 rounded-sm font-bold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Slip</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRN History List */}
      {showHistory && (
        <div className="bg-white border border-[#edeeef] rounded-md p-4 space-y-3 animate-slide-in">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 uppercase">PRN Assessment Logs</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs font-semibold text-gray-500 hover:text-black uppercase cursor-pointer"
            >
              Hide
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {prnHistory.length > 0 ? (
              prnHistory.map((rec) => (
                <div key={rec.prn} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900 font-mono tracking-wider">{rec.prn}</p>
                    <p className="text-gray-500 text-[11px]">{rec.category} • {new Date(rec.generatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-black font-mono">UGX {rec.amount.toLocaleString()}</p>
                    <div className="flex justify-end gap-1.5 mt-0.5 items-center">
                      <StatusBadge status={rec.status} />
                      {rec.status === 'PENDING' && (
                        <button
                          onClick={() => onInitiatePayment(rec.prn)}
                          className="text-[10px] text-[#735c00] font-bold underline cursor-pointer"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No registered assessments found.</p>
            )}
          </div>
        </div>
      )}

      {/* 1. TIN STATUS CARD */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fdcc00]"></div>
        
        <div className="p-4 pl-5">
          <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
            TIN Status
          </span>
          <span className="block text-xs text-gray-400 font-medium">
            Tax Identification Number
          </span>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="font-mono text-xl font-bold text-gray-900 tracking-wider">
              {isLoading ? 'Loading...' : tinDetails?.tin || '1029 3847 5610'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e2f0d9] text-[#006400] border border-[#c5e1b4] uppercase">
              {isLoading ? '...' : tinDetails?.status + ' & Verified' || 'Active & Verified'}
            </span>
          </div>

          <p className="text-[10px] text-gray-400 mt-3 font-medium">
            Last verified: {isLoading ? '...' : tinDetails?.lastVerified || 'Today, 08:42 AM'}
          </p>
        </div>
      </div>

      {/* 2. TAX LEDGER CARD */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Tax Ledger
          </h3>
          <button
            onClick={() => setShowHistory(true)}
            className="text-xs font-semibold text-black flex items-center gap-1 hover:underline"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="py-4 space-y-2">
              <SkeletonLoader className="h-5 w-full" count={2} />
            </div>
          ) : ledger.length > 0 ? (
            ledger.map((entry) => (
              <div key={entry.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{entry.category}</p>
                  <p className="text-gray-500 text-[11px]">{entry.period} {entry.prn ? `• PRN: ${entry.prn}` : ''}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-bold text-gray-900 font-mono">UGX {entry.amount.toLocaleString()}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={entry.status} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No ledger history returned.</p>
          )}
        </div>
      </div>

      {/* 3. E-FILING SUMMARY */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            E-Filing Summary
          </h3>
          <FileText className="w-4 h-4 text-gray-400" />
        </div>

        {isLoading ? (
          <SkeletonLoader className="h-20 w-full" />
        ) : efiling ? (
          <div className="space-y-4">
            <div className="p-3 bg-[#f8f9fa] border border-gray-100 rounded-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="block text-[9px] text-gray-500 font-bold uppercase">
                    Current Filing Period
                  </span>
                  <span className="font-mono text-base font-bold text-black tracking-wide block mt-0.5">
                    {efiling.period}
                  </span>
                </div>
                <span className="bg-[#fdcc00] text-black px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border border-[#ffe086]">
                  DUE IN {efiling.daysRemaining} DAYS
                </span>
              </div>
              <p className="text-xs text-[#4c4546] font-medium mt-1.5">
                {efiling.status}
              </p>
            </div>

            <button
              onClick={() => alert('E-Filing Portal successfully synchronized. Ready for statutory declarations.')}
              className="w-full border border-black hover:bg-gray-50 text-black py-3 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Start E-Filing Declaration</span>
            </button>
          </div>
        ) : null}
      </div>

    </div>
  );
};

// Simulated actions
const triggerDownloadSuccess = () => {
  const elem = document.createElement('div');
  elem.innerText = 'URA PRN Payment Slip downloaded.';
  elem.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2.5 rounded-sm shadow-md text-xs font-semibold';
  document.body.appendChild(elem);
  setTimeout(() => elem.remove(), 2500);
};
