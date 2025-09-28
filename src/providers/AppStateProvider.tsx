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
  Dispute,
  BackendDispute
} from '../data/mockBills';
import { apiService } from '../services/api';
import { base64ToDataUri, getMimeTypeFromBase64 } from '../utils/imageUtils';

interface AppState {
  bills: Bill[];
  paymentMethods: PaymentMethod[];
  complaints: Complaint[];
  consumption: UsageRecord[];
  disputes: Dispute[];
  isLoadingDisputes: boolean;
  disputesError: string | null;
  addDispute: (dispute: Dispute) => void;
  fetchDisputes: (customerId: string) => Promise<void>;
  refreshDisputes: (customerId: string) => Promise<void>;
}

// Helper function to convert backend dispute to frontend format
const convertBackendDispute = (backendDispute: BackendDispute): Dispute => {
  // Map backend status to frontend status
  const statusMap: Record<string, Dispute['status']> = {
    'open': 'Submitted',
    'under_review': 'Under Review',
    'resolved': 'Resolved',
    'rejected': 'Rejected'
  };

  // Convert base64 image to data URI
  const imageDataUri = backendDispute.evidence_photo 
    ? base64ToDataUri(backendDispute.evidence_photo, getMimeTypeFromBase64(backendDispute.evidence_photo))
    : null;

  return {
    id: backendDispute.dispute_id,
    billId: backendDispute.bill_id,
    status: statusMap[backendDispute.status] || 'Submitted',
    submittedAt: backendDispute.created_at,
    comments: backendDispute.description,
    attachment: imageDataUri,
    voiceNote: null // Backend doesn't support voice notes yet
  };
};

const useAppStore = create<AppState>((set, get) => ({
  bills,
  paymentMethods,
  complaints,
  consumption,
  disputes: [], // Start with empty array, will be populated by fetchDisputes
  isLoadingDisputes: false,
  disputesError: null,
  
  addDispute: (dispute) =>
    set((state) => ({
      ...state,
      disputes: [dispute, ...state.disputes]
    })),

  fetchDisputes: async (customerId: string) => {
    set({ isLoadingDisputes: true, disputesError: null });
    
    try {
      const response = await apiService.getDisputesByCustomer(customerId);
      
      if (response.success) {
        const convertedDisputes = response.disputes.map(convertBackendDispute);
        set({ 
          disputes: convertedDisputes,
          isLoadingDisputes: false,
          disputesError: null
        });
      } else {
        set({ 
          isLoadingDisputes: false,
          disputesError: response.message || 'Failed to fetch disputes'
        });
      }
    } catch (error) {
      set({ 
        isLoadingDisputes: false,
        disputesError: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  refreshDisputes: async (customerId: string) => {
    // Same as fetchDisputes but without setting loading state initially
    const { fetchDisputes } = get();
    await fetchDisputes(customerId);
  }
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

