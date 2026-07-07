import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { CompanyRegistry } from '../types';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

interface UrsbBusinessPortalProps {
  onStartBusinessRegistration: (name: string) => void;
  onInitiateAnnualReturnPRN: (companyName: string) => void;
}

export const UrsbBusinessPortal: React.FC<UrsbBusinessPortalProps> = ({
  onStartBusinessRegistration,
  onInitiateAnnualReturnPRN
}) => {
  const { token } = useIdentity();
  
  // States
  const [companies, setCompanies] = useState<CompanyRegistry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Name Reservation States
  const [searchName, setSearchName] = useState('');
  const [checkResult, setCheckResult] = useState<{ available: boolean; name: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await dpiGateway.getMyCompanies(token);
      if (response.success && response.data) {
        setCompanies(response.data);
      }
    } catch (err) {
      console.error('Error fetching registered companies', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  // Check name availability
  const handleCheckNameAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCheckResult(null);

    const trimmed = searchName.trim();
    if (!trimmed) {
      setError('Please enter a company name to check availability.');
      return;
    }

    setIsChecking(true);
    try {
      const res = await dpiGateway.checkNameAvailability(trimmed);
      if (res.success && res.data) {
        setCheckResult(res.data);
      } else {
        setError(res.error || 'Failed to check name reservation registry.');
      }
    } catch (err: any) {
      setError(err.message || 'Interoperability lookup timed out.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          URSB Business Portal
        </h2>
        <p className="text-gray-500 text-xs">
          Manage your business registrations, reserved names, and annual returns compliance efficiently.
        </p>
      </div>

      {/* Primary Register Action */}
      <button
        onClick={() => {
          setSearchName('');
          setCheckResult(null);
          // Focus or open name reservation tool
          const el = document.getElementById('name-reservation-input');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="w-full bg-black hover:bg-neutral-900 text-white py-3.5 rounded-sm text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[48px]"
      >
        <Plus className="w-4 h-4 text-[#fdcc00]" />
        <span>Register New Business</span>
      </button>

      {/* 1. Name Reservation Tool Card */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-black" />
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-tight">
            Name Reservation Tool
          </h3>
        </div>
        
        <p className="text-xs text-gray-500 leading-relaxed">
          Check the availability of your desired business name and reserve it instantly before proceeding with full registration.
        </p>

        <form onSubmit={handleCheckNameAvailability} className="space-y-3">
          <input
            id="name-reservation-input"
            type="text"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              if (error) setError(null);
              if (checkResult) setCheckResult(null);
            }}
            placeholder="Enter business name to check..."
            className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-xs focus:outline-none focus:border-black uppercase font-mono tracking-wider font-bold"
          />

          <button
            type="submit"
            disabled={isChecking}
            className="w-full bg-[#fdcc00] hover:bg-[#efc100] text-black py-2.5 rounded-sm text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
          >
            {isChecking ? 'Querying URSB Registers...' : 'Check Availability'}
          </button>
        </form>

        {/* Display validation result */}
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ffb4a8] text-[#93000a] text-xs rounded-sm flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {checkResult && (
          <div className="p-4 rounded border text-xs space-y-3">
            {checkResult.available ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-[#006400]">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold uppercase font-mono">✓ "{checkResult.name}" is AVAILABLE</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">The name does not clash with any registered Ugandan legal entity.</p>
                  </div>
                </div>
                <button
                  onClick={() => onStartBusinessRegistration(checkResult.name)}
                  className="w-full bg-black text-white py-2 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
                >
                  <span>Initiate Name Reservation & Incorporation</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-[#ba1a1a]">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase font-mono">✗ "{checkResult.name}" is UNAVAILABLE</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">This name is already registered, reserved, or conflicts with active trademark indexes.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. SIMPO Registry Card */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 flex items-start gap-3.5">
        <div className="w-10 h-10 bg-[#f1f3f5] rounded-sm flex items-center justify-center shrink-0 border border-gray-200">
          <FileText className="w-5 h-5 text-black" />
        </div>
        <div className="space-y-1.5 flex-grow">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-tight">
            SIMPO Registry
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Verify Security Interest in Movable Property entries to ensure clean business assets and secure lines of credit.
          </p>
          <button
            onClick={() => alert('Redirecting to the secure URSB SIMPO collateral registry.')}
            className="text-xs font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Access SIMPO Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. My Registered Companies Card */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-black" />
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              My Registered Companies
            </span>
          </div>
          <span className="w-5 h-5 rounded-full bg-[#fdcc00] text-black text-[10px] font-bold flex items-center justify-center">
            {companies.length}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <SkeletonLoader className="h-6 w-full" count={2} />
            </div>
          ) : companies.length > 0 ? (
            companies.map((co) => (
              <div key={co.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors">
                <div className="space-y-1 pr-4">
                  <p className="font-bold text-gray-900">{co.name}</p>
                  <p className="text-gray-500 text-[11px]">
                    Reg No: <span className="font-mono font-medium">{co.regNo}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={co.status} />
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400 text-xs">No registered entities found under your profile credentials.</div>
          )}
        </div>
      </div>

      {/* 4. Annual Returns Tracker Card */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Calendar className="w-4 h-4 text-black" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Annual Returns Tracker
          </h3>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <SkeletonLoader className="h-14 w-full" count={2} />
          ) : companies.length > 0 ? (
            companies.map((co) => (
              <div
                key={co.id}
                className="p-3.5 bg-[#f8f9fa] border border-gray-100 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{co.name}</p>
                  <p className="text-gray-500 text-[11px]">
                    {co.annualReturnStatus === 'Due' ? `Due Date: ${co.annualReturnDueDate}` : `Filed: ${co.filedDate}`}
                  </p>
                </div>
                
                <div className="shrink-0 flex items-center gap-2">
                  {co.annualReturnStatus === 'Due' ? (
                    <button
                      onClick={() => onInitiateAnnualReturnPRN(co.name)}
                      className="bg-[#fff2cc] text-[#735c00] border border-[#ffe086] hover:bg-[#ffe599] font-bold px-3 py-1.5 rounded-sm uppercase text-[10px] cursor-pointer"
                    >
                      File Now
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-bold bg-[#e2f0d9] text-[#006400] border border-[#c5e1b4] uppercase">
                      ✓ Compliant
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No business trackers registered.</p>
          )}
        </div>
      </div>

    </div>
  );
};
