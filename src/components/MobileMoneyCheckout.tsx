import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { dpiGateway } from '../lib/dpiGateway';
import { PrnRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { SkeletonLoader } from './SkeletonLoader';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface MobileMoneyCheckoutProps {
  prnCode: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export const MobileMoneyCheckout: React.FC<MobileMoneyCheckoutProps> = ({
  prnCode,
  onPaymentSuccess,
  onCancel
}) => {
  const { token, profile } = useIdentity();
  
  // Data States
  const [prnRecord, setPrnRecord] = useState<PrnRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Checkout States
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'bank'>('momo');
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<{ txnId: string; record: PrnRecord } | null>(null);

  // Load PRN Details
  useEffect(() => {
    const fetchPrnDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await dpiGateway.verifyPRNForPayment(prnCode);
        if (res.success && res.data) {
          setPrnRecord(res.data);
          // Auto-fill phone number from profile
          if (profile?.phoneNumber) {
            // strip prefix for display
            const rawPhone = profile.phoneNumber.replace('+256', '').replace(/\s/g, '');
            setPhoneNumber(rawPhone);
          }
        } else {
          setError(res.error || 'PRN Verification failed.');
        }
      } catch (err: any) {
        setError(err.message || 'Downstream payment gateway is unresponsive.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrnDetails();
  }, [prnCode, profile]);

  const handleCopyPrn = () => {
    navigator.clipboard.writeText(prnCode);
    alert('PRN copied to clipboard.');
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prnRecord) return;
    setError(null);

    // Verify phone format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setError('Please provide a valid 9-digit Ugandan mobile number (7XX XXX XXX or 9XX XXX XXX).');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const fullPhoneNumber = `+256 ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
      const res = await dpiGateway.executeMobileMoneyPayment(
        prnRecord.prn,
        fullPhoneNumber,
        momoProvider
      );
      if (res.success && res.data) {
        setCompletedTransaction({
          txnId: res.data.transactionId,
          record: res.data.record
        });
      } else {
        setError(res.error || 'Mobile Money transaction was declined.');
      }
    } catch (err: any) {
      setError(err.message || 'Gateway carrier timeout.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 selection:bg-[#fdcc00] selection:text-black font-sans">
      
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-black hover:bg-gray-50 rounded transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Secure Payment
          </h2>
          <p className="text-xs text-gray-500">
            Complete your transaction for government services.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-4">
          <SkeletonLoader className="h-44 w-full" />
          <SkeletonLoader className="h-28 w-full animate-pulse" />
        </div>
      ) : error && !completedTransaction ? (
        <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-[#ba1a1a]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-gray-900">Payment Validation Error</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              {error}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="bg-black text-white px-5 py-2.5 rounded-sm text-xs font-bold cursor-pointer hover:bg-neutral-900 transition-colors"
          >
            Go Back
          </button>
        </div>
      ) : completedTransaction ? (
        
        /* SUCCESS CONFIRMATION SCREEN */
        <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-5 shadow-sm animate-scale-up">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#e2f0d9] text-[#006400] flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-gray-900">Payment Successful</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              Your payment for <span className="font-bold text-black">"{completedTransaction.record.category}"</span> has been cryptographically cleared by the Uganda Revenue Authority (URA).
            </p>
          </div>

          <div className="p-4 bg-[#f8f9fa] rounded-sm text-xs text-left divide-y divide-gray-200 border border-gray-150">
            <div className="py-2 flex justify-between font-semibold">
              <span className="text-gray-500">Transaction ID:</span>
              <span className="text-black font-mono font-bold">{completedTransaction.txnId}</span>
            </div>
            <div className="py-2 flex justify-between font-semibold">
              <span className="text-gray-500">PRN Code:</span>
              <span className="text-black font-mono font-bold">{completedTransaction.record.prn}</span>
            </div>
            <div className="py-2 flex justify-between font-semibold">
              <span className="text-gray-500">Amount Paid:</span>
              <span className="text-emerald-800 font-mono font-black">UGX {completedTransaction.record.amount.toLocaleString()}</span>
            </div>
            <div className="py-2 flex justify-between font-semibold">
              <span className="text-gray-500">Payer Name:</span>
              <span className="text-black font-bold uppercase">{completedTransaction.record.applicantName}</span>
            </div>
          </div>

          <button
            onClick={onPaymentSuccess}
            className="w-full bg-black text-white py-3.5 rounded-sm text-xs font-bold hover:bg-neutral-900 transition-colors cursor-pointer min-h-[48px]"
          >
            Return to Service Hub
          </button>
        </div>
      ) : prnRecord ? (
        
        /* STANDARD CHECKOUT CARD */
        <div className="space-y-5">
          
          {/* PRN SLIP SUMMARY */}
          <div className="bg-white border border-[#edeeef] rounded-md shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fdcc00]"></div>
            
            <div className="p-4 pl-5 space-y-4">
              
              <div className="space-y-1">
                <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  Payment Reference Number (PRN)
                </span>
                
                <div className="flex items-center justify-between gap-2 p-2 bg-[#f8f9fa] border border-gray-150 rounded-sm font-mono text-sm font-bold tracking-wider text-gray-900 select-all">
                  <span>{prnRecord.prn}</span>
                  <button
                    type="button"
                    onClick={handleCopyPrn}
                    className="p-1 hover:bg-white border border-transparent hover:border-gray-200 rounded transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-black" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div>
                  <span className="block text-[9px] text-gray-400 uppercase">Service</span>
                  <p className="text-gray-900 font-bold">{prnRecord.category}</p>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-400 uppercase">Applicant</span>
                  <p className="text-gray-900 font-bold uppercase truncate">{prnRecord.applicantName}</p>
                </div>
              </div>

              {/* Total block */}
              <div className="p-4 bg-[#f8f9fa] border border-gray-150 rounded-sm text-center space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                  Total Amount Due
                </span>
                <span className="text-2xl font-black text-gray-900 font-mono block">
                  UGX {prnRecord.amount.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] text-emerald-800 font-bold font-mono uppercase bg-[#e2f0d9] px-2 py-0.5 rounded-full border border-[#c5e1b4] mt-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Verified Secure</span>
                </span>
              </div>

            </div>
          </div>

          {/* METHOD SELECTION CARDS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Select Payment Method
            </h3>

            {/* 1. Mobile Money */}
            <div className={`bg-white border ${paymentMethod === 'momo' ? 'border-black' : 'border-[#edeeef]'} rounded-md p-4 space-y-4`}>
              <button
                type="button"
                onClick={() => setPaymentMethod('momo')}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f1f3f5] rounded-sm flex items-center justify-center text-black">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Mobile Money</h4>
                    <p className="text-xs text-gray-500">MTN MoMo, Airtel Money</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                  {paymentMethod === 'momo' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </button>

              {/* Collapsible Mobile Money Details */}
              {paymentMethod === 'momo' && (
                <div className="pt-3 border-t border-gray-100 space-y-4 text-xs animate-slide-in">
                  
                  {/* Carriers Selection */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setMomoProvider('MTN')}
                      className={`flex-1 p-2.5 border rounded-sm flex items-center justify-center gap-2 cursor-pointer font-bold transition-all ${momoProvider === 'MTN' ? 'border-[#fdcc00] bg-[#fffcf0]' : 'border-gray-200 hover:bg-gray-55'}`}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#fdcc00] border border-black flex items-center justify-center font-black text-[8px]">M</span>
                      <span>MTN MoMo</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setMomoProvider('AIRTEL')}
                      className={`flex-1 p-2.5 border rounded-sm flex items-center justify-center gap-2 cursor-pointer font-bold transition-all ${momoProvider === 'AIRTEL' ? 'border-[#ba1a1a] bg-red-50 text-[#930000]' : 'border-gray-200 hover:bg-gray-55'}`}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center font-bold text-[8px]">a</span>
                      <span>Airtel Money</span>
                    </button>
                  </div>

                  {/* Input Phone details */}
                  <form onSubmit={handleExecutePayment} className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold font-mono text-xs">
                          +256
                        </span>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="7XX XXX XXX"
                          maxLength={9}
                          className="w-full pl-14 pr-4 py-2.5 border border-[#cfc4c5] rounded-sm text-sm font-mono focus:outline-none focus:border-black font-bold tracking-widest text-left"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        A secure USSD validation prompt will be dispatched immediately.
                      </p>
                    </div>

                    {/* Display validation errors */}
                    {error && (
                      <div className="p-2 bg-[#ffdad6] text-[#93000a] text-[11px] rounded-sm flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Pay Button */}
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full bg-black text-white py-3.5 rounded-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 min-h-[48px]"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#fdcc00]" />
                          <span>Pushing carrier PIN verification...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-[#fdcc00]" />
                          <span>Pay UGX {prnRecord.amount.toLocaleString()} Now</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* 2. Card Method (Out of scope/disabled for security) */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`w-full bg-white border ${paymentMethod === 'card' ? 'border-black' : 'border-[#edeeef]'} rounded-md p-4 flex items-center justify-between text-left cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f1f3f5] rounded-sm flex items-center justify-center text-gray-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Debit / Credit Card</h4>
                  <p className="text-xs text-gray-500">Visa, Mastercard • Offline Sync</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
              </div>
            </button>

            {/* 3. EFT Bank Transfer (Out of scope/disabled) */}
            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`w-full bg-white border ${paymentMethod === 'bank' ? 'border-black' : 'border-[#edeeef]'} rounded-md p-4 flex items-center justify-between text-left cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f1f3f5] rounded-sm flex items-center justify-center text-gray-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">EFT / Bank Transfer</h4>
                  <p className="text-xs text-gray-500">Direct bank deposit via PRN</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                {paymentMethod === 'bank' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
              </div>
            </button>

          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full border border-[#cfc4c5] hover:bg-gray-50 text-gray-700 py-3 rounded-sm text-xs font-bold cursor-pointer min-h-[44px]"
          >
            Cancel Transaction
          </button>

          {/* Secured disclaimer */}
          <div className="pt-2 flex justify-center items-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Secured by National IT Authority (NITA-U)</span>
          </div>

        </div>
      ) : null}

    </div>
  );
};
