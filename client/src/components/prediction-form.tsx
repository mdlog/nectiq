import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gem } from "lucide-react";
import { PredictionBlockchainForm } from "./PredictionBlockchainForm";

interface PredictionFormProps {
  preSelectedCrypto?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PredictionForm({ preSelectedCrypto, onClose, onSuccess }: PredictionFormProps) {
  const [selectedStake, setSelectedStake] = useState<number | null>(null);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [useInsurance, setUseInsurance] = useState(false);

  // 🔑 STATE: Store last valid data to prevent disappearing during refresh
  const [lastValidCryptos, setLastValidCryptos] = useState<any[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Fetch live Pyth Network prices for real-time updates
  const { data: livePrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/crypto/pyth-prices", "prices"],
    refetchInterval: 1000, // Same as other pages - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as other pages - very fresh data
    retry: 5, // Increased from 3 to 5 for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    keepPreviousData: true, // 🔑 Keep data during refetch
    placeholderData: (previousData) => previousData, // 🔑 Show previous data while loading
    gcTime: 600000, // 10 minutes cache
    select: (data: any[]) => {
      const priceMap: Record<string, number> = {};
      data.forEach(crypto => {
        priceMap[crypto.id] = crypto.current_price;
      });
      return priceMap;
    },
    onError: (error) => {
      console.error("❌ [PREDICTION-FORM-ERROR] Price query failed:", error);
    },
  });

  // Fetch available cryptocurrencies from database
  const { data: availableCryptos = [], isLoading: cryptosLoading, isError } = useQuery({
    queryKey: ["/api/crypto/pyth-prices", "cryptos"],
    refetchInterval: 1000, // Same as other pages - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as other pages - very fresh data
    retry: 5, // Increased from 3 to 5 for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    keepPreviousData: true, // 🔑 Keep data during refetch to prevent disappearing
    placeholderData: (previousData) => previousData, // 🔑 Show previous data while loading
    gcTime: 600000, // 10 minutes cache
    select: (data: any[]) => data, // Return full crypto data with image, price, etc.
    onSuccess: (data) => {
      if (data && data.length > 0) {
        console.log("✅ [PREDICTION-FORM-SUCCESS] Received", data.length, "cryptocurrencies");
        setLastValidCryptos(data);
        setHasLoadedOnce(true);
      }
    },
    onError: (error) => {
      console.error("❌ [PREDICTION-FORM-ERROR] Crypto query failed:", error);
    },
  });

  // Update current prices when live prices change
  useEffect(() => {
    if (livePrices) {
      setCurrentPrices(livePrices);
    } else {
      // Use fallback prices if live prices are not available
      const fallbackPrices = {
        'bitcoin': 50000,
        'ethereum': 3000,
        'binancecoin': 300
      };
      setCurrentPrices(fallbackPrices);
    }
  }, [livePrices]);

  // 🔑 CRITICAL FIX: Update lastValidCryptos only if we receive non-empty data
  useEffect(() => {
    if (availableCryptos && Array.isArray(availableCryptos) && availableCryptos.length > 0) {
      console.log("✅ [PREDICTION-FORM-UPDATE] Updating last valid cryptos with", availableCryptos.length, "items");
      setLastValidCryptos(availableCryptos);
    } else {
      console.log("⚠️ [PREDICTION-FORM-SKIP] Skipping update - empty/invalid data, keeping previous data");
    }
  }, [availableCryptos]);

  // 🔑 FALLBACK DATA: Provide fallback data to prevent empty form
  const fallbackCryptos = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 50000, image: '/api/placeholder/32/32' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 3000, image: '/api/placeholder/32/32' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 300, image: '/api/placeholder/32/32' }
  ];

  // 🔑 USE LAST VALID DATA: Always use last valid data if current is empty
  const cryptosToUse = (availableCryptos && availableCryptos.length > 0) ? availableCryptos : 
                      (lastValidCryptos.length > 0) ? lastValidCryptos : fallbackCryptos;

  // Show loading state ONLY on FIRST LOAD when no data exists and actively loading
  // Never show loading during subsequent fetches - this prevents form from disappearing
  if (cryptosLoading && cryptosToUse.length === 0 && !hasLoadedOnce && fallbackCryptos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Make New Prediction</h2>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Don't render form if no cryptocurrencies are available AND we never had data before (first load failure)
  if (!cryptosLoading && cryptosToUse.length === 0 && !hasLoadedOnce && fallbackCryptos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Make New Prediction</h2>
        </div>
        <div className="text-center py-8">
          <Gem className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            {isError ? 'Error Loading Cryptocurrencies' : 'No Cryptocurrencies Available'}
          </h3>
          <p className="text-slate-400">
            {isError ? 'Retrying connection...' : 'Please add cryptocurrencies in the admin panel to start making predictions.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Blockchain Form with Backend Design */}
      <PredictionBlockchainForm
        preSelectedCrypto={preSelectedCrypto}
        onClose={onClose}
        onSuccess={onSuccess}
        availableCryptos={cryptosToUse}
        currentPrices={currentPrices}
        selectedStake={selectedStake}
        setSelectedStake={setSelectedStake}
        useInsurance={useInsurance}
        setUseInsurance={setUseInsurance}
      />
    </div>
  );
}