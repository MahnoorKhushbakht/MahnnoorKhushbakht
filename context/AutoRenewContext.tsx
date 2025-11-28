'use client';
import React, { createContext, useContext, useState } from 'react';

interface AutoRenewContextType {
  autoRenew: boolean;
  onToggleAutoRenew: () => void;
}

const AutoRenewContext = createContext<AutoRenewContextType | undefined>(undefined);

export function AutoRenewProvider({ children }: { children: React.ReactNode }) {
  const [autoRenew, setAutoRenew] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoRenew');
      return saved ? JSON.parse(saved) : true; 
    }
    return true;
  });

  const onToggleAutoRenew = () => {
    const newValue = !autoRenew;
    setAutoRenew(newValue);
    localStorage.setItem('autoRenew', newValue.toString());
  };

  return (
    <AutoRenewContext.Provider value={{ autoRenew, onToggleAutoRenew }}>
      {children}
    </AutoRenewContext.Provider>
  );
}

export function useAutoRenewContext() {
  const context = useContext(AutoRenewContext);
  if (context === undefined) {
    throw new Error('useAutoRenewContext must be used within an AutoRenewProvider');
  }
  return context;
}