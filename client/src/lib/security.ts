import DOMPurify from 'dompurify';

/**
 * XSS Protection Utilities untuk Nectiq Platform
 * Mencegah script injection dan malicious content
 */

// Konfigurasi DOMPurify untuk extra security
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span'],
  ALLOWED_ATTR: ['class'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
  KEEP_CONTENT: false,
  USE_PROFILES: { html: true }
};

/**
 * Sanitize user input untuk mencegah XSS attacks
 * @param input - Raw user input
 * @returns Sanitized safe string
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  
  // Basic validation
  if (typeof input !== 'string') {
    console.warn('🚨 SECURITY: Non-string input detected', typeof input);
    return String(input);
  }
  
  // Remove any potential script tags or javascript
  let cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Use DOMPurify for comprehensive cleaning
  cleaned = DOMPurify.sanitize(cleaned, purifyConfig);
  
  return cleaned;
}

/**
 * Sanitize cryptocurrency names and symbols
 * @param crypto - Cryptocurrency name or symbol
 * @returns Safe cryptocurrency identifier
 */
export function sanitizeCrypto(crypto: string | null | undefined): string {
  if (!crypto) return '';
  
  // Only allow alphanumeric characters, spaces, and common crypto symbols
  return crypto.replace(/[^a-zA-Z0-9\s\-_.]/g, '').trim();
}

/**
 * Sanitize numerical inputs for amounts, prices, etc.
 * @param value - Numerical input as string
 * @returns Safe numerical string
 */
export function sanitizeNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  
  const str = String(value);
  // Only allow digits, decimal point, and minus sign
  const cleaned = str.replace(/[^0-9.-]/g, '');
  
  // Validate it's a valid number
  const num = parseFloat(cleaned);
  return isNaN(num) ? '0' : cleaned;
}

/**
 * Validate and sanitize wallet addresses
 * @param address - Ethereum wallet address
 * @returns Safe wallet address or empty string
 */
export function sanitizeWalletAddress(address: string | null | undefined): string {
  if (!address) return '';
  
  // Ethereum address format: 0x followed by 40 hex characters
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  if (ethAddressRegex.test(address)) {
    return address.toLowerCase();
  }
  
  console.warn('🚨 SECURITY: Invalid wallet address format detected', address);
  return '';
}

/**
 * Sanitize file names for upload
 * @param fileName - Original file name
 * @returns Safe file name
 */
export function sanitizeFileName(fileName: string | null | undefined): string {
  if (!fileName) return '';
  
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.\./g, '')
    .replace(/^\./, '')
    .substring(0, 255); // Limit length
}

/**
 * HTML escape untuk rendering aman
 * @param text - Raw text content
 * @returns HTML-escaped text
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate URL untuk mencegah malicious redirects
 * @param url - URL string
 * @returns Safe URL or empty string
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // Only allow https and http protocols
    if (!['https:', 'http:'].includes(urlObj.protocol)) {
      console.warn('🚨 SECURITY: Unsafe URL protocol detected', urlObj.protocol);
      return '';
    }
    
    // Block common malicious domains (extend this list as needed)
    const blockedDomains = ['javascript', 'data', 'vbscript'];
    if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
      console.warn('🚨 SECURITY: Blocked malicious domain', urlObj.hostname);
      return '';
    }
    
    return urlObj.toString();
  } catch (error) {
    console.warn('🚨 SECURITY: Invalid URL format detected', url);
    return '';
  }
}

/**
 * Security logging untuk suspicious activities
 * @param event - Security event type
 * @param details - Event details
 */
export function logSecurityEvent(event: string, details: any): void {
  console.warn(`🚨 SECURITY EVENT: ${event}`, {
    timestamp: new Date().toISOString(),
    event,
    details: typeof details === 'object' ? JSON.stringify(details) : details,
    userAgent: navigator.userAgent,
    url: window.location.href
  });
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement security event API call
    fetch('/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(err => console.error('Failed to log security event:', err));
  }
}

/**
 * Check for potential malicious patterns dalam user input
 * @param input - User input to check
 * @returns Boolean indicating if input looks suspicious
 */
export function detectSuspiciousContent(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /document\.write/i,
    /window\.location/i,
    /\.innerHTML/i,
    /fromCharCode/i,
    /base64/i,
    /atob\(/i,
    /btoa\(/i,
    /%3cscript/i,
    /%3c%2fscript/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(input));
  
  if (isSuspicious) {
    logSecurityEvent('SUSPICIOUS_INPUT_DETECTED', { 
      input: input.substring(0, 100) + '...',
      length: input.length 
    });
  }
  
  return isSuspicious;
}

// Export all security functions untuk easy access
export const security = {
  sanitizeInput,
  sanitizeCrypto,
  sanitizeNumber,
  sanitizeWalletAddress,
  sanitizeFileName,
  escapeHtml,
  sanitizeUrl,
  logSecurityEvent,
  detectSuspiciousContent
};

export default security;