import { polygonAmoy } from './rainbow-config';

/**
 * Auto-switch to Polygon Amoy Testnet
 * If the chain is not added to the wallet, it will automatically add it first
 */
export async function switchToPolygonAmoy() {
    if (!window.ethereum) {
        console.warn('🔷 [POLYGON-AMOY] No wallet detected (window.ethereum undefined)');
        return { success: false, error: 'No wallet detected' };
    }

    console.log('🔷 [POLYGON-AMOY] Wallet found, attempting to switch to Polygon Amoy...');
    console.log('🔷 [POLYGON-AMOY] Target Chain ID: 80002 (0x13882 hex)');

    try {
        console.log('🔷 [POLYGON-AMOY] Sending wallet_switchEthereumChain request...');

        // Try to switch to Polygon Amoy
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13882' }], // 80002 in hex
        });

        console.log('✅ [POLYGON-AMOY] Successfully switched to Polygon Amoy!');
        return { success: true };

    } catch (switchError: any) {
        console.log('⚠️ [POLYGON-AMOY] Switch failed, error code:', switchError.code);

        // Error code 4902 means the chain has not been added to the wallet
        if (switchError.code === 4902) {
            try {
                console.log('🔷 [POLYGON-AMOY] Chain not found in wallet (Error 4902)');
                console.log('🔷 [POLYGON-AMOY] Attempting to add Polygon Amoy to wallet...');

                // Add Polygon Amoy to the wallet
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: '0x13882', // 80002 in hex
                            chainName: 'Polygon Amoy Testnet',
                            nativeCurrency: {
                                name: 'POL',
                                symbol: 'POL',
                                decimals: 18,
                            },
                            rpcUrls: ['https://rpc-amoy.polygon.technology'],
                            blockExplorerUrls: ['https://amoy.polygonscan.com'],
                        },
                    ],
                });

                console.log('✅ [POLYGON-AMOY] Successfully added Polygon Amoy to wallet!');
                console.log('✅ [POLYGON-AMOY] Chain should now be active');
                return { success: true, added: true };

            } catch (addError: any) {
                console.error('❌ [POLYGON-AMOY] Failed to add chain');
                console.error('❌ [POLYGON-AMOY] Error details:', addError);
                return {
                    success: false,
                    error: 'Failed to add Polygon Amoy to wallet',
                    details: addError.message
                };
            }
        } else if (switchError.code === 4001) {
            // User rejected the request
            console.warn('⚠️ [POLYGON-AMOY] User rejected chain switch request (Error 4001)');
            return {
                success: false,
                error: 'User rejected chain switch',
                userRejected: true
            };
        } else {
            console.error('❌ [POLYGON-AMOY] Failed to switch chain');
            console.error('❌ [POLYGON-AMOY] Error code:', switchError.code);
            console.error('❌ [POLYGON-AMOY] Error message:', switchError.message);
            return {
                success: false,
                error: 'Failed to switch to Polygon Amoy',
                details: switchError.message
            };
        }
    }
}

/**
 * Check if the current chain is Polygon Amoy
 */
export async function isOnPolygonAmoy(): Promise<boolean> {
    if (!window.ethereum) {
        return false;
    }

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isAmoy = chainId === '0x13882'; // 80002 in hex

        console.log('🔍 [POLYGON-AMOY] Current chain:', chainId, '- Is Amoy:', isAmoy);
        return isAmoy;
    } catch (error) {
        console.error('❌ [POLYGON-AMOY] Failed to get chain ID:', error);
        return false;
    }
}

/**
 * Get Polygon Amoy chain info
 */
export function getPolygonAmoyInfo() {
    return {
        id: polygonAmoy.id,
        name: polygonAmoy.name,
        nativeCurrency: polygonAmoy.nativeCurrency,
        rpcUrls: polygonAmoy.rpcUrls,
        blockExplorers: polygonAmoy.blockExplorers,
        testnet: polygonAmoy.testnet,
        faucet: 'https://faucet.polygon.technology/',
        chainlistUrl: 'https://chainlist.org/chain/80002',
    };
}

/**
 * Auto-switch to Polygon Amoy on wallet connect
 * This should be called after wallet connection is established
 */
export async function autoSwitchToPolygonAmoy() {
    console.log('🔷 [POLYGON-AMOY] Auto-switch initiated...');

    if (!window.ethereum) {
        console.error('❌ [POLYGON-AMOY] No wallet detected (window.ethereum is undefined)');
        return { success: false, error: 'No wallet detected' };
    }

    console.log('✅ [POLYGON-AMOY] Wallet detected, checking current chain...');
    const isAmoy = await isOnPolygonAmoy();

    if (isAmoy) {
        console.log('✅ [POLYGON-AMOY] Already on Polygon Amoy (Chain ID: 80002), no action needed');
        return { success: true, alreadyOnAmoy: true };
    }

    console.log('🔄 [POLYGON-AMOY] Not on Amoy, initiating chain switch...');
    return await switchToPolygonAmoy();
}

// TypeScript declaration for window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

