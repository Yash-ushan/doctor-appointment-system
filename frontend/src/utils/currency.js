// Currency utility functions for consistent LKR formatting

/**
 * Format amount in LKR currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show LKR symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatLKR = (amount, showSymbol = true) => {
  if (!amount || isNaN(amount)) return showSymbol ? 'LKR 0' : '0';
  
  const formattedAmount = parseFloat(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `LKR ${formattedAmount}` : formattedAmount;
};

/**
 * Format amount with shorter LKR display for tight spaces
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatLKRShort = (amount) => {
  if (!amount || isNaN(amount)) return 'LKR 0';
  
  if (amount >= 1000000) {
    return `LKR ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `LKR ${(amount / 1000).toFixed(1)}K`;
  }
  
  return `LKR ${amount.toLocaleString()}`;
};

/**
 * Parse LKR string back to number
 * @param {string} lkrString - LKR formatted string
 * @returns {number} Parsed amount
 */
export const parseLKR = (lkrString) => {
  if (!lkrString) return 0;
  
  // Remove LKR prefix and commas, then parse
  const cleanString = lkrString.toString().replace(/LKR\s?|,/g, '');
  const amount = parseFloat(cleanString);
  
  return isNaN(amount) ? 0 : amount;
};

/**
 * Validate if amount is a valid LKR amount
 * @param {number} amount - Amount to validate
 * @returns {boolean} Is valid amount
 */
export const isValidLKRAmount = (amount) => {
  return !isNaN(amount) && amount >= 0 && amount <= 10000000; // Max 10M LKR
};

// Common LKR amounts for medical consultations
export const CONSULTATION_FEES = {
  ONLINE_MIN: 1000,
  ONLINE_MAX: 5000,
  PHYSICAL_MIN: 1500,
  PHYSICAL_MAX: 8000,
  EMERGENCY_MIN: 2000,
  EMERGENCY_MAX: 15000
};

export default {
  formatLKR,
  formatLKRShort,
  parseLKR,
  isValidLKRAmount,
  CONSULTATION_FEES
};
