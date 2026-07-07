import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { ActiveFile } from '../types';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  Search,
  Bell,
  Fingerprint,
  FileText,
  CreditCard,
  Briefcase,
  History,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  MapPin,
  Compass,
  ArrowRight
} from 'lucide-react';

interface CitizenHomeProps {
  onNavigateToView: (view: 'home' | 'services' | 'docs' | 'support' | 'workflows') => void;
  onSelectPopularService: (serviceName: 'NIRA' | 'Passports' | 'URA' | 'URSB' | 'Transport' | 'NSSF') => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({ onNavigateToView, onSelectPopularService }) => {
  const { profile, token } = useIdentity();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!token) return;
      setIsLoadingFiles(true);
      try {
        const res = await dpiGateway.getActiveFiles(token);
        if (res.success && res.data) {
          setActiveFiles(res.data);
        }
      } catch (err) {
        console.error('Error retrieving active files', err);
      } finally {
        setIsLoadingFiles(false);
      }
    };
    fetchFiles();
  }, [token]);

  // Extract first name for welcome greetings
  const firstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'APOLLO';

  // Popular services data structure matching the mockups
  const popularServices = [
    {
      id: 'nira',
      name: 'NIRA',
      desc: 'ID Services',
      bgColor: 'bg-[#fdcc00]',
      textColor: 'text-black',
      icon: <CreditCard className="w-6 h-6 text-black" />,
      action: () => onSelectPopularService('NIRA')
    },
    {
      id: 'passport',
      name: 'Passports',
      desc: 'Internal Affairs',
      bgColor: 'bg-[#ffdad4]',
      textColor: 'text-[#930000]',
      icon: <Compass className="w-6 h-6 text-[#930000]" />,
      action: () => onSelectPopularService('Passports')
    },
    {
      id: 'ura',
      name: 'URA',
      desc: 'Tax Portal',
      bgColor: 'bg-[#edeeef]',
      textColor: 'text-black',
      icon: <FileText className="w-6 h-6 text-black" />,
      action: () => onSelectPopularService('URA')
    },
    {
      id: 'ursb',
      name: 'URSB',
      desc: 'Registration',
      bgColor: 'bg-[#e2e2e2]',
      textColor: 'text-black',
      icon: <Briefcase className="w-6 h-6 text-black" />,
      action: () => onSelectPopularService('URSB')
    }
  ];

  // Filter activities/services based on search
  const filteredServices = popularServices.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      
      {/* Top Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <span className="block text-[11px] font-bold tracking-widest text-[#735c00] uppercase font-mono">
            WELCOME BACK, {firstName}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Service Hub
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Active indicator configuration shortcut */}
          <button
            onClick={() => onNavigateToView('workflows')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#cfc4c5] hover:bg-gray-50 text-xs font-semibold cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#735c00]" />
            <span>DPI Life Events</span>
          </button>
          
          <button className="relative w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
            <Bell className="w-5 h-5 text-gray-800" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
          </button>
        </div>
      </div>

      {/* Global Search Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for services (e.g. Passport, Tax, driving permit)"
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#cfc4c5] rounded-sm text-sm focus:outline-none focus:border-2 focus:border-black transition-all"
        />
      </div>

      {/* Smart life event bundles banner (Singapore LifeSG inspired) */}
      <div className="bg-[#fffcf0] border border-[#ffe086] rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#fdcc00] text-black px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
            DPI LifeSG Event Bundling
          </div>
          <h3 className="text-sm font-bold text-[#231a00] uppercase tracking-tight">
            Comprehensive Life Event Workflows
          </h3>
          <p className="text-xs text-[#574500]">
            Don't jump between agencies. Complete sequential business registrations or permit renewals in one unified pipeline.
          </p>
        </div>
        <button
          onClick={() => onNavigateToView('workflows')}
          className="bg-black hover:bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-sm shrink-0 flex items-center gap-1.5 cursor-pointer touch-manipulation"
        >
          <span>Open Workflows</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popular Services Grid (2x2 standard representation) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Popular Services
          </h3>
          <button
            onClick={() => onNavigateToView('services')}
            className="text-xs font-bold text-[#735c00] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredServices.length > 0 ? (
            filteredServices.map((serv) => (
              <button
                key={serv.id}
                onClick={serv.action}
                className="bg-white border border-[#edeeef] p-4 rounded-md text-left flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-black transition-all duration-200 cursor-pointer min-h-[140px] group"
              >
                <div className={`w-12 h-12 rounded-sm ${serv.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  {serv.icon}
                </div>
                <div className="mt-4">
                  <h4 className="font-bold text-base text-[#191c1d] tracking-tight">
                    {serv.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {serv.desc}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-6 text-center text-gray-400 text-xs">
              No matching agency services found.
            </div>
          )}
        </div>
      </div>

      {/* Secondary Quick Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* NSSF quick launch */}
        <button
          onClick={() => onSelectPopularService('NSSF')}
          className="bg-white border border-[#edeeef] p-4 rounded-md flex items-center justify-between text-left hover:border-black transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e2f0d9] rounded-sm flex items-center justify-center text-[#006400]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#191c1d]">NSSF Pension Balance</h4>
              <p className="text-xs text-gray-500">Check contributions & files</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Transport quick launch */}
        <button
          onClick={() => onSelectPopularService('Transport')}
          className="bg-white border border-[#edeeef] p-4 rounded-md flex items-center justify-between text-left hover:border-black transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fff2cc] rounded-sm flex items-center justify-center text-[#735c00]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#191c1d]">Transport & Mobility</h4>
              <p className="text-xs text-gray-500">Permits, vehicles, transfers</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Recent Activities List (Citizenship Tracker) */}
      <div className="space-y-3 bg-white rounded-md border border-[#edeeef] p-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-black" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
              Recent Activities / File Tracking
            </h3>
          </div>
          <button
            onClick={() => onNavigateToView('docs')}
            className="text-xs font-bold text-black hover:underline"
          >
            My Wallet
          </button>
        </div>

        {isLoadingFiles ? (
          <div className="py-4 space-y-3">
            <SkeletonLoader className="h-6 w-full" count={2} />
          </div>
        ) : activeFiles.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {activeFiles.map((file) => (
              <div
                key={file.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="space-y-1 pr-4">
                  <p className="font-bold text-sm text-gray-900">{file.title}</p>
                  <p className="text-gray-500 text-[11px]">
                    Ref: <span className="font-mono font-medium">{file.reference}</span> • {file.agencyName}
                  </p>
                </div>
                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="text-right">
                    <StatusBadge status={file.status} />
                    <p className="text-[10px] text-gray-400 mt-0.5">{file.updatedAt}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 text-xs">
            No recent files or service applications tracked.
          </div>
        )}
      </div>

      {/* Digital Security Tip Card */}
      <div className="bg-black text-white p-5 rounded-md relative overflow-hidden shadow-sm">
        <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full border-4 border-neutral-800 opacity-20"></div>
        <div className="absolute -left-12 -top-12 w-28 h-28 rounded-full border border-neutral-700 opacity-15"></div>
        
        <div className="relative flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-neutral-900 text-[#fdcc00] flex items-center justify-center shrink-0 border border-neutral-800">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold tracking-wider text-[#fdcc00] uppercase font-mono">
              Digital Security Tip
            </h4>
            <p className="text-sm font-medium leading-relaxed text-gray-100">
              Never share your UgandaOne PIN or National ID details with anyone over the phone. Official agents will never ask for credentials.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
