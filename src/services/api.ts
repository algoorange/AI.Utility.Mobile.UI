import { API_CONFIG } from '../config/api';
import type { GetDisputesResponse } from '../data/mockBills';

export interface DisputeSubmissionData {
  bill_id: string;
  customer_id: string;
  issue_type: string;
  description: string;
  evidence_photo: File | Blob | { uri: string; type: string; name: string };
}

export interface DisputeResponse {
  success: boolean;
  dispute_id: string;
  message: string;
  data?: any;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async submitDispute(disputeData: DisputeSubmissionData): Promise<DisputeResponse> {
    try {
      console.log('Submitting dispute to:', `${this.baseUrl}${API_CONFIG.ENDPOINTS.DISPUTES.CREATE}`);
      const formData = new FormData();
      formData.append('bill_id', disputeData.bill_id);
      formData.append('customer_id', disputeData.customer_id);
      formData.append('issue_type', disputeData.issue_type);
      formData.append('description', disputeData.description);
      
      // Handle file upload for React Native
      if ('uri' in disputeData.evidence_photo) {
        // React Native file format
        formData.append('evidence_photo', disputeData.evidence_photo as any);
      } else {
        // Web File/Blob format
        formData.append('evidence_photo', disputeData.evidence_photo as any, 'evidence.jpg');
      }

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.DISPUTES.CREATE}`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header - let the browser/RN set it with boundary for FormData
          ...API_CONFIG.DEFAULT_HEADERS,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Ensure we return a consistent response format
      return {
        success: true,
        dispute_id: result.dispute_id || result.id,
        message: result.message || 'Dispute submitted successfully',
        data: result
      };
    } catch (error) {
      console.error('Error submitting dispute:', error);
      
      // Return a consistent error format
      return {
        success: false,
        dispute_id: '',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: null
      };
    }
  }

  async getDisputesByCustomer(customerId: string): Promise<GetDisputesResponse> {
    try {
      console.log('Fetching disputes for customer:', customerId);
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.DISPUTES.GET_BY_CUSTOMER}/${customerId}`, {
        method: 'GET',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      const result: GetDisputesResponse = await response.json();
      console.log('Disputes fetched successfully:', result.count, 'disputes');
      
      return result;
    } catch (error) {
      console.error('Error fetching disputes:', error);
      
      // Return a consistent error format
      return {
        success: false,
        disputes: [],
        count: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const apiService = new ApiService();
