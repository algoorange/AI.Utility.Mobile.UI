/**
 * Utility functions for handling images
 */

/**
 * Converts base64 string to data URI for display in React Native
 * @param base64String - The base64 encoded image string
 * @param mimeType - The MIME type of the image (default: image/jpeg)
 * @returns Data URI string that can be used as image source
 */
export const base64ToDataUri = (base64String: string, mimeType: string = 'image/jpeg'): string => {
  // Check if the base64 string already includes the data URI prefix
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  
  // Add the data URI prefix
  return `data:${mimeType};base64,${base64String}`;
};

/**
 * Validates if a string is a valid base64 encoded image
 * @param base64String - The string to validate
 * @returns boolean indicating if the string is valid base64
 */
export const isValidBase64Image = (base64String: string): boolean => {
  try {
    // Check if it's a data URI or plain base64
    const base64Data = base64String.startsWith('data:') 
      ? base64String.split(',')[1] 
      : base64String;
    
    // Basic validation - check if it can be decoded
    if (!base64Data || base64Data.length === 0) {
      return false;
    }
    
    // Check if it's valid base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(base64Data);
  } catch (error) {
    return false;
  }
};

/**
 * Gets the appropriate MIME type based on base64 image header
 * @param base64String - The base64 encoded image string
 * @returns The detected MIME type or default jpeg
 */
export const getMimeTypeFromBase64 = (base64String: string): string => {
  // Check for common image format signatures in base64
  if (base64String.startsWith('/9j/') || base64String.startsWith('iVBORw0KGgo')) {
    return 'image/jpeg';
  } else if (base64String.startsWith('iVBORw0KGgo')) {
    return 'image/png';
  } else if (base64String.startsWith('UklGR')) {
    return 'image/webp';
  } else if (base64String.startsWith('R0lGOD')) {
    return 'image/gif';
  }
  
  // Default to jpeg
  return 'image/jpeg';
};
