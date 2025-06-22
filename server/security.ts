// Security utilities for input validation and sanitization
export class SecurityValidator {
  // Sanitize string input to prevent XSS
  static sanitizeString(input: string): string {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
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

  // Check for potential SQL injection patterns
  static checkSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
      /('|\"|`|;|\||&)/g
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