import React, { useState } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { ShieldCheck, Eye, EyeOff, Fingerprint, HelpCircle, Globe, AlertTriangle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, error, clearError } = useIdentity();
  const [nin, setNin] = useState('CM89021105G12F'); // Pre-fill with the default verified NIN
  const [pin, setPin] = useState('1962'); // Pre-fill default PIN
  const [showPin, setShowPin] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!nin.trim()) {
      setLocalError('Please enter your National Identification Number (NIN).');
      return;
    }
    if (!pin.trim()) {
      setLocalError('Please enter your 4-digit Security PIN.');
      return;
    }

    const success = await login(nin, pin);
    if (!success) {
      // Error is set in IdentityContext
    }
  };

  const handleBiometricLogin = async () => {
    setLocalError(null);
    // Simulate biometric request by logging in immediately using the default credentials
    const success = await login('CM89021105G12F', '1962');
    if (!success) {
      setLocalError('Biometric verification failed. Please use your PIN.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-between p-4 font-sans selection:bg-[#fdcc00] selection:text-black">
      
      {/* Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black text-[#fdcc00] flex items-center justify-center font-mono font-black text-sm">
            U1
          </div>
          <span className="font-bold tracking-tight text-gray-900 text-lg">UgandaOne</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f3f5] text-xs font-medium text-gray-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Gov Gateway</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md my-auto">
        
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#191c1d] mb-2.5">
            Welcome back
          </h1>
          <p className="text-[#4c4546] text-sm leading-relaxed max-w-xs mx-auto">
            Identify yourself to access secure government services and documents.
          </p>
        </div>

        {/* Secure Login Card */}
        <div className="bg-white rounded-md border border-[#edeeef] shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden relative">
          
          {/* Uganda National Flag Ribbon Accent */}
          <div className="h-1 w-full flex">
            <div className="w-1/3 bg-black"></div>
            <div className="w-1/3 bg-[#fdcc00]"></div>
            <div className="w-1/3 bg-[#ba1a1a]"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Display error if present */}
            {(error || localError) && (
              <div className="p-3 bg-[#ffdad6] border border-[#ffb4a8] text-[#93000a] text-xs rounded-sm flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Authorization Error</p>
                  <p>{localError || error}</p>
                </div>
              </div>
            )}

            {/* NIN Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                NATIONAL ID NUMBER (NIN)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">
                  CM
                </span>
                <input
                  type="text"
                  value={nin.startsWith('CM') ? nin.substring(2) : nin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    setNin('CM' + val);
                    if (error || localError) clearError();
                  }}
                  placeholder="89021105G12F"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#cfc4c5] rounded-sm text-sm font-mono tracking-wider focus:outline-none focus:border-2 focus:border-black transition-all"
                  maxLength={12}
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Format: CM followed by 12 characters (e.g., CM89021105G12F)
              </p>
            </div>

            {/* PIN Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                  SECURITY PIN
                </label>
                <button
                  type="button"
                  onClick={() => {}}
                  className="text-xs font-semibold text-[#735c00] hover:underline"
                >
                  Forgot PIN?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    if (error || localError) clearError();
                  }}
                  placeholder="••••"
                  maxLength={4}
                  className="w-full px-4 py-3 pr-11 bg-white border border-[#cfc4c5] rounded-sm text-sm tracking-widest focus:outline-none focus:border-2 focus:border-black transition-all text-center font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3.5 rounded-sm text-sm font-semibold hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-manipulation min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Identity...</span>
                </>
              ) : (
                <>
                  <span>Login with National ID</span>
                  <span className="font-bold">→</span>
                </>
              )}
            </button>
          </form>

          {/* Biometric section divider */}
          <div className="relative flex py-3 items-center px-6">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              OR SECURE BIOMETRIC
            </span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Biometric Button */}
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={isLoading}
              className="w-full border border-black text-black bg-white py-3 rounded-sm text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer touch-manipulation min-h-[48px]"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Use Biometrics</span>
            </button>
          </div>
        </div>

        {/* Demo Helper Hint */}
        <div className="mt-4 p-3 bg-[#f8f9fa] border border-[#edeeef] rounded-sm text-[11px] text-[#4c4546] text-center">
          <p className="font-semibold text-black">Citizen Portal Sandbox Active</p>
          <p>Login prefilled for citizen <span className="font-mono font-bold">Mukasa Ssewanyana</span>.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md py-6 flex flex-col items-center gap-4 border-t border-gray-100 text-center">
        <div className="flex items-center gap-6 text-xs font-semibold text-gray-600">
          <button className="flex items-center gap-1.5 hover:text-black">
            <HelpCircle className="w-4 h-4 text-[#735c00]" />
            <span>Support Center</span>
          </button>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <button className="flex items-center gap-1.5 hover:text-black">
            <Globe className="w-4 h-4 text-black" />
            <span>Luganda</span>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
          Official Government of Uganda Application<br />
          © {new Date().getFullYear()} NIRA & Ministry of ICT & National Guidance
        </p>
      </div>

    </div>
  );
};
