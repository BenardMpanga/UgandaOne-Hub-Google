import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  CreditCard,
  Plus,
  QrCode,
  Share2,
  Lock,
  Unlock,
  Eye,
  FileText,
  ShieldAlert,
  Download,
  AlertCircle,
  MoreVertical,
  Car,
  CheckCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const NiraPortal: React.FC = () => {
  const { profile, token, toggleCardLock, isLoading: isIdentityLoading, auditLogs } = useIdentity();
  const [activeTab, setActiveTab] = useState<'documents' | 'history'>('documents');
  const [permit, setPermit] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingPermit, setIsLoadingPermit] = useState(true);
  const [activeModal, setActiveModal] = useState<'qr' | 'share' | 'none'>('none');
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterNode, setFilterNode] = useState<string>('ALL');

  useEffect(() => {
    const fetchPermitAndVehicles = async () => {
      if (!token) return;
      setIsLoadingPermit(true);
      try {
        const permitRes = await dpiGateway.getDrivingPermit(token);
        const vehiclesRes = await dpiGateway.getRegisteredVehicles(token);
        if (permitRes.success && permitRes.data) {
          setPermit(permitRes.data);
        }
        if (vehiclesRes.success && vehiclesRes.data) {
          setVehicles(vehiclesRes.data);
        }
      } catch (err) {
        console.error('Error fetching permit details', err);
      } finally {
        setIsLoadingPermit(false);
      }
    };
    fetchPermitAndVehicles();
  }, [token]);

  const handleDownloadCopy = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      triggerToast('Tax clearance PDF downloaded successfully.');
    }, 1500);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-3 rounded-sm shadow-md text-xs font-semibold flex items-center gap-2 border border-neutral-800 animate-slide-in">
          <CheckCircle className="w-4 h-4 text-[#fdcc00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and secure state indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Digital Wallet
          </h2>
          <p className="text-gray-500 text-xs">
            Manage and verify your government-issued documents safely.
          </p>
        </div>
        <span className="flex items-center gap-1 bg-[#fff2cc] text-[#735c00] px-2.5 py-1 rounded-sm text-[10px] font-bold font-mono tracking-wider border border-[#ffe086] uppercase">
          <Lock className="w-3 h-3" />
          <span>Secure</span>
        </span>
      </div>

      {/* Add Document Action */}
      <button
        onClick={() => triggerToast('Document registry links are fully integrated. No additional legacy cards found.')}
        className="w-full bg-black text-white py-3.5 rounded-sm text-sm font-semibold hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm touch-manipulation min-h-[48px]"
      >
        <Plus className="w-4 h-4" />
        <span>Add Document</span>
      </button>

      {/* Main documents cards stacking list */}
      <div className="space-y-4">
        
        {/* 1. NATIONAL ID CARD */}
        {profile && (
          <div className="bg-white rounded-md border border-[#edeeef] shadow-sm overflow-hidden relative">
            
            {/* National Yellow Flag Accent Strip on Left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fdcc00]"></div>

            {/* Card Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between pl-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-black" />
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  NATIONAL ID
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCardLock}
                  disabled={isIdentityLoading}
                  className="p-1 text-gray-400 hover:text-black hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  title={profile.isCardLocked ? 'Unlock Card' : 'Lock/Freeze Card'}
                >
                  {profile.isCardLocked ? <Lock className="w-4 h-4 text-red-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                </button>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Card content body */}
            <div className={`p-4 pl-5 relative ${profile.isCardLocked ? 'opacity-40' : ''}`}>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                
                {/* ID Portrait photograph */}
                <div className="w-24 h-28 bg-[#f1f3f5] rounded-sm border border-[#cfc4c5] shrink-0 overflow-hidden relative flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Citizen portrait"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <CreditCard className="w-10 h-10 text-gray-300" />
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/40 text-[8px] text-center font-bold text-white py-0.5">
                    NIRA BIOMETRICS
                  </div>
                </div>

                {/* Citizen text metadata */}
                <div className="space-y-3 flex-grow">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase font-bold">
                      FULL NAME
                    </span>
                    <span className="font-bold text-lg text-gray-900 tracking-tight leading-tight block">
                      {profile.fullName}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase font-bold">
                      NIN
                    </span>
                    <span className="font-mono text-base font-black tracking-wider text-gray-900">
                      {profile.nin}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">
                        DOB
                      </span>
                      <span className="text-xs font-semibold text-gray-800">{profile.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">
                        GENDER
                      </span>
                      <span className="text-xs font-semibold text-gray-800">{profile.gender}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">
                        NATIONALITY
                      </span>
                      <span className="text-xs font-semibold text-gray-800">{profile.nationality}</span>
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <StatusBadge status={profile.cardStatus} />
                  </div>
                </div>

              </div>

              {/* Locked Overlay Indicator */}
              {profile.isCardLocked && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-1.5">
                  <Lock className="w-8 h-8 text-[#ba1a1a]" />
                  <p className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">
                    E-KYC SHARED ACCESS SUSPENDED
                  </p>
                  <button
                    onClick={toggleCardLock}
                    className="mt-1 text-[10px] font-bold bg-black text-white px-3 py-1.5 rounded-sm uppercase cursor-pointer"
                  >
                    Unlock Identity Card
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Action buttons */}
            <div className="grid grid-cols-2 border-t border-gray-100 divide-x divide-gray-100 text-xs">
              <button
                onClick={() => {
                  if (profile.isCardLocked) return;
                  setActiveModal('qr');
                }}
                disabled={profile.isCardLocked}
                className="py-3 flex items-center justify-center gap-1.5 font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
              >
                <QrCode className="w-4 h-4 text-[#735c00]" />
                <span>Verify</span>
              </button>
              <button
                onClick={() => {
                  if (profile.isCardLocked) return;
                  setActiveModal('share');
                }}
                disabled={profile.isCardLocked}
                className="py-3 flex items-center justify-center gap-1.5 font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

          </div>
        )}

        {/* 2. DRIVING PERMIT CARD */}
        <div className="bg-white rounded-md border border-[#edeeef] shadow-sm overflow-hidden relative">
          
          {/* Black vertical stripe accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>

          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between pl-5">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-black" />
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                DRIVING PERMIT
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          {/* Content */}
          <div className="p-4 pl-5">
            {isLoadingPermit ? (
              <SkeletonLoader className="h-16 w-full" />
            ) : permit ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">
                    PERMIT NO.
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                    {permit.permitNo}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">
                    EXPIRY DATE
                  </span>
                  <span className="font-bold text-gray-900">
                    {new Date(permit.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                    CATEGORIES
                  </span>
                  <div className="flex items-center gap-1.5">
                    {permit.classes.map((cls: string) => (
                      <span key={cls} className="w-6 h-6 rounded-sm bg-[#f1f3f5] border border-gray-200 text-black font-mono font-bold text-xs flex items-center justify-center">
                        {cls}
                      </span>
                    ))}
                    <span className="text-[10px] text-gray-400 font-medium ml-2">Light commercial passenger</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-gray-400 text-xs">
                No driving permit retrieved.
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 border-t border-gray-100 divide-x divide-gray-100 text-xs">
            <button
              onClick={() => setActiveModal('qr')}
              className="py-3 flex items-center justify-center gap-1.5 font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Show QR</span>
            </button>
            <button
              onClick={() => triggerToast('Driving Permit secure link: CM89021105G12F-MOWT-DL-APPROVED')}
              className="py-3 flex items-center justify-center gap-1.5 font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Full</span>
            </button>
          </div>

        </div>

        {/* 3. TAX CLEARANCE CARD */}
        <div className="bg-white rounded-md border border-[#edeeef] shadow-sm overflow-hidden relative">
          
          {/* Red vertical stripe accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ba1a1a]"></div>

          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between pl-5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-black" />
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                TAX CLEARANCE
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e2f0d9] text-[#006400] border border-[#c5e1b4] uppercase">
              VALID
            </span>
          </div>

          {/* Content */}
          <div className="p-4 pl-5">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] text-gray-500 uppercase font-bold">
                  TIN
                </span>
                <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                  100-293-8411
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 uppercase font-bold">
                  FY
                </span>
                <span className="font-bold text-gray-900">
                  {new Date().getFullYear() - 1}/{new Date().getFullYear().toString().substring(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleDownloadCopy}
            disabled={isDownloading}
            className="w-full py-3.5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-gray-800 hover:bg-gray-50 cursor-pointer touch-manipulation"
          >
            {isDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Downloading copy...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Official Copy</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* 4. DATA ACCESS AUDIT LOG (ESTONIAN X-ROAD MODEL) */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fcfdfe]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006400]" />
              <h3 className="text-xs font-black tracking-wider text-gray-900 uppercase">
                Citizen Data Access Audit Log
              </h3>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              Real-time accountability trail of decentralized queries matching your identity.
            </p>
          </div>
          
          {/* Agency Node Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Node:</span>
            <select
              value={filterNode}
              onChange={(e) => setFilterNode(e.target.value)}
              className="bg-white border border-gray-200 text-[10px] font-bold uppercase p-1.5 rounded-sm focus:outline-none focus:border-black cursor-pointer text-xs"
            >
              <option value="ALL">All Nodes</option>
              <option value="NIRA_NODE">NIRA Node</option>
              <option value="URA_NODE">URA Node</option>
              <option value="MoWT_NODE">MoWT Node</option>
              <option value="URSB_NODE">URSB Node</option>
              <option value="NSSF_NODE">NSSF Node</option>
            </select>
          </div>
        </div>

        {/* Audit Log list */}
        <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
          {auditLogs.filter(log => filterNode === 'ALL' || log.agencyNode === filterNode).length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 font-medium">
              No transactions logged for the selected agency node.
            </div>
          ) : (
            auditLogs
              .filter(log => filterNode === 'ALL' || log.agencyNode === filterNode)
              .map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#fafbfc] transition-colors space-y-2 text-left">
                  <div className="flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold bg-[#f1f3f5] px-1.5 py-0.5 rounded-sm text-gray-600 border border-gray-200">
                          {log.id}
                        </span>
                        <span className="font-bold text-gray-900">{log.actor}</span>
                      </div>
                      <p className="text-gray-500 text-[11px] font-semibold">{log.action}</p>
                    </div>
                    
                    <div className="text-right shrink-0 space-y-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                        log.status === 'DECENTRALIZED_VERIFIED'
                          ? 'bg-[#e2f0d9] text-[#006400] border-[#c5e1b4]'
                          : log.status === 'SUCCESS'
                          ? 'bg-[#e8f4fd] text-[#0066cc] border-[#bce0fd]'
                          : 'bg-[#fce8e6] text-[#ba1a1a] border-[#f9c1be]'
                      }`}>
                        {log.status === 'DECENTRALIZED_VERIFIED' ? 'ZKP VERIFIED' : log.status}
                      </span>
                      <p className="text-[9px] text-gray-400 font-mono font-medium">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Data Minimization Box */}
                  <div className="p-2.5 bg-gray-50 rounded border border-gray-100 flex items-start gap-2 text-[10px] font-mono text-gray-600">
                    <div className="p-1 rounded bg-white border border-gray-200 shrink-0">
                      <Lock className="w-3.5 h-3.5 text-[#735c00]" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-700 uppercase text-[9px]">Scope of Transmitted Payload:</span>
                        <span className="bg-emerald-100 text-[#006400] font-bold px-1 rounded-sm text-[8px] uppercase tracking-wide">
                          Data Minimized
                        </span>
                      </div>
                      <p className="text-gray-500 break-all">{log.dataAccessed}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono font-medium text-gray-400 pt-1">
                    <span>Node IP Status: Isolated Enclave Encrypted</span>
                    <span className="font-bold text-black bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wider">
                      {log.agencyNode}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Trust & encryption disclaimer card at bottom */}
      <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-md p-4 text-center space-y-3">
        <div className="flex justify-center">
          <ShieldCheck className="w-8 h-8 text-[#006400]" />
        </div>
        <p className="text-xs text-[#4c4546] leading-relaxed max-w-sm mx-auto">
          Your data is encrypted end-to-end. Documents stored here are cryptographically signed by the relevant government authorities for instant verification.
        </p>
        <button
          onClick={() => triggerToast('DPI Privacy Policy: secure zero-knowledge architecture.')}
          className="block w-full text-xs font-bold text-black hover:underline uppercase tracking-wider"
        >
          PRIVACY POLICY
        </button>
      </div>

      {/* QR Code Verification Modal */}
      {activeModal === 'qr' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#edeeef] p-6 max-w-sm w-full text-center space-y-4 animate-scale-up">
            <h3 className="font-bold text-lg text-gray-900">Digital Document QR Code</h3>
            <p className="text-xs text-gray-500">
              Present this QR code to any public official or service point for secure cryptographic verification.
            </p>
            
            {/* Mock QR Code element */}
            <div className="w-48 h-48 mx-auto bg-gray-100 p-3 rounded border border-gray-200 flex items-center justify-center relative">
              <div className="w-full h-full bg-[radial-gradient(#000000_15%,transparent_16%)] bg-[size:12px_12px] opacity-85"></div>
              {/* National symbol seal overlay */}
              <div className="absolute inset-0 m-auto w-12 h-12 rounded bg-white border border-black flex items-center justify-center font-bold text-[10px]">
                NIRA
              </div>
            </div>

            <div className="text-[10px] text-gray-400 font-mono">
              HASH: CM890211-MOWT-SECURE-KEY
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full bg-black text-white py-2.5 rounded-sm text-xs font-bold cursor-pointer"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

      {/* Share Document Modal */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#edeeef] p-6 max-w-sm w-full space-y-4 animate-scale-up text-left">
            <h3 className="font-bold text-lg text-gray-900">Secure Identity Sharing</h3>
            <p className="text-xs text-gray-500">
              Share a verified digital e-KYC payload with a third-party agency (e.g., banks, telecom operators).
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-gray-500">
                Authorized Downstream Consumer
              </label>
              <select className="w-full p-2.5 bg-white border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black">
                <option>Centenary Bank Ltd (e-KYC opening)</option>
                <option>MTN Uganda (SIM Swap KYC)</option>
                <option>Airtel Uganda (SIM Registration)</option>
                <option>Stanbic Bank Uganda (Loan verification)</option>
              </select>
            </div>

            <div className="p-3 bg-gray-55 bg-gray-50 rounded border border-gray-100 text-[10px] text-gray-500 font-mono space-y-1">
              <p className="font-bold text-black">ENCRYPTED ATOMIC METADATA PAYLOAD:</p>
              <p className="truncate">NIN_VERIFY:CM89021105G12F</p>
              <p className="truncate">SIG:X_UGANDAONE_HMAC_SIG_NIRA_APPROVED</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveModal('none');
                  triggerToast('Cryptographically verified payload shared securely.');
                }}
                className="flex-grow bg-black text-white py-2.5 rounded-sm text-xs font-bold cursor-pointer"
              >
                Share Payload
              </button>
              <button
                onClick={() => setActiveModal('none')}
                className="border border-gray-200 text-gray-800 px-4 py-2.5 rounded-sm text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
