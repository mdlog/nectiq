import React from 'react';
import { PredictionBlockchainForm } from "./PredictionBlockchainForm";

interface PredictionFormProps {
  preSelectedCrypto?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PredictionForm({ preSelectedCrypto, onClose, onSuccess }: PredictionFormProps) {
  console.log('🔍 [PREDICTION-FORM] Component rendering with:', {
    preSelectedCrypto,
    onClose: !!onClose,
    onSuccess: !!onSuccess
  });

  // Simple fallback data
  const fallbackCryptos = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 50000 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 3000 },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 300 }
  ];

  const fallbackPrices = {
    'bitcoin': 50000,
    'ethereum': 3000,
    'binancecoin': 300
  };

  return (
    <div>
      <PredictionBlockchainForm
        preSelectedCrypto={preSelectedCrypto}
        onClose={onClose}
        onSuccess={onSuccess}
        availableCryptos={fallbackCryptos}
        currentPrices={fallbackPrices}
      />
    </div>
  );
}