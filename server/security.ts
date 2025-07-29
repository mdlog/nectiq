// Security utilities for input validation and sanitization
export class SecurityValidator {
  // Enhanced XSS protection with comprehensive sanitization
  static sanitizeString(input: string): string {
    return input
      // Remove script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove iframe tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove object and embed tags
      .replace(/<(object|embed|applet)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
      // Remove dangerous attributes
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Remove potentially dangerous functions
      .replace(/eval\s*\(/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/behavior\s*:/gi, '')
      // Remove style attributes that could contain expressions
      .replace(/style\s*=\s*['""][^'"]*expression[^'"]*['"]/gi, '')
      .trim();
  }

  // Validate and sanitize username
  static validateUsername(username: string): { valid: boolean; sanitized?: string; error?: string } {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }

    const sanitized = this.sanitizeString(username);
    
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(sanitized)) {
      return { valid: false, error: 'Username must be 3-20 alphanumeric characters' };
    }

    return { valid: true, sanitized };
  }

  // Validate wallet address format
  static validateWalletAddress(address: string): { valid: boolean; error?: string } {
    if (!address || typeof address !== 'string') {
      return { valid: false, error: 'Wallet address is required' };
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return { valid: false, error: 'Invalid wallet address format' };
    }

    return { valid: true };
  }

  // Validate cryptocurrency selection
  static validateCryptocurrency(crypto: string): { valid: boolean; error?: string } {
    const validCryptos = ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"];
    
    if (!crypto || !validCryptos.includes(crypto)) {
      return { valid: false, error: 'Invalid cryptocurrency selection' };
    }

    return { valid: true };
  }

  // Validate numeric amounts with range checking
  static validateAmount(amount: any, min: number, max: number, mustBeInteger = false): { valid: boolean; value?: number; error?: string } {
    const num = Number(amount);
    
    if (isNaN(num)) {
      return { valid: false, error: 'Amount must be a valid number' };
    }

    if (mustBeInteger && !Number.isInteger(num)) {
      return { valid: false, error: 'Amount must be a whole number' };
    }

    if (num < min || num > max) {
      return { valid: false, error: `Amount must be between ${min} and ${max}` };
    }

    return { valid: true, value: num };
  }

  // Validate timeframe
  static validateTimeframe(timeframe: string): { valid: boolean; error?: string } {
    const validTimeframes = ["1h", "6h", "24h", "7d"];
    
    if (!timeframe || !validTimeframes.includes(timeframe)) {
      return { valid: false, error: 'Invalid timeframe selection' };
    }

    return { valid: true };
  }

  // Enhanced SQL injection detection with advanced patterns
  static checkSqlInjection(input: string): boolean {
    const sqlPatterns = [
      // Standard SQL keywords used in attacks
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|grant|revoke)\b)/gi,
      // Comments and delimiters that can be used to manipulate queries
      /(--|\/\*|\*\/|;)/g,
      // Boolean-based injection attempts
      /(\b(or|and)\b\s+[\d\w'\"]+\s*[=<>!]+\s*[\d\w'\"]+)/gi,
      // SQL functions commonly used in attacks
      /(\b(char|ascii|substring|concat|length|benchmark|sleep|waitfor|cast|convert|hex|unhex)\b)/gi,
      // Time-based injection patterns
      /(\b(waitfor|delay|sleep|benchmark)\b)/gi,
      // UNION-based patterns
      /(\bunion\b\s+(all\s+)?select)/gi,
      // Information schema patterns
      /(\binformation_schema\b|\bsysobjects\b|\bsyscolumns\b)/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting check for specific operations
  static checkRateLimit(userId: number, operation: string, timestamps: Date[], maxRequests: number, windowMs: number): boolean {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    
    // Filter timestamps within the window
    const recentRequests = timestamps.filter(timestamp => timestamp > windowStart);
    
    return recentRequests.length >= maxRequests;
  }
}