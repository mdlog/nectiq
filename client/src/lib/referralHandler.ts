// Utility functions for handling referral codes from URL parameters

export const REFERRAL_STORAGE_KEY = 'nectiq_referral_code';

/**
 * Extract referral code from URL parameters and store in localStorage
 */
export function handleReferralFromURL(): string | null {
  try {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
      if (import.meta.env.DEV) {
        console.log('🎯 [REFERRAL] Found referral code in URL:', referralCode);
      }
      
      // Validate referral code format (should be 8 characters)
      if (referralCode.length === 8 && /^[A-Z0-9]+$/.test(referralCode)) {
        // Store in localStorage for later use
        localStorage.setItem(REFERRAL_STORAGE_KEY, referralCode);
        if (import.meta.env.DEV) {
          console.log('✅ [REFERRAL] Valid referral code stored in localStorage:', referralCode);
        }
        
        // Clean up URL by removing ref parameter without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete('ref');
        window.history.replaceState({}, '', url.toString());
        if (import.meta.env.DEV) {
          console.log('🧹 [REFERRAL] Cleaned up URL from referral parameter');
        }
        
        return referralCode;
      } else {
        console.warn('⚠️ [REFERRAL] Invalid referral code format:', referralCode);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ [REFERRAL] Error handling referral from URL:', error);
    return null;
  }
}

/**
 * Get stored referral code from localStorage
 */
export function getStoredReferralCode(): string | null {
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch (error) {
    console.error('❌ [REFERRAL] Error getting stored referral code:', error);
    return null;
  }
}

/**
 * Clear stored referral code (used after successful processing)
 */
export function clearStoredReferralCode(): void {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    console.log('🧹 [REFERRAL] Cleared stored referral code');
  } catch (error) {
    console.error('❌ [REFERRAL] Error clearing referral code:', error);
  }
}

/**
 * Check if referral code exists in URL or localStorage
 */
export function hasReferralCode(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const urlReferral = urlParams.get('ref');
  const storedReferral = getStoredReferralCode();
  
  return !!(urlReferral || storedReferral);
}