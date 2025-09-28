// API Configuration
export const API_CONFIG = {
  // Update this URL to match your backend server
  // Use your laptop's IP address, not localhost, for mobile testing
  BASE_URL: 'http://192.168.1.6:8000',
  
  // Endpoints
  ENDPOINTS: {
    DISPUTES: {
      CREATE: '/disputes/create',
      GET_BY_CUSTOMER: '/disputes/get_disputes_by_customer'
    }
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Accept': 'application/json'
  }
};

// For development, you might want to use different URLs based on platform
// Uncomment and modify as needed:
/*
import { Platform } from 'react-native';

export const API_CONFIG = {
  BASE_URL: Platform.select({
    ios: 'http://localhost:8000',
    android: 'http://10.0.2.2:8000', // Android emulator
    default: 'http://localhost:8000'
  }),
  // ... rest of config
};
*/
