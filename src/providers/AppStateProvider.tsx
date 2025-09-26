import React, { createContext, useContext } from 'react';
import { create } from 'zustand';
import {
  bills,
  Bill,
  paymentMethods,
  PaymentMethod,
  complaints,
  Complaint,
  consumption,
  UsageRecord,
  disputes,
  Dispute
} from '@data/mockBills';

interface AppState {
  bills: Bill[];
  paymentMethods: PaymentMethod[];
  complaints: Complaint[];
  consumption: UsageRecord[];
  disputes: Dispute[];
  addDispute: (dispute: Dispute) => void;
}

const useAppStore = create<AppState>((set) => ({
  bills,
  paymentMethods,
  complaints,
  consumption,
  disputes,
  addDispute: (dispute) =>
    set((state) => ({
      ...state,
      disputes: [dispute, ...state.disputes]
    }))
}));

const AppStateContext = createContext<typeof useAppStore | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppStateContext.Provider value={useAppStore}>{children}</AppStateContext.Provider>
);

export const useAppState = () => {
  const store = useContext(AppStateContext);
  if (!store) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return store();
};

