// Utility functions for wallet detection and localhost compatibility

export const detectMetaMask = () => {
  if (typeof window === 'undefined') return false;
  
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    console.log('No ethereum provider found');
    return false;
  }
  
  const isMetaMask = ethereum.isMetaMask;
  console.log('MetaMask detected:', isMetaMask);
  console.log('Ethereum provider:', ethereum);
  
  return isMetaMask;
};

export const checkWalletReady = async () => {
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  try {
    // Check if MetaMask is unlocked
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    console.log('Current accounts:', accounts);
    
    // Get current network
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);
    
    return {
      isUnlocked: accounts.length > 0,
      accounts,
      chainId
    };
  } catch (error) {
    console.error('Error checking wallet status:', error);
    throw error;
  }
};

export const requestWalletConnection = async () => {
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  try {
    console.log('Requesting wallet connection...');
    const accounts = await ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    console.log('Wallet connected successfully:', accounts);
    return accounts;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Enhanced localhost compatibility checker
export const checkLocalhostCompatibility = () => {
  const checks = {
    isLocalhost: window.location.hostname === 'localhost',
    hasMetaMask: detectMetaMask(),
    hasEthereum: !!(window as any).ethereum,
    userAgent: navigator.userAgent,
    protocol: window.location.protocol
  };
  
  console.log('Localhost compatibility check:', checks);
  
  return checks;
};