import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  Car,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  ArrowLeftRight,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface TransportPortalProps {
  onStartPermitRenewal: () => void;
}

export const TransportPortal: React.FC<TransportPortalProps> = ({ onStartPermitRenewal }) => {
  const { token } = useIdentity();
  
  // Data States
  const [permit, setPermit] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Form States
  const [vehicleReg, setVehicleReg] = useState('UBC 123X');
  const [buyerName, setBuyerName] = useState('');
  const [buyerNin, setBuyerNin] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTransportData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const permitRes = await dpiGateway.getDrivingPermit(token);
      const vehiclesRes = await dpiGateway.getRegisteredVehicles(token);
      const alertsRes = await dpiGateway.getInsuranceAlerts(token);
      const transfersRes = await dpiGateway.getOwnershipTransfers(token);

      if (permitRes.success) setPermit(permitRes.data);
      if (vehiclesRes.success) setVehicles(vehiclesRes.data || []);
      if (alertsRes.success) setAlerts(alertsRes.data || []);
      if (transfersRes.success) setTransfers(transfersRes.data || []);
    } catch (err) {
      console.error('Error fetching Transport agency states', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, [token]);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTransferSuccess(null);

    if (!buyerName.trim() || !buyerNin.trim()) {
      setFormError('Buyer Full Name and Buyer National ID Number (NIN) are required.');
      return;
    }

    if (!token) return;
    setIsSubmittingTransfer(true);
    try {
      const res = await dpiGateway.initiateOwnershipTransfer(token, vehicleReg, buyerName, buyerNin);
      if (res.success && res.data) {
        setTransferSuccess(`Ownership transfer request for ${vehicleReg.toUpperCase()} submitted successfully. Undergoing verification.`);
        setBuyerName('');
        setBuyerNin('');
        // Refresh transfers list
        const listRes = await dpiGateway.getOwnershipTransfers(token);
        if (listRes.success) setTransfers(listRes.data || []);
      } else {
        setFormError(res.error || 'Failed to submit transfer request.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Interoperability transmission error.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Transport & Mobility
        </h2>
        <p className="text-gray-500 text-xs">
          Manage your driving permits, vehicle registration, and ownership transfers.
        </p>
      </div>

      {/* 1. DIGITAL DRIVING PERMIT CARD */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fdcc00]"></div>

        <div className="p-4 pl-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Digital Driving Permit
              </span>
              <span className="text-[10px] text-gray-400 font-semibold font-mono">
                UDLS verified status
              </span>
            </div>
            {permit && <StatusBadge status={permit.status} />}
          </div>

          {isLoading ? (
            <SkeletonLoader className="h-16 w-full" />
          ) : permit ? (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-gray-400 font-bold text-[9px] uppercase">
                  Permit No:
                </span>
                <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                  {permit.permitNo}
                </span>
              </div>

              <div>
                <span className="block text-gray-400 font-bold text-[9px] uppercase">
                  Classes:
                </span>
                <span className="font-bold text-gray-900 font-mono tracking-widest text-sm">
                  {permit.classes.join(', ')}
                </span>
              </div>

              <div className="col-span-2 pt-2 border-t border-gray-50">
                <span className="block text-gray-400 font-bold text-[9px] uppercase mb-0.5">
                  Expires in
                </span>
                <span className="text-lg font-bold text-[#735c00] font-mono">
                  {permit.expiresInDays} Days
                </span>
                <span className="text-[10px] text-gray-400 font-medium block">
                  On {new Date(permit.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No permit records retrieved.</p>
          )}

          {permit && permit.expiresInDays <= 180 && (
            <button
              onClick={onStartPermitRenewal}
              className="w-full bg-black hover:bg-neutral-900 text-white py-3 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
            >
              <span>Renew Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. ACTION REQUIRED: INSURANCE BANNERS */}
      {alerts.length > 0 && alerts.map((alt) => (
        <div key={alt.policyNo} className="bg-[#ffdad6] border border-[#ffb4a8] rounded-md p-4 text-[#ba1a1a] relative overflow-hidden">
          {/* Accent vertical stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ba1a1a]"></div>

          <div className="flex items-start gap-3.5 pl-1.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#ba1a1a]" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#93000a]">
                Action Required
              </h3>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#191c1d]">Motor Third Party Insurance</p>
                <p className="text-xs font-semibold font-mono text-[#ba1a1a]">Expires in {alt.expiresInDays} days ({alt.vehicleReg})</p>
              </div>
              <button
                onClick={onStartPermitRenewal}
                className="block text-xs font-bold text-black underline pt-1"
              >
                Renew via URA & Insurance Gateway
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 3. REGISTERED VEHICLES CARD */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-black" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Registered Vehicles
            </h3>
          </div>
          <span className="bg-[#f1f3f5] text-gray-700 px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider">
            URA Sync
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <SkeletonLoader className="h-10 w-full" count={1} />
          ) : vehicles.length > 0 ? (
            vehicles.map((vh) => (
              <div key={vh.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gray-100 border border-gray-200 text-gray-800 font-mono font-black text-xs flex items-center justify-center rounded-sm tracking-wide">
                    {vh.regNo}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{vh.makeModel}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Verified Registration</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No registered motor assets verified.</p>
          )}
        </div>

        <button
          onClick={() => alert('Search and synchronize motor vehicle registers through national registry integration.')}
          className="w-full border border-black hover:bg-gray-50 text-black py-2.5 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Verify Another Vehicle</span>
        </button>
      </div>

      {/* 4. OWNERSHIP TRANSFERS CARD */}
      <div className="bg-white rounded-md border border-[#edeeef] shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <ArrowLeftRight className="w-4 h-4 text-black" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Ownership Transfers
          </h3>
        </div>

        {transferSuccess && (
          <div className="p-3 bg-[#e2f0d9] border border-[#c5e1b4] text-[#006400] text-xs rounded-sm flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{transferSuccess}</span>
          </div>
        )}

        {/* Transfer form overlay */}
        {showTransferForm ? (
          <form onSubmit={handleTransferSubmit} className="p-3.5 bg-gray-50 rounded border border-gray-200 text-xs space-y-3.5 animate-slide-in">
            <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
              <span className="font-bold uppercase text-gray-500">Initiate Ownership Transfer</span>
              <button
                type="button"
                onClick={() => setShowTransferForm(false)}
                className="text-[10px] font-bold text-gray-400 hover:text-black uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="p-2 bg-[#ffdad6] text-[#93000a] text-[11px] rounded-sm flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Select Registered Vehicle</label>
              <select
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                className="w-full p-2 bg-white border border-gray-200 rounded-sm focus:outline-none"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.regNo}>{v.makeModel} ({v.regNo})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Buyer Legal Name</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Enter buyer name as shown on National ID..."
                className="w-full p-2 bg-white border border-gray-200 rounded-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Buyer National ID (NIN)</label>
              <input
                type="text"
                value={buyerNin}
                onChange={(e) => setBuyerNin(e.target.value.replace(/\s/g, '').toUpperCase())}
                placeholder="CM..."
                maxLength={14}
                className="w-full p-2 bg-white border border-gray-200 rounded-sm focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingTransfer}
              className="w-full bg-black hover:bg-neutral-900 text-white py-2.5 rounded-sm font-bold text-[11px] transition-colors cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
            >
              {isSubmittingTransfer ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting Transfer Protocols...</span>
                </>
              ) : (
                <span>Submit Transfer Deed</span>
              )}
            </button>
          </form>
        ) : (
          /* Default transfers state or listing */
          <div className="space-y-4">
            {transfers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {transfers.map(tr => (
                  <div key={tr.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">Transfer: {tr.vehicleReg}</p>
                      <p className="text-gray-500 text-[10px]">Buyer: {tr.buyerName} • {new Date(tr.initiatedAt).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={tr.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-55 bg-gray-50 border border-gray-100 text-gray-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <p className="text-gray-500 max-w-xs mx-auto font-medium">
                  No active transfers. Initiate or track a motor vehicle ownership transfer through the URA portal.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (vehicles.length === 0) {
                  alert('Please verify a vehicle asset first.');
                  return;
                }
                setShowTransferForm(true);
                setTransferSuccess(null);
              }}
              className="w-full border border-black hover:bg-gray-50 text-black py-2.5 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <span>Initiate Transfer</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
