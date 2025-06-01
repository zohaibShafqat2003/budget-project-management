/**
 * Format a number as currency (USD)
 * @param {Number} value - The value to format
 * @param {String} currency - The currency code (default: USD)
 * @returns {String} Formatted currency string
 */
const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a date as a string
 * @param {Date|String} date - The date to format
 * @param {String} format - The format to use (short, medium, long, full)
 * @returns {String} Formatted date string
 */
const formatDate = (date, format = 'medium') => {
  if (!date) {
    return 'N/A';
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format]);
};

/**
 * Format a percentage value
 * @param {Number} value - The value to format as percentage
 * @param {Number} decimals - Number of decimal places
 * @returns {String} Formatted percentage string
 */
const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a number with thousand separators
 * @param {Number} value - The value to format
 * @param {Number} decimals - Number of decimal places
 * @returns {String} Formatted number string
 */
const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

module.exports = {
  formatCurrency,
  formatDate,
  formatPercentage,
  formatNumber
}; 