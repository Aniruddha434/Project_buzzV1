/**
 * Currency formatting utilities for ProjectBuzz
 * Ensures consistent Indian Rupee formatting across the application
 */

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showDecimals?: boolean;
  compact?: boolean;
}

/**
 * Format price in Indian Rupees with consistent formatting
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number | string | undefined | null,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    showSymbol = true,
    showDecimals = false,
    compact = false
  } = options;

  // Handle invalid or empty amounts
  if (amount === undefined || amount === null || amount === '') {
    return showSymbol ? '₹0' : '0';
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return showSymbol ? '₹0' : '0';
  }

  // Format for compact display (e.g., 1.2K, 1.5L)
  if (compact && numAmount >= 1000) {
    if (numAmount >= 10000000) { // 1 Crore
      const crores = numAmount / 10000000;
      const formatted = crores >= 10 ? crores.toFixed(0) : crores.toFixed(1);
      return showSymbol ? `₹${formatted}Cr` : `${formatted}Cr`;
    } else if (numAmount >= 100000) { // 1 Lakh
      const lakhs = numAmount / 100000;
      const formatted = lakhs >= 10 ? lakhs.toFixed(0) : lakhs.toFixed(1);
      return showSymbol ? `₹${formatted}L` : `${formatted}L`;
    } else if (numAmount >= 1000) { // 1 Thousand
      const thousands = numAmount / 1000;
      const formatted = thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1);
      return showSymbol ? `₹${formatted}K` : `${formatted}K`;
    }
  }

  // Standard Indian number formatting with commas
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(numAmount);

  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format price for display in project cards
 * @param price - The price to format
 * @returns Formatted price string
 */
export const formatProjectPrice = (price: number | string | undefined | null): string => {
  return formatCurrency(price, { showSymbol: true, showDecimals: false });
};

/**
 * Format price for compact display (mobile/small screens)
 * @param price - The price to format
 * @returns Compact formatted price string
 */
export const formatCompactPrice = (price: number | string | undefined | null): string => {
  return formatCurrency(price, { showSymbol: true, showDecimals: false, compact: true });
};

/**
 * Format sales count with proper pluralization
 * @param count - Number of sales
 * @returns Formatted sales string
 */
export const formatSalesCount = (count: number | undefined | null): string => {
  const salesCount = count || 0;
  
  if (salesCount === 0) return 'No sales';
  if (salesCount === 1) return '1 sale';
  
  // Use compact formatting for large numbers
  if (salesCount >= 1000) {
    if (salesCount >= 1000000) {
      const millions = salesCount / 1000000;
      return `${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)}M sales`;
    } else {
      const thousands = salesCount / 1000;
      return `${thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1)}K sales`;
    }
  }
  
  return `${salesCount.toLocaleString('en-IN')} sales`;
};

/**
 * Format view count with proper formatting
 * @param count - Number of views
 * @returns Formatted views string
 */
export const formatViewCount = (count: number | undefined | null): string => {
  const viewCount = count || 0;
  
  if (viewCount === 0) return '0 views';
  
  // Use compact formatting for large numbers
  if (viewCount >= 1000) {
    if (viewCount >= 1000000) {
      const millions = viewCount / 1000000;
      return `${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)}M views`;
    } else {
      const thousands = viewCount / 1000;
      return `${thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1)}K views`;
    }
  }
  
  return `${viewCount.toLocaleString('en-IN')} views`;
};

/**
 * Format rating with stars
 * @param rating - Rating value (0-5)
 * @returns Formatted rating string
 */
export const formatRating = (rating: number | undefined | null): string => {
  const ratingValue = rating || 0;
  const stars = '★'.repeat(Math.floor(ratingValue)) + '☆'.repeat(5 - Math.floor(ratingValue));
  return `${stars} ${ratingValue.toFixed(1)}`;
};

/**
 * Format discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted discount string
 */
export const formatDiscount = (
  originalPrice: number | undefined | null,
  discountedPrice: number | undefined | null
): string | null => {
  if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) {
    return null;
  }
  
  const discountPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  return `${discountPercent}% OFF`;
};
