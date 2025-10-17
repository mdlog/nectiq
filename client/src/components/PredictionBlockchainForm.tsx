import React from 'react';

interface PredictionBlockchainFormProps {
    preSelectedCrypto?: string;
    onClose?: () => void;
    onSuccess?: () => void;
    availableCryptos?: any[];
    currentPrices?: Record<string, number>;
    selectedStake?: number | null;
    setSelectedStake?: (amount: number | null) => void;
    useInsurance?: boolean;
    setUseInsurance?: (use: boolean) => void;
}

export function PredictionBlockchainForm({
    preSelectedCrypto,
    onClose,
    onSuccess,
    availableCryptos = [],
    currentPrices = {},
    selectedStake,
    setSelectedStake,
    useInsurance = false,
    setUseInsurance
}: PredictionBlockchainFormProps) {
    
    console.log('🔍 [PREDICTION-FORM] Component rendering with:', {
        preSelectedCrypto,
        availableCryptos: availableCryptos?.length,
        currentPrices: Object.keys(currentPrices).length
    });

    return (
        <div className="space-y-6">
            <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Make New Prediction
                </h3>
                <p className="text-gray-400 mb-4">
                    Form is loading... Available cryptos: {availableCryptos?.length || 0}
                </p>
                <div className="space-y-2">
                    <div className="text-sm text-gray-300">
                        Selected Crypto: {preSelectedCrypto || 'None'}
                    </div>
                    <div className="text-sm text-gray-300">
                        Available Cryptos: {availableCryptos?.length || 0}
                    </div>
                    <div className="text-sm text-gray-300">
                        Current Prices: {Object.keys(currentPrices).length}
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Close Modal
                </button>
            </div>
        </div>
    );
}