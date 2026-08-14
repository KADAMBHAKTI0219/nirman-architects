/**
 * Standardized Currency Formatter for Nirman Architects
 * Formats numbers into Indian Rupee (₹) format with en-IN digit grouping.
 * Examples:
 *   1500000 -> ₹15,00,000
 *   25000   -> ₹25,000
 */

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '₹0';
  
  // If already formatted string with ₹, return as is
  if (typeof amount === 'string' && amount.startsWith('₹')) return amount;

  const num = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) 
    : Number(amount);

  if (isNaN(num)) return `₹${amount}`;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatINR = formatCurrency;
