import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CPCB_THRESHOLDS } from '../utils/thresholdEvaluator';

const ThresholdContext = createContext(null);
const STORAGE_KEY = 'varuna_custom_thresholds_v1';

export function ThresholdProvider({ children }) {
  const [thresholds, setThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CPCB_THRESHOLDS;
    } catch {
      return DEFAULT_CPCB_THRESHOLDS;
    }
  });

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  const updateThresholds = (newThresholds) => {
    setThresholds(newThresholds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newThresholds));
  };

  const resetThresholds = () => {
    setThresholds(DEFAULT_CPCB_THRESHOLDS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ThresholdContext.Provider
      value={{
        thresholds,
        updateThresholds,
        resetThresholds,
        isThresholdModalOpen,
        setIsThresholdModalOpen
      }}
    >
      {children}
    </ThresholdContext.Provider>
  );
}

export function useThresholds() {
  const context = useContext(ThresholdContext);
  if (!context) {
    throw new Error('useThresholds must be used within a ThresholdProvider');
  }
  return context;
}
