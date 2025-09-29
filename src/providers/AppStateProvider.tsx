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
  BackendDispute,
  BackendBill
} from '../data/mockBills';
import { apiService, RegisterRequest } from '../services/api';
import { base64ToDataUri, getMimeTypeFromBase64 } from '../utils/imageUtils';

interface AppState {
  bills: Bill[];
  backendBills: BackendBill[];
  paymentMethods: PaymentMethod[];
  complaints: Complaint[];
  consumption: UsageRecord[];
  disputes: Dispute[];
  backendDisputes: BackendDispute[];
  isLoadingDisputes: boolean;
  disputesError: string | null;
  isLoadingBills: boolean;
  billsError: string | null;
  customerId: string;
  isAuthenticated: boolean;
  userAccountNumber: string;
  userEmail: string;
  billsLastFetched: number | null;
  disputesLastFetched: number | null;
  addDispute: (dispute: Dispute) => void;
  fetchDisputes: (customerId: string) => Promise<void>;
  refreshDisputes: (customerId: string) => Promise<void>;
  fetchBills: (customerId: string) => Promise<void>;
  refreshBills: (customerId: string) => Promise<void>;
  loadInitialData: (customerId: string) => Promise<void>;
  login: (accountNumber: string, email: string) => Promise<boolean>;
  register: (registerData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
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

// Helper function to convert backend bill to frontend format
const convertBackendBill = (backendBill: BackendBill): Bill => {
  console.log('Converting backend bill:', backendBill);
  console.log('Backend category:', backendBill.category);
  
  // Map backend status to frontend status
  const statusMap: Record<string, Bill['status']> = {
    'paid': 'Paid',
    'unpaid': 'Due',
    'overdue': 'Overdue'
  };

  // Map backend category to frontend type
  const typeMap: Record<string, Bill['type']> = {
    'Electricity': 'Electricity',
    'Water': 'Water',
    'electricity': 'Electricity',
    'water': 'Water',
    'ELECTRICITY': 'Electricity',
    'WATER': 'Water'
  };

  const convertedBill = {
    id: backendBill.bill_id,
    account: backendBill.category,
    amount: backendBill.amount_due,
    dueDate: backendBill.due_date.split('T')[0], // Extract date part only
    status: statusMap[backendBill.status] || 'Due',
    type: typeMap[backendBill.category] || 'Electricity',
    pdfUrl: undefined // Backend doesn't provide PDF URL yet
  };
  
  console.log('Converted bill type:', convertedBill.type);
  console.log('Converted bill:', convertedBill);
  return convertedBill;
};

const useAppStore = create<AppState>((set, get) => ({
  bills: [], // Start with empty array, will be populated by fetchBills
  backendBills: [], // Store original backend bill data
  paymentMethods,
  complaints,
  consumption,
  disputes: [], // Start with empty array, will be populated by fetchDisputes
  backendDisputes: [], // Store original backend dispute data
  isLoadingDisputes: false,
  disputesError: null,
  isLoadingBills: false,
  billsError: null,
  customerId: '', // Will be set after login
  isAuthenticated: false,
  userAccountNumber: '',
  userEmail: '',
  billsLastFetched: null,
  disputesLastFetched: null,
  
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
          backendDisputes: response.disputes, // Store original backend data
          isLoadingDisputes: false,
          disputesError: null,
          disputesLastFetched: Date.now()
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
  },

  fetchBills: async (customerId: string) => {
    set({ isLoadingBills: true, billsError: null });
    
    try {
      const response = await apiService.getBillsByCustomer(customerId);
      
      if (response.success) {
        console.log('AppStateProvider - Raw backend bills:', response.bills);
        const convertedBills = response.bills.map(convertBackendBill);
        console.log('AppStateProvider - Converted bills:', convertedBills);
        set({ 
          bills: convertedBills,
          backendBills: response.bills, // Store original backend data
          isLoadingBills: false,
          billsError: null,
          billsLastFetched: Date.now()
        });
        console.log('AppStateProvider - Bills state updated');
      } else {
        set({ 
          isLoadingBills: false,
          billsError: response.message || 'Failed to fetch bills'
        });
      }
    } catch (error) {
      set({ 
        isLoadingBills: false,
        billsError: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  refreshBills: async (customerId: string) => {
    // Same as fetchBills but without setting loading state initially
    const { fetchBills } = get();
    await fetchBills(customerId);
  },

  loadInitialData: async (customerId: string) => {
    const { fetchBills, fetchDisputes } = get();
    await Promise.all([
      fetchBills(customerId),
      fetchDisputes(customerId)
    ]);
  },

  login: async (accountNumber: string, email: string) => {
    try {
      const result = await apiService.loginUser(accountNumber, email);
      
      if (result && result.customer_id) {
        set({
          isAuthenticated: true,
          customerId: result.customer_id,
          userAccountNumber: accountNumber,
          userEmail: email
        });
        
        // Load initial data after successful login
        const { loadInitialData } = get();
        await loadInitialData(result.customer_id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  register: async (registerData: RegisterRequest) => {
    try {
      const result = await apiService.registerUser(registerData);
      return result.success;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      customerId: '',
      userAccountNumber: '',
      userEmail: '',
      bills: [],
      backendBills: [],
      disputes: [],
      backendDisputes: [],
      billsLastFetched: null,
      disputesLastFetched: null
    });
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

