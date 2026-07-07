import React, { createContext, useContext, useState, useEffect } from 'react';
import { CitizenProfile } from '../types';
import { dpiGateway } from '../lib/dpiGateway';

interface IdentityContextType {
  token: string | null;
  profile: CitizenProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (nin: string, pin: string) => Promise<boolean>;
  logout: () => void;
  toggleCardLock: () => Promise<void>;
  latencyEnabled: boolean;
  setLatencyEnabled: (enabled: boolean) => void;
  offlineMode: boolean;
  setOfflineMode: (enabled: boolean) => void;
  clearError: () => void;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('X-UgandaOne-NIN-Token'));
  const [profile, setProfile] = useState<CitizenProfile | null>(() => {
    const cached = localStorage.getItem('X-UgandaOne-Profile');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latencyEnabled, setLatencyEnabled] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  // Synchronize gateway settings with state
  useEffect(() => {
    dpiGateway.latencyEnabled = latencyEnabled;
    dpiGateway.offlineMode = offlineMode;
  }, [latencyEnabled, offlineMode]);

  const login = async (nin: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dpiGateway.verifyNIN(nin, pin);
      if (response.success && response.data) {
        setToken(response.data.token);
        setProfile(response.data.profile);
        localStorage.setItem('X-UgandaOne-NIN-Token', response.data.token);
        localStorage.setItem('X-UgandaOne-Profile', JSON.stringify(response.data.profile));
        setIsLoading(false);
        return true;
      } else {
        setError(response.error || 'Identity verification failed.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Connecting to NIRA Node failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setProfile(null);
    localStorage.removeItem('X-UgandaOne-NIN-Token');
    localStorage.removeItem('X-UgandaOne-Profile');
  };

  const toggleCardLock = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await dpiGateway.toggleIdentityLock(token);
      if (response.success && response.data !== undefined && profile) {
        const updatedProfile = { ...profile, isCardLocked: response.data };
        setProfile(updatedProfile);
        localStorage.setItem('X-UgandaOne-Profile', JSON.stringify(updatedProfile));
      } else {
        setError(response.error || 'Failed to modify lock status.');
      }
    } catch (err: any) {
      setError(err.message || 'Interoperability adapter error.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <IdentityContext.Provider
      value={{
        token,
        profile,
        isLoading,
        error,
        login,
        logout,
        toggleCardLock,
        latencyEnabled,
        setLatencyEnabled,
        offlineMode,
        setOfflineMode,
        clearError
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
};
