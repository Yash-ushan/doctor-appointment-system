// Application currency configuration
const CURRENCY_CONFIG = {
  code: 'LKR',
  symbol: 'LKR',
  name: 'Sri Lankan Rupee',
  locale: 'en-LK',
  position: 'before', // 'before' or 'after' the amount
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.'
};

// Default consultation fee ranges (in LKR)
const DEFAULT_CONSULTATION_FEES = {
  online: {
    min: 1000,
    max: 5000,
    default: 1500
  },
  physical: {
    min: 1500,
    max: 8000,
    default: 2000
  },
  emergency: {
    min: 2000,
    max: 15000,
    default: 3000
  },
  followUp: {
    min: 800,
    max: 3000,
    default: 1200
  }
};

// PayHere specific configuration
const PAYHERE_CONFIG = {
  currency: 'LKR',
  supportedCards: ['VISA', 'MASTER', 'AMEX'],
  minAmount: 100, // LKR 100
  maxAmount: 1000000 // LKR 1 Million
};

module.exports = {
  CURRENCY_CONFIG,
  DEFAULT_CONSULTATION_FEES,
  PAYHERE_CONFIG
};
