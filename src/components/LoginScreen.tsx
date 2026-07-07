import React, { useState } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { ShieldCheck, Eye, EyeOff, Fingerprint, HelpCircle, Globe, AlertTriangle, Smartphone, Key, CircleCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, error, clearError } = useIdentity();
  const [nin, setNin] = useState('CM89021105G12F'); // Default NIN
  const [pin, setPin] = useState('1962'); // Default PIN
  const [showPin, setShowPin] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Out-of-band Secure Handshake simulation states
  const [showHandshake, setShowHandshake] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(1);
  const [handshakeText, setHandshakeText] = useState('');

  const runHandshakeSequence = async (targetNin: string, targetPin: string) => {
    setLocalError(null);
    clearError();
    setShowHandshake(true);

    const steps = [
      { step: 1, text: 'Initiating decentralized Zero-Knowledge authentication challenge...' },
      { step: 2, text: 'Sending secure out-of-band SIM push notification to registered device (+256 772 345 678)...' },
      { step: 3, text: 'Waiting for citizen confirmation/biometric swipe on hardware module...' },
      { step: 4, text: 'Exchanging short-lived scoped cryptographic keys (ECDH-P256)...' },
      { step: 5, text: 'Signature validated. Issuing secure, stateless session token...' }
    ];

    for (let i = 0; i < steps.length; i++) {
      setHandshakeStep(steps[i].step);
      setHandshakeText(steps[i].text);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Now execute actual login logic in background
    const success = await login(targetNin, targetPin);
    if (!success) {
      setShowHandshake(false);
    }
  };

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

    await runHandshakeSequence(nin, pin);
  };

  const handleBiometricLogin = async () => {
    // Biometric bypass automatically logs in with the pre-approved sandbox credentials
    await runHandshakeSequence('CM89021105G12F', '1962');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-between p-4 font-sans selection:bg-[#fdcc00] selection:text-black relative overflow-hidden">
      
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
          <span>Gov Gateway v2</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md my-auto">
        
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#191c1d] mb-2.5">
            Identify Securely
          </h1>
          <p className="text-[#4c4546] text-sm leading-relaxed max-w-xs mx-auto">
            Zero-knowledge civil verification powered by Estonia's decentralized X-Road interoperability.
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
                  onClick={() => alert('Demo notice: Sandbox uses PIN 1962.')}
                  className="text-xs font-semibold text-[#735c00] hover:underline cursor-pointer"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading || showHandshake}
              className="w-full bg-black text-white py-3.5 rounded-sm text-sm font-semibold hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-manipulation min-h-[48px]"
            >
              <span>Login with National ID</span>
              <span className="font-bold">→</span>
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
              disabled={isLoading || showHandshake}
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

      {/* Out-of-band Handshake Visual Overlay Modal */}
      <AnimatePresence>
        {showHandshake && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f1115] border border-neutral-800 rounded-md p-6 max-w-sm w-full text-white space-y-6 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                
                {/* Simulated Device Animation Circle */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#fdcc00]/10 animate-ping"></span>
                  <div className="w-16 h-16 rounded-full bg-[#1b1e25] border border-neutral-700 flex items-center justify-center">
                    {handshakeStep <= 2 && <Smartphone className="w-7 h-7 text-[#fdcc00] animate-bounce" />}
                    {handshakeStep === 3 && <Fingerprint className="w-7 h-7 text-[#ba1a1a] animate-pulse" />}
                    {handshakeStep === 4 && <Key className="w-7 h-7 text-sky-400 animate-spin" />}
                    {handshakeStep === 5 && <CircleCheck className="w-7 h-7 text-emerald-400" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-mono text-xs text-[#fdcc00] uppercase tracking-widest font-bold">
                    SECURITY HANDSHAKE
                  </h3>
                  <p className="font-bold text-base tracking-tight text-neutral-100">
                    SIM-Bound Multi-Factor Auth
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-1.5 w-full justify-center py-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        s === handshakeStep
                          ? 'w-6 bg-[#fdcc00]'
                          : s < handshakeStep
                          ? 'w-3 bg-emerald-500'
                          : 'w-3 bg-neutral-800'
                      }`}
                    ></div>
                  ))}
                </div>

                {/* Secure Log Console Output */}
                <div className="w-full bg-[#050608] border border-neutral-800 rounded p-3 font-mono text-[10px] text-left text-neutral-400 min-h-[70px] flex items-center justify-center">
                  <motion.p
                    key={handshakeStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="leading-relaxed"
                  >
                    {handshakeText}
                  </motion.p>
                </div>

                <p className="text-[10px] text-neutral-500 font-mono select-none">
                  SECURE CRYPTO CHANNEL • X-ROAD GATEWAY v2
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="w-full max-w-md py-6 flex flex-col items-center gap-4 border-t border-gray-100 text-center">
        <div className="flex items-center gap-6 text-xs font-semibold text-gray-600">
          <button onClick={() => alert('UgandaOne support: Call toll-free 196')} className="flex items-center gap-1.5 hover:text-black cursor-pointer">
            <HelpCircle className="w-4 h-4 text-[#735c00]" />
            <span>Support Center</span>
          </button>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <button onClick={() => alert('Luganda localization loaded.')} className="flex items-center gap-1.5 hover:text-black cursor-pointer">
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
