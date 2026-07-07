import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { NssfAccount } from '../types';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  TrendingUp,
  ShieldAlert,
  Clock,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ArrowRight,
  FileCheck,
  Percent,
  CheckCircle2,
  Bell,
  Plus
} from 'lucide-react';

export const NssfPortal: React.FC = () => {
  const { token, profile } = useIdentity();
  const [account, setAccount] = useState<NssfAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitiatingClaim, setIsInitiatingClaim] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);
  const [selectedAgeCategory, setSelectedAgeCategory] = useState('Age Benefit (55+)');

  const fetchNssfData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await dpiGateway.getNssfAccount(token);
      if (res.success && res.data) {
        setAccount(res.data);
      }
    } catch (err) {
      console.error('Error fetching NSSF profile data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNssfData();
  }, [token]);

  const handleInitiateClaim = async () => {
    if (!token) return;
    setIsInitiatingClaim(true);
    setClaimSuccessMessage(null);
    try {
      const res = await dpiGateway.initiateNssfClaim(token, selectedAgeCategory);
      if (res.success && res.data) {
        setAccount(res.data);
        setClaimSuccessMessage(`Successfully submitted Age Benefit claim under category: ${selectedAgeCategory}. Processing initiated.`);
      }
    } catch (err) {
      console.error('NSSF claims system failed', err);
    } finally {
      setIsInitiatingClaim(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            NSSF Social Security
          </h2>
          <p className="text-gray-500 text-xs">
            View your contributions, track claims, and manage your social security profile securely.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full border border-gray-150 flex items-center justify-center font-bold text-xs bg-emerald-50 text-emerald-800">
          NSSF
        </div>
      </div>

      {/* 1. TOTAL ACCUMULATED BALANCE CARD */}
      {isLoading ? (
        <SkeletonLoader className="h-44 w-full" />
      ) : account ? (
        <div className="bg-white rounded-md border border-[#edeeef] shadow-sm overflow-hidden relative">
          
          {/* Subtle watermark background for auth feeling */}
          <div className="absolute right-2 bottom-2 font-mono font-black text-gray-50 text-8xl tracking-tighter opacity-70 select-none">
            NSSF
          </div>

          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">
                TOTAL ACCUMULATED BALANCE
              </span>
              <span className="flex items-center gap-1 bg-[#fdcc00] text-black px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#ffe086]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-bold block">UGX</span>
              <span className="text-3xl font-black text-gray-900 font-mono block tracking-tight">
                {account.totalBalance.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 font-medium block">
                As of Oct 24, 2023 • Live Audit
              </span>
            </div>

            {/* Split row */}
            <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-gray-100 text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold flex items-center gap-1">
                  <Percent className="w-3 h-3 text-[#735c00]" />
                  <span>Employee (5%)</span>
                </span>
                <p className="font-bold text-gray-900 font-mono text-sm">
                  UGX {account.employeeContribution.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 font-semibold flex items-center gap-1">
                  <Percent className="w-3 h-3 text-emerald-700" />
                  <span>Employer (10%)</span>
                </span>
                <p className="font-bold text-gray-900 font-mono text-sm">
                  UGX {account.employerContribution.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : null}

      {/* 2. CLAIM STATUS CARD */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <FileCheck className="w-4 h-4 text-black" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Claim Status
          </h3>
        </div>

        {claimSuccessMessage && (
          <div className="p-3 bg-[#e2f0d9] border border-[#c5e1b4] text-[#006400] text-xs rounded-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{claimSuccessMessage}</span>
          </div>
        )}

        {isLoading ? (
          <SkeletonLoader className="h-14 w-full" />
        ) : account?.claimStatus === 'NONE' ? (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-gray-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium">
              No active benefit claims found under your citizen identification.
            </p>

            {/* Expander form to initiate age benefits claim */}
            <div className="pt-2 max-w-sm mx-auto space-y-3 border-t border-gray-100 text-left">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Benefit Class
                </label>
                <select
                  value={selectedAgeCategory}
                  onChange={(e) => setSelectedAgeCategory(e.target.value)}
                  className="w-full p-2 bg-white border border-[#cfc4c5] text-xs rounded-sm focus:outline-none focus:border-black"
                >
                  <option>Age Benefit (55+)</option>
                  <option>Withdrawal Benefit (50+)</option>
                  <option>Emigration Grant</option>
                  <option>Survivors Benefit</option>
                </select>
              </div>

              <button
                onClick={handleInitiateClaim}
                disabled={isInitiatingClaim}
                className="w-full bg-black text-white py-2.5 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                {isInitiatingClaim ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Lodging claim statement...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Initiate Benefit Claim</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-[#fffcf0] border border-[#ffe086] rounded-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-[#735c00] uppercase tracking-wider">
                CLAIM UNDER AUDIT
              </span>
              <StatusBadge status="Under Review" />
            </div>
            <p className="text-xs text-gray-700 font-medium font-mono leading-tight">
              {account?.claimDetails}
            </p>
            <p className="text-[10px] text-gray-400">
              NIRA and NSSF adapters are cross-validating biometric indices and historical logs.
            </p>
          </div>
        )}
      </div>

      {/* 3. CONTRIBUTION HISTORY CHART (Interactive Pure-SVG Columns - Stitch Inspired) */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Contribution History
          </h3>
          <span className="bg-[#f1f3f5] text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
            Last 12 Months
          </span>
        </div>

        {isLoading ? (
          <SkeletonLoader className="h-32 w-full" />
        ) : account ? (
          <div className="space-y-3">
            
            {/* Custom Responsive pure-SVG Chart */}
            <div className="relative pt-6 px-2 border-b border-gray-200">
              
              {/* Grid indicators on left */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono text-gray-400 -translate-y-2 select-none h-[115%]">
                <span>4M</span>
                <span>2M</span>
                <span>0</span>
              </div>

              {/* Chart container */}
              <div className="h-32 flex items-end justify-between pl-8 pr-4">
                {account.monthlyContributions.map((contrib) => {
                  
                  // Height scale based on max 1,500,000 max contribution
                  const heightPercent = Math.min(100, Math.max(15, (contrib.amount / 1300000) * 100));
                  // High emphasis for Feb contribution (black as shown in mockup!)
                  const barColorClass = contrib.month === 'Feb' ? 'bg-black' : 'bg-[#c6c6c6]';

                  return (
                    <div key={contrib.month} className="flex flex-col items-center flex-1 mx-2.5 group relative">
                      
                      {/* Interactive Hover Tooltip */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-150 z-10 bg-black text-white text-[9px] font-mono p-1.5 rounded shadow-md pointer-events-none whitespace-nowrap">
                        UGX {contrib.amount.toLocaleString()}
                      </div>

                      {/* Column block */}
                      <div
                        className={`w-10 rounded-t-sm transition-all duration-300 ${barColorClass} group-hover:opacity-85`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>

                      {/* Month label */}
                      <span className="text-[11px] font-mono text-gray-500 mt-2 block font-medium">
                        {contrib.month}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        ) : null}
      </div>

      {/* 4. RECENT ALERTS */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-black" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Recent Alerts
            </h3>
          </div>
          <button
            onClick={() => alert('No older security files logged.')}
            className="text-xs font-bold text-[#735c00] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <SkeletonLoader className="h-10 w-full" count={2} />
          ) : account && account.recentAlerts.length > 0 ? (
            account.recentAlerts.map((alt) => (
              <div key={alt.id} className="py-3 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${alt.type === 'CONTRIBUTION_RECEIVED' ? 'bg-[#e2f0d9] text-[#006400]' : 'bg-[#f1f3f5] text-black'}`}>
                  {alt.type === 'CONTRIBUTION_RECEIVED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    {alt.title}
                  </h4>
                  <p className="text-xs text-[#4c4546] leading-relaxed">
                    {alt.description}
                  </p>
                  <span className="block text-[10px] text-gray-400 font-medium">
                    {alt.date}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No alerts logged recently.</p>
          )}
        </div>
      </div>

    </div>
  );
};
