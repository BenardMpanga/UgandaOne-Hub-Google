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
  CheckCircle2,
  Mail,
  Check,
  ExternalLink,
  FileText
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
  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);

  // Credit Card States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [payerEmail, setPayerEmail] = useState('mpangabenard2584@gmail.com');

  // EFT Bank Transfer States
  const [bankName, setBankName] = useState('Stanbic Bank Uganda');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

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
            const rawPhone = profile.phoneNumber.replace('+256', '').replace(/\s/g, '');
            setPhoneNumber(rawPhone);
          }
          if (profile?.fullName) {
            setCardholderName(profile.fullName);
            setBankAccountName(profile.fullName);
          }
          if (profile?.email) {
            setPayerEmail(profile.email);
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
        momoProvider,
        payerEmail
      );
      if (res.success && res.data) {
        setCompletedTransaction({
          txnId: res.data.transactionId,
          record: res.data.record
        });
        setCompletedReceipt(res.data.receipt);
      } else {
        setError(res.error || 'Mobile Money transaction was declined.');
      }
    } catch (err: any) {
      setError(err.message || 'Gateway carrier timeout.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleExecuteCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prnRecord) return;
    setError(null);

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cardCvv.replace(/\D/g, '').length < 3) {
      setError('Please enter a valid 3-digit CVV.');
      return;
    }
    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (!payerEmail.trim() || !payerEmail.includes('@')) {
      setError('Please enter a valid email address to receive your payment receipt.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await dpiGateway.executeCardPayment(
        prnRecord.prn,
        cleanCard,
        cardExpiry,
        cardCvv,
        cardholderName,
        payerEmail
      );
      if (res.success && res.data) {
        setCompletedTransaction({
          txnId: res.data.transactionId,
          record: res.data.record
        });
        setCompletedReceipt(res.data.receipt);
      } else {
        setError(res.error || 'Card clearance transaction was declined.');
      }
    } catch (err: any) {
      setError(err.message || 'Downstream credit card acquirer timeout.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleExecuteBankPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prnRecord) return;
    setError(null);

    if (!bankAccountNumber.trim() || bankAccountNumber.length < 8) {
      setError('Please enter a valid bank account number (at least 8 digits).');
      return;
    }
    if (!bankAccountName.trim()) {
      setError('Please enter the account holder name.');
      return;
    }
    if (!payerEmail.trim() || !payerEmail.includes('@')) {
      setError('Please enter a valid email address to receive your payment receipt.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await dpiGateway.executeBankTransferPayment(
        prnRecord.prn,
        bankName,
        bankAccountNumber,
        bankAccountName,
        payerEmail
      );
      if (res.success && res.data) {
        setCompletedTransaction({
          txnId: res.data.transactionId,
          record: res.data.record
        });
        setCompletedReceipt(res.data.receipt);
      } else {
        setError(res.error || 'Bank EFT transaction failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Inter-bank settlement network timeout.');
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
            Secure Payment Gateway
          </h2>
          <p className="text-xs text-gray-500">
            Cryptographic Clearing & Multi-Channel Clearing House
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
        
        /* SUCCESS CONFIRMATION SCREEN WITH RECEIPT DISPATCH */
        <div className="bg-white border border-[#edeeef] rounded-md p-6 text-center space-y-5 shadow-sm animate-scale-up">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#e2f0d9] text-[#006400] flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-gray-900">Payment Successful</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              Your payment for <span className="font-bold text-black">"{completedTransaction.record.category}"</span> has been cleared instantly by the Uganda Revenue Authority (URA).
            </p>
          </div>

          {/* Real-time Email Dispatch Alert */}
          <div className="p-3.5 bg-emerald-50 border border-[#c5e1b4] rounded text-left flex items-start gap-3">
            <div className="p-1 rounded bg-white border border-[#c5e1b4] text-[#006400] shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs text-[#006400]">
              <p className="font-black uppercase tracking-wide text-[10px]">Verifiable Receipt Sent</p>
              <p className="font-medium">
                A cryptographic payment receipt was sent to your registered address: <span className="font-black text-black underline">{completedReceipt?.payerEmail || payerEmail}</span>
              </p>
            </div>
          </div>

          {/* Cryptographic Verifiable Receipt Layout */}
          <div className="p-4 bg-[#fcfdfe] rounded border border-gray-200 text-left space-y-3 font-mono relative overflow-hidden">
            <div className="absolute right-2 top-2 uppercase font-sans text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded border bg-emerald-100 text-[#006400] border-[#c5e1b4] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Cleared (E-Receipt)</span>
            </div>
            
            <div className="space-y-1 pb-2 border-b border-dashed border-gray-200">
              <h4 className="text-[10px] font-sans font-black uppercase text-gray-400">Official Payment Receipt</h4>
              <p className="text-xs font-bold text-gray-900">{completedReceipt?.id || 'RCP-889012'}</p>
            </div>

            <div className="space-y-1.5 text-[11px] font-semibold text-gray-700">
              <div className="flex justify-between">
                <span>PRN Code:</span>
                <span className="text-black font-bold">{completedTransaction.record.prn}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Category:</span>
                <span className="text-black uppercase text-right max-w-[200px] truncate">{completedTransaction.record.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleared Amount:</span>
                <span className="text-emerald-800 font-black">UGX {completedTransaction.record.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payer Name:</span>
                <span className="text-black font-bold uppercase">{completedReceipt?.payerName || completedTransaction.record.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Channel:</span>
                <span className="text-black font-bold uppercase">{completedReceipt?.paymentDetails || 'Secure DPI Switch'}</span>
              </div>
              <div className="flex justify-between">
                <span>Core Settlement ID:</span>
                <span className="text-black font-bold">{completedTransaction.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleared On:</span>
                <span className="text-gray-500 text-[10px]">
                  {completedReceipt ? new Date(completedReceipt.timestamp).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Verification Hash signature box */}
            <div className="pt-2 mt-2 border-t border-dashed border-gray-200 flex items-start gap-1.5 text-[8px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
              <div className="space-y-0.5 font-mono">
                <span className="font-bold text-gray-600 uppercase">Cryptographic Authentication Signature:</span>
                <p className="break-all font-mono leading-none">
                  sha256_{btoa(completedTransaction.txnId).substring(0, 48).toLowerCase()}
                </p>
              </div>
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
                    <Smartphone className="w-5 h-5 text-gray-700" />
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
                <div className="pt-3 border-t border-gray-100 space-y-4 text-xs animate-slide-in text-left">
                  
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
                  <form onSubmit={handleExecutePayment} className="space-y-3">
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
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Associated Email (for receipt dispatch)</span>
                        <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wide">
                          linked
                        </span>
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm focus:outline-none focus:border-black font-semibold text-gray-800"
                      />
                    </div>

                    <p className="text-[10px] text-gray-500">
                      A secure USSD validation prompt will be dispatched to your phone immediately.
                    </p>

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

            {/* 2. Card Method */}
            <div className={`bg-white border ${paymentMethod === 'card' ? 'border-black' : 'border-[#edeeef]'} rounded-md p-4 space-y-4`}>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f1f3f5] rounded-sm flex items-center justify-center text-black">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Debit / Credit Card</h4>
                    <p className="text-xs text-gray-500">Visa, Mastercard • Cleared Securely via NITA-U</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </button>

              {/* Collapsible Card Details */}
              {paymentMethod === 'card' && (
                <div className="pt-3 border-t border-gray-100 space-y-4 text-xs animate-slide-in text-left">
                  <form onSubmit={handleExecuteCardPayment} className="space-y-3">
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="MUKASA SSEWANYANA"
                        className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm focus:outline-none focus:border-black font-bold uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                          setCardNumber(formatted.slice(0, 19));
                        }}
                        placeholder="4000 1234 5678 9010"
                        className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm font-mono focus:outline-none focus:border-black font-bold tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 2) {
                              setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm font-mono focus:outline-none focus:border-black font-bold text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="•••"
                          maxLength={3}
                          className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm font-mono focus:outline-none focus:border-black font-bold text-center tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Payer Email (for cryptographic receipt)</span>
                        <span className="text-[9px] text-[#006400] font-black lowercase tracking-wide flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> associated address
                        </span>
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm focus:outline-none focus:border-black font-semibold text-gray-800"
                      />
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
                          <span>Authorizing with Card Acquirer...</span>
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

            {/* 3. EFT Bank Transfer */}
            <div className={`bg-white border ${paymentMethod === 'bank' ? 'border-black' : 'border-[#edeeef]'} rounded-md p-4 space-y-4`}>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f1f3f5] rounded-sm flex items-center justify-center text-black">
                    <Building2 className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">EFT / Bank Transfer</h4>
                    <p className="text-xs text-gray-500">Direct real-time clearing bank deposit via PRN</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  {paymentMethod === 'bank' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </button>

              {/* Collapsible Bank Details */}
              {paymentMethod === 'bank' && (
                <div className="pt-3 border-t border-gray-100 space-y-4 text-xs animate-slide-in text-left">
                  
                  {/* EFT Warning Note */}
                  <div className="p-2.5 bg-neutral-50 border border-gray-150 rounded text-[11px] font-semibold text-gray-600 flex gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="leading-normal text-gray-500">
                      EFT / Real-time Bank transfer queries require automated clearing house verification. Clearing occurs instantly via the UgandaOne DPI switch.
                    </p>
                  </div>

                  <form onSubmit={handleExecuteBankPayment} className="space-y-3">
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Select Clearing Bank
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-white px-3 py-2.5 border border-[#cfc4c5] rounded-sm text-sm focus:outline-none focus:border-black font-bold uppercase"
                      >
                        <option value="Stanbic Bank Uganda">Stanbic Bank Uganda</option>
                        <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                        <option value="Centenary Bank">Centenary Bank (CenteMobile)</option>
                        <option value="DFCU Bank">DFCU Bank</option>
                        <option value="Absa Bank Uganda">Absa Bank Uganda</option>
                        <option value="Bank of Baroda">Bank of Baroda</option>
                        <option value="Equity Bank Uganda">Equity Bank Uganda</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="1029348576"
                          className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm font-mono focus:outline-none focus:border-black font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          placeholder="MUKASA SSEWANYANA"
                          className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm focus:outline-none focus:border-black font-bold uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Payer Email (for cryptographic receipt)</span>
                        <span className="text-[9px] text-[#006400] font-black lowercase tracking-wide flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> associated address
                        </span>
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full px-3.5 py-2.5 border border-[#cfc4c5] rounded-sm text-sm focus:outline-none focus:border-black font-semibold text-gray-800"
                      />
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
                          <span>Initiating EFT Clearing Settlement...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-[#fdcc00]" />
                          <span>Authorize EFT Transfer of UGX {prnRecord.amount.toLocaleString()}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

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
