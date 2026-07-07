import React, { useState } from 'react';
import { IdentityProvider, useIdentity } from './context/IdentityContext';
import { LoginScreen } from './components/LoginScreen';
import { CitizenHome } from './components/CitizenHome';
import { NiraPortal } from './components/NiraPortal';
import { UraTaxPortal } from './components/UraTaxPortal';
import { UrsbBusinessPortal } from './components/UrsbBusinessPortal';
import { NssfPortal } from './components/NssfPortal';
import { TransportPortal } from './components/TransportPortal';
import { WorkflowsView } from './components/WorkflowsView';
import { MobileMoneyCheckout } from './components/MobileMoneyCheckout';
import { StatusBadge } from './components/StatusBadge';
import {
  Home,
  Briefcase,
  FolderLock,
  Compass,
  LifeBuoy,
  LogOut,
  Sliders,
  TrendingUp,
  MapPin,
  CreditCard,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

function AppContent() {
  const {
    token,
    profile,
    logout,
    latencyEnabled,
    setLatencyEnabled,
    offlineMode,
    setOfflineMode,
    toggleCardLock
  } = useIdentity();

  // Navigation tab state
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'docs' | 'support' | 'workflows'>('home');
  
  // Detailed active portal drill-down state (under Services tab or home quick-links)
  const [activePortal, setActivePortal] = useState<'none' | 'NIRA' | 'Passports' | 'URA' | 'URSB' | 'Transport' | 'NSSF'>('none');
  
  // Checkout overlay state
  const [checkoutPrn, setCheckoutPrn] = useState<string | null>(null);

  // Quick helper to show developers/users what's going on behind the scenes
  const [showDpiConsole, setShowDpiConsole] = useState(false);

  // Authentication gate
  if (!token) {
    return <LoginScreen />;
  }

  // Handle mobile money checkout flow
  if (checkoutPrn) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-4 px-4 sm:px-6 max-w-lg mx-auto">
        <MobileMoneyCheckout
          prnCode={checkoutPrn}
          onPaymentSuccess={() => {
            setCheckoutPrn(null);
            // After successful payment, route to Docs (Digital Wallet) so they see immediate updates!
            setCurrentView('docs');
            setActivePortal('none');
          }}
          onCancel={() => setCheckoutPrn(null)}
        />
      </div>
    );
  }

  // Drill down from Home / Services
  const handleSelectPopularService = (serviceName: 'NIRA' | 'Passports' | 'URA' | 'URSB' | 'Transport' | 'NSSF') => {
    setCurrentView('services');
    setActivePortal(serviceName);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col font-sans select-none pb-12">
      
      {/* 1. SECURE TOP BAR */}
      <header className="bg-white border-b border-[#e9ecef] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Citizen Avatar"
                className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-black text-[#fdcc00] flex items-center justify-center font-mono font-bold text-sm">
                MO
              </div>
            )}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none font-mono">
                REPUBLIC OF UGANDA
              </span>
              <span className="font-bold tracking-tight text-gray-900 text-base">
                UgandaOne
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Sandbox DPI Console Toggle */}
            <button
              onClick={() => setShowDpiConsole(!showDpiConsole)}
              className="p-2 rounded hover:bg-gray-55 border border-transparent hover:border-gray-150 text-gray-600 hover:text-black cursor-pointer transition-all flex items-center gap-1.5"
              title="DPI Sandbox Console"
            >
              <Sliders className="w-4 h-4 text-[#735c00]" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline uppercase">DPI Console</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-[#ba1a1a] cursor-pointer transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. SECURITY & NETWORK RESILIENCY DEVELOPMENT CONTROLS (DPI CONSOLE) */}
      {showDpiConsole && (
        <div className="bg-[#1b1b1b] text-white p-4 text-xs font-mono border-b border-neutral-800">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <span className="text-[#fdcc00] font-black uppercase">UGANDAONE DPI GATEWAY CONSOLE</span>
              <button
                onClick={() => setShowDpiConsole(false)}
                className="text-[10px] text-gray-400 hover:text-white uppercase font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              
              {/* Latency setting */}
              <div className="flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-800">
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-200">Simulated Network Latency</p>
                  <p className="text-[10px] text-gray-400">Models Estonia X-Road routing latency.</p>
                </div>
                <button
                  onClick={() => setLatencyEnabled(!latencyEnabled)}
                  className={`px-3 py-1.5 rounded-sm font-bold uppercase text-[10px] cursor-pointer ${latencyEnabled ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-gray-400'}`}
                >
                  {latencyEnabled ? 'ENABLED (800ms)' : 'DISABLED (50ms)'}
                </button>
              </div>

              {/* Offline mode setting */}
              <div className="flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-800">
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-200">Carrier Offline Simulator</p>
                  <p className="text-[10px] text-gray-400">Tests system resiliency states.</p>
                </div>
                <button
                  onClick={() => setOfflineMode(!offlineMode)}
                  className={`px-3 py-1.5 rounded-sm font-bold uppercase text-[10px] cursor-pointer ${offlineMode ? 'bg-[#ba1a1a] text-white' : 'bg-neutral-800 text-gray-400'}`}
                >
                  {offlineMode ? 'OFFLINE ACTIVE' : 'ONLINE STABLE'}
                </button>
              </div>

            </div>

            <div className="text-[10px] text-gray-500 pt-1 flex items-center justify-between">
              <span>Token: <span className="text-[#fdcc00] font-bold select-all truncate max-w-xs inline-block align-middle">{token}</span></span>
              <span>Node Status: <span className="text-emerald-500 font-bold">● OPERATIONAL</span></span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-6">
        
        {/* Offline Warning banner if offline mode active */}
        {offlineMode && (
          <div className="mb-6 p-3 bg-[#ffdad6] border border-[#ffb4a8] text-[#93000a] text-xs rounded-sm flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Resiliency Mode Active: DPI Interoperability Gateway simulated offline. Downstream connections will fail with safe retry states.</span>
          </div>
        )}

        {/* View Switcher Router */}
        {(() => {
          
          if (currentView === 'home') {
            return (
              <CitizenHome
                onNavigateToView={(view) => {
                  setCurrentView(view);
                  setActivePortal('none');
                }}
                onSelectPopularService={handleSelectPopularService}
              />
            );
          }

          if (currentView === 'services') {
            
            // Render specific drill-down portal
            if (activePortal === 'NIRA') {
              return (
                <div className="space-y-4 animate-slide-in">
                  <button
                    onClick={() => setActivePortal('none')}
                    className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Back to Services</span>
                  </button>
                  <NiraPortal />
                </div>
              );
            }

            if (activePortal === 'URA') {
              return (
                <div className="space-y-4 animate-slide-in">
                  <button
                    onClick={() => setActivePortal('none')}
                    className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Back to Services</span>
                  </button>
                  <UraTaxPortal onInitiatePayment={(prn) => setCheckoutPrn(prn)} />
                </div>
              );
            }

            if (activePortal === 'URSB') {
              return (
                <div className="space-y-4 animate-slide-in">
                  <button
                    onClick={() => setActivePortal('none')}
                    className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Back to Services</span>
                  </button>
                  <UrsbBusinessPortal
                    onStartBusinessRegistration={(name) => {
                      // Transition directly into workflows tab and prefill business registration!
                      setCurrentView('workflows');
                    }}
                    onInitiateAnnualReturnPRN={(companyName) => {
                      // Auto route to URA PRN assessment generator with returning category!
                      setActivePortal('URA');
                    }}
                  />
                </div>
              );
            }

            if (activePortal === 'NSSF') {
              return (
                <div className="space-y-4 animate-slide-in">
                  <button
                    onClick={() => setActivePortal('none')}
                    className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Back to Services</span>
                  </button>
                  <NssfPortal />
                </div>
              );
            }

            if (activePortal === 'Transport') {
              return (
                <div className="space-y-4 animate-slide-in">
                  <button
                    onClick={() => setActivePortal('none')}
                    className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Back to Services</span>
                  </button>
                  <TransportPortal
                    onStartPermitRenewal={() => {
                      // Transition to Permit renewal Life event workflow!
                      setCurrentView('workflows');
                    }}
                  />
                </div>
              );
            }

            if (activePortal === 'Passports') {
              // Detailed passport tracking dashboard as shown in the fourth Stitch screenshot!
              return (
                <div className="space-y-6 animate-slide-in">
                  <button
                    onClick={() => setActivePortal('none')}
                    className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Back to Services</span>
                  </button>

                  {/* Passport Application Details Card */}
                  <div>
                    <span className="block text-[10px] font-bold tracking-widest text-[#735c00] uppercase font-mono mb-1">
                      PASSPORT SERVICES (DCIC)
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 leading-none">
                      Passport Application
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      Directorate of Citizenship and Immigration Control
                    </p>
                  </div>

                  {/* Status Box */}
                  <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fdcc00]"></div>
                    <div className="flex justify-between items-start pl-1">
                      <div>
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">
                          CURRENT STATUS
                        </span>
                        <span className="text-xl font-bold text-gray-900 block mt-1">
                          Under Review
                        </span>
                      </div>
                      <span className="bg-[#fff2cc] text-[#735c00] border border-[#ffe086] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Processing</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100 text-xs pl-1 font-semibold">
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase">Expected by</span>
                        <span className="text-gray-900 text-sm">Oct 24, 2026</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase">Queue Pos.</span>
                        <span className="text-gray-900 text-sm">#1,204</span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="bg-white rounded-md border border-[#edeeef] p-5 space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
                      Tracking Timeline
                    </h4>

                    <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-gray-150">
                      
                      {/* Step 1 */}
                      <div className="relative text-xs">
                        <span className="absolute -left-[22px] top-0 w-4.5 h-4.5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white font-bold text-[9px]">
                          ✓
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-900 text-sm">Application Submitted</p>
                          <p className="text-gray-500">Sept 12, 2025 • 09:45 AM</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative text-xs">
                        <span className="absolute -left-[22px] top-0 w-4.5 h-4.5 rounded-full bg-[#fdcc00] border-2 border-white flex items-center justify-center text-black font-bold text-[9px]">
                          •
                        </span>
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900 text-sm">Under Review</p>
                          <p className="text-gray-500 leading-relaxed">Your documents are being verified by the immigration officer.</p>
                          <span className="inline-block bg-[#f1f3f5] border border-gray-200 text-gray-700 text-[10px] font-mono px-2 py-0.5 rounded-sm font-semibold mt-1">
                            Verified: Fingerprints, Photo, NIN
                          </span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative text-xs">
                        <span className="absolute -left-[22px] top-0 w-4.5 h-4.5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-[10px]">
                          3
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-400 text-sm">Printing</p>
                          <p className="text-gray-400">Final security features application.</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="relative text-xs">
                        <span className="absolute -left-[22px] top-0 w-4.5 h-4.5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-[10px]">
                          4
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-400 text-sm">Ready for Collection</p>
                          <p className="text-gray-400 text-[11px]">Passport Office, Port Bell Rd, Kampala.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Application Metadata Specs */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div className="bg-white border border-[#edeeef] p-4 rounded-md">
                      <span className="text-gray-400 block text-[9px] uppercase">Application ID</span>
                      <span className="text-gray-900 text-base font-bold font-mono tracking-wider block mt-1">
                        UG-772910-X
                      </span>
                    </div>

                    <div className="bg-white border border-[#edeeef] p-4 rounded-md">
                      <span className="text-gray-400 block text-[9px] uppercase">Type</span>
                      <span className="text-gray-900 text-base font-bold block mt-1">
                        Ordinary 48 Pages
                      </span>
                    </div>

                    <div className="bg-white border border-[#edeeef] p-4 rounded-md">
                      <span className="text-gray-400 block text-[9px] uppercase">Fee Status</span>
                      <span className="text-emerald-800 text-base font-bold block mt-1 font-mono uppercase">
                        PAID
                      </span>
                    </div>

                    <div className="bg-white border border-[#edeeef] p-4 rounded-md">
                      <span className="text-gray-400 block text-[9px] uppercase">Appointment Date</span>
                      <span className="text-gray-900 text-xs font-bold block mt-1 leading-tight">
                        Oct 10, 2026 • 10:00 AM
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3.5">
                    <button
                      onClick={() => alert('Appointment rescheduled to Oct 12, 2026 • 11:00 AM.')}
                      className="w-full border border-black hover:bg-gray-50 text-black py-3 rounded-sm text-xs font-bold cursor-pointer"
                    >
                      Reschedule Biometrics Appointment
                    </button>

                    <button
                      onClick={() => alert('Secure VoIP helpdesk: Toll-free 0800 199 000 connected.')}
                      className="w-full bg-black hover:bg-neutral-900 text-white py-3.5 rounded-sm text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-4 h-4 text-[#fdcc00]" />
                      <span>Contact DCIC Support</span>
                    </button>

                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                      For urgent passport queries, please visit the Ministry of Internal Affairs Headquarters or call toll-free line: 0800 199 000.
                    </p>
                  </div>
                </div>
              );
            }

            // General Services Directory view
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Services Directory
                  </h2>
                  <p className="text-gray-500 text-xs">
                    Access isolated legacy databases mapped via the Estonia X-Road Interoperability Gateway.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* NIRA */}
                  <button
                    onClick={() => setActivePortal('NIRA')}
                    className="p-4 bg-white border border-[#edeeef] hover:border-black rounded-md text-left flex items-start gap-3.5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#fdcc00] text-black rounded-sm flex items-center justify-center shrink-0 font-bold text-xs">N1</div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-gray-900">NIRA Foundational ID</h4>
                      <p className="text-[11px] text-gray-500">e-KYC verified documents & lock controls.</p>
                    </div>
                  </button>

                  {/* URA */}
                  <button
                    onClick={() => setActivePortal('URA')}
                    className="p-4 bg-white border border-[#edeeef] hover:border-black rounded-md text-left flex items-start gap-3.5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#f1f3f5] text-black rounded-sm flex items-center justify-center shrink-0 font-bold text-xs"><FileText className="w-5 h-5" /></div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-gray-900">URA Tax & PRN Hub</h4>
                      <p className="text-[11px] text-gray-500">TIN registries, assessments, and PRN slips.</p>
                    </div>
                  </button>

                  {/* URSB */}
                  <button
                    onClick={() => setActivePortal('URSB')}
                    className="p-4 bg-white border border-[#edeeef] hover:border-black rounded-md text-left flex items-start gap-3.5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#e2e2e2] text-black rounded-sm flex items-center justify-center shrink-0 font-bold text-xs">UR</div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-gray-900">URSB Business Portal</h4>
                      <p className="text-[11px] text-gray-500">Name reservations, corporate sync, returns.</p>
                    </div>
                  </button>

                  {/* Passports */}
                  <button
                    onClick={() => setActivePortal('Passports')}
                    className="p-4 bg-white border border-[#edeeef] hover:border-black rounded-md text-left flex items-start gap-3.5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#ffdad4] text-[#930000] rounded-sm flex items-center justify-center shrink-0 font-bold text-xs"><Compass className="w-5 h-5" /></div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-gray-900">Passport Status (DCIC)</h4>
                      <p className="text-[11px] text-gray-500">Track immigration biometrics & printing logs.</p>
                    </div>
                  </button>

                  {/* Transport */}
                  <button
                    onClick={() => setActivePortal('Transport')}
                    className="p-4 bg-white border border-[#edeeef] hover:border-black rounded-md text-left flex items-start gap-3.5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#fff2cc] text-[#735c00] rounded-sm flex items-center justify-center shrink-0 font-bold text-xs"><MapPin className="w-5 h-5" /></div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-gray-900">Transport & Mobility</h4>
                      <p className="text-[11px] text-gray-500">Permits, vehicle registrations, transfers.</p>
                    </div>
                  </button>

                  {/* NSSF */}
                  <button
                    onClick={() => setActivePortal('NSSF')}
                    className="p-4 bg-white border border-[#edeeef] hover:border-black rounded-md text-left flex items-start gap-3.5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#e2f0d9] text-[#006400] rounded-sm flex items-center justify-center shrink-0 font-bold text-xs"><TrendingUp className="w-5 h-5" /></div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-gray-900">NSSF Social Security</h4>
                      <p className="text-[11px] text-gray-500">Pensions, employer deposits, claims.</p>
                    </div>
                  </button>

                </div>

                {/* Singapore LifeSG highlight */}
                <div className="bg-[#fffcf0] border border-[#ffe086] p-5 rounded-md text-center space-y-3">
                  <span className="bg-[#fdcc00] text-black px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                    Singapore LifeSG Strategy
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed max-w-md mx-auto">
                    Try our combined sequential workflows. Bundle complex multi-agency steps like name reservation, corporate TIN registration, and license payments into a unified experience.
                  </p>
                  <button
                    onClick={() => setCurrentView('workflows')}
                    className="bg-black text-white px-4 py-2 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    Launch LifeSG Workflows
                  </button>
                </div>
              </div>
            );
          }

          if (currentView === 'docs') {
            return <NiraPortal />;
          }

          if (currentView === 'workflows') {
            return <WorkflowsView onInitiatePayment={(prn) => setCheckoutPrn(prn)} />;
          }

          if (currentView === 'support') {
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Citizen Helpdesk
                  </h2>
                  <p className="text-gray-500 text-xs">
                    Get assistance with foundational identity issues, tax audits, or pension queries.
                  </p>
                </div>

                <div className="bg-white border border-[#edeeef] rounded-md p-5 space-y-4">
                  <h3 className="font-bold text-sm text-gray-950 uppercase">Frequently Queried Dues (FAQ)</h3>
                  
                  <div className="space-y-3 text-xs leading-relaxed text-gray-600">
                    <div>
                      <p className="font-bold text-gray-900">Q: What is a PRN, and how do I pay it?</p>
                      <p>A: A Payment Registration Number (PRN) is a strict 11-digit code generated via the URA node to authorize any government service payment. You can copy the code and enter your Ugandan phone number to pay securely via MTN MoMo or Airtel Money directly on UgandaOne.</p>
                    </div>
                    <div className="pt-2">
                      <p className="font-bold text-gray-900">Q: Why should I freeze my NIRA card?</p>
                      <p>A: Freezing your National ID card blocks all immediate e-KYC digital queries from cental banks, telecoms, or lenders. This safeguards your biometric indices if your physical credentials or mobile SIM swap vulnerabilities are compromised.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black text-white rounded-md text-center space-y-2">
                  <p className="text-xs font-mono font-bold text-[#fdcc00] uppercase tracking-wider">National IT Authority Contact</p>
                  <p className="text-sm font-semibold">Toll-free Hotline: 0800 199 000</p>
                  <p className="text-[10px] text-gray-400">Available 24/7. Cross-agency priority routing active.</p>
                </div>
              </div>
            );
          }

          return null;
        })()}

      </main>

      {/* 4. PERSISTENT INSTITUTIONAL BOTTOM NAV BAR */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-[#e9ecef] shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-45">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-1 px-4">
          
          {/* Home */}
          <button
            onClick={() => {
              setCurrentView('home');
              setActivePortal('none');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-sm cursor-pointer relative"
          >
            <div className={`w-14 py-1.5 rounded-sm flex flex-col items-center justify-center transition-all ${currentView === 'home' ? 'bg-[#fdcc00] text-black font-bold scale-105' : 'text-gray-400 hover:text-black'}`}>
              <Home className="w-5.5 h-5.5" />
              <span className="text-[9px] font-semibold tracking-wider uppercase mt-1 leading-none">Home</span>
            </div>
          </button>

          {/* Services */}
          <button
            onClick={() => {
              setCurrentView('services');
              setActivePortal('none');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-sm cursor-pointer relative"
          >
            <div className={`w-14 py-1.5 rounded-sm flex flex-col items-center justify-center transition-all ${currentView === 'services' ? 'bg-[#fdcc00] text-black font-bold scale-105' : 'text-gray-400 hover:text-black'}`}>
              <Compass className="w-5.5 h-5.5" />
              <span className="text-[9px] font-semibold tracking-wider uppercase mt-1 leading-none">Services</span>
            </div>
          </button>

          {/* My Docs */}
          <button
            onClick={() => {
              setCurrentView('docs');
              setActivePortal('none');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-sm cursor-pointer relative"
          >
            <div className={`w-14 py-1.5 rounded-sm flex flex-col items-center justify-center transition-all ${currentView === 'docs' ? 'bg-[#fdcc00] text-black font-bold scale-105' : 'text-gray-400 hover:text-black'}`}>
              <FolderLock className="w-5.5 h-5.5" />
              <span className="text-[9px] font-semibold tracking-wider uppercase mt-1 leading-none">My Docs</span>
            </div>
          </button>

          {/* Support */}
          <button
            onClick={() => {
              setCurrentView('support');
              setActivePortal('none');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-sm cursor-pointer relative"
          >
            <div className={`w-14 py-1.5 rounded-sm flex flex-col items-center justify-center transition-all ${currentView === 'support' ? 'bg-[#fdcc00] text-black font-bold scale-105' : 'text-gray-400 hover:text-black'}`}>
              <LifeBuoy className="w-5.5 h-5.5" />
              <span className="text-[9px] font-semibold tracking-wider uppercase mt-1 leading-none">Support</span>
            </div>
          </button>

        </div>
      </nav>

    </div>
  );
}

export default function App() {
  return (
    <IdentityProvider>
      <AppContent />
    </IdentityProvider>
  );
}
